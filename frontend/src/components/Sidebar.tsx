import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiList, FiPieChart, FiSettings, FiLogOut, FiSun, FiMoon, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

interface SidebarProps {
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, toggleTheme } = useAuth();

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <FiList className="w-5 h-5" /> },
    { name: 'Statistics', path: '/statistics', icon: <FiPieChart className="w-5 h-5" /> },
  ];

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 border-r transition-transform duration-300 transform
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    bg-white border-slate-100 text-slate-800
    dark:bg-darkSidebar dark:border-darkBorder dark:text-slate-200
    flex flex-col justify-between
  `;

  return (
    <>
      {/* Backdrop (closes sidebar when clicked) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div>
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-darkBorder">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 overflow-hidden relative rounded-xl bg-black border border-slate-800 dark:border-darkBorder flex items-center justify-center shadow-sm">
                <img 
                  src={logo} 
                  alt="Logo Icon" 
                  className="w-[140%] h-auto max-w-none absolute top-[-2px] left-1/2 -translate-x-1/2 object-contain" 
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Money<span className="text-blue-500">Map</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Theme Toggle near logo */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkCard hover:text-slate-800 dark:hover:text-white transition-all shadow-sm cursor-pointer"
                title="Toggle Theme"
              >
                {user?.theme === 'dark' ? (
                  <FiSun className="w-4 h-4 text-amber-500" />
                ) : (
                  <FiMoon className="w-4 h-4 text-blue-500" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkCard hover:text-slate-800 dark:hover:text-white transition-all shadow-sm cursor-pointer"
                title="Close Menu"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="p-4 mx-4 mt-6 rounded-2xl bg-slate-50 dark:bg-darkCard border border-slate-100 dark:border-darkBorder flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-darkCard dark:hover:text-white'
                  }
                `}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-darkBorder space-y-1.5">
          <button
            onClick={() => {
              setIsMobileOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-darkCard dark:hover:text-white transition-all duration-200"
          >
            <FiSettings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
