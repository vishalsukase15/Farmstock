import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Heart, Star, Tractor } from 'lucide-react';
import { Product } from '../../types/index.js';
import { PriceDisplay } from './PriceDisplay.js';
import { useAuth } from '../../context/AuthContext.js';
import api, { resolveAssetUrl } from '../../services/api.js';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string, isSaved: boolean) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  isWishlisted: initialWishlisted = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(initialWishlisted);
  const [isToggling, setIsToggling] = useState(false);

  const mainImage = resolveAssetUrl(product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&q=80&w=800');

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to save equipment to your wishlist.');
      return;
    }

    try {
      setIsToggling(true);
      const res = await api.post('/wishlist/toggle', { productId: product.id });
      setSaved(res.data.isWishlisted);
      if (onWishlistToggle) {
        onWishlistToggle(product.id, res.data.isWishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const getTransactionBadge = () => {
    if (product.transactionType === 'SALE') {
      return <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">Sale</span>;
    }
    if (product.transactionType === 'RENT') {
      return <span className="bg-amber-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">Rent</span>;
    }
    return <span className="bg-primary-700 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">Sale & Rent</span>;
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:border-primary-400">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          {getTransactionBadge()}
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2 py-0.5 rounded shadow-sm">
            {product.condition}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isToggling}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-colors shadow ${
            saved
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Specifications chip */}
        {product.horsepower && (
          <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
            {product.horsepower} HP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Verified Owner */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-primary-700">{product.category?.name}</span>
            {product.owner?.isVerified && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 text-emerald-700" />
                Verified
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block group-hover:text-primary-700 transition-colors">
            <h3 className="font-bold text-slate-900 text-base line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{product.villageOrCity}, {product.district}, {product.state}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <PriceDisplay
            salePrice={product.salePrice}
            rentalDailyRate={product.rentalDailyRate}
            rentalHourlyRate={product.rentalHourlyRate}
            isNegotiable={product.isNegotiable}
            transactionType={product.transactionType}
            size="sm"
          />

          <Link
            to={`/products/${product.id}`}
            className="px-3 py-1.5 bg-primary-50 text-primary-800 text-xs font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};
