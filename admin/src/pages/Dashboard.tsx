import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { supabase } from '../lib/supabase';

const COLORS = ['#22C55E', '#A0AEC0', '#4ADE80', '#FACC15', '#FF784B', '#936DFF'];

type DashboardData = {
  totalUsers: number;
  activeUsers7d: number;
  dailySignups: number;
  totalCards: number;
  totalTests: number;
  mostViewedSubject: string;
  avgTestSuccess: number;
  dailyUserGrowth: { date: string; count: number }[];
  subjectDistribution: { name: string; kart: number; görüntülenme: number }[];
  testSuccessPie: { name: string; value: number }[];
};

function startOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function last7DaysUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      try {
        const [
          profilesRes,
          profilesListRes,
          cardViewsRes,
          profilesTodayRes,
          cardsRes,
          testsRes,
          cardViewsListRes,
          progressRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('created_at'),
          supabase.from('card_views').select('user_id, viewed_at').gte('viewed_at', last7DaysUTC()),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfTodayUTC()),
          supabase.from('flash_cards').select('id', { count: 'exact', head: true }),
          supabase.from('test_questions').select('id', { count: 'exact', head: true }),
          supabase.from('card_views').select('flash_card_id, flash_cards(topic_id, topics(subject_id, subjects(name)))').limit(5000),
          supabase.from('user_progress').select('test_score, test_total').not('test_score', 'is', null).not('test_total', 'is', null),
        ]);

        const totalUsers = profilesRes.count ?? 0;
        const dailySignups = profilesTodayRes.count ?? 0;
        const totalCards = cardsRes.count ?? 0;
        const totalTests = testsRes.count ?? 0;

        const activeUserIds = new Set((cardViewsRes.data ?? []).map((r: { user_id: string }) => r.user_id));
        const activeUsers7d = activeUserIds.size;

        const profilesList = (profilesListRes.data ?? []) as { created_at: string }[];
        const last30 = new Date();
        last30.setUTCDate(last30.getUTCDate() - 30);
        const byDay: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date(last30);
          d.setUTCDate(d.getUTCDate() + i);
          byDay[d.toISOString().slice(0, 10)] = 0;
        }
        profilesList.forEach((p) => {
          const day = p.created_at?.slice(0, 10);
          if (day && byDay[day] !== undefined) byDay[day]++;
        });
        const dailyUserGrowth = Object.entries(byDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date: date.slice(5), count }));

        const viewsList = (cardViewsListRes.data ?? []) as unknown as {
          flash_cards?: { topics?: { subjects?: { name: string }; subject_id: string }; topic_id: string } | null;
        }[];
        const subjectViewCount: Record<string, number> = {};
        viewsList.forEach((v) => {
          const subj = v.flash_cards?.topics?.subjects;
          const name = (subj && typeof subj === 'object' && 'name' in subj ? (subj as { name: string }).name : null) ?? 'Belirsiz';
          subjectViewCount[name] = (subjectViewCount[name] ?? 0) + 1;
        });

        const { data: subjectsData } = await supabase.from('subjects').select('id, name');
        const subjectCardCount: Record<string, number> = {};
        (subjectsData ?? []).forEach((s: { id: string; name: string }) => { subjectCardCount[s.name] = 0; });
        const { data: cardsByTopic } = await supabase.from('flash_cards').select('topic_id');
        const { data: topicsData } = await supabase.from('topics').select('id, subject_id');
        const topicToSubject: Record<string, string> = {};
        (topicsData ?? []).forEach((t: { id: string; subject_id: string }) => { topicToSubject[t.id] = t.subject_id; });
        const subjectIdToName: Record<string, string> = {};
        (subjectsData ?? []).forEach((s: { id: string; name: string }) => { subjectIdToName[s.id] = s.name; });
        (cardsByTopic ?? []).forEach((c: { topic_id: string }) => {
          const subId = topicToSubject[c.topic_id];
          const name = subjectIdToName[subId];
          if (name) subjectCardCount[name] = (subjectCardCount[name] ?? 0) + 1;
        });

        const subjectDistribution = (subjectsData ?? []).map((s: { id: string; name: string }) => ({
          name: s.name,
          kart: subjectCardCount[s.name] ?? 0,
          görüntülenme: subjectViewCount[s.name] ?? 0,
        })).filter((s) => s.kart > 0 || s.görüntülenme > 0);

        const mostViewedSubject =
          Object.entries(subjectViewCount).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '–';

        const progressList = (progressRes.data ?? []) as { test_score: number; test_total: number }[];
        let totalScore = 0;
        let totalTotal = 0;
        progressList.forEach((p) => {
          totalScore += p.test_score ?? 0;
          totalTotal += p.test_total ?? 0;
        });
        const avgTestSuccess = totalTotal > 0 ? Math.round((totalScore / totalTotal) * 100) : 0;
        const testSuccessPie = totalTotal > 0
          ? [
              { name: 'Başarılı', value: Math.round((totalScore / totalTotal) * 100) },
              { name: 'Başarısız', value: 100 - Math.round((totalScore / totalTotal) * 100) },
            ]
          : [{ name: 'Veri yok', value: 100 }];

        setData({
          totalUsers,
          activeUsers7d,
          dailySignups,
          totalCards,
          totalTests,
          mostViewedSubject,
          avgTestSuccess,
          dailyUserGrowth,
          subjectDistribution,
          testSuccessPie,
        });
      } catch (_) {
        setData({
          totalUsers: 0,
          activeUsers7d: 0,
          dailySignups: 0,
          totalCards: 0,
          totalTests: 0,
          mostViewedSubject: '–',
          avgTestSuccess: 0,
          dailyUserGrowth: [],
          subjectDistribution: [],
          testSuccessPie: [{ name: 'Veri yok', value: 100 }],
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-bgray-600 dark:text-bgray-50">Yükleniyor…</span>
      </div>
    );
  }

  type MetricItem = { label: string; value: number | string; link?: string; sub?: string; icon: string };
  const metrics: MetricItem[] = [
    { label: 'Toplam kullanıcı', value: data?.totalUsers ?? 0, link: '/users', icon: '👥' },
    { label: 'Aktif kullanıcı (7 gün)', value: data?.activeUsers7d ?? 0, sub: 'Son 7 günde kart görüntüleyen', icon: '🟢' },
    { label: 'Günlük yeni kayıt', value: data?.dailySignups ?? 0, sub: 'Bugün kayıt olan', icon: '📅' },
    { label: 'Toplam bilgi kartı', value: data?.totalCards ?? 0, link: '/cards', icon: '🃏' },
    { label: 'Toplam test sorusu', value: data?.totalTests ?? 0, sub: 'test_questions', icon: '📝' },
    { label: 'En çok görüntülenen ders', value: data?.mostViewedSubject ?? '–', sub: 'kart görüntüleme', icon: '📚' },
    { label: 'Ort. test başarı oranı', value: data?.avgTestSuccess != null ? `%${data.avgTestSuccess}` : '–', sub: 'user_progress', icon: '📊' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metrics.map((m) => (
          <div key={m.label}>
            {m.link ? (
              <Link to={m.link} className="card-bankco block transition hover:shadow-md">
                <div className="mb-2 text-2xl">{m.icon}</div>
                <div className="text-xl font-bold text-bgray-900 dark:text-white">{m.value}</div>
                <div className="text-sm font-medium text-bgray-600 dark:text-bgray-50">{m.label}</div>
                {m.sub != null && <div className="mt-1 text-xs text-success-400">{m.sub}</div>}
              </Link>
            ) : (
              <div className="card-bankco">
                <div className="mb-2 text-2xl">{m.icon}</div>
                <div className="text-xl font-bold text-bgray-900 dark:text-white">{m.value}</div>
                <div className="text-sm font-medium text-bgray-600 dark:text-bgray-50">{m.label}</div>
                {m.sub != null && <div className="mt-1 text-xs text-success-400">{m.sub}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-bankco">
          <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Günlük kullanıcı artışı (son 30 gün)</h2>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyUserGrowth ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#718096" />
                <YAxis tick={{ fontSize: 11 }} stroke="#718096" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} name="Yeni kayıt" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-bankco">
          <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Test başarı oranı</h2>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.testSuccessPie ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} %${value}`}
                >
                  {(data?.testSuccessPie ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `%${v}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-bankco">
        <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Ders bazlı içerik dağılımı</h2>
        <p className="mb-4 text-xs text-bgray-600 dark:text-bgray-50">Kart sayısı ve (varsa) görüntülenme sayısı.</p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.subjectDistribution ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} stroke="#718096" />
              <YAxis tick={{ fontSize: 11 }} stroke="#718096" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend />
              <Bar dataKey="kart" fill="#22C55E" name="Kart sayısı" radius={[4, 4, 0, 0]} />
              <Bar dataKey="görüntülenme" fill="#A0AEC0" name="Görüntülenme" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-bankco">
          <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Hızlı erişim</h2>
          <ul className="space-y-3">
            <li><Link to="/subjects" className="font-medium text-success-400 hover:underline">Dersler & Konular</Link></li>
            <li><Link to="/cards" className="font-medium text-success-400 hover:underline">Kartlar</Link></li>
            <li><Link to="/motivation" className="font-medium text-success-400 hover:underline">Motivasyon</Link></li>
            <li><Link to="/announcements" className="font-medium text-success-400 hover:underline">Duyurular</Link></li>
            <li><Link to="/users" className="font-medium text-success-400 hover:underline">Kullanıcılar</Link></li>
          </ul>
        </div>
        <div className="card-bankco">
          <h2 className="mb-4 text-lg font-semibold text-bgray-900 dark:text-white">Özet</h2>
          <p className="text-sm text-bgray-600 dark:text-bgray-50">Aktif kullanıcı: son 7 günde kart görüntüleyen. Test başarı oranı: user_progress test_score/test_total ortalaması. Grafik verileri sayfa yüklendiğinde güncellenir.</p>
        </div>
      </div>
    </div>
  );
}
