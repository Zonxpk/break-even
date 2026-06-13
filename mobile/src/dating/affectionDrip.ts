export const CHAT_DRIP_EVERY_N = 2;
export const CHAT_DRIP_MAX = 15;

/** Returns 0 or 1 affection to grant after this user message (post-increment count). */
export function chatAffectionGain(userMsgCount: number, sessionGained: number): number {
  if (sessionGained >= CHAT_DRIP_MAX) return 0;
  if (userMsgCount % CHAT_DRIP_EVERY_N !== 0) return 0;
  return 1;
}
