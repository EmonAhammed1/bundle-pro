import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { BUNDLE_TYPES } from '../../types/bundleTypes';

// Import All 10 Widgets
import { BuyXGetYWidget } from './Widgets/BuyXGetYWidget';
import { TieredQuantityWidget } from './Widgets/TieredQuantityWidget';
import { VolumeDiscountWidget } from './Widgets/VolumeDiscountWidget';
import { MixMatchWidget } from './Widgets/MixMatchWidget';
import { FixedBundleWidget } from './Widgets/FixedBundleWidget';
import { BuildYourOwnBundleWidget } from './Widgets/BuildYourOwnBundleWidget';
import { FbtWidget } from './Widgets/FbtWidget';
import { CompleteTheLookWidget } from './Widgets/CompleteTheLookWidget';
import { BuyMoreSaveMoreWidget } from './Widgets/BuyMoreSaveMoreWidget';

import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Lock,
  Tag
} from 'lucide-react';

export const StorefrontLayout = () => {
  const { 
    products, 
    selectedProduct, 
    setSelectedProduct, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    rawSubtotal,
    totalSavings,
    finalTotal,
    activeWidgetType, 
    setActiveWidgetType,
    setActiveTab,
    widgetStyle
  } = useBundle();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const cartItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleCheckout = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    setCheckedOut(true);
    setTimeout(() => {
      clearCart();
      setCheckedOut(false);
      setIsCartOpen(false);
    }, 2500);
  };

  const renderActiveWidget = () => {
    switch (activeWidgetType) {
      case 'BUY_X_GET_Y':
        return <BuyXGetYWidget />;
      case 'BUY_2_GET_10_BUY_3_GET_20':
      case 'TIERED_PRICING':
        return <TieredQuantityWidget />;
      case 'VOLUME_DISCOUNT':
        return <VolumeDiscountWidget />;
      case 'MIX_AND_MATCH':
        return <MixMatchWidget />;
      case 'FIXED_BUNDLE':
        return <FixedBundleWidget />;
      case 'BUILD_YOUR_OWN':
        return <BuildYourOwnBundleWidget />;
      case 'FREQUENTLY_BOUGHT_TOGETHER':
        return <FbtWidget />;
      case 'COMPLETE_THE_LOOK':
        return <CompleteTheLookWidget />;
      case 'BUY_MORE_SAVE_MORE':
        return <BuyMoreSaveMoreWidget />;
      default:
        return <TieredQuantityWidget />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Top Banner Simulator Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>STOREFRONT LIVE SIMULATOR • Testing Active Shopify Widgets</span>
        </div>
        <button
          onClick={() => setActiveTab('campaigns')}
          className="bg-slate-950 text-white hover:bg-slate-900 px-3 py-1 rounded-lg font-bold flex items-center space-x-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Admin Panel</span>
        </button>
      </div>

      {/* Widget Selector Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-2">Select Widget Preview:</span>
          {Object.values(BUNDLE_TYPES).map((bt) => {
            const isSelected = activeWidgetType === bt.id;
            return (
              <button
                key={bt.id}
                onClick={() => setActiveWidgetType(bt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {bt.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mock Shopify Store Front */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Mock Store Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between mb-8 shadow-xl">
          <div className="font-extrabold text-xl tracking-tight text-white flex items-center space-x-2">
            <span className="text-emerald-400">URBAN</span>STORE.
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center space-x-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-white transition"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Product Detail & Bundle Widget Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-xl">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title} 
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            
            {/* Product Thumbnails Switcher */}
            <div className="grid grid-cols-4 gap-2">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-1 rounded-xl border transition overflow-hidden ${
                    selectedProduct.id === p.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.image} alt={p.title} className="h-16 w-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info & Bundle Widget */}
          <div className="lg:col-span-7 space-y-6">
            
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{selectedProduct.category}</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{selectedProduct.title}</h1>
              
              <div className="flex items-center space-x-3 mt-2 font-mono">
                <span className="text-2xl font-black text-white">${selectedProduct.price.toFixed(2)}</span>
                {selectedProduct.compareAtPrice && (
                  <span className="text-sm text-slate-500 line-through">${selectedProduct.compareAtPrice.toFixed(2)}</span>
                )}
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  In Stock ({selectedProduct.variants[0]?.inventory} units)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{selectedProduct.description}</p>
            </div>

            {/* DYNAMIC BUNDLE WIDGET MOUNT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Active Bundle Offer ({BUNDLE_TYPES[activeWidgetType]?.name})</span>
                <span className="text-emerald-400 font-mono">Real-time Discount Applied</span>
              </div>
              {renderActiveWidget()}
            </div>

          </div>

        </div>

      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-slideLeft">
            
            {/* Cart Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-extrabold text-base text-white">Your Shopping Cart ({cartItemCount})</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Buy More Save More Meter in Cart */}
              <div className="mt-4">
                <BuyMoreSaveMoreWidget />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <ShoppingBag className="h-12 w-12 mx-auto text-slate-700" />
                  <p className="text-xs font-semibold">Your cart is empty.</p>
                  <p className="text-[11px] text-slate-600">Select any bundle offer on the storefront to add items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between space-x-3">
                    <img src={item.product.image} alt={item.product.title} className="h-14 w-14 object-cover rounded-lg border border-slate-800" />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{item.product.title}</h4>
                      {item.bundleInfo && (
                        <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 mt-0.5">
                          {item.bundleInfo.label} ({item.discountPercent}% OFF)
                        </span>
                      )}
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        ${(item.product.price * (1 - item.discountPercent/100)).toFixed(2)} x {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1 font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">${rawSubtotal.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center space-x-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Bundle Savings</span>
                      </span>
                      <span className="font-mono">-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>Total Due</span>
                    <span className="font-mono text-emerald-400">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkedOut}
                  className="w-full py-3.5 rounded-xl font-black text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  {checkedOut ? <CheckCircle2 className="h-4 w-4 text-slate-950" /> : <Lock className="h-4 w-4 text-slate-950" />}
                  <span>{checkedOut ? 'Simulated Order Success!' : 'Proceed to Shopify Checkout'}</span>
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
