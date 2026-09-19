import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { WishlistItem } from '../../types/index.js';
import { ProductCard } from '../../components/product/ProductCard.js';
import api from '../../services/api.js';

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
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
    fetchWishlist();
  }, []);

  const handleWishlistToggle = (productId: string, isSaved: boolean) => {
    if (!isSaved) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Saved Equipment (Wishlist)</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Machinery you have shortlisted for upcoming harvest and sowing seasons.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading saved items...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any tractor, rotavator, or tiller to save it here for later.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-primary-700 text-white rounded-xl text-xs font-bold shadow"
          >
            Explore Machinery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
