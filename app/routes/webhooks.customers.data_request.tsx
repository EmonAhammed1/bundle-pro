import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[GDPR Webhook] ${topic} received for shop: ${shop}`, payload);

  // EM Bundle stores only bundle configurations and aggregate sales stats, no PII.
  return new Response("OK", { status: 200 });
};
