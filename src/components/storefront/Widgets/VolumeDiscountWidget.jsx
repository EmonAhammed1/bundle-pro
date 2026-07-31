import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Layers, Check, ShoppingBag } from 'lucide-react';

export const VolumeDiscountWidget = () => {
  const { products, addToCart, widgetStyle } = useBundle();
  const targetProduct = products[5]; // Hydra Glow Face Serum
  const [selectedTierIndex, setSelectedTierIndex] = useState(1);
  const [added, setAdded] = useState(false);

  const tiers = [
    { qty: 1, discount: 0, label: 'Standard Bottle', badge: '' },
    { qty: 2, discount: 15, label: 'Duo Pack (15% OFF)', badge: 'Most Popular' },
    { qty: 4, discount: 25, label: 'Family Pack (25% OFF)', badge: 'Best Value' }
  ];

  const currentTier = tiers[selectedTierIndex];
  const unitPrice = targetProduct.price;
  const rawTotal = unitPrice * currentTier.qty;
  const discountedTotal = rawTotal * (1 - currentTier.discount / 100);

  const handleAddToCart = () => {
    addToCart(targetProduct, currentTier.qty, currentTier.discount, {
      label: `Volume ${currentTier.label}`
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
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-white">Bulk Volume Discount Matrix</h3>
          <p className="text-xs text-slate-400">Select bulk quantity to lock in lowest price per unit</p>
        </div>
      </div>

      {/* Pricing Matrix Rows */}
      <div className="space-y-2">
        {tiers.map((t, idx) => {
          const isSelected = selectedTierIndex === idx;
          const pricePerUnit = (unitPrice * (1 - t.discount / 100)).toFixed(2);
          const itemTotal = (unitPrice * t.qty * (1 - t.discount / 100)).toFixed(2);

          return (
            <div
              key={idx}
              onClick={() => setSelectedTierIndex(idx)}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                isSelected 
                  ? 'bg-slate-800 border-2 text-white shadow-md' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              style={{ borderColor: isSelected ? widgetStyle.primaryColor : undefined }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{t.qty}x {targetProduct.title}</span>
                    {t.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ${pricePerUnit} each {t.discount > 0 && `(Save ${t.discount}%)`}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-sm text-emerald-400 font-mono">${itemTotal}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        <span>{added ? 'Volume Bundle Added!' : `Buy ${currentTier.qty} Bottles for $${discountedTotal.toFixed(2)}`}</span>
      </button>

    </div>
  );
};
