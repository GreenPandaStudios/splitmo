import * as fs from 'fs/promises';
import * as path from 'path';
import { ITelemetryLogger, TelemetryEntry } from './interfaces.ts';

export class FileTelemetryLogger implements ITelemetryLogger {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'telemetry.jsonl');
  }

  async logDecision(entry: TelemetryEntry): Promise<void> {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Append entry as single line JSON with newline
      const line = JSON.stringify(entry) + '\n';
      await fs.appendFile(this.filePath, line, 'utf-8');
    } catch (error) {
      console.error('Failed to log telemetry:', error);
    }
  }

  async readAll(): Promise<TelemetryEntry[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const lines = data.split('\n').filter((l) => l.trim().length > 0);
      return lines.map((l) => JSON.parse(l) as TelemetryEntry);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Failed to read telemetry:', error);
      throw error;
    }
  }
}

export class MemoryTelemetryLogger implements ITelemetryLogger {
  public entries: TelemetryEntry[] = [];

  async logDecision(entry: TelemetryEntry): Promise<void> {
    this.entries.push(entry);
  }

  async readAll(): Promise<TelemetryEntry[]> {
    return this.entries;
  }
}
