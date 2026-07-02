import { theme } from '../theme';

/**
 * Shared Stack.Screen header options for Doodle screens — paper background,
 * Mali ink title, no hairline shadow (the prototype has no chrome besides
 * the sketchbook itself).
 */
export const doodleHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: theme.doodle.paper },
  headerTitleStyle: { fontFamily: theme.fontBold, color: theme.doodle.ink },
  headerTintColor: theme.doodle.ink,
  headerShadowVisible: false,
} as const;
