import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { MerchantInstallerModal } from './MerchantInstallerModal';
import { BundleCreatorModal } from './BundleCreatorModal';
import { FastBundleWelcomeScreen } from './FastBundleWelcomeScreen';
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
  Settings,
  HelpCircle,
  Home,
  Rocket
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { activeTab, setActiveTab, campaigns } = useBundle();
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [isCreateBundleOpen, setIsCreateBundleOpen] = useState(false);
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;

  const sidebarNavItems = [
    { id: 'welcome', label: 'Welcome', icon: Home },
    { id: 'campaigns', label: 'Bundles', icon: Layers, badge: activeCount },
    { id: 'boosters', label: 'Boosters', icon: Rocket },
    { id: 'customizer', label: 'Customization', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'exporter', label: 'Settings & Code', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900 flex flex-col font-sans antialiased">
      <MerchantInstallerModal isOpen={isInstallerOpen} onClose={() => setIsInstallerOpen(false)} />
      <BundleCreatorModal isOpen={isCreateBundleOpen} onClose={() => setIsCreateBundleOpen(false)} />

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm text-slate-900">EmBundle <span className="text-pink-600 font-extrabold">PRO</span></h1>
              <span className="text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">Shopify Bundle App</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreateBundleOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create bundle</span>
            </button>

            <button
              onClick={() => setIsInstallerOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Install on Store</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'simulator'
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Test Storefront</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main App Layout: Sidebar + Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Left Shopify Admin Sub-menu Sidebar */}
        <aside className="w-full md:w-56 p-4 border-r border-slate-200 bg-white/60 space-y-4">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Apps &gt; EmBundle PRO
          </div>
          
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === 'welcome' && item.id === 'welcome');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-200/70 text-slate-900 font-bold shadow-inner'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 md:p-8">
          {activeTab === 'welcome' ? (
            <FastBundleWelcomeScreen onCreateBundleClick={() => setIsCreateBundleOpen(true)} />
          ) : (
            children
          )}
        </main>

      </div>

    </div>
  );
};
