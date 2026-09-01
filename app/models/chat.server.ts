import prisma from "../db.server";

// In-memory typing state tracker
const typingState = new Map<string, { merchant: number; admin: number }>();

export function setTypingStatus(shop: string, sender: "MERCHANT" | "ADMIN") {
  const current = typingState.get(shop) || { merchant: 0, admin: 0 };
  const expiresAt = Date.now() + 3500;

  if (sender === "MERCHANT") {
    current.merchant = expiresAt;
  } else {
    current.admin = expiresAt;
  }

  typingState.set(shop, current);
}

export function getTypingStatus(shop: string) {
  const current = typingState.get(shop) || { merchant: 0, admin: 0 };
  const now = Date.now();

  return {
    isMerchantTyping: current.merchant > now,
    isAdminTyping: current.admin > now,
  };
}

export async function getChatMessages(shop: string) {
  return await prisma.chatMessage.findMany({
    where: { shop },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStoreDetails(shop: string) {
  const [subscription, bundles, settings] = await Promise.all([
    prisma.subscription.findUnique({ where: { shop } }),
    prisma.bundle.findMany({
      where: { shop },
      include: { products: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shopSettings.findUnique({ where: { shop } }),
  ]);

  const totalViews = bundles.reduce((acc, b) => acc + b.views, 0);
  const totalPurchases = bundles.reduce((acc, b) => acc + b.purchases, 0);
  const totalRevenue = bundles.reduce((acc, b) => acc + b.revenue, 0);

  return {
    shop,
    subscription: subscription || { planName: "FREE", status: "ACTIVE" },
    bundles,
    settings: settings || {
      primaryColor: "#008060",
      accentColor: "#E3F1DF",
      buttonText: "Add Bundle to Cart",
      widgetTitle: "Frequently Bought Together",
      showSaveBadge: true,
      borderRadius: 8,
      customCss: "",
      customJs: "",
    },
    stats: {
      totalBundles: bundles.length,
      activeBundles: bundles.filter((b) => b.status === "ACTIVE").length,
      totalViews,
      totalPurchases,
      totalRevenue,
    },
  };
}

export async function saveStoreCustomCode(shop: string, customCss: string, customJs?: string) {
  const data: any = { customCss };
  if (customJs !== undefined) data.customJs = customJs;

  return await prisma.shopSettings.upsert({
    where: { shop },
    update: data,
    create: {
      shop,
      customCss,
      customJs: customJs || "",
    },
  });
}

export async function sendChatMessage(shop: string, sender: "MERCHANT" | "ADMIN", message: string) {
  if (!message || message.trim() === "") return null;

  const current = typingState.get(shop);
  if (current) {
    if (sender === "MERCHANT") current.merchant = 0;
    else current.admin = 0;
  }

  return await prisma.chatMessage.create({
    data: {
      shop,
      sender,
      message: message.trim(),
    },
  });
}

export async function getAllConversations() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const shopMap = new Map<string, { shop: string; lastMessage: string; lastAt: Date; unread: number }>();

  for (const msg of messages) {
    if (!shopMap.has(msg.shop)) {
      shopMap.set(msg.shop, {
        shop: msg.shop,
        lastMessage: msg.message,
        lastAt: msg.createdAt,
        unread: msg.sender === "MERCHANT" && !msg.isRead ? 1 : 0,
      });
    } else {
      if (msg.sender === "MERCHANT" && !msg.isRead) {
        const item = shopMap.get(msg.shop)!;
        item.unread += 1;
      }
    }
  }

  return Array.from(shopMap.values());
}

export async function markMessagesAsRead(shop: string, reader: "MERCHANT" | "ADMIN") {
  const targetSender = reader === "ADMIN" ? "MERCHANT" : "ADMIN";
  await prisma.chatMessage.updateMany({
    where: {
      shop,
      sender: targetSender,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
