import React from 'react';
import { View, Image, StyleSheet, Pressable, Linking, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import type { AdSlot } from '../hooks/useAdSlots';
import { APP_THEME } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = { slot: AdSlot; height: number; width?: number };

export function AdSlotView({ slot, height, width: customWidth }: Props) {
  const isFullScreen = slot.width_px == null || slot.height_px == null;
  const w = customWidth ?? (slot.width_px != null ? Math.min(slot.width_px, SCREEN_WIDTH) : SCREEN_WIDTH);
  const h = slot.height_px != null ? slot.height_px : height;

  if (slot.ad_type === 'image' && slot.image_url) {
    return (
      <View style={[styles.wrap, { width: w, height: h }]}>
        <Pressable
          style={styles.pressable}
          onPress={() => slot.link_url && Linking.openURL(slot.link_url)}
        >
          <Image
            source={{ uri: slot.image_url }}
            style={[styles.image, isFullScreen ? styles.imageFull : { width: w, height: h, maxWidth: w, maxHeight: h }]}
            resizeMode={isFullScreen ? 'contain' : 'cover'}
          />
          {slot.link_url ? (
            <Text variant="labelSmall" style={styles.linkHint}>Reklam – tıklayın</Text>
          ) : null}
        </Pressable>
      </View>
    );
  }
  if (slot.ad_type === 'admob' && slot.admob_unit_id) {
    return (
      <View style={[styles.wrap, styles.admobPlaceholder, { width: w, height: h }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_THEME.surface,
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  image: {
    borderRadius: APP_THEME.radius.card,
  },
  imageFull: {
    width: '100%',
    maxWidth: 400,
    height: '80%',
    maxHeight: 400,
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
