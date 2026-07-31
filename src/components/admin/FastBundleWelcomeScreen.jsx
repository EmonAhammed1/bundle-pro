import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { Mail, PackagePlus, ArrowRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export const FastBundleWelcomeScreen = ({ onCreateBundleClick }) => {
  const [email, setEmail] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { fetchRealStoreProducts } = useBundle();

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    if (email) {
      await fetchRealStoreProducts(email);
      setIsConfirmed(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto py-6">
      
      {/* Welcome Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to EmBundle PRO</h1>
        <p className="text-sm text-slate-500">Boost your store average order value (AOV) with powerful bundles in just two steps.</p>
      </div>

      {/* Main 2-Step Onboarding Grid Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Step 1: Connect Store */}
        <div className="p-8 flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-4 flex flex-col items-center">
            {/* Step Icon Graphic */}
            <div className="h-28 w-28 rounded-full bg-purple-100 flex items-center justify-center relative shadow-inner">
              <div className="h-20 w-20 rounded-full bg-purple-200/60 flex items-center justify-center">
                <Mail className="h-10 w-10 text-purple-600" />
              </div>
              <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border-2 border-white">
                ✓
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Step 1: Connect Shopify Store</h3>
              <p className="text-xs text-slate-500 mt-1">Enter your myshopify.com domain to sync your products.</p>
            </div>
          </div>

          <form onSubmit={handleConfirmEmail} className="w-full max-w-sm space-y-3">
            {isConfirmed ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Store Connected Successfully!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. mystore.myshopify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition"
                >
                  Connect
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Step 2: Build your first bundle */}
        <div className="p-8 flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-4 flex flex-col items-center">
            {/* Step 2 Graphic */}
            <div className="h-28 w-28 rounded-full bg-indigo-50 flex items-center justify-center relative shadow-inner">
              <div className="flex items-center space-x-1.5">
                <div className="h-10 w-10 rounded-lg bg-pink-100 border border-pink-200 flex items-center justify-center transform -rotate-6">
                  <span className="text-lg">📦</span>
                </div>
                <span className="text-slate-400 font-bold text-sm">+</span>
                <div className="h-10 w-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center transform rotate-6">
                  <span className="text-lg">🎁</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Step 2: Build your first bundle</h3>
              <p className="text-xs text-slate-500 mt-1">Create bundles with your products in just a few clicks!</p>
            </div>
          </div>

          <button
            onClick={onCreateBundleClick}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition transform hover:-translate-y-0.5"
          >
            Create bundle
          </button>
        </div>

      </div>
    </div>
  );
};
