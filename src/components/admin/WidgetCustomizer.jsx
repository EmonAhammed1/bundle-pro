import React from 'react';
import { useBundle } from '../../context/BundleContext';
import { Palette, Sparkles, Check, RefreshCw } from 'lucide-react';

export const WidgetCustomizer = () => {
  const { widgetStyle, setWidgetStyle } = useBundle();

  const colorPresets = [
    { label: 'Shopify Emerald', hex: '#059669' },
    { label: 'Vibrant Violet', hex: '#7c3aed' },
    { label: 'Rose Pink', hex: '#e11d48' },
    { label: 'Amber Gold', hex: '#d97706' },
    { label: 'Cyber Cyan', hex: '#0891b2' },
    { label: 'Midnight Slate', hex: '#334155' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Palette className="h-5 w-5 text-emerald-400" />
          <span>Widget Theme & Styling Customizer</span>
        </h2>
        <p className="text-xs text-slate-400">Match bundle widgets seamlessly with your Shopify theme aesthetic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Form Controls */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-5">
          
          {/* Primary Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Primary Accent Color</label>
            <div className="grid grid-cols-3 gap-2.5">
              {colorPresets.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setWidgetStyle(prev => ({ ...prev, primaryColor: c.hex }))}
                  className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition ${
                    widgetStyle.primaryColor === c.hex 
                      ? 'border-white bg-slate-800 text-white ring-2 ring-emerald-400/50' 
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }}></span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Badge Label */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Badge Callout</label>
            <input
              type="text"
              value={widgetStyle.badgeText}
              onChange={(e) => setWidgetStyle(prev => ({ ...prev, badgeText: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Corner Roundness */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Corner Roundness</label>
            <div className="grid grid-cols-3 gap-2">
              {['6px', '12px', '24px'].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setWidgetStyle(prev => ({ ...prev, borderRadius: radius }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    widgetStyle.borderRadius === radius
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {radius === '6px' ? 'Sharp (6px)' : radius === '12px' ? 'Rounded (12px)' : 'Pill (24px)'}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <span className="block text-xs font-bold text-white">Shimmer Animation Effect</span>
              <span className="text-[10px] text-slate-400">Eye-catching glow on discount badges</span>
            </div>
            <button
              onClick={() => setWidgetStyle(prev => ({ ...prev, calloutAnimation: !prev.calloutAnimation }))}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                widgetStyle.calloutAnimation ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-950 shadow"></div>
            </button>
          </div>

        </div>

        {/* Right Column: Live Style Card Preview */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Widget Styling Preview</h3>
            
            {/* Mock Widget Box */}
            <div 
              className="p-5 bg-slate-950 border text-slate-100 shadow-xl transition-all"
              style={{ 
                borderRadius: widgetStyle.borderRadius,
                borderColor: widgetStyle.primaryColor + '40'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full text-white uppercase tracking-wider"
                  style={{ backgroundColor: widgetStyle.primaryColor }}
                >
                  {widgetStyle.badgeText}
                </span>
                <span className="text-xs text-emerald-400 font-bold">Save 20% OFF</span>
              </div>

              <h4 className="font-bold text-sm text-white">Buy 2 Get 10% Off / Buy 3 Get 20% Off</h4>
              <p className="text-xs text-slate-400 mt-1">Select your quantity below to unlock savings instantly.</p>

              <button
                className="w-full mt-4 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-lg transition"
                style={{ backgroundColor: widgetStyle.primaryColor }}
              >
                Add Bundle to Cart
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Styles auto-sync across all 10 storefront widgets.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
