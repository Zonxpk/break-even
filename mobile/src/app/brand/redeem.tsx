import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { redeemClaimCode, ShopError } from '../../api/shop';
import { theme } from '../../ui/theme';

export default function BrandRedeem() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRedeem() {
    setLoading(true);
    try {
      const claim = await redeemClaimCode(code);
      Alert.alert('สำเร็จ', `รับของแล้ว: ${claim.redemption_code}`);
      setCode('');
    } catch (e) {
      const msg = e instanceof ShopError ? 'โค้ดไม่ถูกต้องหรือใช้แล้ว' : 'เกิดข้อผิดพลาด';
      Alert.alert('ไม่สำเร็จ', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'รับของที่บูธ' }} />
      <Text style={s.label}>กรอกโค้ด WHEN-...</Text>
      <TextInput
        style={s.input}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="WHEN-XXXXXXXXXXXX"
      />
      <Pressable style={s.btn} onPress={onRedeem} disabled={loading || !code.trim()}>
        <Text style={s.btnText}>{loading ? 'กำลังยืนยัน...' : 'ยืนยันรับของ'}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  label: { marginTop: 20, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 14, fontSize: 16 },
  btn: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 14, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
});
