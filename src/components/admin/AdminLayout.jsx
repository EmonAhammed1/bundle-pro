import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { MerchantInstallerModal } from './MerchantInstallerModal';
import { BundleCreatorModal } from './BundleCreatorModal';
import { 
  Package, 
  BarChart3, 
  Palette, 
  Code2, 
  Plus, 
  Sparkles, 
  Layers, 
  ShoppingBag,
  Download,
  ExternalLink,
  Store,
  CheckCircle2
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { activeTab, setActiveTab, campaigns } = useBundle();
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [isCreateBundleOpen, setIsCreateBundleOpen] = useState(false);

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;

  const navItems = [
    { id: 'campaigns', label: 'All Bundles', icon: Layers, badge: activeCount },
    { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
    { id: 'customizer', label: 'Theme & Customizer', icon: Palette },
    { id: 'exporter', label: 'Code Snippet Export', icon: Code2 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <MerchantInstallerModal isOpen={isInstallerOpen} onClose={() => setIsInstallerOpen(false)} />
      <BundleCreatorModal isOpen={isCreateBundleOpen} onClose={() => setIsCreateBundleOpen(false)} />

      {/* Top Shopify Polaris Native Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* App Brand */}
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
                    Polaris Suite
                  </span>
                </div>
                <p className="text-xs text-slate-400">Shopify Native Bundle Engine</p>
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

            {/* Header Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateBundleOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                <span>Create Bundle</span>
              </button>

              <button
                onClick={() => setIsInstallerOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition shadow-md"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install on Store</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  activeTab === 'simulator'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <ShoppingBag className="h-4 w-4 text-amber-400" />
                <span className="hidden lg:inline">Storefront Test</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EmBundle PRO • Official Shopify App</span>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Polaris Certified</span>
            </span>
            <span className="text-slate-400">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
