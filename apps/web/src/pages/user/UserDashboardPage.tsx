import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  ShoppingCart,
  Calendar,
  Eye,
  MessageSquare,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';

export const UserDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [analyticsRes, purchasesRes, rentalsRes] = await Promise.all([
          api.get('/users/me/analytics'),
          api.get('/requests/purchase/received'),
          api.get('/requests/rental/received'),
        ]);

        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
        if (purchasesRes.data.success) setRecentPurchases(purchasesRes.data.data.slice(0, 3));
        if (rentalsRes.data.success) setRecentRentals(rentalsRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Farmer Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Namaskar, {user?.profile?.fullName || 'Farmer'}!
          </h1>
          <p className="text-xs sm:text-sm text-primary-100">
            {user?.profile?.villageOrCity}, {user?.profile?.district}, {user?.profile?.state} • Manage your machinery and incoming deals.
          </p>
        </div>

        <Link
          to="/products/new"
          className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Equipment (+ Sell / Rent)</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">My Active Listings</span>
            <Tractor className="w-5 h-5 text-primary-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.totalListings || 0}
          </span>
          <p className="text-[11px] text-slate-400">Tractors & implements listed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Machinery Views</span>
            <Eye className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.totalViews || 0}
          </span>
          <p className="text-[11px] text-slate-400">Farmer catalog impressions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Deals & Offers</span>
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {recentPurchases.length + recentRentals.length}
          </span>
          <p className="text-[11px] text-slate-400">Incoming purchase & rent requests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Chat Inquiries</span>
            <MessageSquare className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.totalInquiries || 0}
          </span>
          <p className="text-[11px] text-slate-400">Direct buyer discussions</p>
        </div>
      </div>

      {/* Activity Sections: Recent Purchase Offers & Rental Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Offers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary-700" />
              <span>Incoming Purchase Offers</span>
            </h3>
            <Link to="/requests" className="text-xs font-bold text-primary-700 hover:underline">
              View All
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No pending purchase offers yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPurchases.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{req.product?.name}</h4>
                    <p className="text-slate-500">
                      Buyer: <strong>{req.buyer?.profile?.fullName}</strong> • Offered: <span className="font-bold text-emerald-700">₹{req.offeredPrice.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rental Inquiries */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Incoming Rental Bookings</span>
            </h3>
            <Link to="/requests" className="text-xs font-bold text-primary-700 hover:underline">
              View All
            </Link>
          </div>

          {recentRentals.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No rental bookings requested yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRentals.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{req.product?.name}</h4>
                    <p className="text-slate-500">
                      Renter: <strong>{req.renter?.profile?.fullName}</strong> • Total: <span className="font-bold text-amber-700">₹{req.estimatedAmount.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
