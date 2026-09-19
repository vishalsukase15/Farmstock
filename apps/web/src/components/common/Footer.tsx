import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tractor, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md">
                <Tractor className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                FARM<span className="text-primary-500">STOCK</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.aboutText')}
            </p>
            <div className="pt-2 flex flex-col gap-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-400" />
                <span>Vishal Patil - founder of Farmstock (8322290201)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                <span>vishalpatil@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Browse Machinery</Link></li>
              <li><Link to="/categories" className="hover:text-primary-400 transition-colors">Equipment Categories</Link></li>
              <li><Link to="/products/new" className="hover:text-primary-400 transition-colors">Sell or Rent Equipment</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-400 transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About FarmStock</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Popular Machinery
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products?category=tractors" className="hover:text-primary-400 transition-colors">Tractors (4WD & 2WD)</Link></li>
              <li><Link to="/products?category=rotavators" className="hover:text-primary-400 transition-colors">Rotavators & Tillers</Link></li>
              <li><Link to="/products?category=harvesters" className="hover:text-primary-400 transition-colors">Combine Harvesters</Link></li>
              <li><Link to="/products?category=water-pumps" className="hover:text-primary-400 transition-colors">Water Pumps & Sprayers</Link></li>
              <li><Link to="/products?category=solar-agricultural-equipment" className="hover:text-primary-400 transition-colors">Solar Agri Equipment</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/faqs" className="hover:text-primary-400 transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/help" className="hover:text-primary-400 transition-colors">{t('footer.support')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FARMSTOCK. {t('footer.allRights')}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">100% Direct Farmer-to-Farmer Trade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
