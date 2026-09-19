import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ShieldCheck,
  Heart,
  Share2,
  AlertTriangle,
  MessageSquare,
  ShoppingCart,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Product } from '../../types/index.js';
import { resolveAssetUrl } from '../../services/api.js';
import { PriceDisplay, formatINR } from '../../components/product/PriceDisplay.js';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modals
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [buyMessage, setBuyMessage] = useState('');
  const [isSubmittingBuy, setIsSubmittingBuy] = useState(false);

  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pricingUnit, setPricingUnit] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [rentalUse, setRentalUse] = useState('');
  const [isSubmittingRent, setIsSubmittingRent] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('MISLEADING_INFO');
  const [reportDesc, setReportDesc] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then((res) => {
          if (res.data.success) {
            setProduct(res.data.data);
            setOfferedPrice(res.data.data.salePrice || 0);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-slate-500">Loading machinery specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Equipment not found</h2>
        <Link to="/products" className="inline-block px-4 py-2 bg-primary-700 text-white rounded-xl text-xs font-bold">
          Back to Browse
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === product.ownerId;
  const images = product.images?.length > 0
    ? product.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800', isPrimary: true, sortOrder: 0 }];

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/chat/conversations', {
        recipientId: product.ownerId,
        productId: product.id,
      });
      if (res.data.success) {
        navigate('/chat');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      alert('Equipment added to your purchase cart!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsSubmittingBuy(true);
      await api.post('/requests/purchase', {
        productId: product.id,
        quantity: 1,
        offeredPrice: Number(offeredPrice),
        message: buyMessage,
        preferredContact: 'CHAT',
      });
      alert('Purchase request successfully submitted to owner!');
      setBuyModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit purchase request');
    } finally {
      setIsSubmittingBuy(false);
    }
  };

  const handleRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsSubmittingRent(true);
      await api.post('/requests/rental', {
        productId: product.id,
        startDate,
        endDate,
        pricingUnit,
        intendedUse: rentalUse,
      });
      alert('Rental request submitted to owner!');
      setRentModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rental request');
    } finally {
      setIsSubmittingRent(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsSubmittingReview(true);
      await api.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Thank you! Review posted successfully.');
      setReviewComment('');
      // refresh product
      const updated = await api.get(`/products/${product.id}`);
      if (updated.data.success) setProduct(updated.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/reports', {
        targetType: 'PRODUCT',
        targetId: product.id,
        reason: reportReason,
        description: reportDesc,
      });
      alert('Report submitted. Our moderation team will review this listing.');
      setReportModalOpen(false);
    } catch (err: any) {
      alert('Failed to report listing.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-primary-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-700">Machinery</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-primary-700">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Essential Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={resolveAssetUrl(images[selectedImageIndex]?.url)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-primary-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {product.transactionType === 'SALE' ? 'For Sale' : product.transactionType === 'RENT' ? 'For Rent' : 'Sale & Rent'}
              </span>
              <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1 rounded-full backdrop-blur shadow">
                {product.condition}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-primary-600 ring-2 ring-primary-400' : 'border-slate-200'
                  }`}
                >
                  <img src={resolveAssetUrl(img.url)} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pricing & CTA Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-primary-700 uppercase tracking-wider">{product.brand}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Listed {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
              <span>{product.villageOrCity}, {product.district}, {product.state}</span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl p-5 space-y-3">
            <PriceDisplay
              salePrice={product.salePrice}
              rentalDailyRate={product.rentalDailyRate}
              rentalHourlyRate={product.rentalHourlyRate}
              isNegotiable={product.isNegotiable}
              transactionType={product.transactionType}
              size="lg"
            />

            {product.securityDeposit ? (
              <div className="text-xs text-slate-600 pt-1 border-t border-primary-200/60">
                Security Deposit: <strong>{formatINR(product.securityDeposit)}</strong> (Refundable upon inspection)
              </div>
            ) : null}

            {product.rentalTerms && (
              <p className="text-[11px] text-slate-500 bg-white/70 p-2 rounded-lg">
                <strong>Rental Terms:</strong> {product.rentalTerms}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {!isOwner ? (
            <div className="space-y-3">
              {/* Buy Request Button */}
              {(product.transactionType === 'SALE' || product.transactionType === 'BOTH') && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBuyModalOpen(true)}
                    className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Request to Buy</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-white border border-primary-700 text-primary-800 hover:bg-primary-50 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              )}

              {/* Rent Request Button */}
              {(product.transactionType === 'RENT' || product.transactionType === 'BOTH') && (
                <button
                  onClick={() => setRentModalOpen(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book for Rent</span>
                </button>
              )}

              {/* Chat with Owner */}
              <button
                onClick={handleStartChat}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-primary-700" />
                <span>Chat with Equipment Owner</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
              You are the owner of this equipment listing. You can manage or edit this product from your dashboard.
            </div>
          )}

          {/* Owner Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equipment Owner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-base">
                {product.owner?.profile?.avatarUrl ? (
                  <img src={product.owner.profile.avatarUrl} alt="Owner" className="w-full h-full rounded-full object-cover" />
                ) : (
                  product.owner?.profile?.fullName?.charAt(0) || 'F'
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  {product.owner?.profile?.fullName || 'Verified Farmer'}
                  {product.owner?.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  {product.owner?.profile?.district}, {product.owner?.profile?.state}
                </p>
                <p className="text-[11px] text-slate-400">
                  Active listings: {product.owner?._count?.products || 1}
                </p>
              </div>
            </div>
            {product.owner?.phone && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-700">
                <span>Phone: <strong>{product.owner.phone}</strong></span>
              </div>
            )}
          </div>

          {/* Safety & Report links */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Verified Inspection Available
            </span>
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Listing
            </button>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-slate-200">
        {/* Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Machinery Overview & Condition</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Farmer Reviews</span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full font-semibold text-slate-600">
                {product.reviews?.length || 0}
              </span>
            </h2>

            {/* Existing Reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-3">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {rev.author?.profile?.fullName || 'Verified Farmer'}
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No reviews yet for this machinery.</p>
            )}

            {/* Submit Review */}
            {isAuthenticated && !isOwner && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Leave a Review for this Equipment</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rating:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="p-1 border border-slate-200 rounded text-xs"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this equipment and owner..."
                  required
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-1.5 bg-primary-700 text-white rounded-lg text-xs font-bold hover:bg-primary-800 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between p-3 bg-slate-50">
                <span className="text-slate-500">Brand</span>
                <span className="font-bold text-slate-800">{product.brand}</span>
              </div>
              {product.model && (
                <div className="flex justify-between p-3">
                  <span className="text-slate-500">Model</span>
                  <span className="font-bold text-slate-800">{product.model}</span>
                </div>
              )}
              {product.horsepower && (
                <div className="flex justify-between p-3 bg-slate-50">
                  <span className="text-slate-500">Horsepower (HP)</span>
                  <span className="font-bold text-slate-800">{product.horsepower} HP</span>
                </div>
              )}
              {product.fuelType && (
                <div className="flex justify-between p-3">
                  <span className="text-slate-500">Fuel / Power Type</span>
                  <span className="font-bold text-slate-800">{product.fuelType}</span>
                </div>
              )}
              {product.usageHours && (
                <div className="flex justify-between p-3 bg-slate-50">
                  <span className="text-slate-500">Usage Meter</span>
                  <span className="font-bold text-slate-800">{product.usageHours} Hours</span>
                </div>
              )}
              {product.modelYear && (
                <div className="flex justify-between p-3">
                  <span className="text-slate-500">Manufacturing Year</span>
                  <span className="font-bold text-slate-800">{product.modelYear}</span>
                </div>
              )}

              {/* Custom specs */}
              {product.specifications?.map((spec) => (
                <div key={spec.id} className="flex justify-between p-3">
                  <span className="text-slate-500">{spec.label}</span>
                  <span className="font-bold text-slate-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BUY REQUEST MODAL */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Send Purchase Offer</h3>
            <p className="text-xs text-slate-500">
              Submit your proposed price to the equipment owner. You can negotiate and inspect machinery before finalizing.
            </p>

            <form onSubmit={handleBuySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Offered Price (₹ INR)
                </label>
                <input
                  type="number"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-primary-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Message to Owner
                </label>
                <textarea
                  value={buyMessage}
                  onChange={(e) => setBuyMessage(e.target.value)}
                  placeholder="Introduce yourself and propose a date for inspection..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBuy}
                  className="w-1/2 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50"
                >
                  {isSubmittingBuy ? 'Sending Offer...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENT BOOKING MODAL */}
      {rentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Request Equipment Rental</h3>
            <p className="text-xs text-slate-500">
              Select your required dates. Collision checks are performed to ensure no overlapping bookings.
            </p>

            <form onSubmit={handleRentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pricing Unit</label>
                <select
                  value={pricingUnit}
                  onChange={(e) => setPricingUnit(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="DAILY">Daily Rate ({formatINR(product.rentalDailyRate || 0)}/day)</option>
                  <option value="WEEKLY">Weekly Rate ({formatINR(product.rentalWeeklyRate || 0)}/wk)</option>
                  <option value="MONTHLY">Monthly Rate ({formatINR(product.rentalMonthlyRate || 0)}/mo)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Intended Agricultural Work</label>
                <input
                  type="text"
                  value={rentalUse}
                  onChange={(e) => setRentalUse(e.target.value)}
                  placeholder="e.g. Sowing 5 acres wheat, puddling, transport"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRentModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRent}
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow disabled:opacity-50"
                >
                  {isSubmittingRent ? 'Reserving...' : 'Submit Rental Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Report Machinery Listing
            </h3>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="FRAUD">Fraudulent Listing</option>
                  <option value="MISLEADING_INFO">Misleading or Incorrect Details</option>
                  <option value="INAPPROPRIATE">Inappropriate Content</option>
                  <option value="SPAM">Spam or Duplicate</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Explain why this listing violates community standards..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
