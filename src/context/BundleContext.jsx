import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PRODUCTS, INITIAL_CAMPAIGNS } from '../data/mockCatalog';
import { BUNDLE_TYPES } from '../types/bundleTypes';

const BundleContext = createContext();

export const BundleProvider = ({ children }) => {
  const [products] = useState(MOCK_PRODUCTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' | 'campaigns' | 'boosters' | 'analytics' | 'customizer' | 'exporter' | 'simulator'
  const [activeWidgetType, setActiveWidgetType] = useState('BUY_2_GET_10_BUY_3_GET_20');
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);

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

    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + (product.price * quantity * (1 - appliedDiscountPercent / 100)),
      bundleOrders: prev.bundleOrders + (bundleInfo ? 1 : 0)
    }));
  };

  // Add multiple items to cart (e.g. for FBT / Complete the Look / Bundles)
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

  // Calculate cart totals with dynamic Buy More Save More & Tiered spend rules
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Check Buy More Save More Active Tier
  const bmsmCampaign = campaigns.find(c => c.type === 'BUY_MORE_SAVE_MORE' && c.status === 'ACTIVE');
  let cartLevelDiscountPercent = 0;
  if (bmsmCampaign && bmsmCampaign.tiers) {
    const sortedTiers = [...bmsmCampaign.tiers].sort((a, b) => b.spendAmount - a.spendAmount);
    const matchedTier = sortedTiers.find(t => rawSubtotal >= t.spendAmount);
    if (matchedTier) {
      cartLevelDiscountPercent = matchedTier.discountPercent;
    }
  }

  // Calculate Item-level discounts
  const itemDiscountsTotal = cart.reduce((acc, item) => {
    const itemTotal = item.product.price * item.quantity;
    const itemDiscount = itemTotal * (item.discountPercent / 100);
    return acc + itemDiscount;
  }, 0);

  const cartLevelDiscountTotal = (rawSubtotal - itemDiscountsTotal) * (cartLevelDiscountPercent / 100);
  const totalSavings = itemDiscountsTotal + cartLevelDiscountTotal;
  const finalTotal = Math.max(0, rawSubtotal - totalSavings);

  // Campaign management
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
