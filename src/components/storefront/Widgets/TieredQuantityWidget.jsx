import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Percent, Check, ShoppingBag, Zap } from 'lucide-react';

export const TieredQuantityWidget = () => {
  const { selectedProduct, addToCart, widgetStyle } = useBundle();
  const [selectedQuantity, setSelectedQuantity] = useState(2);
  const [added, setAdded] = useState(false);

  const tiers = [
    { qty: 1, discount: 0, label: 'Single Unit', badge: '' },
    { qty: 2, discount: 10, label: 'Buy 2 Get 10% OFF', badge: 'Popular' },
    { qty: 3, discount: 20, label: 'Buy 3 Get 20% OFF', badge: 'Best Value' },
    { qty: 5, discount: 30, label: 'Buy 5 Get 30% OFF', badge: 'Super Saver' }
  ];

  const currentTier = tiers.find(t => t.qty === selectedQuantity) || tiers[0];
  const unitPrice = selectedProduct.price;
  const rawSubtotal = unitPrice * selectedQuantity;
  const discountAmount = rawSubtotal * (currentTier.discount / 100);
  const finalPrice = rawSubtotal - discountAmount;

  const handleAddBundle = () => {
    addToCart(selectedProduct, selectedQuantity, currentTier.discount, {
      label: `Buy ${selectedQuantity} Get ${currentTier.discount}% OFF`,
      id: `tiered_${selectedQuantity}`
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div 
      className="bg-slate-900 border text-slate-100 p-5 shadow-xl transition-all space-y-4"
      style={{ 
        borderRadius: widgetStyle.borderRadius,
        borderColor: widgetStyle.primaryColor + '50'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Buy More, Save More Deals</h3>
            <p className="text-xs text-slate-400">Unlock up to 30% instant discount</p>
          </div>
        </div>

        {currentTier.discount > 0 && (
          <span className="animate-pulse px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
            Save {currentTier.discount}% OFF
          </span>
        )}
      </div>

      {/* Tiers Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tiers.map((t) => {
          const isSelected = selectedQuantity === t.qty;
          return (
            <button
              key={t.qty}
              onClick={() => setSelectedQuantity(t.qty)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected 
                  ? 'bg-slate-800 border-2 text-white ring-2 ring-emerald-500/30' 
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              style={{ borderColor: isSelected ? widgetStyle.primaryColor : undefined }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">{t.qty} Qty</span>
                  {t.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {t.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] block mt-1 font-semibold text-slate-300">
                  {t.discount > 0 ? `${t.discount}% OFF` : 'Standard'}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold text-emerald-400">
                ${((unitPrice * t.qty * (1 - t.discount/100)) / t.qty).toFixed(2)}/ea
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Savings Summary */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Subtotal ({selectedQuantity} items):</span>
        <div className="flex items-center space-x-2">
          {discountAmount > 0 && (
            <span className="text-slate-500 line-through font-mono">${rawSubtotal.toFixed(2)}</span>
          )}
          <span className="text-base font-black text-emerald-400 font-mono">${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddBundle}
        disabled={added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        <span>{added ? 'Added to Cart!' : `Add ${selectedQuantity} Items to Cart (Save $${discountAmount.toFixed(2)})`}</span>
      </button>

    </div>
  );
};
