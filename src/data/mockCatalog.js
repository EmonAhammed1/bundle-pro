export const MOCK_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Urban Heavyweight Hoodie',
    category: 'Fashion',
    collection: 'Streetwear 2026',
    price: 65.00,
    compareAtPrice: 85.00,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'Premium 450GSM cotton fleece hoodie with double-stitched hood and relaxed fit.',
    variants: [
      { id: 'v1_s', title: 'Small / Onyx Black', price: 65.00, inventory: 42 },
      { id: 'v1_m', title: 'Medium / Onyx Black', price: 65.00, inventory: 35 },
      { id: 'v1_l', title: 'Large / Onyx Black', price: 65.00, inventory: 19 }
    ]
  },
  {
    id: 'prod_2',
    title: 'Minimalist Slim Jogger',
    category: 'Fashion',
    collection: 'Streetwear 2026',
    price: 45.00,
    compareAtPrice: 55.00,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80',
    description: 'Tapered athletic joggers with water-resistant zip pockets.',
    variants: [
      { id: 'v2_m', title: 'Medium / Charcoal Gray', price: 45.00, inventory: 50 },
      { id: 'v2_l', title: 'Large / Charcoal Gray', price: 45.00, inventory: 22 }
    ]
  },
  {
    id: 'prod_3',
    title: 'Retro High Top Sneakers',
    category: 'Fashion',
    collection: 'Footwear',
    price: 110.00,
    compareAtPrice: 135.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted leather sneakers with cushioned insoles and gum rubber outsole.',
    variants: [
      { id: 'v3_42', title: 'EU 42 / Off White', price: 110.00, inventory: 15 },
      { id: 'v3_43', title: 'EU 43 / Off White', price: 110.00, inventory: 10 }
    ]
  },
  {
    id: 'prod_4',
    title: 'Acoustic Active ANC Headphones',
    category: 'Electronics',
    collection: 'Audio Gear',
    price: 180.00,
    compareAtPrice: 220.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Hi-Res Bluetooth 5.3 headphones with hybrid active noise cancellation.',
    variants: [
      { id: 'v4_blk', title: 'Midnight Black', price: 180.00, inventory: 80 }
    ]
  },
  {
    id: 'prod_5',
    title: 'MagSafe Wireless Charging Pad',
    category: 'Electronics',
    collection: 'Audio Gear',
    price: 35.00,
    compareAtPrice: 45.00,
    image: 'https://images.unsplash.com/photo-1622445268465-843d63d0371a?auto=format&fit=crop&w=600&q=80',
    description: '15W fast magnetic charging stand for iPhone and AirPods.',
    variants: [
      { id: 'v5_slv', title: 'Silver Aluminum', price: 35.00, inventory: 120 }
    ]
  },
  {
    id: 'prod_6',
    title: 'Hydra Glow Face Serum',
    category: 'Cosmetics',
    collection: 'Skincare Essentials',
    price: 28.00,
    compareAtPrice: 38.00,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    description: 'Hyaluronic acid and Vitamin C formula for radiant 24hr skin hydration.',
    variants: [
      { id: 'v6_50ml', title: '50ml Glass Bottle', price: 28.00, inventory: 200 }
    ]
  },
  {
    id: 'prod_7',
    title: 'Botanical Night Renewal Cream',
    category: 'Cosmetics',
    collection: 'Skincare Essentials',
    price: 34.00,
    compareAtPrice: 42.00,
    image: 'https://images.unsplash.com/photo-1608248597261-833258657b45?auto=format&fit=crop&w=600&q=80',
    description: 'Rich night mask with squalane and jojoba oil to nourish overnight.',
    variants: [
      { id: 'v7_50g', title: '50g Jar', price: 34.00, inventory: 140 }
    ]
  },
  {
    id: 'prod_8',
    title: 'Matte Clay Hair Pomade',
    category: 'Cosmetics',
    collection: 'Grooming',
    price: 22.00,
    compareAtPrice: 26.00,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    description: 'Strong hold matte finish styling clay with natural cedarwood scent.',
    variants: [
      { id: 'v8_100g', title: '100g Tin', price: 22.00, inventory: 90 }
    ]
  }
];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'camp_buy_2_10',
    type: 'BUY_2_GET_10_BUY_3_GET_20',
    title: 'Buy More, Save Big! (Tiered Quantity Discount)',
    status: 'ACTIVE',
    targetProductIds: ['prod_1', 'prod_2'],
    tiers: [
      { quantity: 2, discountPercent: 10, label: 'Buy 2 Get 10% OFF' },
      { quantity: 3, discountPercent: 20, label: 'Buy 3 Get 20% OFF' },
      { quantity: 5, discountPercent: 30, label: 'Buy 5 Get 30% OFF' }
    ],
    calloutText: '🔥 Save up to 30% when you buy multiple items!'
  },
  {
    id: 'camp_fbt_1',
    type: 'FREQUENTLY_BOUGHT_TOGETHER',
    title: 'Urban Streetwear Outfit Bundle',
    status: 'ACTIVE',
    mainProductId: 'prod_1',
    bundleItemIds: ['prod_1', 'prod_2', 'prod_3'],
    discountPercent: 15,
    ctaText: 'Add All 3 Items to Cart (Save 15%)'
  },
  {
    id: 'camp_ctl_1',
    type: 'COMPLETE_THE_LOOK',
    title: 'Complete the Look: Casual Streetwear',
    status: 'ACTIVE',
    mainProductId: 'prod_1',
    lookItemIds: ['prod_1', 'prod_2', 'prod_3'],
    discountPercent: 20,
    badgeText: 'Outfit Bundle'
  },
  {
    id: 'camp_vol_1',
    type: 'VOLUME_DISCOUNT',
    title: 'Serum Bulk Volume Savings',
    status: 'ACTIVE',
    targetProductId: 'prod_6',
    tiers: [
      { quantity: 1, discountPercent: 0, label: 'Standard Pack' },
      { quantity: 2, discountPercent: 15, label: 'Duo Pack (Save 15%)' },
      { quantity: 4, discountPercent: 25, label: 'Family Pack (Save 25%)' }
    ]
  },
  {
    id: 'camp_byob_1',
    type: 'BUILD_YOUR_OWN',
    title: 'Build Your Own Skincare Routine',
    status: 'ACTIVE',
    boxSize: 3,
    fixedBundlePrice: 69.00,
    originalValue: 90.00,
    allowedProductIds: ['prod_6', 'prod_7', 'prod_8']
  },
  {
    id: 'camp_bmsm_1',
    type: 'BUY_MORE_SAVE_MORE',
    title: 'Spend Threshold Cart Unlocker',
    status: 'ACTIVE',
    tiers: [
      { spendAmount: 50, discountPercent: 10, reward: '10% OFF Order' },
      { spendAmount: 100, discountPercent: 20, reward: '20% OFF Order' },
      { spendAmount: 150, discountPercent: 30, reward: '30% OFF Order + Free Gift' }
    ]
  },
  {
    id: 'camp_bxgy_1',
    type: 'BUY_X_GET_Y',
    title: 'Buy ANC Headphones Get MagSafe Charger FREE',
    status: 'ACTIVE',
    buyProductId: 'prod_4',
    buyQuantity: 1,
    getProductId: 'prod_5',
    getQuantity: 1,
    discountPercent: 100
  },
  {
    id: 'camp_fixed_1',
    type: 'FIXED_BUNDLE',
    title: 'Ultimate Audio & Power Combo',
    status: 'ACTIVE',
    productIds: ['prod_4', 'prod_5'],
    bundlePrice: 179.00,
    comparePrice: 215.00,
    badgeText: 'Limited Combo Deal'
  },
  {
    id: 'camp_mix_1',
    type: 'MIX_AND_MATCH',
    title: 'Mix & Match Any 2 Apparel Items for $95',
    status: 'ACTIVE',
    requiredCount: 2,
    fixedPrice: 95.00,
    category: 'Fashion'
  },
  {
    id: 'camp_tiered_1',
    type: 'TIERED_PRICING',
    title: 'Progressive Tiered Savings',
    status: 'ACTIVE',
    tiers: [
      { minUnits: 2, discountPercent: 10 },
      { minUnits: 4, discountPercent: 20 },
      { minUnits: 6, discountPercent: 35 }
    ]
  }
];
