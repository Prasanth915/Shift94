import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Project', href: '/projects/create', icon: FilePlus },
    { name: 'Publish History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                SHIFT <span className="text-zinc-500">94</span>
              </span>
            </Link>
            <button className="lg:hidden text-zinc-400 cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-6 border-t border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.name || 'Developer'}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition duration-150 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Navigation */}
        <header className="bg-zinc-950/20 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-zinc-400 hover:text-white cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-sm font-medium text-zinc-400 capitalize hidden lg:inline">
              {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop().replace('-', ' ')}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
