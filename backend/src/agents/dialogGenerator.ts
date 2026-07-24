import { Character, ILlmClient, Location } from './interfaces.ts';

export class DialogGenerator {
  constructor(private llmClient: ILlmClient) {}

  async generateInteraction(c1: Character, c2: Character): Promise<{ c1Line: string; c2Line: string; c1OpinionOfC2?: string; c2OpinionOfC1?: string }> {
    const prompt = `
You are orchestrating a brief dialog between two office co-workers bumping into each other.
Character A: ${c1.name} (${c1.role}). Bio: ${c1.bio}. Current task: ${c1.currentTask}. Memories: ${c1.memories.slice(-2).join(' | ')}.
Character A's relationship opinion of B: "${c1.relationships?.[c2.id] || 'neutral'}"

Character B: ${c2.name} (${c2.role}). Bio: ${c2.bio}. Current task: ${c2.currentTask}. Memories: ${c2.memories.slice(-2).join(' | ')}.
Character B's relationship opinion of A: "${c2.relationships?.[c1.id] || 'neutral'}"

Generate exactly two lines of dialog, followed by each character's updated short relationship opinion of the other based on this interaction.
Ensure dialogue is concise, fits their roles/personality bios, and references their tasks/memories.

Format your output exactly as:
${c1.name}: [A's line]
${c2.name}: [B's line]
${c1.name}'s updated opinion of ${c2.name}: [Updated relationship note, under 1 sentence]
${c2.name}'s updated opinion of ${c1.name}: [Updated relationship note, under 1 sentence]`;

    try {
      const response = await this.llmClient.generateCompletion(prompt);
      const lines = response.split('\n').filter((l) => l.includes(':'));
      let c1Line = `Hey ${c2.name}, how is the ${c2.currentTask} going?`;
      let c2Line = `Good! Just finishing up. How is your ${c1.currentTask}?`;
      let c1Opinion = c1.relationships?.[c2.id];
      let c2Opinion = c2.relationships?.[c1.id];

      for (const line of lines) {
        const lower = line.trim().toLowerCase();
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = lower.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '').trim();

        if (key === c1.id || key === c1.name.toLowerCase()) {
          c1Line = val;
        } else if (key === c2.id || key === c2.name.toLowerCase()) {
          c2Line = val;
        } else if (key.includes('opinion of ' + c2.name.toLowerCase())) {
          c1Opinion = val;
        } else if (key.includes('opinion of ' + c1.name.toLowerCase())) {
          c2Opinion = val;
        }
      }
      return { c1Line, c2Line, c1OpinionOfC2: c1Opinion, c2OpinionOfC1: c2Opinion };
    } catch {
      const fallbacks = [
        {
          c1: `Hey ${c2.name}, how is the ${c2.currentTask} going?`,
          c2: `Hey ${c1.name}. Just focusing on ${c2.currentTask} right now. Sprints are busy!`
        },
        {
          c1: `Hey ${c2.name}, any blockers on ${c2.currentTask}?`,
          c2: `No major blockers, ${c1.name}. Just working through it. How is your ${c1.currentTask}?`
        },
        {
          c1: `${c2.name}, let's sync up on ${c2.currentTask} later today.`,
          c2: `Sounds good, ${c1.name}. Let's grab coffee and chat then.`
        },
        {
          c1: `Hey ${c2.name}, how are things with "${c2.currentTask}"?`,
          c2: `Hey ${c1.name}. I'm currently focused on "${c1.currentTask}". Let's chat later!`
        }
      ];
      const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return { c1Line: selected.c1, c2Line: selected.c2 };
    }
  }

  async runStandup(characters: Character[], topic: string): Promise<{ transcript: { sender: string; text: string }[]; updatedCharacters: Character[] }> {
    const transcript: { sender: string; text: string }[] = [];
    const updatedCharacters: Character[] = [];
    for (const char of characters) {
      const prompt = `
You are ${char.name}, the ${char.role}. Bio: ${char.bio}.
You are attending a team standup meeting. The meeting topic is: "${topic}".
Your memories: ${char.memories.join('\n')}
Your current task is: ${char.currentTask}

Say one concise sentence reporting your progress, aligning with the topic, and addressing the team. Reflect your personality. Do not output anything else besides your spoken sentence.`;
      let cleanResponse = `I'm working on "${char.currentTask}" and keeping things moving.`;
      try {
        const response = await this.llmClient.generateCompletion(prompt);
        cleanResponse = response.replace(/^"|"$/g, '').trim();
      } catch { /* fallback to default */ }
      transcript.push({ sender: char.name, text: cleanResponse });
      const updatedMemories = [...char.memories, `Said in standup: "${cleanResponse}"`].slice(-5);
      updatedCharacters.push({ ...char, memories: updatedMemories });
    }
    return { transcript, updatedCharacters };
  }

  async generateLocationArrivalMessage(char: Character, location: Location): Promise<string> {
    const prompt = `
You are ${char.name}, the ${char.role}. Bio: ${char.bio}.
You just arrived at: "${location.name}" (type: "${location.type}"). Current task: "${char.currentTask}".

Say one concise, casual sentence announcing your arrival. Reflect your personality. Do not use quotes or prefixes, just output the spoken sentence.`;
    try {
      const response = await this.llmClient.generateCompletion(prompt);
      return response.replace(/^"|"$/g, '').trim();
    } catch {
      return `Arrived at ${location.name}.`;
    }
  }

  async generateSlackResponse(char: Character, msg: { sender: string; message: string; channel: string }): Promise<string> {
    const prompt = `
You are ${char.name}, the ${char.role}. Bio: ${char.bio}.
Your boss (User) just posted in the Slack channel "${msg.channel}": "${msg.message}"

Write a quick, one-sentence reply to the boss. Make sure to refer to them as "the boss", "boss", or "Mr./Ms. Boss" to show respect, while reflecting your personality.
Keep it extremely concise and direct. Do not use quotes, just output the spoken sentence.`;
    try {
      const response = await this.llmClient.generateCompletion(prompt);
      return response.replace(/^"|"$/g, '').trim();
    } catch {
      return `On it, boss!`;
    }
  }
}
