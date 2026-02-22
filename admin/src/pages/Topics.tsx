import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Topic = { id: string; subject_id: string; name: string; slug: string; sort_order: number };

export default function Topics() {
  const [list, setList] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('topics').select('*').order('sort_order');
    setList((data ?? []) as Topic[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1>Konular</h1>
      <div className="card">
        {loading ? <p>Loading</p> : (
          <table>
            <thead><tr><th>Name</th><th>Slug</th><th>Order</th></tr></thead>
            <tbody>
              {list.map((t) => <tr key={t.id}><td>{t.name}</td><td>{t.slug}</td><td>{t.sort_order}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
