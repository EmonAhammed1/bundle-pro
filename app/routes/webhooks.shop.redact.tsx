import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[GDPR Webhook] ${topic} received for shop: ${shop}`, payload);

  if (shop) {
    try {
      await prisma.bundle.deleteMany({ where: { shop } });
      await prisma.shopSettings.deleteMany({ where: { shop } });
      await prisma.subscription.deleteMany({ where: { shop } });
      console.log(`[GDPR Redact] Successfully cleaned up data for ${shop}`);
    } catch (err) {
      console.error(`[GDPR Redact] Cleanup error for ${shop}:`, err);
    }
  }

  return new Response("OK", { status: 200 });
};
