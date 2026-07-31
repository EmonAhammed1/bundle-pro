import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Gift, Plus, CheckCircle, ArrowRight } from 'lucide-react';

export const BuyXGetYWidget = () => {
  const { products, addToCart, addBundleToCart, widgetStyle } = useBundle();
  const mainProduct = products[3]; // ANC Headphones
  const freeGiftProduct = products[4]; // MagSafe Charger
  const [added, setAdded] = useState(false);

  const handleAddDeal = () => {
    // Add Main Product + Free Gift Product (100% discount on gift)
    addBundleToCart([
      { product: mainProduct, quantity: 1 },
      { product: freeGiftProduct, quantity: 1 }
    ], 50, 'Buy X Get Y Deal');
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div 
      className="bg-slate-900 border text-slate-100 p-5 shadow-xl transition-all"
      style={{ 
        borderRadius: widgetStyle.borderRadius,
        borderColor: widgetStyle.primaryColor + '50'
      }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <span 
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white uppercase"
            style={{ backgroundColor: widgetStyle.primaryColor }}
          >
            {widgetStyle.badgeText}
          </span>
          <h3 className="font-extrabold text-base text-white mt-0.5">Special Gift Offer: Buy Headphones, Get Wireless Charger FREE</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
        
        {/* Item 1 */}
        <div className="flex items-center space-x-3">
          <img src={mainProduct.image} alt={mainProduct.title} className="h-16 w-16 object-cover rounded-lg border border-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Buy This Item</span>
            <h4 className="font-bold text-xs text-white">{mainProduct.title}</h4>
            <span className="text-xs text-emerald-400 font-bold">${mainProduct.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center space-x-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
          <img src={freeGiftProduct.image} alt={freeGiftProduct.title} className="h-16 w-16 object-cover rounded-lg border border-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Get This FREE ($35 Value)</span>
            <h4 className="font-bold text-xs text-white">{freeGiftProduct.title}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 line-through">${freeGiftProduct.price.toFixed(2)}</span>
              <span className="text-xs text-emerald-400 font-black">FREE</span>
            </div>
          </div>
        </div>

      </div>

      <button
        onClick={handleAddDeal}
        disabled={added}
        className="w-full mt-4 py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <CheckCircle className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
        <span>{added ? 'Bundle Added to Cart!' : 'Claim Free Charger with Headphones'}</span>
      </button>
    </div>
  );
};
