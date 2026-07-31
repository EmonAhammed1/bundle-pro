import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { BUNDLE_TYPES } from '../../types/bundleTypes';
import { BundleCreatorModal } from './BundleCreatorModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Copy,
  ExternalLink,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

export const CampaignsManager = () => {
  const { 
    campaigns, 
    toggleCampaignStatus, 
    addCampaign, 
    deleteCampaign, 
    setActiveTab, 
    setActiveWidgetType,
    products
  } = useBundle();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || c.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDuplicate = (camp) => {
    const duplicateData = {
      ...camp,
      id: `camp_${Date.now()}`,
      title: `${camp.title} (Copy)`,
      status: 'INACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    addCampaign(duplicateData);
  };

  const handleTestOnStorefront = (typeKey) => {
    setActiveWidgetType(typeKey);
    setActiveTab('simulator');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <BundleCreatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Top Header Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Shopify Bundle Engine</h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {campaigns.filter(c => c.status === 'ACTIVE').length} Active Bundles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, manage, and toggle active/inactive bundle rules on specific products.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Create New Bundle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search bundles by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">🟢 Active Only</option>
            <option value="INACTIVE">⚪ Inactive Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="ALL">All Bundle Types (10)</option>
            {Object.entries(BUNDLE_TYPES).map(([typeKey, bundle]) => (
              <option key={typeKey} value={typeKey}>{bundle.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Polaris Native Bundles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            {/* Table Header */}
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Bundle Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Discount Rule</th>
                <th className="px-6 py-4">Target Products</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Layers className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm text-slate-400">No Bundles Found</p>
                    <p className="text-xs mt-1">Click "Create New Bundle" to start adding custom product bundle rules.</p>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => {
                  const bundleDef = BUNDLE_TYPES[camp.type] || BUNDLE_TYPES.BUY_2_GET_10_BUY_3_GET_20;
                  const isActive = camp.status === 'ACTIVE';

                  return (
                    <tr key={camp.id} className="hover:bg-slate-800/40 transition group">
                      
                      {/* Active / Inactive Toggle Switch */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleCampaignStatus(camp.id)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full font-extrabold text-[11px] transition ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <ToggleRight className="h-4 w-4 text-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 text-slate-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Title & Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                            {bundleDef.icon}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition">
                              {camp.title}
                            </span>
                            <div className="text-[11px] text-slate-400">Created: {camp.createdAt || 'Today'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                          {bundleDef.name}
                        </span>
                      </td>

                      {/* Discount Rule */}
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        {camp.discountPercent ? `${camp.discountPercent}% OFF` : 
                         camp.tiers ? `${camp.tiers.length} Tier Rules` : 'Dynamic Discount'}
                      </td>

                      {/* Target Products */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Tag className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{camp.targetProductIds ? `${camp.targetProductIds.length} Products` : 'All Products'}</span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTestOnStorefront(camp.type)}
                            title="Preview on Storefront"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 transition"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(camp)}
                            title="Duplicate Bundle"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteCampaign(camp.id)}
                            title="Delete Bundle"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
