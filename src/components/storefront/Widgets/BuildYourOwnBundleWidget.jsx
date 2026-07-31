import React, { useState } from 'react';
import { useBundle } from '../../../context/BundleContext';
import confetti from 'canvas-confetti';
import { Box, Plus, CheckCircle2, Sparkles, Trash2, ShoppingBag } from 'lucide-react';

export const BuildYourOwnBundleWidget = () => {
  const { products, addBundleToCart, widgetStyle } = useBundle();
  const allowedProducts = products.filter(p => p.category === 'Cosmetics'); // Serum, Renewal Cream, Hair Pomade
  const [selectedItems, setSelectedItems] = useState([]);
  const [added, setAdded] = useState(false);

  const boxCapacity = 3;
  const bundleFixedPrice = 69.00;
  const originalValue = 90.00;

  const addItemToBox = (product) => {
    if (selectedItems.length >= boxCapacity) return;
    const newItems = [...selectedItems, product];
    setSelectedItems(newItems);

    if (newItems.length === boxCapacity) {
      // Trigger Confetti!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }
    }
  };

  const removeItemFromBox = (index) => {
    setSelectedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const isBoxFull = selectedItems.length === boxCapacity;

  const handleAddToCart = () => {
    if (!isBoxFull) return;
    addBundleToCart(
      selectedItems.map(p => ({ product: p, quantity: 1 })),
      23.3, // ~23% discount
      'Custom Skincare Box'
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div 
      className="bg-slate-900 border text-slate-100 p-5 shadow-xl transition-all space-y-5"
      style={{ 
        borderRadius: widgetStyle.borderRadius,
        borderColor: widgetStyle.primaryColor + '50'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Build Your Own Custom Skincare Box</h3>
            <p className="text-xs text-slate-400">Pick any 3 items for only <span className="text-emerald-400 font-bold">$69.00</span> (Valued at $90)</p>
          </div>
        </div>

        <span className="text-xs font-black bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-3 py-1 rounded-full">
          {selectedItems.length}/{boxCapacity} Slots Filled
        </span>
      </div>

      {/* Visual Box Slots */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Your Box Contents:</span>
        
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: boxCapacity }).map((_, slotIdx) => {
            const item = selectedItems[slotIdx];

            return (
              <div 
                key={slotIdx}
                className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 relative text-center transition ${
                  item 
                    ? 'border-emerald-500 bg-slate-900 text-white border-solid' 
                    : 'border-slate-800 bg-slate-950/40 text-slate-600'
                }`}
              >
                {item ? (
                  <>
                    <button 
                      onClick={() => removeItemFromBox(slotIdx)}
                      className="absolute top-1 right-1 p-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 rounded-md hover:text-white transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <img src={item.image} alt={item.title} className="h-10 w-10 object-cover rounded-md mb-1" />
                    <span className="text-[10px] font-bold truncate w-full">{item.title}</span>
                  </>
                ) : (
                  <>
                    <Box className="h-6 w-6 text-slate-700 mb-1" />
                    <span className="text-[9px] font-semibold text-slate-500">Empty Slot {slotIdx + 1}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selectable Product Cards */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose Items to Fill Box:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allowedProducts.map((p) => (
            <div 
              key={p.id}
              onClick={() => addItemToBox(p)}
              className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 cursor-pointer flex items-center space-x-3 transition group"
            >
              <img src={p.image} alt={p.title} className="h-12 w-12 object-cover rounded-lg border border-slate-800" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-white truncate group-hover:text-emerald-400">{p.title}</h4>
                <span className="text-[11px] text-slate-400 font-mono">${p.price.toFixed(2)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleAddToCart}
        disabled={!isBoxFull || added}
        className="w-full py-3 rounded-xl font-black text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-lg transition hover:brightness-110 disabled:opacity-50"
        style={{ backgroundColor: added ? '#10b981' : widgetStyle.primaryColor, color: '#020617' }}
      >
        <ShoppingBag className="h-4 w-4" />
        <span>{added ? 'Custom Box Added to Cart!' : isBoxFull ? 'Add Complete Box to Cart ($69.00)' : `Fill ${boxCapacity - selectedItems.length} More Slots to Complete Box`}</span>
      </button>

    </div>
  );
};
