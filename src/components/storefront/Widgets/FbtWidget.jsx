import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { ShoppingBag, Plus, Check, CheckSquare, Square } from 'lucide-react';

export const FbtWidget = () => {
  const { products, addBundleToCart, widgetStyle } = useBundle();
  const fbtProducts = [products[0], products[1], products[2]]; // Hoodie, Joggers, Sneakers
  const [selectedIds, setSelectedIds] = useState(fbtProducts.map(p => p.id));
  const [added, setAdded] = useState(false);

  const discountPercent = 15;

  const toggleCheck = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const activeItems = fbtProducts.filter(p => selectedIds.includes(p.id));
  const rawTotal = activeItems.reduce((acc, p) => acc + p.price, 0);
  const discountTotal = selectedIds.length === fbtProducts.length ? rawTotal * (discountPercent / 100) : 0;
  const finalPrice = rawTotal - discountTotal;

  const handleAddAll = () => {
    addBundleToCart(
      activeItems.map(p => ({ product: p, quantity: 1 })),
      selectedIds.length === fbtProducts.length ? discountPercent : 0,
      'Frequently Bought Together Bundle'
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
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Frequently Bought Together</h3>
            <p className="text-xs text-slate-400">Buy these 3 items together & save {discountPercent}%</p>
          </div>
        </div>
      </div>

      {/* Horizontal Image Thumbnails with Plus Sign */}
      <div className="flex items-center space-x-3 overflow-x-auto py-2">
        {fbtProducts.map((p, idx) => {
          const isSelected = selectedIds.includes(p.id);

          return (
            <React.Fragment key={p.id}>
              <div className="relative flex-shrink-0">
                <img 
                  src={p.image} 
                  alt={p.title} 
                  className={`h-20 w-20 object-cover rounded-xl border transition ${
                    isSelected ? 'border-emerald-400 opacity-100' : 'border-slate-800 opacity-40 grayscale'
                  }`} 
                />
              </div>
              {idx < fbtProducts.length - 1 && (
                <Plus className="h-4 w-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Checkbox List */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        {fbtProducts.map((p) => {
          const isSelected = selectedIds.includes(p.id);

          return (
            <div 
              key={p.id}
              onClick={() => toggleCheck(p.id)}
              className="flex items-center justify-between text-xs cursor-pointer select-none py-1 hover:text-white"
            >
              <div className="flex items-center space-x-2">
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-600" />
                )}
                <span className={isSelected ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  {p.title}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-300">${p.price.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Subtotal & Add Button */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Total Price ({activeItems.length} items):</span>
        <div className="flex items-center space-x-2 font-mono">
          {discountTotal > 0 && <span className="text-slate-500 line-through">${rawTotal.toFixed(2)}</span>}
          <span className="text-base font-black text-emerald-400">${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleAddAll}
        disabled={added || activeItems.length === 0}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        <span>{added ? 'Bundle Added to Cart!' : `Add All ${activeItems.length} Selected Items to Cart`}</span>
      </button>

    </div>
  );
};
