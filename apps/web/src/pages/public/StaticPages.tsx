import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, ShieldCheck, Phone, CheckCircle, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { Category } from '../../types/index.js';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-slate-900">All Agricultural Equipment Categories</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore specialized machinery tailored for every stage of cultivation, tilling, sowing, and harvesting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-primary-500 hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Tractor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {cat.description || 'Quality machinery available for purchase and rental.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary-700">
              <span>{cat.productCount || 0} active listings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="space-y-3 text-center">
        <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">About Us</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">FARMSTOCK Agricultural Marketplace</h1>
        <p className="text-sm text-slate-600">Empowering Farmers. Connecting Equipment. Growing Together.</p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <p>
          Mechanization is the key to elevating agricultural productivity, reducing manual labor, and securing higher yields for farming families across India. However, high capital costs for modern machinery such as combine harvesters, 4WD tractors, and smart rotavators often keep this essential equipment out of reach of smallholder farmers.
        </p>
        <p>
          <strong>FARMSTOCK</strong> was founded to solve this critical disparity. By establishing a direct, transparent peer-to-peer equipment sharing and trading marketplace, farmers who own machinery can monetize idle days through local rentals, while neighboring farmers gain flexible, affordable access to modern implements on an hourly, daily, or seasonal basis.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">Our Core Principles</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Zero Mandatory Middlemen:</strong> Direct farmer-to-farmer communication through built-in in-app chat and verified contact mechanisms.</li>
          <li><strong>Transparent Indian Rupee (₹) Pricing:</strong> Clear breakdowns for purchase prices, hourly and daily rental rates, and refundable security deposits.</li>
          <li><strong>Vernacular Multi-Language Accessibility:</strong> Built for farmers in their local tongue: English, Marathi, Hindi, and Spanish.</li>
          <li><strong>Verified Community Trust:</strong> Mandatory ownership validation, review feedback loops, and automated calendar collision safeguards.</li>
        </ul>
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Step-by-Step Guide</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">How FarmStock Works</h1>
        <p className="text-xs sm:text-sm text-slate-600">A guide for buyers, sellers, and equipment renters.</p>
      </div>

      <div className="space-y-6">
        {[
          { step: '1', title: 'Discover Machinery by District', text: 'Filter by tractor horsepower, implement category, condition (New/Used), and your taluka or village.' },
          { step: '2', title: 'Direct Real-Time Chat', text: 'Chat privately with the machine owner inside FarmStock to discuss condition, driver availability, and maintenance.' },
          { step: '3', title: 'Send Purchase Offer or Book Rental Dates', text: 'Submit a price offer or reserve dates on the rental calendar with automatic collision prevention.' },
          { step: '4', title: 'Field Inspection & Completion', text: 'Inspect the tractor or tiller in person, verify fuel and accessories, and mark the deal as completed to unlock trusted reviews.' },
        ].map((item) => (
          <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-700 text-white font-black text-base flex items-center justify-center shrink-0">
              {item.step}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => {
  const faqs = [
    { q: 'Is there any commission charged by FarmStock?', a: 'No! FarmStock is completely commission-free for direct farmer-to-farmer transactions.' },
    { q: 'Can I act as both a buyer and a seller on the same account?', a: 'Yes. Every registered farmer account can both list machinery for sale/rent and submit offers on other listings.' },
    { q: 'How does rental booking work?', a: 'You select required start and end dates. The system checks whether the equipment has already been approved for those dates. If free, an inquiry is submitted to the owner for one-click approval.' },
    { q: 'What happens if equipment is damaged during rental?', a: 'FarmStock encourages refundable security deposits and inspection protocols specified in each listing agreement.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-slate-500">Everything you need to know about using FarmStock.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary-700 shrink-0" />
              {faq.q}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
    <h1 className="text-2xl font-black text-slate-900">Terms and Conditions</h1>
    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-4">
      <p>1. <strong>Platform Role:</strong> FarmStock operates solely as a digital communication and listing directory between farmers. We do not own, inspect, or guarantee privately listed machinery.</p>
      <p>2. <strong>User Responsibility:</strong> Users agree to provide truthful descriptions, actual manufacturing years, and genuine photos of their machinery.</p>
      <p>3. <strong>Rental Agreements:</strong> Rental conditions, fuel provisions, and security deposits must be agreed upon mutually prior to equipment handover.</p>
      <p>4. <strong>Prohibited Conduct:</strong> Fraudulent listings, duplicate spam, and harassment over chat will result in immediate permanent account suspension.</p>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
    <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-4">
      <p>1. <strong>Personal Information:</strong> We respect farmer privacy. Phone numbers and village coordinates are only visible when permitted by user privacy settings or during active deal coordination.</p>
      <p>2. <strong>Data Security:</strong> Passwords are encrypted with salted hashing (bcrypt), and authentication tokens are secured with standard web cryptographic practices.</p>
      <p>3. <strong>No Third-Party Sale:</strong> We do not sell your personal contact numbers or farming data to third-party telemarketers.</p>
    </div>
  </div>
);
