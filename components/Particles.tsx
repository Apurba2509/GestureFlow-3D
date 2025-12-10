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

// Spatial Grid Configuration
const GRID_SIZE = 30; // World units (-15 to +15)
const GRID_RES = 15; // Resolution (cells per axis)
const GRID_CELL_SIZE = GRID_SIZE / GRID_RES;
const GRID_HALF = GRID_SIZE / 2;
const GRID_TOTAL_CELLS = GRID_RES * GRID_RES * GRID_RES;
const MAX_COLLISION_CHECKS = 8; // Performance cap per particle

export const Particles: React.FC<ParticlesProps> = ({ shapeType, color, handRef }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Store target positions (the shape)
  const targetPositions = useMemo(() => generateShapePositions(shapeType, PARTICLE_COUNT), [shapeType]);
  
  // Initialize current positions array with random spread to prevent initial explosion
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for(let i = 0; i < arr.length; i++) {
        arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);
  
  // Spatial Grid Arrays (Linked List approach)
  // gridHead stores the index of the first particle in each cell
  // gridNext stores the index of the next particle in the same cell
  const { gridHead, gridNext } = useMemo(() => ({
    gridHead: new Int32Array(GRID_TOTAL_CELLS),
    gridNext: new Int32Array(PARTICLE_COUNT)
  }), []);

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
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true; 
    return texture;
  }, []);

  // Track previous hand position to calculate velocity
  const prevHandPos = useRef<{x: number, y: number, isTracking: boolean}>({ x: 0, y: 0, isTracking: false });
  const smoothedHandPos = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  const persistentZoom = useRef(1.0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const { distance, avgGrip, isDetected, position: handScreenPos } = handRef.current;
    
    // --- Hand Tracking Logic ---
    const targetHandX = handScreenPos.x * (viewport.width / 2);
    const targetHandY = handScreenPos.y * (viewport.height / 2);

    if (isDetected) {
       if (!prevHandPos.current.isTracking) {
           smoothedHandPos.current.x = targetHandX;
           smoothedHandPos.current.y = targetHandY;
       } else {
           const lerpFactor = Math.min(1.0, 10.0 * delta);
           smoothedHandPos.current.x += (targetHandX - smoothedHandPos.current.x) * lerpFactor;
           smoothedHandPos.current.y += (targetHandY - smoothedHandPos.current.y) * lerpFactor;
       }
    }

    const handWorldX = smoothedHandPos.current.x;
    const handWorldY = smoothedHandPos.current.y;
    let handSpeed = 0;

    if (isDetected) {
      if (!prevHandPos.current.isTracking) {
        prevHandPos.current = { x: handWorldX, y: handWorldY, isTracking: true };
      } else {
        const handDx = handWorldX - prevHandPos.current.x;
        const handDy = handWorldY - prevHandPos.current.y;
        handSpeed = delta > 0.001 ? Math.sqrt(handDx*handDx + handDy*handDy) / delta : 0;
        prevHandPos.current = { x: handWorldX, y: handWorldY, isTracking: true };
      }
      const targetZoom = 0.4 + (distance * 2.6);
      persistentZoom.current += (targetZoom - persistentZoom.current) * 0.1;
    } else {
      prevHandPos.current.isTracking = false;
    }

    const expansionFactor = persistentZoom.current;
    const tension = isDetected ? avgGrip : 0; 
    const smoothing = (3.0 + (tension * 12.0)) * delta;
    const repulsionRadius = 6.0; 
    const repulsionStrength = 60.0 * delta; 
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Update Material
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const baseColor = new THREE.Color(color);
        const focusColor = new THREE.Color('#ffffff'); 
        baseColor.lerp(focusColor, tension * 0.7);
        pointsRef.current.material.color.lerp(baseColor, 0.1);
        const targetSize = 0.05 + (tension * 0.03);
        pointsRef.current.material.size += (targetSize - pointsRef.current.material.size) * 0.1;
    }

    // --- Step 1: Build Spatial Grid ---
    // Reset Grid Head
    gridHead.fill(-1);

    // Populate Grid
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const px = currentPositions[i3];
        const py = currentPositions[i3+1];
        const pz = currentPositions[i3+2];
        
        let gx = Math.floor((px + GRID_HALF) / GRID_CELL_SIZE);
        let gy = Math.floor((py + GRID_HALF) / GRID_CELL_SIZE);
        let gz = Math.floor((pz + GRID_HALF) / GRID_CELL_SIZE);
        
        // Clamp to grid
        if (gx < 0) gx = 0; else if (gx >= GRID_RES) gx = GRID_RES - 1;
        if (gy < 0) gy = 0; else if (gy >= GRID_RES) gy = GRID_RES - 1;
        if (gz < 0) gz = 0; else if (gz >= GRID_RES) gz = GRID_RES - 1;
        
        const cellIdx = gx + gy * GRID_RES + gz * GRID_RES * GRID_RES;
        gridNext[i] = gridHead[cellIdx];
        gridHead[cellIdx] = i;
    }

    // --- Step 2: Update Particles & Collide ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      let cx = currentPositions[i3];
      let cy = currentPositions[i3 + 1];
      let cz = currentPositions[i3 + 2];
      
      let tx = targetPositions[i3];
      let ty = targetPositions[i3 + 1];
      let tz = targetPositions[i3 + 2];

      // Expansion
      tx *= expansionFactor;
      ty *= expansionFactor;
      tz *= expansionFactor;

      // Breathing
      const breathingAmplitude = (1.0 - tension) * 0.15; 
      const breathe = Math.sin(time * 1.5 + randomOffsets[i]) * breathingAmplitude;
      tx += tx * breathe;
      ty += ty * breathe;
      tz += tz * breathe;

      // Focus Jitter
      if (tension > 0.8) {
         tx += (Math.random() - 0.5) * 0.05;
         ty += (Math.random() - 0.5) * 0.05;
         tz += (Math.random() - 0.5) * 0.05;
      }

      // Hand Repulsion
      if (isDetected && handSpeed > 1.5) { 
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

      // --- Collision Detection (Using Grid) ---
      // Re-calculate cell for current position (approximate)
      let gx = Math.floor((cx + GRID_HALF) / GRID_CELL_SIZE);
      let gy = Math.floor((cy + GRID_HALF) / GRID_CELL_SIZE);
      let gz = Math.floor((cz + GRID_HALF) / GRID_CELL_SIZE);
      
      if (gx < 0) gx = 0; else if (gx >= GRID_RES) gx = GRID_RES - 1;
      if (gy < 0) gy = 0; else if (gy >= GRID_RES) gy = GRID_RES - 1;
      if (gz < 0) gz = 0; else if (gz >= GRID_RES) gz = GRID_RES - 1;

      const cellIdx = gx + gy * GRID_RES + gz * GRID_RES * GRID_RES;
      
      let neighbor = gridHead[cellIdx];
      let checks = 0;
      
      // Iterate neighbors in the same cell
      while (neighbor !== -1 && checks < MAX_COLLISION_CHECKS) {
         if (neighbor !== i) {
             const n3 = neighbor * 3;
             const nx = currentPositions[n3];
             const ny = currentPositions[n3+1];
             const nz = currentPositions[n3+2];
             
             const dx = cx - nx;
             const dy = cy - ny;
             const dz = cz - nz;
             const distSq = dx*dx + dy*dy + dz*dz;
             
             const radius = 0.08; // Physical radius
             const minDist = radius * 2;
             
             if (distSq < minDist * minDist && distSq > 0.00001) {
                 const dist = Math.sqrt(distSq);
                 const force = (minDist - dist) / dist;
                 const collisionStrength = 0.25; // Soft collision
                 
                 cx += dx * force * collisionStrength;
                 cy += dy * force * collisionStrength;
                 cz += dz * force * collisionStrength;
             }
         }
         neighbor = gridNext[neighbor];
         checks++;
      }

      // Move towards target (Integration)
      cx += (tx - cx) * smoothing;
      cy += (ty - cy) * smoothing;
      cz += (tz - cz) * smoothing;

      // Write back
      currentPositions[i3] = cx;
      currentPositions[i3 + 1] = cy;
      currentPositions[i3 + 2] = cz;

      // Update Visuals
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
      <pointsMaterial
        attach="material"
        map={particleTexture}
        size={0.05}
        sizeAttenuation={true}
        color={color}
        transparent={true}
        alphaTest={0.01}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};