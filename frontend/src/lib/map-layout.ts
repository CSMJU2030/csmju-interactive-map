import type { MapLayout, MapPoint } from '@/types/api';

export const defaultMapLayout: MapLayout = {
  corridorPoints: [
    { x: 23, y: 3 },
    { x: 23, y: 41 },
    { x: 28, y: 44.5 },
    { x: 78, y: 44.5 },
    { x: 83, y: 41 },
    { x: 83, y: 3 },
  ],
  corridorWidth: 4.5,
};

export const corridorPath = (points: MapPoint[]) =>
  points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
