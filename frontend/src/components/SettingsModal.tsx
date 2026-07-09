import React, { useState } from 'react';
import { FiX, FiSun, FiMoon, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, toggleTheme, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/password', {
        oldPassword,
        newPassword,
      });
      setSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your old password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-darkCard border border-slate-100 dark:border-darkBorder">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-darkBorder">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-darkInput dark:text-slate-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Theme Settings */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Theme Configuration
            </h4>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-darkInput border border-slate-100 dark:border-darkBorder">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-darkCard text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkInput/50 transition-all font-medium text-sm shadow-sm"
              >
                {user?.theme === 'dark' ? (
                  <>
                    <FiSun className="text-amber-500 w-4 h-4" />
                    Light Theme
                  </>
                ) : (
                  <>
                    <FiMoon className="text-blue-500 w-4 h-4" />
                    Dark Theme
                  </>
                )}
              </button>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-darkBorder" />

          {/* Change Password Form */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiLock className="text-slate-400 dark:text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Change Password
              </h4>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="premium-label">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="premium-input !pr-10 w-full"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showOldPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="premium-label">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="premium-input !pr-10 w-full"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="premium-label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="premium-input !pr-10 w-full"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-3 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center h-[52px] rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save Password'}
              </button>
            </form>
          </div>

          <hr className="border-slate-100 dark:border-darkBorder" />

          {/* Quick Actions */}
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center h-[52px] rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 font-semibold transition-all"
          >
            Logout from MoneyMap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
