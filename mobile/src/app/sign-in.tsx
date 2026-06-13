import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../state/auth';
import { theme } from '../ui/theme';

export default function SignIn() {
  const { signInGuest, signInEmail, signUpEmail } = useAuth();
  const [mode, setMode] = useState<'guest' | 'email'>('guest');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: unknown) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', e instanceof Error ? e.message : 'ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <Text style={s.logo}>เมื่อไหร่จะถึง?</Text>
      <Text style={s.brand}>When? — ส่งทุกอย่าง ถึงสักวัน</Text>

      {mode === 'guest' ? (
        <>
          <TextInput style={s.input} placeholder="ชื่อเล่นของคุณ" value={nickname} onChangeText={setNickname} />
          <Pressable
            style={[s.btn, busy && s.btnDisabled]}
            disabled={busy || nickname.trim().length === 0}
            onPress={() => run(() => signInGuest(nickname.trim()))}
          >
            <Text style={s.btnText}>เริ่มเลย (ไม่ต้องสมัคร)</Text>
          </Pressable>
          <Pressable onPress={() => setMode('email')}>
            <Text style={s.link}>หรือใช้อีเมล</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput style={s.input} placeholder="อีเมล" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={s.input} placeholder="รหัสผ่าน" secureTextEntry value={password} onChangeText={setPassword} />
          <Pressable style={[s.btn, busy && s.btnDisabled]} disabled={busy} onPress={() => run(() => signInEmail(email.trim(), password))}>
            <Text style={s.btnText}>เข้าสู่ระบบ</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => run(() => signUpEmail(email.trim(), password, email.split('@')[0]))}>
            <Text style={s.link}>สมัครใหม่ด้วยอีเมลนี้</Text>
          </Pressable>
          <Pressable onPress={() => setMode('guest')}>
            <Text style={s.link}>กลับไปแบบไม่สมัคร</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg, gap: 12 },
  logo: { fontSize: 40, fontWeight: '800', color: theme.green, textAlign: 'center' },
  brand: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: theme.radius, padding: 14, fontSize: 16 },
  btn: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: theme.green, textAlign: 'center', padding: 8 },
});
