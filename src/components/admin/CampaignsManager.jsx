import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { BUNDLE_TYPES } from '../../types/bundleTypes';
import { 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Trash2, 
  Eye, 
  Sparkles, 
  X,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Campaign Form State
  const [newCampaignType, setNewCampaignType] = useState('BUY_2_GET_10_BUY_3_GET_20');
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [spendThreshold, setSpendThreshold] = useState(100);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    const bt = BUNDLE_TYPES[newCampaignType];
    
    let campaignData = {
      type: newCampaignType,
      title: newCampaignTitle || `${bt.name} Offer`,
      status: 'ACTIVE'
    };

    if (newCampaignType === 'BUY_2_GET_10_BUY_3_GET_20') {
      campaignData.tiers = [
        { quantity: 2, discountPercent: 10, label: 'Buy 2 Get 10% OFF' },
        { quantity: 3, discountPercent: 20, label: 'Buy 3 Get 20% OFF' }
      ];
      campaignData.targetProductIds = [products[0]?.id || 'prod_1'];
    } else if (newCampaignType === 'FREQUENTLY_BOUGHT_TOGETHER') {
      campaignData.mainProductId = products[0]?.id || 'prod_1';
      campaignData.bundleItemIds = [products[0]?.id || 'prod_1', products[1]?.id || 'prod_2', products[2]?.id || 'prod_3'];
      campaignData.discountPercent = Number(discountPercent);
    } else if (newCampaignType === 'BUY_MORE_SAVE_MORE') {
      campaignData.tiers = [
        { spendAmount: 50, discountPercent: 10, reward: '10% OFF Order' },
        { spendAmount: Number(spendThreshold), discountPercent: Number(discountPercent), reward: `${discountPercent}% OFF Order` }
      ];
    } else {
      campaignData.discountPercent = Number(discountPercent);
    }

    addCampaign(campaignData);
    setIsModalOpen(false);
    setNewCampaignTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>Bundle Campaign Manager</span>
          </h2>
          <p className="text-xs text-slate-400">Configure, activate, and manage your 10 bundle campaign rules</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All 10 Bundle Types</option>
            {Object.values(BUNDLE_TYPES).map(bt => (
              <option key={bt.id} value={bt.id}>{bt.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Campaign Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No campaigns found matching your filter</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or create a new bundle campaign.</p>
          </div>
        ) : (
          filteredCampaigns.map((c) => {
            const bt = BUNDLE_TYPES[c.type] || { name: c.type, badge: 'Bundle', color: 'from-emerald-500 to-teal-600' };
            const isActive = c.status === 'ACTIVE';

            return (
              <div 
                key={c.id} 
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-gradient-to-r ${bt.color} text-white`}>
                        {bt.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{bt.badge}</span>
                    </div>

                    <button
                      onClick={() => toggleCampaignStatus(c.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isActive ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-slate-500" />}
                      <span>{isActive ? 'ACTIVE' : 'DISABLED'}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-white">{c.title}</h3>

                  <div className="mt-3 text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {c.tiers && (
                      <div className="flex flex-wrap gap-1">
                        {c.tiers.map((t, idx) => (
                          <span key={idx} className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono">
                            {t.label || `${t.quantity || t.minUnits || `$${t.spendAmount}`} ➔ ${t.discountPercent}% OFF`}
                          </span>
                        ))}
                      </div>
                    )}
                    {c.discountPercent && (
                      <div className="font-medium text-emerald-400">
                        Bundle Discount: {c.discountPercent}% OFF
                      </div>
                    )}
                    {c.fixedBundlePrice && (
                      <div className="font-medium text-emerald-400">
                        Special Fixed Price: ${c.fixedBundlePrice.toFixed(2)} (Valued at ${c.originalValue.toFixed(2)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveWidgetType(c.type);
                      setActiveTab('simulator');
                    }}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Test on Storefront</span>
                  </button>

                  <button
                    onClick={() => deleteCampaign(c.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Campaign Wizard */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>Create New Bundle Campaign</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Bundle Type (All 10 Supported)</label>
                <select
                  value={newCampaignType}
                  onChange={(e) => setNewCampaignType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.values(BUNDLE_TYPES).map(bt => (
                    <option key={bt.id} value={bt.id}>{bt.name} — {bt.category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campaign Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Special Buy 2 Get 10% Off"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Spend Threshold ($)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={spendThreshold}
                    onChange={(e) => setSpendThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Publish Campaign
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
