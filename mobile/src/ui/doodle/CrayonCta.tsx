import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../theme';
import { Sketch } from './Sketch';

type Props = {
  label: string;
  onPress?: () => void;
  /** `.crayon-cta.ghost` — paper fill, pencil text, lighter shadow */
  ghost?: boolean;
  disabled?: boolean;
  seed?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The prototype's `.crayon-cta`: big crayon button with 3px ink border,
 * hard offset shadow and a slight tilt (coral) or its ghost variant.
 */
export function CrayonCta({ label, onPress, ghost = false, disabled = false, seed = 99, style, testID }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} testID={testID} style={[disabled && s.disabled, style]}>
      <Sketch
        style={{ transform: [{ rotate: ghost ? '0.5deg' : '-0.6deg' }] }}
        fill={ghost ? theme.doodle.card : theme.doodle.coral}
        stroke={theme.doodle.ink}
        strokeWidth={3}
        seed={seed}
        radius={18}
        shadow
      >
        <Text style={[s.text, ghost && s.textGhost]}>{label}</Text>
      </Sketch>
    </Pressable>
  );
}

const s = StyleSheet.create({
  text: {
    fontFamily: theme.fontBold, fontSize: 17, color: '#fff',
    textAlign: 'center', paddingVertical: 14, paddingHorizontal: 14,
  },
  textGhost: { color: theme.doodle.pencil },
  disabled: { opacity: 0.4 },
});
