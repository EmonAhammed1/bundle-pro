import React, { useState } from 'react';
import { Store, ArrowRight, ShieldCheck, ExternalLink, X } from 'lucide-react';

export const MerchantInstallerModal = ({ isOpen, onClose }) => {
  const [storeDomain, setStoreDomain] = useState('');
  const clientId = 'd05f746d959269be8308b07258f782be';

  const handleInstall = (e) => {
    e.preventDefault();
    if (!storeDomain) return;

    let cleanDomain = storeDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');

    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }

    const redirectUri = 'https://bundle.emonahammed.shop/auth/callback';
    const scopes = 'write_products,read_products,write_discounts,read_discounts,write_orders,read_orders,write_themes,read_themes';

    // Official Standard Shopify OAuth Authorization Install URL
    const installUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.open(installUrl, '_blank');
  };

  const handleDirectPartnerInstall = () => {
    // Official Shopify Partner Direct Install URL
    const directUrl = `https://admin.shopify.com/oauth/install?client_id=${clientId}`;
    window.open(directUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleUp relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="font-extrabold text-xl text-white">Install EmBundle PRO on Your Store</h3>
          <p className="text-xs text-slate-400">
            Enter your Shopify store domain below to start the instant app installation.
          </p>
        </div>

        <form onSubmit={handleInstall} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Shopify Store Domain</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. liquid-hub.myshopify.com"
                value={storeDomain}
                onChange={(e) => setStoreDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-32 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="absolute right-3 top-3 text-xs font-semibold text-slate-500 pointer-events-none">
                .myshopify.com
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-black text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            <span>Install App on Store</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleDirectPartnerInstall}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline flex items-center justify-center space-x-1 mx-auto"
          >
            <span>Or click here to install via Shopify Partner Link</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Official Shopify OAuth 2.0 Secure Installer</span>
        </div>

      </div>
    </div>
  );
};
