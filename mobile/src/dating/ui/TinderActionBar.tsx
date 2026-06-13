import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import type { SwipeDirection } from './TinderDeck';

interface Props {
  onSwipe: (dir: SwipeDirection) => void;
  disabled?: boolean;
}

export default function TinderActionBar({ onSwipe, disabled }: Props) {
  return (
    <View style={s.row}>
      <ActionBtn
        label="ย้อน"
        glyph="↺"
        bg={theme.tinder.rewind}
        size="sm"
        disabled={disabled}
        onPress={() => Alert.alert('พรีเมียม', 'รีวายด์ใช้ได้ใน Tinder Gold — ที่นี่ยังไม่มีจริง')}
      />
      <ActionBtn
        label="ไม่"
        glyph="✕"
        bg={theme.tinder.nopeBg}
        glyphColor={theme.tinder.nope}
        size="lg"
        disabled={disabled}
        onPress={() => onSwipe('left')}
      />
      <ActionBtn
        label="ซุปเปอร์"
        glyph="★"
        bg={theme.tinder.superLikeBg}
        glyphColor={theme.tinder.superLike}
        size="md"
        disabled={disabled}
        onPress={() => onSwipe('super')}
      />
      <ActionBtn
        label="ชอบ"
        glyph="♥"
        bg={theme.tinder.likeBg}
        glyphColor={theme.tinder.like}
        size="lg"
        disabled={disabled}
        onPress={() => onSwipe('right')}
      />
      <ActionBtn
        label="บูสต์"
        glyph="⚡"
        bg="#F3E8FF"
        glyphColor={theme.tinder.boost}
        size="sm"
        disabled={disabled}
        onPress={() => Alert.alert('บูสต์แล้ว!', 'คนในรัศมี 0 กม. เพิ่มขึ้น 0 คน')}
      />
    </View>
  );
}

function ActionBtn({
  label,
  glyph,
  bg,
  glyphColor = theme.text,
  size,
  disabled,
  onPress,
}: {
  label: string;
  glyph: string;
  bg: string;
  glyphColor?: string;
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress: () => void;
}) {
  const dim = size === 'lg' ? 64 : size === 'md' ? 52 : 44;
  const fontSize = size === 'lg' ? 28 : size === 'md' ? 22 : 18;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg },
        pressed && !disabled && s.pressed,
        disabled && s.disabled,
      ]}
    >
      <Text style={[s.glyph, { fontSize, color: glyphColor }]}>{glyph}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  glyph: { fontWeight: '700' },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
  disabled: { opacity: 0.45 },
});
