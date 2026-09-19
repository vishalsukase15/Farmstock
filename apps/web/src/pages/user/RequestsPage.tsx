import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar, Check, X, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { PurchaseRequest, RentalRequest } from '../../types/index.js';
import { formatINR } from '../../components/product/PriceDisplay.js';
import api from '../../services/api.js';

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rec_purchases' | 'sent_purchases' | 'rec_rentals' | 'sent_rentals'>('rec_purchases');

  const [receivedPurchases, setReceivedPurchases] = useState<PurchaseRequest[]>([]);
  const [sentPurchases, setSentPurchases] = useState<PurchaseRequest[]>([]);
  const [receivedRentals, setReceivedRentals] = useState<RentalRequest[]>([]);
  const [sentRentals, setSentRentals] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const [recP, sentP, recR, sentR] = await Promise.all([
        api.get('/requests/purchase/received'),
        api.get('/requests/purchase/sent'),
        api.get('/requests/rental/received'),
        api.get('/requests/rental/sent'),
      ]);

      if (recP.data.success) setReceivedPurchases(recP.data.data);
      if (sentP.data.success) setSentPurchases(sentP.data.data);
      if (recR.data.success) setReceivedRentals(recR.data.data);
      if (sentR.data.success) setSentRentals(sentR.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleUpdatePurchaseStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/requests/purchase/${id}/status`, { status });
      fetchAllRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdateRentalStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/requests/rental/${id}/status`, { status });
      fetchAllRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleOpenChat = async (recipientId: string, productId?: string) => {
    try {
      await api.post('/chat/conversations', { recipientId, productId });
      navigate('/chat');
    } catch {
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Deals & Requests Center</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review incoming buyer offers, respond to rental calendar reservations, and track your sent requests.
        </p>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('rec_purchases')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all ${
            activeTab === 'rec_purchases'
              ? 'bg-primary-700 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Received Purchase Offers ({receivedPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('sent_purchases')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all ${
            activeTab === 'sent_purchases'
              ? 'bg-primary-700 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Sent Offers ({sentPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('rec_rentals')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all ${
            activeTab === 'rec_rentals'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Received Rental Bookings ({receivedRentals.length})
        </button>
        <button
          onClick={() => setActiveTab('sent_rentals')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all ${
            activeTab === 'sent_rentals'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Sent Rental Requests ({sentRentals.length})
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
      ) : (
        <div className="space-y-4">
          {/* TAB 1: RECEIVED PURCHASES */}
          {activeTab === 'rec_purchases' && (
            receivedPurchases.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No purchase offers received yet.
              </div>
            ) : (
              receivedPurchases.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{req.product?.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Offered by: <strong>{req.buyer?.profile?.fullName}</strong> ({req.buyer?.profile?.district}, {req.buyer?.profile?.state})
                    </p>
                    <div className="text-xs">
                      Offered Price: <strong className="text-emerald-700 font-extrabold text-sm">{formatINR(req.offeredPrice)}</strong>
                    </div>
                    {req.message && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-1">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenChat(req.buyerId, req.productId)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-primary-700" />
                      <span>Chat</span>
                    </button>

                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdatePurchaseStatus(req.id, 'ACCEPTED')}
                          className="px-3 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdatePurchaseStatus(req.id, 'REJECTED')}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdatePurchaseStatus(req.id, 'COMPLETED')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 2: SENT PURCHASES */}
          {activeTab === 'sent_purchases' && (
            sentPurchases.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                You haven't sent any purchase offers yet.
              </div>
            ) : (
              sentPurchases.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/products/${req.productId}`} className="font-bold text-slate-900 text-sm hover:text-primary-700">
                        {req.product?.name}
                      </Link>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Owner: <strong>{req.owner?.profile?.fullName}</strong>
                    </p>
                    <div className="text-xs">
                      My Offer: <strong className="text-emerald-700 font-extrabold text-sm">{formatINR(req.offeredPrice)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenChat(req.ownerId, req.productId)}
                      className="px-3 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                    {req.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdatePurchaseStatus(req.id, 'CANCELLED')}
                        className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold"
                      >
                        Cancel Offer
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 3: RECEIVED RENTALS */}
          {activeTab === 'rec_rentals' && (
            receivedRentals.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No rental bookings requested for your equipment yet.
              </div>
            ) : (
              receivedRentals.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{req.product?.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Renter: <strong>{req.renter?.profile?.fullName}</strong> • Dates:{' '}
                      <strong>{new Date(req.startDate).toLocaleDateString()}</strong> to{' '}
                      <strong>{new Date(req.endDate).toLocaleDateString()}</strong>
                    </p>
                    <div className="text-xs">
                      Estimated Total: <strong className="text-amber-700 font-extrabold text-sm">{formatINR(req.estimatedAmount)}</strong>
                      {req.securityDeposit ? ` • Deposit: ${formatINR(req.securityDeposit)}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenChat(req.renterId, req.productId)}
                      className="px-3 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold"
                    >
                      Chat
                    </button>
                    {req.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleUpdateRentalStatus(req.id, 'APPROVED')}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                        >
                          Approve Dates
                        </button>
                        <button
                          onClick={() => handleUpdateRentalStatus(req.id, 'REJECTED')}
                          className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {req.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateRentalStatus(req.id, 'COMPLETED')}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                      >
                        Complete Rental
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 4: SENT RENTALS */}
          {activeTab === 'sent_rentals' && (
            sentRentals.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                You haven't requested any machinery rentals yet.
              </div>
            ) : (
              sentRentals.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{req.product?.name}</h3>
                    <p className="text-xs text-slate-500">
                      Owner: <strong>{req.owner?.profile?.fullName}</strong> • Dates:{' '}
                      {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                    </p>
                    <div className="text-xs">
                      Estimated Cost: <strong className="text-amber-700 font-bold">{formatINR(req.estimatedAmount)}</strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {req.status}
                  </span>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};
