import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateShapePositions = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const i3 = i * 3;

    switch (type) {
      case ShapeType.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        // Distribute slightly randomly for volume
        // 16sin^3(t)
        const hx = 16 * Math.pow(Math.sin(t), 3);
        // 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        // Scale adjustment to fit view (approx radius 4)
        const scale = 0.25; // Increased from 0.15 to fill view better
        x = hx * scale + (Math.random() - 0.5) * 0.5;
        y = hy * scale + (Math.random() - 0.5) * 0.5;
        z = (Math.random() - 0.5) * 2; 
        
        // Normalize roughly to keep camera view consistent
        x *= 1.2;
        y *= 1.2;
        break;
      }

      case ShapeType.FLOWER: {
        // Phyllotaxis
        const angle = i * 137.5 * (Math.PI / 180);
        // Reduced radius multiplier significantly to fit screen
        // Previous was 0.1, resulting in huge shape
        const radius = 0.025 * Math.sqrt(i); 
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        
        // Cup shape z-depth
        z = Math.pow(radius, 2) * 0.8 + (Math.random() - 0.5) * 0.5;
        
        // Scale and center
        x *= 3.5;
        y *= 3.5;
        z -= 3; 
        break;
      }

      case ShapeType.SATURN: {
        // Planet + Ring
        const isRing = Math.random() > 0.4; // 60% ring
        
        if (isRing) {
          const innerR = 3;
          const outerR = 5.5;
          const ringR = innerR + Math.random() * (outerR - innerR);
          const theta = Math.random() * Math.PI * 2;
          x = ringR * Math.cos(theta);
          z = ringR * Math.sin(theta);
          y = (Math.random() - 0.5) * 0.2; // Thin ring
        } else {
          // Sphere
          const r = 2.2;
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        break;
      }

      case ShapeType.FIREWORKS: {
        // Sphere explosion
        const r = 4.5 * Math.cbrt(Math.random()); // Uniform sphere distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};