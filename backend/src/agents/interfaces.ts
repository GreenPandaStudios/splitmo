export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ILlmClient {
  generateCompletion(prompt: string, systemInstruction?: string): Promise<string>;
  generateChat(messages: ChatMessage[]): Promise<string>;
}

export interface TelemetryEntry {
  timestamp: string;
  characterId: string;
  context: {
    caffeineLevel: number;
    x: number;
    y: number;
    targetX?: number;
    targetY?: number;
    timeOfDay: string;
    productivity: number;
    nearOtherAgents: boolean;
  };
  decision: {
    action: 'MOVE' | 'TALK' | 'GET_COFFEE' | 'STANDUP' | 'IDLE';
    targetId?: string;
    pathLength?: number;
  };
  conversationId?: string;
}

export interface ITelemetryLogger {
  logDecision(entry: TelemetryEntry): Promise<void>;
  readAll(): Promise<TelemetryEntry[]>;
}

export interface ScheduleItem {
  startTick: number;
  endTick: number;
  locationId: string;
  task: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  caffeine: number;
  productivity: number;
  currentTask: string;
  memories: string[];
  schedule: ScheduleItem[];
  avatarEmoji: string;
  gradient: string;
  ring: string;
  goalLocationId: string | null;
  dwellTicksRemaining: number;
  bio: string;
  relationships: { [charId: string]: string };
}

export interface ICharacterRepository {
  getCharacters(): Promise<Character[]>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character>;
  saveAll(characters: Character[]): Promise<void>;
}

export interface Location {
  id: string;
  name: string;
  type: 'refill' | 'meeting' | 'lounge' | 'workspace';
  x: number;
  y: number;
  caffeineImpact?: number;
  associatedCharacterId?: string;
  icon?: string;
}

export interface WorldConfig {
  width: number;
  height: number;
  obstacles: { x: number; y: number }[];
  locations: Location[];
}

export interface IWorldRepository {
  getWorld(): Promise<WorldConfig>;
}

export interface Frame {
  tick: number;
  timeOfDay: string;
  characters: Character[];
  slackLogs: {
    id: string;
    channel: string;
    sender: string;
    text: string;
    timestamp: string;
  }[];
  activeSpeechBubbles: { [characterId: string]: string };
}

export interface ISceneManager {
  listScenes(): Promise<string[]>;
  loadScene(name: string): Promise<Frame[]>;
  saveScene(name: string, frames: Frame[]): Promise<void>;
}

export interface IGoalPlanner {
  decideNextAction(
    char: Character,
    allChars: Character[],
    world: WorldConfig,
    tick: number
  ): Promise<{ locationId: string; task: string }>;
}
