import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { PackageCheck, Check, ShoppingBag, Plus } from 'lucide-react';

export const FixedBundleWidget = () => {
  const { products, addBundleToCart, widgetStyle } = useBundle();
  const bundleItems = [products[3], products[4]]; // Headphones + MagSafe Charger
  const comparePrice = 215.00;
  const bundlePrice = 179.00;
  const savings = comparePrice - bundlePrice;
  const [added, setAdded] = useState(false);

  const handleAddFixedBundle = () => {
    const discountRate = ((savings) / comparePrice) * 100;
    addBundleToCart(
      bundleItems.map(p => ({ product: p, quantity: 1 })),
      discountRate,
      'Fixed Power Combo'
    );
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
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Ultimate Audio & Power Kit</h3>
            <p className="text-xs text-slate-400">Fixed Combo Pack • Save ${savings.toFixed(2)}</p>
          </div>
        </div>

        <span className="bg-cyan-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
          Combo Kit
        </span>
      </div>

      {/* Items Preview List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        {bundleItems.map((item, idx) => (
          <div key={item.id} className="flex items-center space-x-3">
            <img src={item.image} alt={item.title} className="h-14 w-14 object-cover rounded-lg border border-slate-800" />
            <div>
              <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
              <span className="text-xs text-slate-400 font-mono">${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Banner */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Package Value:</span>
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 line-through font-mono">${comparePrice.toFixed(2)}</span>
          <span className="text-base font-black text-emerald-400 font-mono">${bundlePrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleAddFixedBundle}
        disabled={added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        <span>{added ? 'Kit Added to Cart!' : `Buy Kit Now for $${bundlePrice.toFixed(2)}`}</span>
      </button>

    </div>
  );
};
