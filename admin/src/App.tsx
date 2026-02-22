import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Topics from './pages/Topics';
import Cards from './pages/Cards';
import Motivation from './pages/Motivation';
import Announcements from './pages/Announcements';

export default function App() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bgray-50 text-bgray-700 dark:bg-darkblack-500 dark:text-bgray-50">
        Yükleniyor…
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bgray-50 px-4 text-center dark:bg-darkblack-500">
        <p className="text-bgray-700 dark:text-bgray-50">Bu panele erişim yetkiniz yok. Sadece admin kullanıcılar giriş yapabilir.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="topics" element={<Topics />} />
        <Route path="cards" element={<Cards />} />
        <Route path="motivation" element={<Motivation />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
