import { OllamaLlmClient, OpenAiLlmClient, MockLlmClient } from './llmClient.ts';
import { FileCharacterRepository } from './characterRepository.ts';
import { FileTelemetryLogger } from './telemetryService.ts';
import { FileSceneManager } from './sceneManager.ts';
import { FileWorldRepository } from './worldRepository.ts';
import { AgentService } from './agentService.ts';
import { ILlmClient, ITelemetryLogger, ICharacterRepository, IWorldRepository, ISceneManager } from './interfaces.ts';
import { DialogGenerator } from './dialogGenerator.ts';
import { GoalPlanner } from './goalPlanner.ts';

export type {
  Character,
  ChatMessage,
  ILlmClient,
  ITelemetryLogger,
  ICharacterRepository,
  IWorldRepository,
  ISceneManager,
  Frame,
  TelemetryEntry,
  Location,
  WorldConfig
} from './interfaces.ts';

export interface IAgentService {
  runTick(
    tickCount: number,
    meetingActive: boolean,
    userWhispers: { [id: string]: string }
  ): Promise<{
    characters: any[];
    events: any[];
    speechBubbles: { [id: string]: string };
  }>;
  runStandup(topic: string): Promise<{ sender: string; text: string }[]>;
}

export function createLlmClient(
  provider: string,
  config: { url?: string; model?: string; apiKey?: string }
): ILlmClient {
  if (provider === 'mock') {
    return new MockLlmClient();
  }
  if (provider === 'openai' && config.apiKey) {
    return new OpenAiLlmClient(config.apiKey, config.model || 'gpt-4o-mini');
  }
  return new OllamaLlmClient(config.url || 'http://localhost:11434', config.model || 'llama3');
}

export function createCharacterRepository(): ICharacterRepository {
  return new FileCharacterRepository();
}

export function createTelemetryLogger(): ITelemetryLogger {
  return new FileTelemetryLogger();
}

export function createSceneManager(): ISceneManager {
  return new FileSceneManager();
}

export function createWorldRepository(): IWorldRepository {
  return new FileWorldRepository();
}

export function createAgentService(
  llmClient: ILlmClient,
  telemetryLogger: ITelemetryLogger,
  charRepo: ICharacterRepository,
  worldRepo: IWorldRepository
): IAgentService {
  const dialogGen = new DialogGenerator(llmClient);
  const goalPlanner = new GoalPlanner(llmClient);
  return new AgentService(dialogGen, goalPlanner, telemetryLogger, charRepo, worldRepo);
}
