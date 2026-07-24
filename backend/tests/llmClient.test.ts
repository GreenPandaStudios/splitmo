import { describe, it, expect } from 'vitest';
import { MockLlmClient } from '../src/agents/llmClient.ts';

describe('LLM Clients & Dependency Injection', () => {
  describe('MockLlmClient', () => {
    it('should capture generateCompletion input and output mock values', async () => {
      const client = new MockLlmClient();
      client.mockResponse = 'Custom Test Output';

      const res = await client.generateCompletion('Test Prompt', 'System Instruction');
      
      expect(res).toBe('Custom Test Output');
      expect(client.lastPrompt).toBe('Test Prompt');
      expect(client.lastMessages).toEqual([
        { role: 'system', content: 'System Instruction' },
        { role: 'user', content: 'Test Prompt' }
      ]);
    });

    it('should handle generateChat input', async () => {
      const client = new MockLlmClient();
      const messages = [
        { role: 'user' as const, content: 'Ping' },
        { role: 'assistant' as const, content: 'Pong' }
      ];

      const res = await client.generateChat(messages);
      
      expect(res).toBe('Mock LLM Response');
      expect(client.lastMessages).toEqual(messages);
    });
  });
});
