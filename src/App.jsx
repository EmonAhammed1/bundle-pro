import React from 'react';
import { BundleProvider, useBundle } from './context/BundleContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { CampaignsManager } from './components/admin/CampaignsManager';
import { WidgetCustomizer } from './components/admin/WidgetCustomizer';
import { CodeExporter } from './components/admin/CodeExporter';
import { StorefrontLayout } from './components/storefront/StorefrontLayout';

const AppContent = () => {
  const { activeTab } = useBundle();

  if (activeTab === 'simulator') {
    return <StorefrontLayout />;
  }

  return (
    <AdminLayout>
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
