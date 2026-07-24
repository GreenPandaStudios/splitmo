export interface Point {
  x: number;
  y: number;
}

export function isValidTile(
  x: number,
  y: number,
  width: number,
  height: number,
  obstacles: Set<string>
): boolean {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return false;
  }
  return !obstacles.has(`${x},${y}`);
}

export function findPath(
  start: Point,
  end: Point,
  width: number,
  height: number,
  obstacles: Set<string>
): Point[] {
  if (start.x === end.x && start.y === end.y) {
    return [];
  }

  let target = { ...end };
  if (!isValidTile(target.x, target.y, width, height, obstacles)) {
    const adjacent = getNeighbors(target).filter(p => isValidTile(p.x, p.y, width, height, obstacles));
    if (adjacent.length > 0) {
      target = adjacent[0];
    } else {
      return [];
    }
  }

  const queue: Point[] = [start];
  const visited = new Set<string>([`${start.x},${start.y}`]);
  const parentMap = new Map<string, string>();

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === target.x && current.y === target.y) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      const coordStr = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(coordStr) && isValidTile(neighbor.x, neighbor.y, width, height, obstacles)) {
        visited.add(coordStr);
        parentMap.set(coordStr, `${current.x},${current.y}`);
        queue.push(neighbor);
      }
    }
  }

  if (!found) {
    return [];
  }

  const path: Point[] = [];
  let currentKey = `${target.x},${target.y}`;
  const startKey = `${start.x},${start.y}`;

  while (currentKey !== startKey) {
    const [xStr, yStr] = currentKey.split(',');
    path.push({ x: parseInt(xStr), y: parseInt(yStr) });
    currentKey = parentMap.get(currentKey)!;
  }

  return path.reverse();
}

function getNeighbors(p: Point): Point[] {
  return [
    { x: p.x, y: p.y - 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x + 1, y: p.y }
  ];
}

export function getDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
