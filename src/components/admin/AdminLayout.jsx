import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { MerchantInstallerModal } from './MerchantInstallerModal';
import { 
  Package, 
  BarChart3, 
  Palette, 
  Code2, 
  Eye, 
  Plus, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShoppingBag,
  Store,
  Download
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { activeTab, setActiveTab, campaigns, cart } = useBundle();
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;

  const navItems = [
    { id: 'campaigns', label: 'Bundle Campaigns', icon: Layers, badge: activeCount },
    { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
    { id: 'customizer', label: 'Widget Theme & Styling', icon: Palette },
    { id: 'exporter', label: 'Shopify Code Export', icon: Code2 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MerchantInstallerModal isOpen={isInstallerOpen} onClose={() => setIsInstallerOpen(false)} />

      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-lg tracking-tight text-white">EmBundle <span className="text-emerald-400 font-extrabold">PRO</span></h1>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    10-in-1 Suite
                  </span>
                </div>
                <p className="text-xs text-slate-400">Shopify Bundle & Discount Engine</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header Action CTAs */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsInstallerOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition shadow-md"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install on Store</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  activeTab === 'simulator'
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02]'
                }`}
              >
                <Store className="h-4 w-4" />
                <span>Storefront Simulator</span>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-800 px-2 py-2 flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950/60 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Shopify Store Connected & Integrated</span>
          </div>
          <div>EmBundle Pro v1.0 • Built with High-Performance React Engine</div>
        </div>
      </footer>
    </div>
  );
};
