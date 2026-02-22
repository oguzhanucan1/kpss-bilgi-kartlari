import React, { useState } from 'react';
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
    <div className="layout" style={{ maxWidth: 400, paddingTop: 80 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>KPSS Admin</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Yönetim paneline giriş yapın</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="msg error">{error}</div>}
          <div className="form-row">
            <label>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label>Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ width: '100%' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
