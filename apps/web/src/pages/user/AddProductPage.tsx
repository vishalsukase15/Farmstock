import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tractor, Upload, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import { Category } from '../../types/index.js';

export const AddProductPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    modelYear: new Date().getFullYear(),
    description: '',
    condition: 'USED',
    transactionType: 'BOTH',

    salePrice: 0,
    isNegotiable: true,
    rentalHourlyRate: 0,
    rentalDailyRate: 0,
    rentalWeeklyRate: 0,
    rentalMonthlyRate: 0,
    securityDeposit: 0,
    rentalTerms: '',

    usageHours: 0,
    horsepower: 45,
    fuelType: 'Diesel',

    state: 'Maharashtra',
    district: '',
    taluka: '',
    villageOrCity: '',
    pincode: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&q=80&w=800',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data.data[0].id }));
        }
      }
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setIsUploading(true);
      const res = await api.post('/products/upload-images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setImageUrls([...imageUrls, ...res.data.urls]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrlImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (imageUrls.length === 0) {
      setError('Please provide at least one product photo.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        rentalHourlyRate: formData.rentalHourlyRate ? Number(formData.rentalHourlyRate) : undefined,
        rentalDailyRate: formData.rentalDailyRate ? Number(formData.rentalDailyRate) : undefined,
        rentalWeeklyRate: formData.rentalWeeklyRate ? Number(formData.rentalWeeklyRate) : undefined,
        rentalMonthlyRate: formData.rentalMonthlyRate ? Number(formData.rentalMonthlyRate) : undefined,
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : undefined,
        usageHours: formData.usageHours ? Number(formData.usageHours) : undefined,
        horsepower: formData.horsepower ? Number(formData.horsepower) : undefined,
        modelYear: formData.modelYear ? Number(formData.modelYear) : undefined,
        images: imageUrls,
      };

      const res = await api.post('/products', payload);
      if (res.data.success) {
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const states = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Madhya Pradesh', 'Karnataka'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">List Agricultural Equipment</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Publish your tractor, harvester, or implement for sale or rental across India with zero commission.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* SECTION 1: BASIC DETAILS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Equipment Overview
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Listing Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mahindra 575 DI Sarpanch Tractor (45 HP) with Power Steering"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Mahindra, John Deere, Shaktiman"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Model Name</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. 575 DI"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturing Year</label>
              <input
                type="number"
                value={formData.modelYear}
                onChange={(e) => setFormData({ ...formData, modelYear: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Condition *</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="NEW">Brand New</option>
                <option value="USED">Used (Well Maintained)</option>
                <option value="REFURBISHED">Refurbished / Serviced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Listing Type *</label>
              <select
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-primary-800"
              >
                <option value="SALE">For Sale Only</option>
                <option value="RENT">For Rent Only</option>
                <option value="BOTH">Available for Sale & Rent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe condition, working hours, implements included, maintenance history, tire condition..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* SECTION 2: PRICING IN INR (₹) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Pricing Details (in Indian Rupees ₹)
          </h2>

          {(formData.transactionType === 'SALE' || formData.transactionType === 'BOTH') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (₹ INR)</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-800"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="neg"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="neg" className="text-xs font-semibold text-slate-700">Price is Negotiable</label>
              </div>
            </div>
          )}

          {(formData.transactionType === 'RENT' || formData.transactionType === 'BOTH') && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Daily Rate (₹/day)</label>
                  <input
                    type="number"
                    value={formData.rentalDailyRate}
                    onChange={(e) => setFormData({ ...formData, rentalDailyRate: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={formData.rentalHourlyRate}
                    onChange={(e) => setFormData({ ...formData, rentalHourlyRate: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Weekly Rate (₹/wk)</label>
                  <input
                    type="number"
                    value={formData.rentalWeeklyRate}
                    onChange={(e) => setFormData({ ...formData, rentalWeeklyRate: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Rental Terms & Conditions</label>
                <input
                  type="text"
                  value={formData.rentalTerms}
                  onChange={(e) => setFormData({ ...formData, rentalTerms: e.target.value })}
                  placeholder="e.g. Fuel by renter, max 8 hours daily, returned clean"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Technical Specs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Horsepower (HP)</label>
              <input
                type="number"
                value={formData.horsepower}
                onChange={(e) => setFormData({ ...formData, horsepower: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Power / Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Solar">Solar Powered</option>
                <option value="Manual">Manual / PTO Driven</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Usage Meter Hours</label>
              <input
                type="number"
                value={formData.usageHours}
                onChange={(e) => setFormData({ ...formData, usageHours: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: LOCATION */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Machinery Location
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Satara"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Taluka</label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                placeholder="e.g. Karad"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Village / City *</label>
              <input
                type="text"
                required
                value={formData.villageOrCity}
                onChange={(e) => setFormData({ ...formData, villageOrCity: e.target.value })}
                placeholder="e.g. Vadgaon"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: PHOTOS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            5. Machinery Photos
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload from Device'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="flex-1 flex gap-2 w-full">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Photo Previews */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group">
                <img src={url} alt="machinery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Main Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary-700 hover:bg-primary-800 text-white font-black rounded-xl text-sm shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing Listing...' : 'Publish Equipment Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
