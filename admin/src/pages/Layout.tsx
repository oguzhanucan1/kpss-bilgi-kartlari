import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const navItems = [
  { to: '/', end: true, label: 'Panel' },
  { to: '/users', end: false, label: 'Kullanıcılar' },
  { to: '/subjects', end: false, label: 'Dersler & Konular' },
  { to: '/cards', end: false, label: 'Kartlar' },
  { to: '/motivation', end: false, label: 'Motivasyon' },
  { to: '/announcements', end: false, label: 'Duyurular' },
  { to: '/ads', end: false, label: 'Reklamlar' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    navigate('/login', { replace: true });
  };

  const pageTitles: Record<string, string> = {
    '/': 'Panel',
    '/users': 'Kullanıcılar',
    '/subjects': 'Dersler & Konular',
    '/cards': 'Kartlar',
    '/motivation': 'Motivasyon',
    '/announcements': 'Duyurular',
    '/ads': 'Reklamlar',
  };
  const currentTitle = pageTitles[location.pathname] ?? 'Admin';

  return (
    <div className="layout-wrapper active flex w-full">
      <aside className="sidebar-wrapper fixed top-0 z-30 flex hidden h-full w-[280px] flex-col border-r border-bgray-200 bg-white dark:border-darkblack-400 dark:bg-darkblack-600 xl:flex">
        <div className="sidebar-header flex h-[72px] w-full shrink-0 items-center border-b border-bgray-200 pl-8 dark:border-darkblack-400">
          <span className="text-xl font-bold text-bgray-900 dark:text-white">KPSS Admin</span>
        </div>
        <div className="sidebar-body flex flex-1 flex-col overflow-y-auto pb-24 pl-6 pr-4 pt-6">
          <div className="nav-wrapper mb-6 pr-4">
            <h4 className="border-b border-bgray-200 text-xs font-semibold uppercase tracking-wide text-bgray-600 dark:border-darkblack-400 dark:text-bgray-50">
              Menü
            </h4>
            <ul className="mt-3 space-y-0.5">
              {navItems.map(({ to, end, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition dark:text-bgray-50 ${
                        isActive
                          ? 'bg-success-50 text-success-400 dark:bg-success-300/20 dark:text-success-200'
                          : 'text-bgray-700 hover:bg-bgray-100 hover:text-bgray-900 dark:hover:bg-darkblack-500'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto border-t border-bgray-200 pt-4 dark:border-darkblack-400">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl border border-bgray-300 bg-bgray-100 px-4 py-3 text-sm font-semibold text-bgray-700 transition hover:bg-bgray-200 dark:border-darkblack-400 dark:bg-darkblack-500 dark:text-bgray-50 dark:hover:bg-darkblack-400"
            >
              Çıkış
            </button>
          </div>
        </div>
      </aside>

      <div className="body-wrapper flex flex-1 flex-col overflow-x-hidden dark:bg-darkblack-500 xl:ml-[280px]">
        <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between border-b border-bgray-200 bg-white px-6 dark:border-darkblack-400 dark:bg-darkblack-600 2xl:px-10">
          <div>
            <h1 className="text-xl font-bold text-bgray-900 dark:text-white lg:text-2xl">{currentTitle}</h1>
            <p className="text-xs font-medium text-bgray-600 dark:text-bgray-50">İçerik yönetim paneli</p>
          </div>
        </header>
        <main className="flex-1 p-6 2xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
