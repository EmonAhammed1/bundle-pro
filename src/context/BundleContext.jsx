import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PRODUCTS, INITIAL_CAMPAIGNS } from '../data/mockCatalog';
import { BUNDLE_TYPES } from '../types/bundleTypes';

const BundleContext = createContext();

export const BundleProvider = ({ children }) => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [storeDomain, setStoreDomain] = useState('');
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' | 'campaigns' | 'boosters' | 'analytics' | 'customizer' | 'exporter' | 'simulator'
  const [activeWidgetType, setActiveWidgetType] = useState('BUY_2_GET_10_BUY_3_GET_20');
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  
  // Customizer styling settings
  const [widgetStyle, setWidgetStyle] = useState({
    primaryColor: '#059669', // Emerald
    accentColor: '#f59e0b',  // Amber
    borderRadius: '12px',
    borderStyle: 'solid',
    fontFamily: 'Inter',
    badgeText: 'HOT DEAL',
    calloutAnimation: true
  });

  // Simulated Analytics
  const [analytics, setAnalytics] = useState({
    totalRevenue: 14250.00,
    bundleOrders: 184,
    aovIncrease: 28.5,
    conversionBoost: 3.4,
    topBundleType: 'BUY_2_GET_10_BUY_3_GET_20'
  });

  // Fetch Real Shopify Store Products with CORS Proxy Fallbacks
  const fetchRealStoreProducts = async (domain) => {
    if (!domain) return false;
    setLoadingProducts(true);

    let cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');

    if (!cleanDomain.includes('.')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }

    setStoreDomain(cleanDomain);
    localStorage.setItem('shopify_connected_shop', cleanDomain);

    const targetUrl = `https://${cleanDomain}/products.json`;

    // Multiple endpoints to bypass CORS & fetch real products
    const fetchEndpoints = [
      targetUrl,
      `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const url of fetchEndpoints) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && data.products && data.products.length > 0) {
            const realProducts = data.products.map((p, idx) => ({
              id: `shopify_${p.id || idx}`,
              title: p.title,
              category: p.product_type || p.vendor || 'Store Product',
              collection: p.vendor || 'Main Collection',
              price: parseFloat(p.variants && p.variants[0] ? p.variants[0].price : '29.99'),
              compareAtPrice: parseFloat(p.variants && p.variants[0] && p.variants[0].compare_at_price ? p.variants[0].compare_at_price : '39.99'),
              image: p.images && p.images[0] ? p.images[0].src : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
              description: p.body_html ? p.body_html.replace(/<[^>]*>?/gm, '') : p.title,
              variants: (p.variants || []).map(v => ({
                id: `v_${v.id}`,
                title: v.title,
                price: parseFloat(v.price || '0'),
                inventory: v.inventory_quantity || 15
              }))
            }));

            setProducts(realProducts);
            setSelectedProduct(realProducts[0]);
            setLoadingProducts(false);
            return true;
          }
        }
      } catch (err) {
        console.warn(`Attempt failed for ${url}:`, err);
      }
    }

    setLoadingProducts(false);
    return false;
  };

  // Sync Store Domain and Fetch Real Products on Initial Load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop') || localStorage.getItem('shopify_connected_shop') || 'liquid-hub.myshopify.com';
    fetchRealStoreProducts(shopParam);
  }, []);

  // Sync URL Path, Query, and Hash with activeTab state
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('campaign') || hash.includes('campaign') || search.includes('tab=campaign')) {
        setActiveTab('campaigns');
      } else if (path.includes('booster') || hash.includes('booster') || search.includes('tab=booster')) {
        setActiveTab('campaigns');
      } else if (path.includes('customiz') || hash.includes('customiz') || search.includes('tab=customiz')) {
        setActiveTab('customizer');
      } else if (path.includes('analytic') || hash.includes('analytic') || search.includes('tab=analytic')) {
        setActiveTab('analytics');
      } else if (path.includes('export') || path.includes('setting') || hash.includes('setting') || search.includes('tab=setting')) {
        setActiveTab('exporter');
      } else if (path.includes('simulat') || hash.includes('simulat')) {
        setActiveTab('simulator');
      } else if (path === '/' || path.includes('welcome') || search.includes('tab=welcome')) {
        setActiveTab('welcome');
      }
    };

    handleUrlSync();

    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    const interval = setInterval(handleUrlSync, 300);

    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
      clearInterval(interval);
    };
  }, []);

  // Add Item to Cart
  const addToCart = (product, quantity = 1, appliedDiscountPercent = 0, bundleInfo = null) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id && item.bundleInfo?.id === bundleInfo?.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product,
        quantity,
        discountPercent: appliedDiscountPercent,
        bundleInfo
      }];
    });

    setAnalytics(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + (product.price * quantity * (1 - appliedDiscountPercent / 100)),
      bundleOrders: prev.bundleOrders + (bundleInfo ? 1 : 0)
    }));
  };

  const addBundleToCart = (items, bundleDiscountPercent = 0, bundleTypeLabel = 'Bundle Deal') => {
    items.forEach(item => {
      addToCart(item.product, item.quantity || 1, bundleDiscountPercent, { label: bundleTypeLabel, id: `bundle_${Date.now()}` });
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const clearCart = () => setCart([]);

  const rawSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  const bmsmCampaign = campaigns.find(c => c.type === 'BUY_MORE_SAVE_MORE' && c.status === 'ACTIVE');
  let cartLevelDiscountPercent = 0;
  if (bmsmCampaign && bmsmCampaign.tiers) {
    const sortedTiers = [...bmsmCampaign.tiers].sort((a, b) => b.spendAmount - a.spendAmount);
    const matchedTier = sortedTiers.find(t => rawSubtotal >= t.spendAmount);
    if (matchedTier) {
      cartLevelDiscountPercent = matchedTier.discountPercent;
    }
  }

  const itemDiscountsTotal = cart.reduce((acc, item) => {
    const itemTotal = item.product.price * item.quantity;
    const itemDiscount = itemTotal * (item.discountPercent / 100);
    return acc + itemDiscount;
  }, 0);

  const cartLevelDiscountTotal = (rawSubtotal - itemDiscountsTotal) * (cartLevelDiscountPercent / 100);
  const totalSavings = itemDiscountsTotal + cartLevelDiscountTotal;
  const finalTotal = Math.max(0, rawSubtotal - totalSavings);

  const toggleCampaignStatus = (id) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c));
  };

  const addCampaign = (newCampaign) => {
    const campaignWithId = {
      ...newCampaign,
      id: `camp_${Date.now()}`,
      status: 'ACTIVE'
    };
    setCampaigns(prev => [campaignWithId, ...prev]);
  };

  const deleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <BundleContext.Provider value={{
      products,
      setProducts,
      loadingProducts,
      storeDomain,
      fetchRealStoreProducts,
      campaigns,
      cart,
      activeTab,
      setActiveTab,
      activeWidgetType,
      setActiveWidgetType,
      selectedProduct,
      setSelectedProduct,
      widgetStyle,
      setWidgetStyle,
      analytics,
      addToCart,
      addBundleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      rawSubtotal,
      totalSavings,
      finalTotal,
      cartLevelDiscountPercent,
      toggleCampaignStatus,
      addCampaign,
      deleteCampaign
    }}>
      {children}
    </BundleContext.Provider>
  );
};

export const useBundle = () => {
  const context = useContext(BundleContext);
  if (!context) {
    throw new Error('useBundle must be used within a BundleProvider');
  }
  return context;
};
