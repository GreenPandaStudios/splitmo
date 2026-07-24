import { OpenAI } from 'openai';
import { ChatMessage, ILlmClient } from './interfaces.ts';

export class OllamaLlmClient implements ILlmClient {
  private baseUrl: string;
  private model: string;
  public lastCallSucceeded = false;

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateCompletion(prompt: string, systemInstruction?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    return this.generateChat(messages);
  }

  async generateChat(messages: ChatMessage[]): Promise<string> {
    try {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const options: any = {};
      if (lastMsg.includes('Decide where to go next')) {
        options.num_predict = 15;
        options.temperature = 0.1;
      } else if (lastMsg.includes('updated short relationship opinion')) {
        options.num_predict = 150;
      } else if (lastMsg.includes('morning standup update') || lastMsg.includes('spoken sentence')) {
        options.num_predict = 80;
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, messages, stream: false, options }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error(`Ollama returned ${response.status}: ${await response.text()}`);
      const data = (await response.json()) as { message: { content: string } };
      this.lastCallSucceeded = true;
      return data.message.content;
    } catch (error) {
      this.lastCallSucceeded = false;
      console.warn('[LLM] Ollama call failed:', (error as Error).message);
      return '';
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const r = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return r.ok;
    } catch {
      return false;
    }
  }
}

export class OpenAiLlmClient implements ILlmClient {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateCompletion(prompt: string, systemInstruction?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    return this.generateChat(messages);
  }

  async generateChat(messages: ChatMessage[]): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return response.choices[0]?.message?.content || '';
  }
}

export class MockLlmClient implements ILlmClient {
  public lastPrompt = '';
  public lastMessages: ChatMessage[] = [];
  public mockResponse = 'Mock LLM Response';

  async generateCompletion(prompt: string, systemInstruction?: string): Promise<string> {
    this.lastPrompt = prompt;
    this.lastMessages = [
      ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
      { role: 'user' as const, content: prompt },
    ];
    return this.mockResponse;
  }

  async generateChat(messages: ChatMessage[]): Promise<string> {
    this.lastMessages = messages;
    return this.mockResponse;
  }
}

// Canned fallback lines for offline mode — not used unless explicitly invoked
export function generateLocalFallbackResponse(context: string): string {
  const text = context.toLowerCase();
  if (text.includes('coffee') || text.includes('caffeine')) return "Coffee time — BRB.";
  if (text.includes('meeting') || text.includes('standup')) return "On my way to the meeting room.";
  if (text.includes('bug') || text.includes('auth') || text.includes('code')) return "Looking into that now.";
  return "Sounds good, let's sync later.";
}
