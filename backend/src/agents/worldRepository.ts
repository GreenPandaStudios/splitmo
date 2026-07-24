import * as fs from 'fs/promises';
import * as path from 'path';
import { WorldConfig, IWorldRepository } from './interfaces.ts';

export class FileWorldRepository implements IWorldRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'world.json');
  }

  async getWorld(): Promise<WorldConfig> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as WorldConfig;
    } catch (error) {
      console.error('Failed to load world configuration:', error);
      throw error;
    }
  }
}

export class MemoryWorldRepository implements IWorldRepository {
  private world: WorldConfig;

  constructor(world: WorldConfig) {
    this.world = world;
  }

  async getWorld(): Promise<WorldConfig> {
    return { ...this.world };
  }
}
