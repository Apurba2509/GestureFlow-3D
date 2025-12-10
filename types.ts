export enum ShapeType {
  HEART = 'HEART',
  SATURN = 'SATURN',
  FIREWORKS = 'FIREWORKS',
}

export interface HandMetrics {
  isDetected: boolean;
  distance: number; // Distance between hands (0 to 1 normalized)
  leftGrip: number; // 0 (open) to 1 (fist)
  rightGrip: number; // 0 (open) to 1 (fist)
  avgGrip: number;
  position: { x: number, y: number }; // Normalized screen coordinates (-1 to 1)
}

export interface ParticleConfig {
  count: number;
  color: string;
  shape: ShapeType;
}

export type ThemeColor = {
  name: string;
  hex: string;
};