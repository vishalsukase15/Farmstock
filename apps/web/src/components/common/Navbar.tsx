import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  Search,
  ShoppingCart,
  Heart,
  Bell,
  MessageSquare,
  User as UserIcon,
  PlusCircle,
  Menu,
  X,
  Globe,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { changeLanguage } from '../../i18n/index.js';
import api from '../../services/api.js';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => {
          if (res.data.success) {
            setUnreadNotifs(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLanguageChange = (lang: 'en' | 'mr' | 'hi' | 'es') => {
    changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'es', label: 'Spanish', native: 'Español' },
  ];

  const currentLangObj = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Tractor className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-primary-950 block leading-none">
                FARM<span className="text-primary-600">STOCK</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                {t('common.tagline')}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/' ? 'text-primary-700 font-bold' : 'text-slate-700 hover:text-primary-700'
              }`}
            >
              {t('common.home')}
            </Link>
            <Link
              to="/products"
              className={`text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/products') && location.pathname !== '/products/new'
                  ? 'text-primary-700 font-bold'
                  : 'text-slate-700 hover:text-primary-700'
              }`}
            >
              {t('common.browse')}
            </Link>
            <Link
              to="/categories"
              className="text-sm font-semibold text-slate-700 hover:text-primary-700 transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-slate-700 hover:text-primary-700 transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-primary-700" />
                <span>{currentLangObj.native}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as any)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-primary-50 hover:text-primary-800 ${
                        i18n.language === lang.code ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticated user quick actions */}
            {isAuthenticated ? (
              <>
                {/* Wishlist button */}
                <Link
                  to="/wishlist"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors relative"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Cart button */}
                <Link
                  to="/cart"
                  className="p-2 text-slate-600 hover:text-primary-700 hover:bg-slate-50 rounded-lg transition-colors relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {user?.counts?.cartItems ? (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {user.counts.cartItems}
                    </span>
                  ) : null}
                </Link>

                {/* Messages button */}
                <Link
                  to="/chat"
                  className="p-2 text-slate-600 hover:text-primary-700 hover:bg-slate-50 rounded-lg transition-colors relative"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Post Equipment Button */}
                <Link
                  to="/products/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-700 text-white rounded-lg text-xs font-bold hover:bg-primary-800 transition-all shadow-sm shadow-primary-700/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('common.sellRent')}</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-primary-500 transition-colors"
                  >
                    {user?.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-bold">
                        {user?.profile?.fullName?.charAt(0) || 'F'}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {user?.profile?.fullName || 'Farmer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary-100 text-primary-800 rounded">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>{t('common.dashboard')}</span>
                        </Link>
                        <Link
                          to="/my-products"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700"
                        >
                          <Tractor className="w-4 h-4 text-slate-400" />
                          <span>{t('common.myProducts')}</span>
                        </Link>
                        <Link
                          to="/requests"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700"
                        >
                          <ShoppingCart className="w-4 h-4 text-slate-400" />
                          <span>{t('common.requests')}</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-700"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>{t('common.profile')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-700" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('common.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-primary-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 bg-primary-700 text-white rounded-lg text-xs font-bold hover:bg-primary-800 transition-colors shadow-sm"
                >
                  {t('common.signup')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-primary-700 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-primary-700"
          >
            {t('common.home')}
          </Link>
          <Link
            to="/products"
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-primary-700"
          >
            {t('common.browse')}
          </Link>
          <Link
            to="/categories"
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-primary-700"
          >
            All Categories
          </Link>
          <Link
            to="/how-it-works"
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-primary-700"
          >
            How It Works
          </Link>
          {isAuthenticated && (
            <>
              <div className="pt-2 border-t border-slate-100" />
              <Link
                to="/products/new"
                className="block py-2 text-sm font-bold text-primary-700"
              >
                + {t('common.sellRent')}
              </Link>
              <Link
                to="/dashboard"
                className="block py-2 text-sm font-semibold text-slate-800"
              >
                {t('common.dashboard')}
              </Link>
              <Link
                to="/requests"
                className="block py-2 text-sm font-semibold text-slate-800"
              >
                {t('common.requests')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
