import React, { useEffect, useState } from 'react';
import { BundleProvider, useBundle } from './context/BundleContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { CampaignsManager } from './components/admin/CampaignsManager';
import { WidgetCustomizer } from './components/admin/WidgetCustomizer';
import { CodeExporter } from './components/admin/CodeExporter';
import { StorefrontLayout } from './components/storefront/StorefrontLayout';
import { CheckCircle2, Sparkles, ArrowRight, Store } from 'lucide-react';

const AppContent = () => {
  const { activeTab } = useBundle();
  const [installedShop, setInstalledShop] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    if (shop) {
      setInstalledShop(shop);
    }
  }, []);

  if (activeTab === 'simulator') {
    return <StorefrontLayout />;
  }

  return (
    <AdminLayout>
      {installedShop && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">App Successfully Connected!</h4>
              <p className="text-xs text-slate-300">
                EmBundle PRO is now active & syncing with <span className="font-mono text-emerald-400 font-bold">{installedShop}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setInstalledShop(null)}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'campaigns' && <CampaignsManager />}
      {activeTab === 'analytics' && <DashboardOverview />}
      {activeTab === 'customizer' && <WidgetCustomizer />}
      {activeTab === 'exporter' && <CodeExporter />}
    </AdminLayout>
  );
};

export function App() {
  return (
    <BundleProvider>
      <AppContent />
    </BundleProvider>
  );
}

export default App;
