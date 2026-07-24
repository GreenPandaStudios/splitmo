import type { Character, ILlmClient, WorldConfig, IGoalPlanner } from './interfaces.ts';
import { getTimeOfDay } from './helpers.ts';

export interface GoalDecision {
  locationId: string;
  task: string;
}

export class GoalPlanner implements IGoalPlanner {
  constructor(private llmClient: ILlmClient) {}

  async decideNextAction(
    char: Character,
    allChars: Character[],
    world: WorldConfig,
    tick: number
  ): Promise<GoalDecision> {
    const occupancy = world.locations.map(loc => {
      const who = allChars
        .filter(c => c.id !== char.id && c.x === loc.x && c.y === loc.y)
        .map(c => c.name);
      return `  ${loc.id} (${loc.name}): ${who.length ? who.join(' & ') + ' is here' : 'empty'}`;
    }).join('\n');

    const cycle = tick % 100;
    const sched = char.schedule.find(s => cycle >= s.startTick && cycle < s.endTick);
    const schedHint = sched
      ? `Your schedule suggests: "${sched.task}" at ${sched.locationId}.`
      : 'No scheduled activity right now.';
    const locationIds = world.locations.map(l => l.id).join(', ');
    const timeOfDay = getTimeOfDay(tick);

    const rels = Object.entries(char.relationships || {})
      .map(([id, desc]) => `  - ${id} (${allChars.find(c => c.id === id)?.name || id}): ${desc}`)
      .join('\n');

    const prompt = `You are ${char.name}, a ${char.role} in a co-working office. It is ${timeOfDay}.
Personality/Background: ${char.bio}

Your current relationships with co-workers:
${rels}

Caffeine: ${char.caffeine}%. Memories: ${char.memories.slice(-3).join(' | ') || 'none so far'}.
${schedHint}

Current office layout:
${occupancy}

Decide where to go next. Consider your relationships and memories — if someone you dislike or find micro-managing is at a location, you might choose to go elsewhere.
Reply with ONLY one location ID from: ${locationIds}`;

    try {
      const response = await this.llmClient.generateCompletion(prompt);
      const cleaned = response.trim().toLowerCase().replace(/['".,!\n]/g, '').split(/\s+/)[0];
      const match = world.locations.find(l => cleaned === l.id || cleaned.includes(l.id));
      if (match) {
        const relSched = char.schedule.find(s => s.locationId === match.id);
        return { locationId: match.id, task: relSched?.task ?? `Visiting ${match.name}` };
      }
    } catch { /* fall through to deterministic fallback */ }

    return this.fallback(char, world, tick);
  }

  fallback(char: Character, world: WorldConfig, tick: number): GoalDecision {
    if (char.caffeine < 20) {
      const refill = world.locations.find(l => l.type === 'refill')!;
      return { locationId: refill.id, task: `Getting coffee at ${refill.name}` };
    }
    const cycle = tick % 100;
    const sched = char.schedule.find(s => cycle >= s.startTick && cycle < s.endTick);
    if (sched) return { locationId: sched.locationId, task: sched.task };
    const desk = world.locations.find(l => l.associatedCharacterId === char.id && l.type === 'workspace')
      ?? world.locations.find(l => l.type === 'lounge')!;
    return { locationId: desk.id, task: 'Working at desk' };
  }
}
