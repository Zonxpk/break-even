import AsyncStorage from '@react-native-async-storage/async-storage';
import { scriptedReply } from './chat';
import type { Persona } from '../types/db';

const LLM_KEY = 'dating:llm:apiKey';

export async function getLlmApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(LLM_KEY);
}

export async function setLlmApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(LLM_KEY, key.trim());
}

export async function generateReply(persona: Persona, userText: string): Promise<string> {
  const apiKey = await getLlmApiKey();
  if (apiKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 120,
          system: persona.system_prompt,
          messages: [{ role: 'user', content: userText }],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.content?.[0]?.text;
        if (text) return `${persona.name}: ${text}`;
      }
    } catch {
      // fall through to scripted
    }
  }
  return scriptedReply(persona, userText);
}
