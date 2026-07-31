import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Grid, CheckCircle2, ShoppingBag } from 'lucide-react';

export const MixMatchWidget = () => {
  const { products, addBundleToCart, widgetStyle } = useBundle();
  const fashionProducts = products.filter(p => p.category === 'Fashion'); // Hoodie, Joggers, Sneakers
  const [selectedProductIds, setSelectedProductIds] = useState([fashionProducts[0]?.id, fashionProducts[1]?.id]);
  const [added, setAdded] = useState(false);

  const targetCount = 2;
  const bundleFixedPrice = 95.00;

  const toggleSelect = (id) => {
    if (selectedProductIds.includes(id)) {
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(prev => prev.filter(pId => pId !== id));
      }
    } else {
      if (selectedProductIds.length < targetCount) {
        setSelectedProductIds(prev => [...prev, id]);
      } else {
        // replace last
        setSelectedProductIds([selectedProductIds[0], id]);
      }
    }
  };

  const selectedItems = fashionProducts.filter(p => selectedProductIds.includes(p.id));
  const rawSubtotal = selectedItems.reduce((a, b) => a + b.price, 0);
  const isComplete = selectedProductIds.length === targetCount;

  const handleAddToCart = () => {
    if (!isComplete) return;
    const discountRate = rawSubtotal > 0 ? ((rawSubtotal - bundleFixedPrice) / rawSubtotal) * 100 : 0;
    addBundleToCart(
      selectedItems.map(p => ({ product: p, quantity: 1 })),
      Math.max(0, discountRate),
      'Mix & Match 2-Pack Deal'
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
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Grid className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Mix & Match Any 2 Fashion Items</h3>
            <p className="text-xs text-slate-400">Pick any 2 apparel items for only <span className="text-emerald-400 font-bold">$95.00</span></p>
          </div>
        </div>

        <span className="text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2.5 py-1 rounded-full">
          {selectedProductIds.length}/{targetCount} Picked
        </span>
      </div>

      {/* Grid of Selectable Items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fashionProducts.map((p) => {
          const isSelected = selectedProductIds.includes(p.id);

          return (
            <div
              key={p.id}
              onClick={() => toggleSelect(p.id)}
              className={`p-3 rounded-xl border cursor-pointer relative transition flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-800 border-2 border-emerald-400 text-white shadow-lg' 
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full text-slate-950">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}

              <img src={p.image} alt={p.title} className="h-24 w-full object-cover rounded-lg mb-2" />
              <div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{p.title}</h4>
                <span className="text-xs text-slate-400 font-mono">${p.price.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Selected Bundle Price:</span>
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-slate-500 line-through">${rawSubtotal.toFixed(2)}</span>
          <span className="text-base font-black text-emerald-400">${bundleFixedPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!isComplete || added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110 disabled:opacity-50"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        <ShoppingBag className="h-4 w-4" />
        <span>{added ? 'Bundle Added!' : isComplete ? 'Add Mix & Match Bundle to Cart' : `Select ${targetCount - selectedProductIds.length} More Item`}</span>
      </button>

    </div>
  );
};
