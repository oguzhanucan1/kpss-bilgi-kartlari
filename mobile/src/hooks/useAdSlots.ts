import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type AdSlot = {
  id: string;
  slug: string;
  name: string;
  ad_type: 'image' | 'admob';
  image_url: string | null;
  link_url: string | null;
  admob_unit_id: string | null;
  is_active: boolean;
  sort_order: number;
  width_px: number | null;
  height_px: number | null;
};

export function useAdSlots(): Record<string, AdSlot> {
  const [slotsBySlug, setSlotsBySlug] = useState<Record<string, AdSlot>>({});

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const { data } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      const list = (data ?? []) as AdSlot[];
      const map: Record<string, AdSlot> = {};
      list.forEach((s) => { map[s.slug] = s; });
      setSlotsBySlug(map);
    };
    load();
  }, []);

  return slotsBySlug;
}
