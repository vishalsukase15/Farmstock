import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard.js';
import { Product, Category } from '../../types/index.js';
import api from '../../services/api.js';

export const BrowseProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states derived from query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const typeParam = searchParams.get('type') || '';
  const conditionParam = searchParams.get('condition') || '';
  const stateParam = searchParams.get('state') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    api.get(`/products?${params.toString()}`)
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const states = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Madhya Pradesh', 'Karnataka'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar: Search and Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Field */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            defaultValue={searchParam}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilter('search', (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
          />
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-700" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary-700" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={categoryParam}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Listing Type
              </label>
              <div className="space-y-1 text-xs font-medium text-slate-700">
                {['', 'SALE', 'RENT', 'BOTH'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="transType"
                      checked={typeParam === type}
                      onChange={() => updateFilter('type', type)}
                      className="accent-primary-600"
                    />
                    <span>{type === '' ? 'All Listings' : type === 'SALE' ? 'For Sale' : type === 'RENT' ? 'For Rent' : 'Sale & Rent'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment Condition */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Condition
              </label>
              <div className="space-y-1 text-xs font-medium text-slate-700">
                {['', 'NEW', 'USED', 'REFURBISHED'].map((cond) => (
                  <label key={cond} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="condition"
                      checked={conditionParam === cond}
                      onChange={() => updateFilter('condition', cond)}
                      className="accent-primary-600"
                    />
                    <span>{cond === '' ? 'Any Condition' : cond}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                State / Region
              </label>
              <select
                value={stateParam}
                onChange={(e) => updateFilter('state', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="">All States</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Price Range (INR ₹) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Max Price (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={minPriceParam}
                  onBlur={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={maxPriceParam}
                  onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No machinery found matching your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, choosing "All States", or searching for a broader term like "Tractor" or "Rotavator".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary-700 text-white rounded-xl text-xs font-bold hover:bg-primary-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong className="text-slate-900">{products.length}</strong> equipment listings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => updateFilter('page', String(pageParam - 1))}
                    disabled={pageParam <= 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-700 px-3">
                    Page {pageParam} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter('page', String(pageParam + 1))}
                    disabled={pageParam >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
