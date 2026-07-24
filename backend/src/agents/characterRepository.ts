import * as fs from 'fs/promises';
import * as path from 'path';
import { Character, ICharacterRepository } from './interfaces.ts';

export class FileCharacterRepository implements ICharacterRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'characters.json');
  }

  async getCharacters(): Promise<Character[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Character[];
    } catch (error: any) {
      console.error('Failed to load characters from file, checking defaults:', error);
      throw error;
    }
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const characters = await this.getCharacters();
    const idx = characters.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Character ${id} not found`);
    }

    const updated = { ...characters[idx], ...updates } as Character;
    characters[idx] = updated;
    await this.saveAll(characters);
    return updated;
  }

  async saveAll(characters: Character[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(characters, null, 2), 'utf-8');
  }
}

export class MemoryCharacterRepository implements ICharacterRepository {
  private characters: Character[] = [];

  constructor(initial: Character[] = []) {
    this.characters = initial;
  }

  async getCharacters(): Promise<Character[]> {
    return [...this.characters];
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const idx = this.characters.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Character ${id} not found`);
    }
    const updated = { ...this.characters[idx], ...updates } as Character;
    this.characters[idx] = updated;
    return updated;
  }

  async saveAll(characters: Character[]): Promise<void> {
    this.characters = [...characters];
  }
}
