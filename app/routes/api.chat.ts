import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  setTypingStatus,
  getTypingStatus,
  getStoreDetails,
} from "../models/chat.server";

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
  const includeDetails = url.searchParams.get("details") === "true";

  if (!shop) {
    return json({ error: "Missing shop" }, { status: 400, headers: corsHeaders });
  }

  const [messages, storeDetails] = await Promise.all([
    getChatMessages(shop),
    includeDetails ? getStoreDetails(shop) : Promise.resolve(null),
  ]);

  const typing = getTypingStatus(shop);

  return json({ messages, typing, storeDetails }, { headers: corsHeaders });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { shop, sender, message, markReadBy, intent, includeDetails } = body;

    if (intent === "typing" && shop && sender) {
      setTypingStatus(shop, sender);
      const typing = getTypingStatus(shop);
      return json({ success: true, typing }, { headers: corsHeaders });
    }

    if (markReadBy && shop) {
      await markMessagesAsRead(shop, markReadBy);
      return json({ success: true }, { headers: corsHeaders });
    }

    if (!shop || !message) {
      return json({ error: "Shop and message are required" }, { status: 400, headers: corsHeaders });
    }

    const newMsg = await sendChatMessage(shop, sender || "MERCHANT", message);
    const [messages, storeDetails] = await Promise.all([
      getChatMessages(shop),
      includeDetails ? getStoreDetails(shop) : Promise.resolve(null),
    ]);
    const typing = getTypingStatus(shop);

    return json({ success: true, newMsg, messages, typing, storeDetails }, { headers: corsHeaders });
  } catch (err: any) {
    return json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
