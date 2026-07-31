import React, { useState } from 'react';
import { useBundle } from '../../context/BundleContext';
import { Code2, Copy, Check, FileCode, Terminal, ExternalLink } from 'lucide-react';

export const CodeExporter = () => {
  const { widgetStyle } = useBundle();
  const [activeTab, setActiveTab] = useState('liquid');
  const [copied, setCopied] = useState(false);

  const liquidSnippet = `{% comment %}
  EmBundle Pro - Liquid Widget Loader
  Add this snippet inside main-product.liquid or cart-drawer.liquid
{% comment %}

<div 
  id="embundle-container"
  data-primary-color="${widgetStyle.primaryColor}"
  data-border-radius="${widgetStyle.borderRadius}"
></div>

<script src="{{ 'embundle-core.js' | asset_url }}" defer="defer"></script>
<link rel="stylesheet" href="{{ 'embundle-styles.css' | asset_url }}">
`;

  const jsSnippet = `/**
 * EmBundle Pro - Storefront Web Component Core Engine
 */
class EmBundleWidget extends HTMLElement {
  connectedCallback() {
    const primaryColor = this.getAttribute('data-primary-color') || '#059669';
    console.log('EmBundle Engine Initialized with Accent Color:', primaryColor);
    
    // Auto-mount bundle widgets based on Shopify Product JSON
    this.innerHTML = \`
      <div class="embundle-card" style="--accent: \${primaryColor}">
        <span class="embundle-badge">${widgetStyle.badgeText}</span>
        <div class="embundle-content">Loading live discounts...</div>
      </div>
    \`;
  }
}
customElements.define('embundle-widget', EmBundleWidget);
`;

  const graphqlSnippet = `# Shopify Functions - Cart Transform API Query
# extensions/embundle-cart-transform/input.graphql

query Input {
  cart {
    lines {
      id
      quantity
      cost {
        amountPerQuantity {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          product {
            id
            title
          }
        }
      }
    }
  }
}
`;

  const currentCode = activeTab === 'liquid' ? liquidSnippet : activeTab === 'js' ? jsSnippet : graphqlSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Code2 className="h-5 w-5 text-emerald-400" />
          <span>Shopify Integration & Code Exporter</span>
        </h2>
        <p className="text-xs text-slate-400">Export Theme App Extension Liquid & Shopify Functions discount code</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Code Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('liquid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'liquid' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Theme Liquid Snippet</span>
            </button>

            <button
              onClick={() => setActiveTab('js')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'js' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Storefront JS Web Component</span>
            </button>

            <button
              onClick={() => setActiveTab('graphql')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'graphql' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Shopify Functions GraphQL</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code View */}
        <div className="p-5 font-mono text-xs text-slate-300 bg-slate-950/90 overflow-x-auto leading-relaxed">
          <pre>{currentCode}</pre>
        </div>

      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex items-center justify-between">
        <span>Need assistance setting up Shopify CLI? Refer to standard theme app extension guidelines.</span>
        <a 
          href="https://shopify.dev/docs/apps/checkout/product-bundles" 
          target="_blank" 
          rel="noreferrer"
          className="text-emerald-400 hover:underline flex items-center space-x-1 font-semibold"
        >
          <span>Shopify Bundles Docs</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

    </div>
  );
};
