import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, List, Divider, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { APP_THEME } from '../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Bildirimler'>;

export default function BildirimlerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [newContent, setNewContent] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={APP_THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Bildirimler</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: APP_THEME.surface, borderRadius: APP_THEME.radius.card, ...APP_THEME.shadow.card }]}>
          <List.Item title="Push bildirimleri" description="Uygulama bildirimlerini aç/kapat" titleStyle={styles.label} descriptionStyle={styles.desc} left={(p) => <List.Icon {...p} icon="bell-outline" color="#F59E0B" />} right={() => <Switch value={pushEnabled} onValueChange={setPushEnabled} color={APP_THEME.primary} />} />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item title="Günlük hatırlatıcı" description="Her gün çalışma hatırlatması" titleStyle={styles.label} descriptionStyle={styles.desc} left={(p) => <List.Icon {...p} icon="clock-outline" color="#F59E0B" />} right={() => <Switch value={dailyReminder} onValueChange={setDailyReminder} color={APP_THEME.primary} />} />
          <Divider style={{ backgroundColor: APP_THEME.border }} />
          <List.Item title="Yeni içerik duyuruları" description="Yeni konu ve kart eklendiğinde bildir" titleStyle={styles.label} descriptionStyle={styles.desc} left={(p) => <List.Icon {...p} icon="new-box" color="#F59E0B" />} right={() => <Switch value={newContent} onValueChange={setNewContent} color={APP_THEME.primary} />} />
        </View>
        <Text style={styles.hint}>Bildirim tercihleri cihazınızda kaydedilir.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: APP_THEME.text },
  scroll: { paddingHorizontal: 20 },
  card: { overflow: 'hidden', marginBottom: 16 },
  label: { fontWeight: '600', color: APP_THEME.text },
  desc: { fontSize: 13, color: APP_THEME.textMuted2, marginTop: 2 },
  hint: { fontSize: 13, color: APP_THEME.textMuted2, lineHeight: 20 },
});
