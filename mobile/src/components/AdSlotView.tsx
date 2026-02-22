import React from 'react';
import { View, Image, StyleSheet, Pressable, Linking, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import type { AdSlot } from '../hooks/useAdSlots';
import { APP_THEME } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = { slot: AdSlot; height: number };

export function AdSlotView({ slot, height }: Props) {
  if (slot.ad_type === 'image' && slot.image_url) {
    return (
      <View style={[styles.wrap, { height }]}>
        <Pressable
          style={styles.pressable}
          onPress={() => slot.link_url && Linking.openURL(slot.link_url)}
        >
          <Image source={{ uri: slot.image_url }} style={styles.image} resizeMode="contain" />
          {slot.link_url ? (
            <Text variant="labelSmall" style={styles.linkHint}>Reklam – tıklayın</Text>
          ) : null}
        </Pressable>
      </View>
    );
  }
  if (slot.ad_type === 'admob' && slot.admob_unit_id) {
    return (
      <View style={[styles.wrap, styles.admobPlaceholder, { height }]}>
        <Text variant="bodySmall" style={styles.admobText}>
          Reklam alanı (AdMob)
        </Text>
        <Text variant="labelSmall" style={styles.admobHint}>
          react-native-google-mobile-ads ile birim kimliği ekleyerek reklam gösterilebilir.
        </Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  wrap: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.surface,
  },
  pressable: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    maxWidth: 400,
    height: '80%',
    maxHeight: 400,
    borderRadius: APP_THEME.radius.card,
  },
  linkHint: {
    marginTop: 8,
    color: APP_THEME.textMuted2,
  },
  admobPlaceholder: {
    padding: 24,
  },
  admobText: {
    color: APP_THEME.textMuted2,
  },
  admobHint: {
    marginTop: 8,
    color: APP_THEME.textMuted2,
    textAlign: 'center',
  },
});
