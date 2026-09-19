import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../../types/index.js';
import { formatINR } from '../../components/product/PriceDisplay.js';
import api from '../../services/api.js';
import { resolveAssetUrl } from '../../services/api.js';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    try {
      await api.patch(`/cart/items/${id}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/cart/items/${id}`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    try {
      await api.delete('/cart');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.salePrice || 0) * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Equipment Purchase Cart</h1>
          <p className="text-xs text-slate-500">Review selected agricultural implements before sending purchase inquiries.</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-xs font-semibold text-rose-600 hover:underline">
            Clear Cart
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your cart...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your cart is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore farm equipment available for sale and add them to stage your purchase requests.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-primary-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Browse Farm Equipment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={resolveAssetUrl(
                      item.product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
                    )}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-slate-900 text-sm hover:text-primary-700 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Owner: {item.product.owner?.profile?.fullName || 'Farmer'} ({item.product.villageOrCity}, {item.product.district})
                    </p>
                    <div className="text-sm font-extrabold text-primary-800">
                      {formatINR(item.product.salePrice || 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-bold text-slate-900 text-sm">Order & Request Summary</h3>
              <div className="divide-y divide-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between pt-2">
                  <span>Selected Machines</span>
                  <span className="font-bold text-slate-800">{items.length} units</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span>Platform Commission</span>
                  <span className="font-bold text-emerald-700">₹0 (Free)</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-primary-800 font-black text-base">{formatINR(subtotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400 mb-3">
                  Clicking each machine allows you to send an official purchase offer and negotiate directly with its owner.
                </p>
                <Link
                  to={`/products/${items[0]?.productId}`}
                  className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2"
                >
                  <span>Proceed to Send Offer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
