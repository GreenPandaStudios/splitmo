import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  createLlmClient,
  createCharacterRepository,
  createTelemetryLogger,
  createSceneManager,
  createWorldRepository,
  createAgentService
} from './agents/index.ts';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const provider = process.env.LLM_PROVIDER || 'ollama';
const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.LLM_MODEL || 'llama3';
const openAiKey = process.env.OPENAI_API_KEY || '';

const llmClient = createLlmClient(
  process.env.NODE_ENV === 'test' ? 'mock' : provider,
  { url: ollamaUrl, model: ollamaModel, apiKey: openAiKey }
);

let llmAvailable = true;
const charRepo = createCharacterRepository();
const telemetryLogger = createTelemetryLogger();
const sceneManager = createSceneManager();
const worldRepo = createWorldRepository();
const agentService = createAgentService(llmClient, telemetryLogger, charRepo, worldRepo);

app.get('/api/status', async (req, res) => {
  try {
    const ok = 'checkHealth' in llmClient ? await (llmClient as any).checkHealth() : true;
    llmAvailable = ok;
    res.json({ llmAvailable: ok, provider, model: ollamaModel });
  } catch {
    res.json({ llmAvailable: false, provider, model: ollamaModel });
  }
});

app.get('/api/world', async (req, res) => {
  try { res.json(await worldRepo.getWorld()); } 
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/characters', async (req, res) => {
  try { res.json(await charRepo.getCharacters()); } 
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tick', async (req, res) => {
  try {
    const { tickCount, meetingActive, userWhispers, userMessages } = req.body;
    const result = await agentService.runTick(tickCount, meetingActive, userWhispers, userMessages);
    const wasLive = 'lastCallSucceeded' in llmClient ? (llmClient as any).lastCallSucceeded : true;
    llmAvailable = wasLive;
    res.json({ ...result, llmAvailable: wasLive });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/meeting', async (req, res) => {
  try {
    res.json({ transcript: await agentService.runStandup(req.body.topic) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/scenes', async (req, res) => {
  try { res.json(await sceneManager.listScenes()); } 
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/scenes/:name', async (req, res) => {
  try { res.json(await sceneManager.loadScene(req.params.name)); } 
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/scenes/:name', async (req, res) => {
  try {
    await sceneManager.saveScene(req.params.name, req.body.frames);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/telemetry', async (req, res) => {
  try { res.json(await telemetryLogger.readAll()); } 
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reset', async (req, res) => {
  try {
    const defaultDataPath = path.join(__dirname, '..', 'data', 'characters.json');
    const defaultData = await fs.readFile(defaultDataPath, 'utf-8');
    await charRepo.saveAll(JSON.parse(defaultData));
    await fs.writeFile(path.join(process.cwd(), 'data', 'telemetry.jsonl'), '', 'utf-8');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend Express TS server running on http://localhost:${PORT}`);
  });
}

export { app };
