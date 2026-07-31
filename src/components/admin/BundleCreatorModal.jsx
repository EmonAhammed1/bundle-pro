import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { BUNDLE_TYPES } from '../../types/bundleTypes';
import { 
  X, 
  Check, 
  Package, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Tag,
  DollarSign,
  Percent,
  Search,
  ShoppingCart
} from 'lucide-react';

export const BundleCreatorModal = ({ isOpen, onClose }) => {
  const { addCampaign, products } = useBundle();

  const [step, setStep] = useState(1); // 1: Choose Type, 2: Select Products, 3: Configure Discounts, 4: Summary
  const [selectedType, setSelectedType] = useState('BUY_2_GET_10_BUY_3_GET_20');
  const [title, setTitle] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([products[0]?.id || 'prod_1']);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [tier2Discount, setTier2Discount] = useState(20);
  const [spendThreshold, setSpendThreshold] = useState(100);
  const [searchProduct, setSearchProduct] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const toggleProductSelection = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSaveBundle = () => {
    const bundleDef = BUNDLE_TYPES[selectedType];
    
    let newCampaign = {
      type: selectedType,
      title: title.trim() || `${bundleDef.name} Campaign`,
      status: 'ACTIVE',
      targetProductIds: selectedProductIds,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (selectedType === 'BUY_2_GET_10_BUY_3_GET_20') {
      newCampaign.tiers = [
        { quantity: 2, discountPercent: Number(discountPercent), label: `Buy 2 Get ${discountPercent}% OFF` },
        { quantity: 3, discountPercent: Number(tier2Discount), label: `Buy 3 Get ${tier2Discount}% OFF` }
      ];
    } else if (selectedType === 'FREQUENTLY_BOUGHT_TOGETHER') {
      newCampaign.mainProductId = selectedProductIds[0] || products[0]?.id;
      newCampaign.bundleItemIds = selectedProductIds.slice(0, 3);
      newCampaign.discountPercent = Number(discountPercent);
    } else if (selectedType === 'BUY_MORE_SAVE_MORE') {
      newCampaign.tiers = [
        { spendAmount: 50, discountPercent: 10, reward: '10% OFF Order' },
        { spendAmount: Number(spendThreshold), discountPercent: Number(discountPercent), reward: `${discountPercent}% OFF Order` }
      ];
    } else {
      newCampaign.discountPercent = Number(discountPercent);
    }

    addCampaign(newCampaign);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setSelectedProductIds([products[0]?.id || 'prod_1']);
    setDiscountPercent(15);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              {step}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Create New Shopify Bundle</h3>
              <p className="text-xs text-slate-400">Step {step} of 4: {
                step === 1 ? 'Select Bundle Type' :
                step === 2 ? 'Choose Target Products' :
                step === 3 ? 'Set Discounts & Rules' : 'Review & Publish'
              }</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="grid grid-cols-4 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-center">
          {[
            { num: 1, label: '1. Bundle Type' },
            { num: 2, label: '2. Select Products' },
            { num: 3, label: '3. Discounts' },
            { num: 4, label: '4. Publish' }
          ].map(s => (
            <div 
              key={s.num} 
              className={`py-3 border-b-2 transition-all ${
                step === s.num 
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 font-bold' 
                  : step > s.num ? 'border-emerald-500/50 text-slate-300' : 'border-transparent text-slate-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Choose Bundle Type */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Choose Bundle Feature</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(BUNDLE_TYPES).map(([typeKey, bundle]) => {
                  const isSelected = selectedType === typeKey;
                  return (
                    <div
                      key={typeKey}
                      onClick={() => setSelectedType(typeKey)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-950' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl mb-2">{bundle.icon}</span>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                      </div>
                      <h4 className="font-bold text-sm text-white">{bundle.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{bundle.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Product Selector */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Products for Bundle</label>
                  <p className="text-xs text-slate-400">Choose which products this bundle will display on</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {selectedProductIds.length} Selected
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProductSelection(prod.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        isChecked 
                          ? 'border-emerald-500/60 bg-emerald-500/10' 
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={prod.image} alt={prod.title} className="h-10 w-10 object-cover rounded-lg border border-slate-800" />
                        <div>
                          <h5 className="font-bold text-xs text-white">{prod.title}</h5>
                          <span className="text-[11px] text-slate-400">${prod.price.toFixed(2)} • {prod.category}</span>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Configure Discounts & Rules */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Bundle Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Special Volume Discount"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {selectedType === 'BUY_2_GET_10_BUY_3_GET_20' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tier 1 Discount (Buy 2)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-8 py-2 text-xs text-white"
                      />
                      <Percent className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tier 2 Discount (Buy 3+)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tier2Discount}
                        onChange={(e) => setTier2Discount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-8 py-2 text-xs text-white"
                      />
                      <Percent className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'BUY_MORE_SAVE_MORE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Min Spend Threshold ($)</label>
                    <input
                      type="number"
                      value={spendThreshold}
                      onChange={(e) => setSpendThreshold(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Reward Discount (%)</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {selectedType !== 'BUY_2_GET_10_BUY_3_GET_20' && selectedType !== 'BUY_MORE_SAVE_MORE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Bundle Discount Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Publish */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <Sparkles className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-base text-white">Ready to Publish Bundle!</h4>
                <p className="text-xs text-slate-300">
                  Your bundle rule will be active immediately on chosen products.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bundle Type:</span>
                  <span className="font-bold text-white">{BUNDLE_TYPES[selectedType].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaign Title:</span>
                  <span className="font-bold text-white">{title || BUNDLE_TYPES[selectedType].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Products:</span>
                  <span className="font-bold text-emerald-400">{selectedProductIds.length} Products</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount Rule:</span>
                  <span className="font-bold text-white">{discountPercent}% OFF</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveBundle}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              <span>Publish Bundle Now</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
