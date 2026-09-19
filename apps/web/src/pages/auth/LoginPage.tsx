import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tractor, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Tractor className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome to FarmStock</h1>
          <p className="text-xs text-slate-500">
            Sign in to manage your machinery listings, rental bookings, and chat.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ramesh.patil@farmstock.com"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Log In to FarmStock'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box for evaluation */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick Demo Login (Pre-configured)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('ramesh.patil@farmstock.com', 'Farmer@123')}
              className="p-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 text-center"
            >
              Ramesh (Seller)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('suresh.shinde@farmstock.com', 'Farmer@123')}
              className="p-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 text-center"
            >
              Suresh (Buyer)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@farmstock.com', 'Admin@123')}
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-800 text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have a farmer account yet?{' '}
          <Link to="/signup" className="font-bold text-primary-700 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
