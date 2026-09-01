import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// CORS Headers to allow Storefront widgets to fetch bundle data
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!shop) {
    return json({ error: "Missing required 'shop' parameter" }, { status: 400, headers: corsHeaders });
  }

  const where: any = {
    shop,
    status: "ACTIVE",
  };

  if (productId) {
    where.products = {
      some: {
        productId: productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`,
      },
    };
  }

  const [bundles, settings] = await Promise.all([
    prisma.bundle.findMany({
      where,
      include: {
        products: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.shopSettings.findUnique({
      where: { shop },
    }),
  ]);

  return json(
    {
      bundles,
      settings,
      customCss: settings?.customCss || "",
      customJs: settings?.customJs || "",
    },
    { headers: corsHeaders }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { intent, bundleId, revenue } = body;

    if (intent === "record_view" && bundleId) {
      await prisma.bundle.update({
        where: { id: bundleId },
        data: { views: { increment: 1 } },
      });
      return json({ success: true }, { headers: corsHeaders });
    }

    if (intent === "record_purchase" && bundleId) {
      await prisma.bundle.update({
        where: { id: bundleId },
        data: {
          purchases: { increment: 1 },
          revenue: { increment: parseFloat(revenue) || 0 },
        },
      });
      return json({ success: true }, { headers: corsHeaders });
    }

    return json({ error: "Invalid action intent" }, { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
