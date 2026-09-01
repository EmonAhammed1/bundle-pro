import prisma from "../db.server";

export type BundleType =
  | "FREQUENTLY_BOUGHT_TOGETHER"
  | "SIMPLE_BUNDLE"
  | "VOLUME_DISCOUNT"
  | "MIX_AND_MATCH"
  | "BUY_X_GET_Y";

export interface BundleProductInput {
  productId: string;
  variantId?: string;
  productTitle: string;
  productImage?: string;
  price: number;
  quantity?: number;
  isMainItem?: boolean;
  isRewardItem?: boolean;
}

export interface VolumeTier {
  qty: number;
  discount: number; // e.g. 10 for 10%
  label?: string;   // e.g. "Buy 2 Save 10%"
}

export interface BxgyRule {
  buyQty: number;
  getQty: number;
  getDiscount: number; // e.g. 100 for Free (100% off), or 50 for 50% off
}

export interface BundleInput {
  title: string;
  description?: string;
  bundleType: BundleType;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  badgeText?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  tierRules?: VolumeTier[];
  bxgyRules?: BxgyRule;
  mixMatchMin?: number;
  mixMatchMax?: number;
  products: BundleProductInput[];
}

export async function getBundles(shop: string, status?: string) {
  const where: any = { shop };
  if (status && status !== "ALL") {
    where.status = status;
  }
  return await prisma.bundle.findMany({
    where,
    include: {
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBundleById(id: string, shop: string) {
  return await prisma.bundle.findFirst({
    where: { id, shop },
    include: {
      products: true,
    },
  });
}

export async function createBundle(shop: string, data: BundleInput) {
  return await prisma.bundle.create({
    data: {
      shop,
      title: data.title,
      description: data.description || "",
      bundleType: data.bundleType || "FREQUENTLY_BOUGHT_TOGETHER",
      discountType: data.discountType || "PERCENTAGE",
      discountValue: data.discountValue || 0,
      badgeText: data.badgeText || "Special Bundle Offer",
      status: data.status || "ACTIVE",
      tierRules: data.tierRules ? JSON.stringify(data.tierRules) : null,
      bxgyRules: data.bxgyRules ? JSON.stringify(data.bxgyRules) : null,
      mixMatchMin: data.mixMatchMin || 2,
      mixMatchMax: data.mixMatchMax || 6,
      products: {
        create: data.products.map((p) => ({
          productId: p.productId,
          variantId: p.variantId || null,
          productTitle: p.productTitle,
          productImage: p.productImage || null,
          price: p.price || 0,
          quantity: p.quantity || 1,
          isMainItem: p.isMainItem || false,
          isRewardItem: p.isRewardItem || false,
        })),
      },
    },
    include: {
      products: true,
    },
  });
}

export async function updateBundle(id: string, shop: string, data: BundleInput) {
  await prisma.bundleProduct.deleteMany({
    where: { bundleId: id },
  });

  return await prisma.bundle.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || "",
      bundleType: data.bundleType || "FREQUENTLY_BOUGHT_TOGETHER",
      discountType: data.discountType || "PERCENTAGE",
      discountValue: data.discountValue || 0,
      badgeText: data.badgeText || "Special Bundle Offer",
      status: data.status || "ACTIVE",
      tierRules: data.tierRules ? JSON.stringify(data.tierRules) : null,
      bxgyRules: data.bxgyRules ? JSON.stringify(data.bxgyRules) : null,
      mixMatchMin: data.mixMatchMin || 2,
      mixMatchMax: data.mixMatchMax || 6,
      products: {
        create: data.products.map((p) => ({
          productId: p.productId,
          variantId: p.variantId || null,
          productTitle: p.productTitle,
          productImage: p.productImage || null,
          price: p.price || 0,
          quantity: p.quantity || 1,
          isMainItem: p.isMainItem || false,
          isRewardItem: p.isRewardItem || false,
        })),
      },
    },
    include: {
      products: true,
    },
  });
}

export async function deleteBundle(id: string, shop: string) {
  return await prisma.bundle.deleteMany({
    where: { id, shop },
  });
}

export async function toggleBundleStatus(id: string, shop: string) {
  const current = await prisma.bundle.findFirst({
    where: { id, shop },
  });
  if (!current) return null;

  const nextStatus = current.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
  return await prisma.bundle.update({
    where: { id },
    data: { status: nextStatus },
  });
}

export async function getBundleStats(shop: string) {
  const bundles = await prisma.bundle.findMany({
    where: { shop },
  });

  const totalBundles = bundles.length;
  const activeBundles = bundles.filter((b) => b.status === "ACTIVE").length;
  const totalViews = bundles.reduce((acc, b) => acc + b.views, 0);
  const totalPurchases = bundles.reduce((acc, b) => acc + b.purchases, 0);
  const totalRevenue = bundles.reduce((acc, b) => acc + b.revenue, 0);
  const conversionRate = totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) : "0.0";

  return {
    totalBundles,
    activeBundles,
    totalViews,
    totalPurchases,
    totalRevenue,
    conversionRate,
  };
}

// Shop Settings Helpers
export async function getShopSettings(shop: string) {
  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        shop,
        primaryColor: "#008060",
        accentColor: "#E3F1DF",
        buttonText: "Add Bundle to Cart",
        widgetTitle: "Frequently Bought Together",
        showSaveBadge: true,
        borderRadius: 8,
      },
    });
  }

  return settings;
}

export async function updateShopSettings(shop: string, data: any) {
  return await prisma.shopSettings.upsert({
    where: { shop },
    update: data,
    create: {
      shop,
      ...data,
    },
  });
}
