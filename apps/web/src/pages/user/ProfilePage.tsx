import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { User, ShieldCheck, MapPin, Phone, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || '',
    bio: user?.profile?.bio || '',
    state: user?.profile?.state || 'Maharashtra',
    district: user?.profile?.district || '',
    taluka: user?.profile?.taluka || '',
    villageOrCity: user?.profile?.villageOrCity || '',
    pincode: user?.profile?.pincode || '',
    isPhonePublic: user?.profile?.isPhonePublic ?? true,
    preferredLang: user?.profile?.preferredLang || 'en',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const states = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Madhya Pradesh', 'Karnataka'];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsSaving(true);

    try {
      await api.patch('/users/me/profile', formData);
      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      setPassSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-800 font-black text-2xl flex items-center justify-center shrink-0">
          {user?.profile?.fullName?.charAt(0) || 'F'}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <span>{user?.profile?.fullName || 'Farmer'}</span>
            {user?.isVerified && (
              <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            )}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.email} • {user?.phone || 'No phone added'}
          </p>
          <p className="text-xs font-semibold text-primary-800">
            Member Role: {user?.role} • Status: {user?.status}
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleProfileSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Farmer Personal & Location Details
        </h2>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Platform Language</label>
            <select
              value={formData.preferredLang}
              onChange={(e) => setFormData({ ...formData, preferredLang: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="es">Español (Spanish)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Farming Bio / Specialization</label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="e.g. Sugarcane and wheat progressive farmer, mechanized tilling service..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
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
            <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Taluka</label>
            <input
              type="text"
              value={formData.taluka}
              onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Village / City</label>
            <input
              type="text"
              value={formData.villageOrCity}
              onChange={(e) => setFormData({ ...formData, villageOrCity: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="phonePub"
            checked={formData.isPhonePublic}
            onChange={(e) => setFormData({ ...formData, isPhonePublic: e.target.checked })}
            className="w-4 h-4 accent-primary-600"
          />
          <label htmlFor="phonePub" className="text-xs font-semibold text-slate-700">
            Show phone number on active equipment listings for direct calls
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow"
        >
          {isSaving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Security & Password
        </h2>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs">
            {passSuccess}
          </div>
        )}
        {passError && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
            {passError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};
