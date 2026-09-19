import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Browse', path: '/products', icon: Search },
    { label: 'Sell/Rent', path: isAuthenticated ? '/products/new' : '/login', icon: PlusCircle, isPrimary: true },
    { label: 'Requests', path: isAuthenticated ? '/requests' : '/login', icon: ShoppingBag },
    { label: 'Profile', path: isAuthenticated ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isPrimary) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-5 bg-primary-700 text-white rounded-full p-3 shadow-lg shadow-primary-700/30 active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
