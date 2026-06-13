import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatSession {
  userMsgCount: number;
  gained: number;
  startedAt: string;
}

export const SESSION_TTL_MS = 30 * 60 * 1000;

const key = (matchId: string) => `dating:chat-session:${matchId}`;

export function freshSession(now = new Date()): ChatSession {
  return { userMsgCount: 0, gained: 0, startedAt: now.toISOString() };
}

export function isSessionExpired(session: ChatSession, nowMs = Date.now()): boolean {
  return nowMs - new Date(session.startedAt).getTime() > SESSION_TTL_MS;
}

export async function loadChatSession(matchId: string): Promise<ChatSession> {
  const raw = await AsyncStorage.getItem(key(matchId));
  if (!raw) return freshSession();
  try {
    const session = JSON.parse(raw) as ChatSession;
    if (isSessionExpired(session)) return freshSession();
    return session;
  } catch {
    return freshSession();
  }
}

export async function saveChatSession(matchId: string, session: ChatSession): Promise<void> {
  await AsyncStorage.setItem(key(matchId), JSON.stringify(session));
}

export async function clearChatSession(matchId: string): Promise<void> {
  await AsyncStorage.removeItem(key(matchId));
}
