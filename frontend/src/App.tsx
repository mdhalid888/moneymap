import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Statistics from './pages/Statistics';

import { FiMenu } from 'react-icons/fi';

// Protected Route Wrapper
const ProtectedLayout: React.FC = () => {
  const { token, loading } = useAuth();
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-darkBg text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">MoneyMap</h3>
        <p className="text-sm mt-1">Loading secure environment...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isSidebarMobileOpen}
        setIsMobileOpen={setIsSidebarMobileOpen}
      />

      {/* Main Content Layout */}
      <div className="min-h-screen flex flex-col">
        {/* Mobile Header Bar */}
        {!isDashboard && (
          <header className="h-16 border-b border-slate-100 dark:border-darkBorder bg-white dark:bg-darkSidebar px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarMobileOpen(true)}
                className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkCard cursor-pointer"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Money<span className="text-blue-500">Map</span>
              </span>
            </div>
          </header>
        )}

        {/* View Wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet context={{ setIsSidebarMobileOpen }} />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

// Public Route Guard (prevents logged in users from visiting Login/Register)
const PublicRouteWrapper: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicRouteWrapper />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Secure Workspace Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/statistics" element={<Statistics />} />
          </Route>

          {/* Fallback Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
