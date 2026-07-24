import { describe, it, expect, beforeEach } from 'vitest';
import { AgentService } from '../src/agents/agentService.ts';
import { MockLlmClient } from '../src/agents/llmClient.ts';
import { MemoryTelemetryLogger } from '../src/agents/telemetryService.ts';
import { MemoryCharacterRepository } from '../src/agents/characterRepository.ts';
import { MemoryWorldRepository } from '../src/agents/worldRepository.ts';
import { Character, WorldConfig } from '../src/agents/interfaces.ts';
import { DialogGenerator } from '../src/agents/dialogGenerator.ts';
import { GoalPlanner } from '../src/agents/goalPlanner.ts';

describe('AgentService Business Logic', () => {
  let mockLlm: MockLlmClient;
  let mockTelemetry: MemoryTelemetryLogger;
  let mockCharRepo: MemoryCharacterRepository;
  let mockWorldRepo: MemoryWorldRepository;
  let agentService: AgentService;

  const defaultChars: Character[] = [
    {
      id: 'alice', name: 'Alice', role: 'Developer',
      x: 2, y: 2, caffeine: 80, productivity: 90,
      currentTask: 'Coding', memories: [],
      schedule: [{ startTick: 0, endTick: 100, locationId: 'alice_desk', task: 'Coding' }],
      avatarEmoji: '', gradient: '', ring: '',
      goalLocationId: null, dwellTicksRemaining: 0, bio: '', relationships: {},
    },
    {
      id: 'bob', name: 'Bob', role: 'Project Manager',
      x: 6, y: 2, caffeine: 15, productivity: 80,
      currentTask: 'Managing', memories: [],
      schedule: [{ startTick: 0, endTick: 100, locationId: 'bob_desk', task: 'Managing' }],
      avatarEmoji: '', gradient: '', ring: '',
      goalLocationId: null, dwellTicksRemaining: 0, bio: '', relationships: {},
    }
  ];

  const defaultWorld: WorldConfig = {
    width: 10,
    height: 10,
    obstacles: [],
    locations: [
      { id: 'kitchen', name: 'Kitchen Bar', type: 'refill', x: 9, y: 9, caffeineImpact: 100 },
      { id: 'conference_table', name: 'Conference Table', type: 'meeting', x: 5, y: 5 },
      { id: 'alice_desk', name: 'Alice Desk', type: 'workspace', x: 2, y: 2, associatedCharacterId: 'alice' },
      { id: 'bob_desk', name: 'Bob Desk', type: 'workspace', x: 6, y: 2, associatedCharacterId: 'bob' }
    ]
  };

  beforeEach(() => {
    mockLlm = new MockLlmClient();
    mockTelemetry = new MemoryTelemetryLogger();
    mockCharRepo = new MemoryCharacterRepository(JSON.parse(JSON.stringify(defaultChars)));
    mockWorldRepo = new MemoryWorldRepository(defaultWorld);
    const dialogGen = new DialogGenerator(mockLlm);
    const goalPlanner = new GoalPlanner(mockLlm);
    agentService = new AgentService(dialogGen, goalPlanner, mockTelemetry, mockCharRepo, mockWorldRepo);
  });

  it('should decrease caffeine and move characters on tick', async () => {
    // Tick 1: both chars pick a goal (no telemetry yet — they're not pathfinding yet)
    await agentService.runTick(1, false, {});
    // Tick 2: chars pathfind toward their goals, logging telemetry
    const result = await agentService.runTick(2, false, {});
    const alice = result.characters.find(c => c.id === 'alice')!;
    expect(alice.caffeine).toBe(78); // started at 80, -1 each tick

    const telemetryLogs = await mockTelemetry.readAll();
    expect(telemetryLogs.length).toBeGreaterThan(0);
  });

  it('should redirect tired character to kitchen (via GoalPlanner fallback)', async () => {
    // MockLlm returns empty string → GoalPlanner fallback picks kitchen for Bob (caffeine 15 < 20)
    mockLlm.mockResponse = '';
    const result = await agentService.runTick(1, false, {});
    const bob = result.characters.find(c => c.id === 'bob')!;
    expect(bob.goalLocationId).toBe('kitchen');
    expect(bob.caffeine).toBe(14);
  });

  it('should trigger conversation when two agents are adjacent', async () => {
    const chars = await mockCharRepo.getCharacters();
    const alice = chars.find(c => c.id === 'alice')!;
    const bob = chars.find(c => c.id === 'bob')!;

    alice.x = 2;
    alice.y = 2;
    bob.x = 2;
    bob.y = 3;
    bob.caffeine = 100;
    await mockCharRepo.saveAll(chars);

    mockLlm.mockResponse = `Alice: Hello Bob\nBob: Hi Alice`;

    const result = await agentService.runTick(1, false, {});

    expect(result.speechBubbles['alice']).toBe('Hello Bob');
    expect(result.speechBubbles['bob']).toBe('Hi Alice');

    const updatedAlice = result.characters.find(c => c.id === 'alice')!;
    expect(updatedAlice.memories.some(m => m.includes('Spoke with Bob'))).toBe(true);
  });

  it('should condense memories using the LLM when they hit 5 entries', async () => {
    const chars = await mockCharRepo.getCharacters();
    const alice = chars.find(c => c.id === 'alice')!;
    alice.memories = ['Memory 1', 'Memory 2', 'Memory 3', 'Memory 4', 'Memory 5'];
    await mockCharRepo.saveAll(chars);

    mockLlm.mockResponse = 'Consolidated Memory A\nConsolidated Memory B';

    const result = await agentService.runTick(1, false, {});
    const updatedAlice = result.characters.find(c => c.id === 'alice')!;
    expect(updatedAlice.memories.length).toBeLessThan(5);
    expect(updatedAlice.memories[0]).toBe('Consolidated Memory A');
  });

  it('should respond to user message as the boss', async () => {
    mockLlm.mockResponse = 'Sure thing, boss!';
    const userMsgs = [{ id: '1', type: 'slack' as const, channel: '#general', sender: 'User', message: 'Hello team', timestamp: '12:00 PM' }];
    
    const result = await agentService.runTick(1, false, {}, userMsgs);
    expect(result.events.some(e => e.type === 'slack' && e.message.includes('boss'))).toBe(true);
  });
});

