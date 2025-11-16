import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Users, RefreshCw, Settings, 
  LogOut, Menu, X, Globe
} from 'lucide-react';
import SettingsModal from './modals/SettingsModal';

const Layout = ({ settings, setSettings }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin, isSupervisor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), roles: ['admin', 'supervisor', 'employee'] },
    { path: '/transactions', icon: FileText, label: t('transactions'), roles: ['admin', 'supervisor', 'employee'] },
    { path: '/users', icon: Users, label: t('users'), roles: ['admin', 'supervisor'] },
    { path: '/handovers', icon: RefreshCw, label: t('handovers'), roles: ['admin', 'supervisor'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full'
        } bg-white border-${i18n.language === 'ar' ? 'l' : 'r'} border-gray-200 w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {settings?.appName || t('appName')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t(user?.role)}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-2 px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-2"
            >
              <Globe size={20} />
              <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-2"
              >
                <Settings size={20} />
                <span>{t('settings')}</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? (i18n.language === 'ar' ? 'mr-64' : 'ml-64') : ''} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{t(user?.role)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Settings Modal */}
      {isAdmin && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
        />
      )}
    </div>
  );
};

export default Layout;
