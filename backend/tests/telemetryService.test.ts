import { describe, it, expect, afterAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileTelemetryLogger } from '../src/agents/telemetryService.ts';
import { TelemetryEntry } from '../src/agents/interfaces.ts';

describe('FileTelemetryLogger', () => {
  const testFile = path.join(process.cwd(), 'data', 'telemetry_test.jsonl');
  const logger = new FileTelemetryLogger(testFile);

  afterAll(async () => {
    try {
      await fs.unlink(testFile);
    } catch (e) {}
  });

  it('should write decision context lines to disk and parse them back', async () => {
    const entry: TelemetryEntry = {
      timestamp: new Date().toISOString(),
      characterId: 'alice',
      context: {
        caffeineLevel: 85,
        x: 2,
        y: 2,
        timeOfDay: '9:00 AM',
        productivity: 90,
        nearOtherAgents: false
      },
      decision: {
        action: 'MOVE',
        targetId: 'kitchen',
        pathLength: 4
      }
    };

    await logger.logDecision(entry);
    
    // Check that file was created
    const stats = await fs.stat(testFile);
    expect(stats.isFile()).toBe(true);

    // Read it back
    const logs = await logger.readAll();
    expect(logs.length).toBe(1);
    expect(logs[0].characterId).toBe('alice');
    expect(logs[0].context.caffeineLevel).toBe(85);
    expect(logs[0].decision.action).toBe('MOVE');
  });
});
