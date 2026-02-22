import React from 'react';
import { View } from 'react-native';
import { AdSlotView } from './AdSlotView';
import type { AdSlot } from '../hooks/useAdSlots';

type Props = { slot: AdSlot | undefined; minHeight?: number };

export function AdBannerSlot({ slot, minHeight = 50 }: Props) {
  if (!slot) return null;
  const h = slot.height_px != null && slot.height_px > 0 ? slot.height_px : minHeight;
  return (
    <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
      <AdSlotView slot={slot} height={h} />
    </View>
  );
}
