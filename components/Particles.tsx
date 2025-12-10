import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType, HandMetrics } from '../types';
import { generateShapePositions } from '../utils/geometry';
import { PARTICLE_COUNT } from '../constants';

interface ParticlesProps {
  shapeType: ShapeType;
  color: string;
  handRef: React.MutableRefObject<HandMetrics>;
}

export const Particles: React.FC<ParticlesProps> = ({ shapeType, color, handRef }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Store target positions (the shape) and current positions
  const targetPositions = useMemo(() => generateShapePositions(shapeType, PARTICLE_COUNT), [shapeType]);
  
  // Initialize current positions array
  const currentPositions = useMemo(() => {
    return new Float32Array(PARTICLE_COUNT * 3);
  }, []);
  
  // Initialize random offsets for breathing effect
  const randomOffsets = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for(let i=0; i<arr.length; i++) arr[i] = Math.random() * Math.PI * 2;
    return arr;
  }, []);

  // Generate a soft circular texture for the particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      // Create a gradient for a soft glow effect
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true; // Helps with blending artifacts
    return texture;
  }, []);

  // Track previous hand position to calculate velocity
  const prevHandPos = useRef<{x: number, y: number, isTracking: boolean}>({ x: 0, y: 0, isTracking: false });

  // Persistent Zoom State
  // We initialize to 1.0 (default scale). 
  // This ref holds the value even when hands are removed.
  const persistentZoom = useRef(1.0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const { distance, avgGrip, isDetected, position: handScreenPos } = handRef.current;
    
    // Map normalized hand position (-1 to 1) to world space
    const handWorldX = handScreenPos.x * (viewport.width / 2);
    const handWorldY = handScreenPos.y * (viewport.height / 2);

    let handSpeed = 0;

    // Calculate Hand Velocity
    if (isDetected) {
      if (!prevHandPos.current.isTracking) {
        prevHandPos.current = { x: handWorldX, y: handWorldY, isTracking: true };
      } else {
        const handDx = handWorldX - prevHandPos.current.x;
        const handDy = handWorldY - prevHandPos.current.y;
        handSpeed = delta > 0.001 ? Math.sqrt(handDx*handDx + handDy*handDy) / delta : 0;
        prevHandPos.current = { x: handWorldX, y: handWorldY, isTracking: true };
      }

      // Update Zoom Persistence ONLY when hands are detected
      // Target scale calculation: 0.4 (min) + distance * 2.6
      const targetZoom = 0.4 + (distance * 2.6);
      // Smooth lerp to new zoom level
      persistentZoom.current += (targetZoom - persistentZoom.current) * 0.1;

    } else {
      prevHandPos.current.isTracking = false;
      // When not detected, we DO NOT change persistentZoom.current.
      // It stays at the last calculated value.
    }

    // Interaction Parameters
    const expansionFactor = persistentZoom.current;
    
    // Focus (Grip): Controls the tightness and energy of particles
    // 0 = Relaxed, 1 = Focused/Tense
    const tension = isDetected ? avgGrip : 0; 
    
    // Physics parameters
    const smoothing = (3.0 + (tension * 12.0)) * delta;
    
    const repulsionRadius = 3.0;
    const repulsionStrength = 20.0 * delta;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Dynamic Material Color Update for Focus Effect
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const baseColor = new THREE.Color(color);
        const focusColor = new THREE.Color('#ffffff'); // Hot white center
        // Mix base color with white based on tension
        baseColor.lerp(focusColor, tension * 0.7);
        pointsRef.current.material.color.lerp(baseColor, 0.1);
        
        // Dynamic Size
        // Increased base size to account for soft texture
        // Relaxed: 0.05, Focused: 0.08
        const targetSize = 0.05 + (tension * 0.03);
        pointsRef.current.material.size += (targetSize - pointsRef.current.material.size) * 0.1;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. Calculate Shape Target
      let tx = targetPositions[i3];
      let ty = targetPositions[i3 + 1];
      let tz = targetPositions[i3 + 2];

      // 2. Apply Expansion (Persistent Zoom)
      tx *= expansionFactor;
      ty *= expansionFactor;
      tz *= expansionFactor;

      // 3. Apply Breathing/Idling
      const breathingAmplitude = (1.0 - tension) * 0.15; 
      const breathe = Math.sin(time * 1.5 + randomOffsets[i]) * breathingAmplitude;
      tx += tx * breathe;
      ty += ty * breathe;
      tz += tz * breathe;

      // 4. Focus Effect (Grip)
      if (tension > 0.8) {
         tx += (Math.random() - 0.5) * 0.05;
         ty += (Math.random() - 0.5) * 0.05;
         tz += (Math.random() - 0.5) * 0.05;
      }

      // 5. Physics: Current State
      let cx = currentPositions[i3];
      let cy = currentPositions[i3 + 1];
      let cz = currentPositions[i3 + 2];

      // 6. Repulsion Logic (Hand movement)
      if (isDetected && handSpeed > 3.0) { 
        const dx = cx - handWorldX;
        const dy = cy - handWorldY;
        const distSq = dx*dx + dy*dy;
        
        if (distSq < repulsionRadius * repulsionRadius) {
            const dist = Math.sqrt(distSq);
            const force = (1.0 - dist / repulsionRadius) * repulsionStrength;
            cx += (dx / dist) * force;
            cy += (dy / dist) * force;
        }
      }

      // 7. Lerp towards Target
      cx += (tx - cx) * smoothing;
      cy += (ty - cy) * smoothing;
      cz += (tz - cz) * smoothing;

      // Update buffers
      currentPositions[i3] = cx;
      currentPositions[i3 + 1] = cy;
      currentPositions[i3 + 2] = cz;

      positions[i3] = cx;
      positions[i3 + 1] = cy;
      positions[i3 + 2] = cz;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * (0.05 + tension * 0.2);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      {/* Updated material with texture and adjusted size */}
      <pointsMaterial
        attach="material"
        map={particleTexture}
        size={0.05} // Increased size for visibility
        sizeAttenuation={true}
        color={color}
        transparent={true}
        alphaTest={0.01} // Helps discard fully transparent pixels
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};