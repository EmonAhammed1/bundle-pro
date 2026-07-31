export const BUNDLE_TYPES = {
  BUY_X_GET_Y: {
    id: 'BUY_X_GET_Y',
    name: 'Buy X Get Y',
    description: 'Offer a free or discounted product when customers buy specific target products.',
    icon: 'Gift',
    category: 'Cross-Sell',
    badge: 'Popular',
    color: 'from-amber-500 to-orange-600'
  },
  BUY_2_GET_10_BUY_3_GET_20: {
    id: 'BUY_2_GET_10_BUY_3_GET_20',
    name: 'Buy 2 Get 10% / Buy 3 Get 20%',
    description: 'Tiered quantity discounts that encourage buying higher quantities for bigger savings.',
    icon: 'Percent',
    category: 'Volume',
    badge: 'High Conversion',
    color: 'from-emerald-500 to-teal-600'
  },
  VOLUME_DISCOUNT: {
    id: 'VOLUME_DISCOUNT',
    name: 'Volume Discount',
    description: 'Quantity break pricing grid on product detail pages with unit savings badges.',
    icon: 'Layers',
    category: 'Volume',
    badge: 'Essential',
    color: 'from-blue-500 to-indigo-600'
  },
  TIERED_PRICING: {
    id: 'TIERED_PRICING',
    name: 'Tiered Pricing',
    description: 'Progressive savings tiers based on total quantity or cart spend milestones.',
    icon: 'TrendingUp',
    category: 'Tiered',
    badge: 'AOV Booster',
    color: 'from-purple-500 to-violet-600'
  },
  MIX_AND_MATCH: {
    id: 'MIX_AND_MATCH',
    name: 'Mix & Match Bundle',
    description: 'Allow customers to pick any items from selected collections to form a custom pack.',
    icon: 'Grid',
    category: 'Custom Box',
    badge: 'Engaging',
    color: 'from-pink-500 to-rose-600'
  },
  FIXED_BUNDLE: {
    id: 'FIXED_BUNDLE',
    name: 'Fixed Bundle',
    description: 'Sell a predefined kit or outfit with a single click and discounted package price.',
    icon: 'PackageCheck',
    category: 'Kits',
    badge: 'Quick Buy',
    color: 'from-cyan-500 to-blue-600'
  },
  BUILD_YOUR_OWN: {
    id: 'BUILD_YOUR_OWN',
    name: 'Build Your Own Bundle',
    description: 'Interactive step-by-step box builder wizard with slot selectors & celebration effects.',
    icon: 'Box',
    category: 'Custom Box',
    badge: 'Interactive',
    color: 'from-fuchsia-500 to-purple-600'
  },
  FREQUENTLY_BOUGHT_TOGETHER: {
    id: 'FREQUENTLY_BOUGHT_TOGETHER',
    name: 'Frequently Bought Together',
    description: 'Amazon-style complementary product cross-sell with checkboxes and one-click add all.',
    icon: 'ShoppingBag',
    category: 'Cross-Sell',
    badge: 'Amazon Style',
    color: 'from-amber-400 to-yellow-600'
  },
  COMPLETE_THE_LOOK: {
    id: 'COMPLETE_THE_LOOK',
    name: 'Complete the Look (Fashion)',
    description: 'Apparel lookbook widget allowing shoppers to buy head-to-toe outfit bundles.',
    icon: 'Shirt',
    category: 'Fashion',
    badge: 'Fashion Pick',
    color: 'from-rose-400 to-pink-600'
  },
  BUY_MORE_SAVE_MORE: {
    id: 'BUY_MORE_SAVE_MORE',
    name: 'Buy More Save More',
    description: 'Dynamic cart progress bar that motivates shoppers to hit spend targets for discounts.',
    icon: 'Sparkles',
    category: 'Cart Booster',
    badge: 'Top Choice',
    color: 'from-emerald-400 to-green-600'
  }
};
