import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Tractor, ShoppingCart, Calendar, AlertTriangle, Check, X, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api.js';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'moderation' | 'users' | 'reports' | 'analytics'>('moderation');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metRes, usrRes, prodRes, repRes, anaRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/reports/admin'),
        api.get('/admin/analytics'),
      ]);

      if (metRes.data.success) setMetrics(metRes.data.data);
      if (usrRes.data.success) setUsers(usrRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (repRes.data.success) setReports(repRes.data.data);
      if (anaRes.data.success) setAnalytics(anaRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerateProduct = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Reason for rejection:') : undefined;
    try {
      await api.patch(`/admin/products/${id}/moderation`, { status, reason });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const next = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${id}/status`, { status: next });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      await api.patch(`/reports/admin/${id}`, { status: 'RESOLVED' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#d97706', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Admin Control Center</h1>
          <p className="text-xs text-slate-500">
            Moderate listings, inspect registered farmers, investigate complaints, and view platform KPIs.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Total Users</span>
          <p className="text-2xl font-black text-slate-900">{metrics?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Active Listings</span>
          <p className="text-2xl font-black text-primary-700">{metrics?.activeListings || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Purchase Offers</span>
          <p className="text-2xl font-black text-emerald-700">{metrics?.purchaseRequests || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Rental Bookings</span>
          <p className="text-2xl font-black text-amber-600">{metrics?.rentalRequests || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Pending Review</span>
          <p className="text-2xl font-black text-sky-600">{metrics?.pendingListings || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Open Reports</span>
          <p className="text-2xl font-black text-rose-600">{metrics?.openReports || 0}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
            activeTab === 'moderation' ? 'bg-primary-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Machinery Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
            activeTab === 'users' ? 'bg-primary-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registered Farmers ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
            activeTab === 'reports' ? 'bg-primary-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Reports & Complaints ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
            activeTab === 'analytics' ? 'bg-primary-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visual Analytics
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Machinery</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-500">{p.category?.name}</td>
                    <td className="p-4 text-slate-600">{p.owner?.profile?.fullName || p.owner?.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleModerateProduct(p.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleModerateProduct(p.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email / Phone</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{u.profile?.fullName || 'Farmer'}</td>
                    <td className="p-4 text-slate-600">{u.email} <br /><span className="text-[11px] text-slate-400">{u.phone}</span></td>
                    <td className="p-4 text-slate-500">{u.profile?.district}, {u.profile?.state}</td>
                    <td className="p-4 font-semibold">{u.role}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No open reports or complaints.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 uppercase">{rep.reason}</span>
                      <span className="text-slate-400">• Target ID: {rep.targetId}</span>
                    </div>
                    <p className="text-slate-600">"{rep.description || 'No additional note'}"</p>
                    <p className="text-slate-400 text-[11px]">Reported by: {rep.reporter?.profile?.fullName || rep.reporter?.email}</p>
                  </div>
                  <div>
                    {rep.status === 'PENDING' ? (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold">Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Machinery Listings by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="listings" fill="#15803d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Top States by Active Machinery</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.regionalDistribution}>
                  <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
