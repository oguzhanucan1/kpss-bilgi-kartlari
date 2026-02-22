import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <nav className="nav">
        <NavLink to="/" end style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Panel</NavLink>
        <NavLink to="/subjects" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Dersler</NavLink>
        <NavLink to="/topics" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Konular</NavLink>
        <NavLink to="/cards" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Kartlar</NavLink>
        <NavLink to="/motivation" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Motivasyon</NavLink>
        <NavLink to="/announcements" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}>Duyurular</NavLink>
        <button type="button" className="secondary" onClick={handleLogout} style={{ marginLeft: 'auto' }}>Çıkış</button>
      </nav>
      <Outlet />
    </div>
  );
}
