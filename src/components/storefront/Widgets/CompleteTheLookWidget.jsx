import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Shirt, Check, Sparkles, ShoppingBag } from 'lucide-react';

export const CompleteTheLookWidget = () => {
  const { products, addBundleToCart, widgetStyle } = useBundle();
  const fashionItems = [products[0], products[1], products[2]]; // Hoodie + Joggers + Sneakers
  const [added, setAdded] = useState(false);

  const rawSubtotal = fashionItems.reduce((a, b) => a + b.price, 0); // 65 + 45 + 110 = 220
  const discountPercent = 20;
  const finalPrice = rawSubtotal * (1 - discountPercent / 100); // 176

  const handleShopLook = () => {
    addBundleToCart(
      fashionItems.map(p => ({ product: p, quantity: 1 })),
      discountPercent,
      'Complete The Look Outfit'
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
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Shirt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Complete the Look (Fashion Outfit)</h3>
            <p className="text-xs text-slate-400">Head-to-Toe Urban Outfit • Save 20%</p>
          </div>
        </div>

        <span className="bg-rose-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
          Lookbook
        </span>
      </div>

      {/* Lookbook Outfit Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fashionItems.map((item) => (
          <div key={item.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <img src={item.image} alt={item.title} className="h-28 w-full object-cover rounded-lg mb-2" />
            <div>
              <span className="text-[9px] font-extrabold text-rose-400 uppercase tracking-widest block">{item.category}</span>
              <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
              <span className="text-xs text-slate-400 font-mono">${item.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Summary */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Entire Outfit Bundle (3 Items):</span>
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-slate-500 line-through">${rawSubtotal.toFixed(2)}</span>
          <span className="text-base font-black text-emerald-400">${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleShopLook}
        disabled={added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        <span>{added ? 'Outfit Added to Cart!' : 'Shop The Entire Outfit (Save $44.00)'}</span>
      </button>

    </div>
  );
};
