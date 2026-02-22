import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) {
      setError('Supabase yapılandırılmamış. .env dosyasını kontrol edin.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bgray-50 px-4 py-16 dark:bg-darkblack-500">
      <div className="card-bankco w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold text-bgray-900 dark:text-white">KPSS Admin</h1>
        <p className="mb-6 text-sm text-bgray-600 dark:text-bgray-50">Yönetim paneline giriş yapın</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="msg-error">{error}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">E-posta</label>
            <input className="input-field w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bgray-700 dark:text-bgray-50">Şifre</label>
            <input className="input-field w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
