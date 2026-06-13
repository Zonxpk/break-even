import { chatAffectionGain } from '../affectionDrip';

test.each([
  [1, 0, 0],
  [2, 0, 1],
  [4, 1, 1],
  [30, 14, 1],
  [30, 15, 0],
  [32, 15, 0],
])('chatAffectionGain(%i, %i) → %i', (userMsgCount, sessionGained, expected) => {
  expect(chatAffectionGain(userMsgCount, sessionGained)).toBe(expected);
});
