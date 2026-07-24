import type { Character, ITelemetryLogger, ICharacterRepository, IWorldRepository, WorldConfig, IGoalPlanner } from './interfaces.ts';
import { findPath, getDistance } from './pathfinding.ts';
import { DialogGenerator } from './dialogGenerator.ts';
import { getTimeOfDay } from './helpers.ts';

type Event = { type: string; message: string; sender?: string; channel?: string };

export class AgentService {
  constructor(
    private dialogGen: DialogGenerator,
    private goalPlanner: IGoalPlanner,
    private telemetryLogger: ITelemetryLogger,
    private charRepo: ICharacterRepository,
    private worldRepo: IWorldRepository
  ) {}

  async runTick(
    tickCount: number,
    meetingActive: boolean,
    userWhispers: { [id: string]: string },
    userMessages?: { channel: string; sender: string; message: string; timestamp: string }[]
  ) {
    const characters = await this.charRepo.getCharacters();
    const world = await this.worldRepo.getWorld();
    const events: Event[] = [];
    const speechBubbles: { [id: string]: string } = {};
    const obstacles = new Set(world.obstacles.map(o => `${o.x},${o.y}`));

    const updatedChars = await Promise.all(
      characters.map(char => this.tickCharacter(char, characters, tickCount, meetingActive, userWhispers, events, world, obstacles))
    );

    // Bumping-into-each-other conversations
    const conversed = new Set<string>();
    for (let i = 0; i < updatedChars.length; i++) {
      for (let j = i + 1; j < updatedChars.length; j++) {
        const c1 = updatedChars[i], c2 = updatedChars[j];
        if (getDistance({ x: c1.x, y: c1.y }, { x: c2.x, y: c2.y }) <= 1 && !conversed.has(c1.id) && !conversed.has(c2.id)) {
          conversed.add(c1.id); conversed.add(c2.id);
          const dialog = await this.dialogGen.generateInteraction(c1, c2);
          speechBubbles[c1.id] = dialog.c1Line; speechBubbles[c2.id] = dialog.c2Line;
          events.push({ type: 'slack', sender: c1.name, message: dialog.c1Line, channel: '#general' });
          events.push({ type: 'slack', sender: c2.name, message: dialog.c2Line, channel: '#general' });
          c1.memories.push(`Spoke with ${c2.name}: "${dialog.c1Line} -> ${dialog.c2Line}"`);
          c2.memories.push(`Spoke with ${c1.name}: "${dialog.c1Line} -> ${dialog.c2Line}"`);
          if (dialog.c1OpinionOfC2) c1.relationships[c2.id] = dialog.c1OpinionOfC2;
          if (dialog.c2OpinionOfC1) c2.relationships[c1.id] = dialog.c2OpinionOfC1;
        }
      }
    }

    // Respond to user (the boss) Slack messages
    if (userMessages && userMessages.length > 0) {
      for (const msg of userMessages) {
        if (msg.sender === 'User') {
          // Pick 1-2 random characters to reply to the boss
          const responders = [...updatedChars].sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 2));
          for (const responder of responders) {
            const reply = await this.dialogGen.generateSlackResponse(responder, msg);
            events.push({ type: 'slack', sender: responder.name, message: reply, channel: msg.channel });
            responder.memories.push(`Replied to boss in ${msg.channel}: "${reply}"`);
          }
        }
      }
    }

    // Condense memories for characters with too many entries
    for (const char of updatedChars) {
      if (char.memories.length >= 5) {
        char.memories = await this.condenseMemories(char);
      }
    }

    await this.charRepo.saveAll(updatedChars);
    return { characters: updatedChars, events, speechBubbles };
  }

  async runStandup(topic: string) {
    const characters = await this.charRepo.getCharacters();
    const { transcript, updatedCharacters } = await this.dialogGen.runStandup(characters, topic);
    for (const char of updatedCharacters) {
      if (char.memories.length >= 5) {
        char.memories = await this.condenseMemories(char);
      }
    }
    await this.charRepo.saveAll(updatedCharacters);
    return transcript;
  }

  private async condenseMemories(char: Character): Promise<string[]> {
    const prompt = `You are ${char.name}, the ${char.role}. Bio: ${char.bio}.
Here are your recent office memories:
${char.memories.join('\n')}

Condense these memories into 2 extremely short bullet points capturing key work progress and relations (first-person perspective). Do not output anything else.`;
    try {
      const summary = await this.dialogGen['llmClient'].generateCompletion(prompt);
      return summary.split('\n').map(l => l.trim().replace(/^-\s*|\*\s*/, '')).filter(l => l.length > 0).slice(0, 2);
    } catch {
      return char.memories.slice(-2);
    }
  }

  private async tickCharacter(
    char: Character, allChars: Character[], tickCount: number, meetingActive: boolean,
    userWhispers: { [id: string]: string }, events: Event[], world: WorldConfig, obstacles: Set<string>
  ): Promise<Character> {
    const newCaffeine = Math.max(0, char.caffeine - 1);
    if (userWhispers[char.id]) {
      events.push({ type: 'system', message: `Whisper to ${char.name}: "${userWhispers[char.id]}"`, channel: '#system' });
    }
    if (char.dwellTicksRemaining > 0) {
      return { ...char, caffeine: newCaffeine, dwellTicksRemaining: char.dwellTicksRemaining - 1 };
    }
    const meetingLoc = world.locations.find(l => l.type === 'meeting');
    if (meetingActive && meetingLoc) {
      const path = findPath({ x: char.x, y: char.y }, { x: meetingLoc.x, y: meetingLoc.y }, world.width, world.height, obstacles);
      const next = path[0] ?? { x: char.x, y: char.y };
      const task = char.x === meetingLoc.x && char.y === meetingLoc.y ? 'Attending standup' : `Heading to ${meetingLoc.name}`;
      return { ...char, x: next.x, y: next.y, caffeine: newCaffeine, currentTask: task, goalLocationId: meetingLoc.id, dwellTicksRemaining: 0 };
    }
    const goalLoc = char.goalLocationId ? world.locations.find(l => l.id === char.goalLocationId) : null;
    const arrived = goalLoc && char.x === goalLoc.x && char.y === goalLoc.y;
    const needsGoal = !goalLoc || arrived;
    if (needsGoal) {
      let arrivedCaffeine = newCaffeine;
      if (arrived && goalLoc!.type === 'refill') {
        arrivedCaffeine = goalLoc!.caffeineImpact ?? 100;
        const msg = await this.dialogGen.generateLocationArrivalMessage(char, goalLoc!);
        events.push({ type: 'slack', sender: char.name, message: msg, channel: '#kitchen' });
      }
      const decision = await this.goalPlanner.decideNextAction({ ...char, caffeine: arrivedCaffeine }, allChars, world, tickCount);
      const dwell = arrived ? (5 + Math.floor(Math.random() * 6)) : 0;
      events.push({ type: 'system', message: `${char.name} decided: ${decision.task}`, channel: '#system' });
      return { ...char, caffeine: arrivedCaffeine, goalLocationId: decision.locationId, currentTask: decision.task, dwellTicksRemaining: dwell };
    }
    const path = findPath({ x: char.x, y: char.y }, { x: goalLoc!.x, y: goalLoc!.y }, world.width, world.height, obstacles);
    const next = path[0] ?? { x: char.x, y: char.y };
    await this.telemetryLogger.logDecision({
      timestamp: new Date().toISOString(), characterId: char.id,
      context: { caffeineLevel: newCaffeine, x: char.x, y: char.y, targetX: goalLoc!.x, targetY: goalLoc!.y, timeOfDay: getTimeOfDay(tickCount), productivity: char.productivity, nearOtherAgents: false },
      decision: { action: 'MOVE', targetId: goalLoc!.id, pathLength: path.length },
    });
    return { ...char, x: next.x, y: next.y, caffeine: newCaffeine };
  }
}
