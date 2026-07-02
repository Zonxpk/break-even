import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '../../ui/theme';

function Icon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 20 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.doodle.coral,
        tabBarInactiveTintColor: theme.doodle.inkSoft,
        tabBarLabelStyle: { fontFamily: theme.fontBold, fontSize: 11 },
        tabBarStyle: { backgroundColor: theme.doodle.paper, borderTopWidth: 2.5, borderTopColor: theme.doodle.ink },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'หน้าแรก', tabBarIcon: () => <Icon glyph="🏠" /> }} />
      <Tabs.Screen name="activity" options={{ title: 'กิจกรรม', tabBarIcon: () => <Icon glyph="📋" /> }} />
      <Tabs.Screen name="vouchers" options={{ title: 'คูปอง', tabBarIcon: () => <Icon glyph="🎟️" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: () => <Icon glyph="👤" /> }} />
    </Tabs>
  );
}
