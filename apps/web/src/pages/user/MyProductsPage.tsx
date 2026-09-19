import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, PlusCircle, Eye, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '../../types/index.js';
import { formatINR } from '../../components/product/PriceDisplay.js';
import api from '../../services/api.js';
import { resolveAssetUrl } from '../../services/api.js';

export const MyProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/my/listings');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'APPROVED' ? 'UNAVAILABLE' : 'APPROVED';
    try {
      await api.patch(`/products/${id}`, { status: nextStatus });
      fetchMyProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this equipment listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMyProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Listed Machinery</h1>
          <p className="text-xs text-slate-500">
            Manage your equipment catalog, toggle rental availability, and monitor buyer views.
          </p>
        </div>
        <Link
          to="/products/new"
          className="px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Equipment</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your equipment...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You haven't listed any farm equipment yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            List your old or new tractors, tillers, pumps, or rotavators to connect with interested buyers and renters.
          </p>
          <Link
            to="/products/new"
            className="inline-block px-5 py-2.5 bg-primary-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Post First Equipment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/9] bg-slate-100">
                  <img
                    src={resolveAssetUrl(p.images?.[0]?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800')}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {p.viewCount} views
                    </span>
                    <span>{p.category?.name}</span>
                  </div>
                  <div className="text-sm font-extrabold text-primary-800">
                    {p.salePrice ? formatINR(p.salePrice) : p.rentalDailyRate ? `${formatINR(p.rentalDailyRate)}/day` : 'Inquire'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/products/${p.id}`}
                  className="font-bold text-primary-700 hover:underline"
                >
                  View Details
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(p.id, p.status)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                    title={p.status === 'APPROVED' ? 'Mark Unavailable' : 'Mark Available'}
                  >
                    {p.status === 'APPROVED' ? <XCircle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
