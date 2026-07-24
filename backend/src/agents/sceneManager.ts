import * as fs from 'fs/promises';
import * as path from 'path';
import { Frame, ISceneManager } from './interfaces.ts';

export class FileSceneManager implements ISceneManager {
  private scenesDir: string;

  constructor(scenesDir?: string) {
    this.scenesDir = scenesDir || path.join(process.cwd(), 'data', 'scenes');
  }

  async listScenes(): Promise<string[]> {
    try {
      await fs.mkdir(this.scenesDir, { recursive: true });
      const files = await fs.readdir(this.scenesDir);
      return files
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.substring(0, f.length - 5));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Failed to list scenes:', error);
      throw error;
    }
  }

  async loadScene(name: string): Promise<Frame[]> {
    try {
      const filePath = path.join(this.scenesDir, `${name}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Frame[];
    } catch (error) {
      console.error(`Failed to load scene ${name}:`, error);
      throw error;
    }
  }

  async saveScene(name: string, frames: Frame[]): Promise<void> {
    try {
      await fs.mkdir(this.scenesDir, { recursive: true });
      const filePath = path.join(this.scenesDir, `${name}.json`);
      await fs.writeFile(filePath, JSON.stringify(frames, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save scene ${name}:`, error);
      throw error;
    }
  }
}

export class MemorySceneManager implements ISceneManager {
  private scenes = new Map<string, Frame[]>();

  async listScenes(): Promise<string[]> {
    return Array.from(this.scenes.keys());
  }

  async loadScene(name: string): Promise<Frame[]> {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }
    return [...scene];
  }

  async saveScene(name: string, frames: Frame[]): Promise<void> {
    this.scenes.set(name, [...frames]);
  }
}
