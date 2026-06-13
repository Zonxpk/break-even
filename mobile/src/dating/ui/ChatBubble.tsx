import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';

interface Props {
  text: string;
  role: 'user' | 'persona';
}

export default function ChatBubble({ text, role }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[s.wrap, isUser ? s.userWrap : s.personaWrap]}>
      <View style={[s.bubble, isUser ? s.user : s.persona]}>
        <Text style={[s.text, isUser ? s.userText : s.personaText]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { maxWidth: '88%' },
  userWrap: { alignSelf: 'flex-end' },
  personaWrap: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  user: { backgroundColor: theme.dating.userBubble, borderBottomRightRadius: 4 },
  persona: { backgroundColor: theme.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EEE' },
  text: { fontSize: 15, lineHeight: 21 },
  userText: { color: theme.text },
  personaText: { color: theme.text },
});
