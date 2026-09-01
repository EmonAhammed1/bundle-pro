import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { getAllConversations, sendChatMessage, markMessagesAsRead, getStoreDetails, saveStoreCustomCode } from "../models/chat.server";

function playAdminMessageSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const conversations = await getAllConversations();
  const initialShop = conversations[0]?.shop || "";
  const initialDetails = initialShop ? await getStoreDetails(initialShop) : null;

  return json({ conversations, initialDetails });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const shop = formData.get("shop") as string;

  if (intent === "save_code" && shop) {
    const customCss = formData.get("customCss") as string;
    const customJs = formData.get("customJs") as string;
    await saveStoreCustomCode(shop, customCss, customJs);
    return json({ success: true, message: "Custom Code applied to store successfully!" });
  }

  const message = formData.get("message") as string;
  if (shop && message) {
    await sendChatMessage(shop, "ADMIN", message);
    await markMessagesAsRead(shop, "ADMIN");
  }

  return json({ success: true });
};

export default function StandaloneAdminInbox() {
  const { conversations, initialDetails } = useLoaderData<typeof loader>();
  const [selectedShop, setSelectedShop] = useState<string>(conversations[0]?.shop || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [storeDetails, setStoreDetails] = useState<any>(initialDetails);
  const [replyText, setReplyText] = useState("");
  const [activeCodeTab, setActiveCodeTab] = useState<"CSS" | "JS">("CSS");
  const [customCss, setCustomCss] = useState<string>(initialDetails?.settings?.customCss || "");
  const [customJs, setCustomJs] = useState<string>(initialDetails?.settings?.customJs || "");
  const [isMerchantTyping, setIsMerchantTyping] = useState(false);
  const [codeSavedMessage, setCodeSavedMessage] = useState(false);
  const fetcher = useFetcher();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingPingRef = useRef<number>(0);

  const cannedReplies = [
    "👋 Hello! How can I help you with your bundles today?",
    "🔧 I'm checking your store settings and bundles right now.",
    "🎨 I have updated your custom code & layout! Please check now.",
    "✅ Your bundle is active and displaying on your product page!",
    "💡 You can enable the widget anytime in Theme Customizer -> App Embeds.",
    "🙌 Glad we could help! Feel free to reach out if you need anything else.",
  ];

  const cssSnippets = [
    { label: "+ Full Width", code: ".em-bundle-btn { width: 100% !important; padding: 14px 20px !important; }\n" },
    { label: "+ Spacing", code: ".em-bundle-container { margin: 28px 0 !important; border: 1.5px solid #008060 !important; }\n" },
    { label: "+ Dark Theme", code: ".em-bundle-container { background: #1a1a1a !important; color: #fff !important; }\n.em-bundle-title, .em-bundle-item-name { color: #fff !important; }\n" },
  ];

  const jsSnippets = [
    { label: "+ Custom Alert Hook", code: "window.addEventListener('em_bundle:added_to_cart', function(e) {\n  console.log('Bundle items added:', e.detail);\n});\n" },
    { label: "+ Direct Checkout", code: "window.addEventListener('em_bundle:added_to_cart', function() {\n  window.location.href = '/checkout';\n});\n" },
  ];

  // Poll messages and store details
  useEffect(() => {
    if (!selectedShop) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?shop=${encodeURIComponent(selectedShop)}&details=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages((prev) => {
              if (data.messages.length > prev.length) {
                const latest = data.messages[data.messages.length - 1];
                if (latest.sender === "MERCHANT") {
                  playAdminMessageSound();
                }
              }
              return data.messages;
            });
          }

          if (data.typing) {
            setIsMerchantTyping(Boolean(data.typing.isMerchantTyping));
          }

          if (data.storeDetails) {
            setStoreDetails(data.storeDetails);
            if (!customCss && data.storeDetails.settings?.customCss) {
              setCustomCss(data.storeDetails.settings.customCss);
            }
            if (!customJs && data.storeDetails.settings?.customJs) {
              setCustomJs(data.storeDetails.settings.customJs);
            }
          }
        }
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedShop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMerchantTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReplyText(val);

    const now = Date.now();
    if (now - lastTypingPingRef.current > 2000 && val.trim() && selectedShop) {
      lastTypingPingRef.current = now;
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "typing", shop: selectedShop, sender: "ADMIN" }),
      }).catch(() => {});
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedShop) return;

    fetcher.submit(
      { shop: selectedShop, message: replyText.trim() },
      { method: "POST" }
    );
    setReplyText("");
  };

  const handleSaveCode = () => {
    if (!selectedShop) return;
    fetcher.submit(
      { intent: "save_code", shop: selectedShop, customCss, customJs },
      { method: "POST" }
    );
    setCodeSavedMessage(true);
    setTimeout(() => setCodeSavedMessage(false), 3000);
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f2f4", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @keyframes em-admin-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .em-admin-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #008060;
          margin: 0 2px;
          animation: em-admin-bounce 1.4s infinite ease-in-out both;
        }
        .em-admin-dot:nth-child(1) { animation-delay: -0.32s; }
        .em-admin-dot:nth-child(2) { animation-delay: -0.16s; }
      `}</style>

      {/* Header */}
      <div style={{ backgroundColor: "#008060", color: "#ffffff", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "26px" }}>💬</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "19px", fontWeight: 700 }}>EM Bundle Support & Diagnostic Desk</h1>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>Live Chat + Bundles Inspector + Per-Store Custom CSS & JS Engine</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ fontSize: "13px", backgroundColor: "rgba(255,255,255,0.2)", padding: "5px 12px", borderRadius: "16px" }}>
            Stores: <strong>{conversations.length}</strong>
          </div>
          {selectedShop && (
            <a
              href={`https://${selectedShop}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#ffffff", fontSize: "13px", textDecoration: "none", backgroundColor: "#004c3f", padding: "5px 12px", borderRadius: "16px", fontWeight: "bold" }}
            >
              ↗ Visit Storefront
            </a>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div style={{ maxWidth: "1600px", margin: "20px auto", padding: "0 16px", display: "grid", gridTemplateColumns: "260px 1fr 400px", gap: "16px", height: "calc(100vh - 120px)" }}>
        
        {/* Column 1: Store Conversations List */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e1e3e5", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px", borderBottom: "1px solid #e1e3e5", fontWeight: 700, fontSize: "15px", color: "#202223", backgroundColor: "#fafbfb" }}>
            Active Stores
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {conversations.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#8c9196", fontSize: "13px" }}>
                No conversations yet.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedShop === conv.shop;
                return (
                  <div
                    key={conv.shop}
                    onClick={() => {
                      setSelectedShop(conv.shop);
                      setCustomCss("");
                      setCustomJs("");
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "#e3f1df" : "transparent",
                      cursor: "pointer",
                      marginBottom: "6px",
                      border: isSelected ? "1px solid #008060" : "1px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "13.5px", color: "#202223" }}>
                        🏪 {conv.shop.replace(".myshopify.com", "")}
                      </span>
                      {conv.unread > 0 && (
                        <span style={{ backgroundColor: "#d82c0d", color: "#ffffff", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "10px" }}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6d7175", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {conv.lastMessage}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Live Chat Feed */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e1e3e5", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #e1e3e5", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafbfb" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#202223" }}>
                {selectedShop ? `Chat with: ${selectedShop}` : "Select a store"}
              </h2>
              <span style={{ fontSize: "11px", color: isMerchantTyping ? "#d82c0d" : "#008060", fontWeight: isMerchantTyping ? "bold" : "normal" }}>
                {isMerchantTyping ? "✍️ Merchant is typing a message..." : "● Real-time Connection"}
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#f6f6f7" }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", color: "#8c9196", fontSize: "13px" }}>
                Select a store to start chatting.
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.sender === "ADMIN";
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isAdmin ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAdmin ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isAdmin ? "#008060" : "#ffffff",
                        color: isAdmin ? "#ffffff" : "#202223",
                        padding: "9px 14px",
                        borderRadius: isAdmin ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        fontSize: "13.5px",
                        lineHeight: "1.4",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.message}
                    </div>
                    <span style={{ fontSize: "10px", color: "#8c9196", marginTop: "3px" }}>
                      {formatTime(m.createdAt)} {isAdmin ? "• You" : "• Merchant"}
                    </span>
                  </div>
                );
              })
            )}

            {isMerchantTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "14px 14px 14px 2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#202223", marginRight: "4px" }}>Merchant is typing</span>
                <span className="em-admin-dot"></span>
                <span className="em-admin-dot"></span>
                <span className="em-admin-dot"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {selectedShop && (
            <div style={{ padding: "6px 14px", backgroundColor: "#fafbfb", borderTop: "1px solid #f1f2f3", display: "flex", gap: "6px", overflowX: "auto", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: "11px", color: "#6d7175", alignSelf: "center", fontWeight: "bold" }}>Quick Replies:</span>
              {cannedReplies.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReplyText(reply)}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #d2d5d8",
                    borderRadius: "14px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    color: "#202223",
                    cursor: "pointer",
                  }}
                >
                  {reply.length > 30 ? reply.substring(0, 30) + "..." : reply}
                </button>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {selectedShop && (
            <form onSubmit={handleSendReply} style={{ padding: "12px 14px", borderTop: "1px solid #e1e3e5", display: "flex", gap: "10px", backgroundColor: "#ffffff" }}>
              <input
                type="text"
                placeholder="Type your reply to the merchant..."
                value={replyText}
                onChange={handleInputChange}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #c9cccf",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                style={{
                  backgroundColor: "#008060",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  cursor: !replyText.trim() ? "not-allowed" : "pointer",
                  opacity: !replyText.trim() ? 0.5 : 1,
                }}
              >
                Send
              </button>
            </form>
          )}
        </div>

        {/* Column 3: Store Diagnostics & Per-Store Code Injector */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e1e3e5", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px", borderBottom: "1px solid #e1e3e5", fontWeight: 700, fontSize: "15px", color: "#202223", backgroundColor: "#fafbfb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🛠️ Store Code & Fixes</span>
            <span style={{ fontSize: "11px", backgroundColor: "#e3f1df", color: "#008060", padding: "2px 8px", borderRadius: "12px" }}>
              Plan: {storeDetails?.subscription?.planName || "FREE"}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Custom Code Injector Card */}
            <div style={{ padding: "12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1.5px solid #008060", boxShadow: "0 2px 6px rgba(0,128,96,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#202223" }}>
                  Live Code Injection
                </span>
                {codeSavedMessage && (
                  <span style={{ fontSize: "11px", color: "#008060", fontWeight: "bold" }}>
                    ✓ Applied Live!
                  </span>
                )}
              </div>

              {/* Tabs for CSS vs JS */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("CSS")}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    backgroundColor: activeCodeTab === "CSS" ? "#008060" : "#f1f2f3",
                    color: activeCodeTab === "CSS" ? "#ffffff" : "#202223",
                  }}
                >
                  Custom CSS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("JS")}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    backgroundColor: activeCodeTab === "JS" ? "#008060" : "#f1f2f3",
                    color: activeCodeTab === "JS" ? "#ffffff" : "#202223",
                  }}
                >
                  Custom JS / Hooks
                </button>
              </div>

              {/* Quick Snippets */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                {activeCodeTab === "CSS"
                  ? cssSnippets.map((snip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomCss((prev) => prev + "\n" + snip.code)}
                        style={{
                          backgroundColor: "#f1f2f3",
                          border: "1px solid #dfe3e8",
                          borderRadius: "10px",
                          padding: "2px 6px",
                          fontSize: "10px",
                          color: "#202223",
                          cursor: "pointer",
                        }}
                      >
                        {snip.label}
                      </button>
                    ))
                  : jsSnippets.map((snip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomJs((prev) => prev + "\n" + snip.code)}
                        style={{
                          backgroundColor: "#f1f2f3",
                          border: "1px solid #dfe3e8",
                          borderRadius: "10px",
                          padding: "2px 6px",
                          fontSize: "10px",
                          color: "#202223",
                          cursor: "pointer",
                        }}
                      >
                        {snip.label}
                      </button>
                    ))}
              </div>

              {activeCodeTab === "CSS" ? (
                <textarea
                  rows={5}
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder={`.em-bundle-container {\n  margin-top: 24px !important;\n}`}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #c9cccf",
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "11.5px",
                    lineHeight: "1.4",
                    boxSizing: "border-box",
                    backgroundColor: "#1e1e1e",
                    color: "#d4d4d4",
                    resize: "vertical",
                  }}
                />
              ) : (
                <textarea
                  rows={5}
                  value={customJs}
                  onChange={(e) => setCustomJs(e.target.value)}
                  placeholder={`// Custom JS executed on store:\nwindow.addEventListener('em_bundle:added_to_cart', function(e) {\n  // your logic\n});`}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #c9cccf",
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "11.5px",
                    lineHeight: "1.4",
                    boxSizing: "border-box",
                    backgroundColor: "#1e1e1e",
                    color: "#9cdcfe",
                    resize: "vertical",
                  }}
                />
              )}

              <button
                type="button"
                onClick={handleSaveCode}
                disabled={!selectedShop}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  backgroundColor: "#008060",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                💾 Save & Apply to {selectedShop ? selectedShop.replace(".myshopify.com", "") : "Store"}
              </button>
            </div>

            {/* Merchant's Created Bundles List */}
            <div>
              <div style={{ fontWeight: "bold", fontSize: "13px", color: "#202223", marginBottom: "8px" }}>
                📦 Created Bundles ({storeDetails?.bundles?.length || 0})
              </div>

              {!storeDetails?.bundles || storeDetails.bundles.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#8c9196", padding: "12px", backgroundColor: "#fafbfb", borderRadius: "6px", textAlign: "center" }}>
                  This merchant hasn't created any bundles yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {storeDetails.bundles.map((bundle: any) => (
                    <div
                      key={bundle.id}
                      style={{
                        padding: "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #dfe3e8",
                        borderRadius: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "12.5px", color: "#202223" }}>
                          {bundle.title}
                        </span>
                        <span style={{ fontSize: "10px", backgroundColor: bundle.status === "ACTIVE" ? "#e3f1df" : "#f1f2f3", color: bundle.status === "ACTIVE" ? "#008060" : "#6d7175", padding: "2px 6px", borderRadius: "8px", fontWeight: "bold" }}>
                          {bundle.status}
                        </span>
                      </div>

                      <div style={{ fontSize: "11px", color: "#6d7175", marginBottom: "6px" }}>
                        Type: <strong>{bundle.bundleType.replace(/_/g, " ")}</strong> | Discount: <strong>{bundle.discountValue}%</strong>
                      </div>

                      {/* Products */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#f9fafb", padding: "6px", borderRadius: "4px" }}>
                        {bundle.products?.map((prod: any) => (
                          <div key={prod.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                            {prod.productImage && (
                              <img src={prod.productImage} alt="" style={{ width: "22px", height: "22px", borderRadius: "3px", objectFit: "cover" }} />
                            )}
                            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#202223" }}>
                              {prod.productTitle}
                            </span>
                            <span style={{ fontWeight: "bold", color: "#008060" }}>${prod.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
