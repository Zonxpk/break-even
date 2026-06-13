import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { theme } from '../ui/theme';

export default function Partner() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [merchDesc, setMerchDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = [company, contact, merchDesc, budget].every((v) => v.trim().length > 0);

  const submit = async () => {
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error('NOT_SIGNED_IN');
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/tiein-submit`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          company: company.trim(),
          contact: contact.trim(),
          merch_desc: merchDesc.trim(),
          budget_range: budget.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      Alert.alert('ได้รับคำขอแล้ว', 'ทีมพาร์ทเนอร์ชิพจะติดต่อกลับภายใน 2 วันทำการ\n(อันนี้ถึงจริง สัญญา)', [
        { text: 'ตกลง', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('ส่งไม่สำเร็จ', e instanceof Error ? e.message : 'ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: theme.pad, gap: 12 }}>
      <Text style={s.heading}>โปรแกรมพาร์ทเนอร์ทางการตลาด</Text>
      <Text style={s.sub}>
        เข้าถึงลูกค้าหลายแสนคนที่กำลังรออะไรบางอย่างที่ไม่มีวันมาถึง — พื้นที่โฆษณาที่ engagement สูงที่สุดคือใจที่ว่างเปล่า
      </Text>

      <Field label="ชื่อบริษัท / แบรนด์" value={company} onChange={setCompany} placeholder="บริษัท ตัวอย่าง จำกัด" />
      <Field label="ช่องทางติดต่อ" value={contact} onChange={setContact} placeholder="อีเมล / LINE / เบอร์โทร" />
      <Field label="สินค้าที่ต้องการ tie-in" value={merchDesc} onChange={setMerchDesc} placeholder="อธิบายสินค้าและรูปแบบแคมเปญ" multiline />
      <Field label="งบประมาณโดยประมาณ" value={budget} onChange={setBudget} placeholder="เช่น 50,000–100,000 บาท" />

      <Pressable style={[s.cta, (!valid || busy) && { opacity: 0.4 }]} disabled={!valid || busy} onPress={submit}>
        <Text style={s.ctaText}>{busy ? 'กำลังส่ง...' : 'ส่งคำขอพาร์ทเนอร์ชิพ'}</Text>
      </Pressable>
      <Text style={s.legal}>การส่งแบบฟอร์มนี้ถือว่ายอมรับเงื่อนไขการเป็นพาร์ทเนอร์ และเข้าใจว่าสินค้าของท่านจะถูกส่งถึงลูกค้าจริงเฉพาะช่องทางแลกรับเท่านั้น</Text>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{props.label}</Text>
      <TextInput
        style={[s.input, props.multiline && { height: 96, textAlignVertical: 'top' }]}
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        multiline={props.multiline}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  heading: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  sub: { fontSize: 13, color: theme.textMuted, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: theme.text },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  cta: { backgroundColor: '#0E2A47', borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700' },
  legal: { fontSize: 10, color: '#bbb', lineHeight: 15 },
});
