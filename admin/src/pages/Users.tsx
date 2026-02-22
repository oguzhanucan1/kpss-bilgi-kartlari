import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
  hedef_yil: string | null;
  created_at: string;
};

export default function Users() {
  const [list, setList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('profiles').select('id, username, full_name, role, hedef_yil, created_at').order('created_at', { ascending: false });
      setList((data ?? []) as Profile[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="card-bankco">
      <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Kayıtlı kullanıcılar</h2>
      {loading ? (
        <p className="text-bgray-600 dark:text-bgray-50">Yükleniyor…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-bgray-200 dark:border-darkblack-400">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Kullanıcı adı</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Ad Soyad</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Rol</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Hedef yıl</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:text-bgray-50">Kayıt tarihi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-bgray-100 dark:border-darkblack-400 hover:bg-bgray-50 dark:hover:bg-darkblack-500">
                  <td className="py-3 text-sm font-medium text-bgray-900 dark:text-white">{p.username ?? '–'}</td>
                  <td className="py-3 text-sm text-bgray-700 dark:text-bgray-50">{p.full_name ?? '–'}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${p.role === 'admin' ? 'bg-success-100 text-success-400 dark:bg-success-300/20 dark:text-success-200' : 'bg-bgray-200 text-bgray-700 dark:bg-darkblack-400 dark:text-bgray-50'}`}>{p.role ?? 'user'}</span>
                  </td>
                  <td className="py-3 text-sm text-bgray-600 dark:text-bgray-50">{p.hedef_yil ?? '–'}</td>
                  <td className="py-3 text-sm text-bgray-600 dark:text-bgray-50">{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && list.length === 0 && <p className="mt-4 text-bgray-600 dark:text-bgray-50">Henüz kayıtlı kullanıcı yok.</p>}
    </div>
  );
}
