import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { theme } from '../theme';

/**
 * Full-bleed sketchbook paper: solid paper fill + a dotted grid, drawn as an
 * absolutely-positioned SVG layer behind screen content. Reproduces the
 * prototype's `.doodle::before` radial-dot background (RN has no CSS
 * pseudo-elements or radial-gradient).
 */
export function PaperBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dots" width={18} height={18} patternUnits="userSpaceOnUse">
            <Circle cx={1.2} cy={1.2} r={1.1} fill={theme.doodle.grid} opacity={0.55} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={theme.doodle.paper} />
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}
