import React from 'react';
import { useBundle } from '../../context/BundleContext';
import { BUNDLE_TYPES } from '../../types/bundleTypes';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  ArrowUpRight, 
  Layers,
  Check,
  Zap
} from 'lucide-react';

export const DashboardOverview = () => {
  const { analytics, campaigns, setActiveTab, setActiveWidgetType } = useBundle();
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Banner / Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Shopify Bundle Engine Live & Active</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">EmBundle PRO</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Supercharge your Shopify store's Average Order Value (AOV) with 10 high-converting bundle campaign types in one powerful suite.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Bundle</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Bundle Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% this month</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bundle Orders Placed</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{analytics.bundleOrders}</span>
            <div className="flex items-center space-x-1 text-blue-400 text-xs font-semibold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+24.2% order conversion</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AOV Boost %</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">+{analytics.aovIncrease}%</span>
            <div className="flex items-center space-x-1 text-purple-400 text-xs font-semibold mt-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>$48.50 extra per cart</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Campaigns</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{activeCampaigns.length} <span className="text-xs text-slate-400 font-normal">/ {campaigns.length} total</span></span>
            <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold mt-1">
              <Check className="h-3.5 w-3.5" />
              <span>10 Bundle Types Ready</span>
            </div>
          </div>
        </div>

      </div>

      {/* 10 Supported Bundle Types Quick Launch Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">All 10 Supported Bundle Types</h3>
            <p className="text-xs text-slate-400">Click on any bundle type to preview live on the Storefront Simulator</p>
          </div>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Manage All Campaigns</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.values(BUNDLE_TYPES).map((bt) => {
            const campaign = campaigns.find(c => c.type === bt.id);
            const isActive = campaign?.status === 'ACTIVE';

            return (
              <div 
                key={bt.id}
                onClick={() => {
                  setActiveWidgetType(bt.id);
                  setActiveTab('simulator');
                }}
                className="group cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isActive ? 'ACTIVE' : 'READY'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{bt.badge}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition">{bt.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{bt.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition">
                  <span>Live Preview</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
