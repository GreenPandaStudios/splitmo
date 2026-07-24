import { describe, it, expect } from 'vitest';
import { findPath, getDistance, isValidTile, Point } from '../src/agents/pathfinding.ts';

describe('Pathfinding & Grid System', () => {
  const width = 10;
  const height = 10;
  const obstacles = new Set<string>([
    '3,3', '3,4', '3,5',
    '7,3', '7,4', '7,5',
    '4,1', '5,1'
  ]);

  describe('isValidTile', () => {
    it('should validate points inside grid and reject points outside grid boundaries', () => {
      expect(isValidTile(0, 0, width, height, obstacles)).toBe(true);
      expect(isValidTile(9, 9, width, height, obstacles)).toBe(true);
      expect(isValidTile(-1, 0, width, height, obstacles)).toBe(false);
      expect(isValidTile(10, 5, width, height, obstacles)).toBe(false);
      expect(isValidTile(5, -1, width, height, obstacles)).toBe(false);
      expect(isValidTile(5, 10, width, height, obstacles)).toBe(false);
    });

    it('should reject coordinates occupied by obstacle walls', () => {
      expect(isValidTile(3, 4, width, height, obstacles)).toBe(false);
      expect(isValidTile(7, 4, width, height, obstacles)).toBe(false);
      expect(isValidTile(3, 2, width, height, obstacles)).toBe(true);
    });
  });

  describe('getDistance', () => {
    it('should calculate correct Manhattan distance', () => {
      const a: Point = { x: 2, y: 3 };
      const b: Point = { x: 5, y: 7 };
      expect(getDistance(a, b)).toBe(7);
    });

    it('should calculate zero distance for same points', () => {
      const a: Point = { x: 5, y: 5 };
      expect(getDistance(a, a)).toBe(0);
    });
  });

  describe('findPath', () => {
    it('should return empty path if start and end are identical', () => {
      const p: Point = { x: 2, y: 2 };
      expect(findPath(p, p, width, height, obstacles)).toEqual([]);
    });

    it('should find direct straight paths in open spaces', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 0, y: 2 };
      const path = findPath(start, end, width, height, obstacles);
      
      expect(path).toEqual([
        { x: 0, y: 1 },
        { x: 0, y: 2 }
      ]);
    });

    it('should navigate around obstacle partitions', () => {
      const start = { x: 2, y: 4 };
      const end = { x: 4, y: 4 };
      const path = findPath(start, end, width, height, obstacles);

      expect(path.length).toBeGreaterThan(0);
      for (const step of path) {
        expect(isValidTile(step.x, step.y, width, height, obstacles)).toBe(true);
      }
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should fall back to nearest valid tile if destination is an obstacle', () => {
      const start = { x: 2, y: 2 };
      const end = { x: 3, y: 4 };
      const path = findPath(start, end, width, height, obstacles);

      expect(path.length).toBeGreaterThan(0);
      const finalDest = path[path.length - 1];
      expect(isValidTile(finalDest.x, finalDest.y, width, height, obstacles)).toBe(true);
      expect(getDistance(finalDest, end)).toBe(1);
    });
  });
});
