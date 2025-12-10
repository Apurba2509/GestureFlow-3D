import { ShapeType, ThemeColor } from './types';

export const PARTICLE_COUNT = 15000;

export const THEME_COLORS: ThemeColor[] = [
  { name: 'Neon Blue', hex: '#00f3ff' },
  { name: 'Love Red', hex: '#ff0055' },
  { name: 'Cosmic Purple', hex: '#bd00ff' },
  { name: 'Solar Gold', hex: '#ffcc00' },
  { name: 'Spring Green', hex: '#00ff99' },
  { name: 'Ice White', hex: '#ffffff' },
];

export const SHAPE_LABELS: Record<ShapeType, string> = {
  [ShapeType.HEART]: 'Heart',
  [ShapeType.SATURN]: 'Saturn',
  [ShapeType.FIREWORKS]: 'Fireworks',
};