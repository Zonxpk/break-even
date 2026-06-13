import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateReply } from './llm';
import type { Persona } from '../types/db';

export interface ChatMessage {
  id: string;
  role: 'user' | 'persona';
  text: string;
  at: string;
}

const key = (matchId: string) => `dating:chat:${matchId}`;

export async function loadChat(matchId: string): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(key(matchId));
  if (!raw) return [];
  return JSON.parse(raw) as ChatMessage[];
}

export async function appendChat(matchId: string, msg: ChatMessage): Promise<void> {
  const rows = await loadChat(matchId);
  rows.push(msg);
  await AsyncStorage.setItem(key(matchId), JSON.stringify(rows));
}

export async function replyToUser(matchId: string, persona: Persona, userText: string): Promise<string> {
  const text = await generateReply(persona, userText);
  await appendChat(matchId, { id: `${Date.now()}`, role: 'user', text: userText, at: new Date().toISOString() });
  await appendChat(matchId, { id: `${Date.now()}-r`, role: 'persona', text, at: new Date().toISOString() });
  return text;
}

export async function appendApology(matchId: string, personaName: string, line: string): Promise<void> {
  await appendChat(matchId, {
    id: `apology-${Date.now()}`,
    role: 'persona',
    text: `${personaName}: ${line}`,
    at: new Date().toISOString(),
  });
}
