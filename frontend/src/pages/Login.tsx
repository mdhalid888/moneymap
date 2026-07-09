import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../utils/api';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      login(token, {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        income: user.income,
        theme: user.theme || 'light',
      });
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-darkBg relative overflow-hidden">
      {/* Decorative premium background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[80px] pointer-events-none" />

      {/* Main glass card */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-darkCard/75 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-premium rounded-3xl p-8 md:p-10 transition-all duration-300">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 overflow-hidden relative rounded-2xl bg-black border border-slate-800 dark:border-darkBorder flex items-center justify-center shadow-md">
              <img 
                src={logo} 
                alt="Logo Icon" 
                className="w-[140%] h-auto max-w-none absolute top-[-3px] left-1/2 -translate-x-1/2 object-contain" 
              />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Money<span className="text-blue-500">Map</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log in to manage your financial world
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="premium-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="premium-input"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="premium-input !pr-10 w-full"
                placeholder="Enter your secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-glow-blue active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
