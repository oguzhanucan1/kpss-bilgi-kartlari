import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Quote = { id: string; text: string; sort_order: number; is_active: boolean };

export default function Motivation() {
  const [list, setList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('motivation_quotes').select('*').order('sort_order');
    setList((data ?? []) as Quote[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1>Motivasyon</h1>
      <div className="card">
        {loading ? <p>Loading</p> : (
          <table>
            <thead><tr><th>Text</th><th>Order</th><th>Active</th></tr></thead>
            <tbody>
              {list.map((q) => <tr key={q.id}><td>{q.text}</td><td>{q.sort_order}</td><td>{q.is_active ? 'Yes' : 'No'}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
