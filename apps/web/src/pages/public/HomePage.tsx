import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Wrench,
  Droplets,
  Sun,
  Truck,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard.js';
import { Product, Category } from '../../types/index.js';
import api from '../../services/api.js';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
        ]);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedState) params.set('state', selectedState);
    navigate(`/products?${params.toString()}`);
  };

  const statesList = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Madhya Pradesh', 'Karnataka'];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-primary-950 to-slate-950 text-white pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Background Subtle Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Middlemen • 100% Direct Farmer Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
                {t('hero.title')}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* SEARCH BAR BOX */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/20 flex flex-col sm:flex-row gap-2 max-w-2xl"
              >
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-slate-800">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('common.searchPlaceholder')}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-slate-800 sm:w-48">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-medium focus:outline-none text-slate-700"
                  >
                    <option value="">All States</option>
                    {statesList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>

              {/* Quick Actions & Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="px-5 py-2.5 bg-primary-700/60 hover:bg-primary-700 text-white rounded-xl text-xs sm:text-sm font-bold border border-primary-500/40 transition-colors"
                >
                  {t('hero.browseBtn')}
                </Link>
                <Link
                  to="/products/new"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-colors"
                >
                  + {t('hero.listBtn')}
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 aspect-square">
                <img
                  src="/truck-working-field-sunny-day.jpg"
                  alt="Tractor on Green Indian Farm"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Float Card 1: Verified Farmer */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 shadow-xl border border-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      RP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1">
                        Ramesh Patil (Satara)
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      </h4>
                      <p className="text-[11px] text-slate-500">Mahindra 575 DI • Available for Rent</p>
                    </div>
                  </div>
                  <span className="text-primary-700 font-black text-sm">₹2,500/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS TICKER */}
      <section className="-mt-12 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary-700">1,250+</span>
            <p className="text-xs font-semibold text-slate-600">{t('stats.activeListings')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary-700">8,400+</span>
            <p className="text-xs font-semibold text-slate-600">{t('stats.registeredFarmers')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary-700">₹3.4 Cr+</span>
            <p className="text-xs font-semibold text-slate-600">{t('stats.transactionsDone')}</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary-700">180+</span>
            <p className="text-xs font-semibold text-slate-600">{t('stats.coveredDistricts')}</p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR MACHINERY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Explore by Category</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Agricultural Machinery</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Tractor className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-primary-700 transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {cat.productCount || 8}+ items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED MACHINERY (LIVE FROM DATABASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Verified Listings</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Featured Agricultural Equipment</h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
          >
            <span>Browse All Machinery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl font-black text-slate-900">{t('howItWorks.title')}</h2>
            <p className="text-xs sm:text-sm text-slate-600">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
              { num: '2', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
              { num: '3', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
              { num: '4', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') },
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center font-black text-base">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Have Idle Machinery? Earn Extra Revenue Every Month!
            </h2>
            <p className="text-xs sm:text-sm text-primary-100 font-normal">
              List your tractor, rotavator, or harvester on FarmStock for free. Connect with verified farmers in your taluka and district.
            </p>
          </div>
          <Link
            to="/products/new"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-xl transition-transform active:scale-95 shrink-0"
          >
            List Equipment Now (Free)
          </Link>
        </div>
      </section>
    </div>
  );
};
