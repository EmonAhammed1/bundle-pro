import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "MERCHANT" | "ADMIN";
  message: string;
  createdAt: string;
}

// Simple Web Audio API sound synthesizer (no external audio file required)
function playMessageSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function MerchantLiveChat({ shop }: { shop: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ADMIN",
      message: "👋 Hi there! Welcome to EM Bundle Support. How can we help you increase your store's sales today?",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const lastTypingPingRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(messages.length);

  // Poll messages and typing status
  useEffect(() => {
    if (!shop) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?shop=${encodeURIComponent(shop)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages((prev) => {
              if (data.messages.length > prev.length) {
                const latest = data.messages[data.messages.length - 1];
                if (latest.sender === "ADMIN") {
                  playMessageSound();
                  if (!isOpen) setHasUnread(true);
                }
              }
              return data.messages;
            });
          }

          if (data.typing) {
            setIsAdminTyping(Boolean(data.typing.isAdminTyping));
          }
        }
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [shop, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isAdminTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMsg(val);

    // Throttle typing event every 2 seconds
    const now = Date.now();
    if (now - lastTypingPingRef.current > 2000 && val.trim()) {
      lastTypingPingRef.current = now;
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "typing", shop, sender: "MERCHANT" }),
      }).catch(() => {});
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isSending) return;

    const sendingText = inputMsg.trim();
    setInputMsg("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          sender: "MERCHANT",
          message: sendingText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error("Chat send error:", err);
    } finally {
      setIsSending(false);
    }
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
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Dynamic CSS animations */}
      <style>{`
        @keyframes em-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .em-typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #8c9196;
          margin: 0 2px;
          animation: em-bounce 1.4s infinite ease-in-out both;
        }
        .em-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .em-typing-dot:nth-child(2) { animation-delay: -0.16s; }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "360px",
            height: "490px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
            border: "1px solid #e1e3e5",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "em-slide-up 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#008060",
              color: "#ffffff",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#00ff9d",
                  boxShadow: "0 0 6px #00ff9d",
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>EM Bundle Live Support</div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>
                  {isAdminTyping ? "Agent is typing..." : "Online • Replies in minutes"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              backgroundColor: "#f6f6f7",
            }}
          >
            {messages.map((m) => {
              const isAdmin = m.sender === "ADMIN";
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isAdmin ? "flex-start" : "flex-end",
                    maxWidth: "82%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isAdmin ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isAdmin ? "#ffffff" : "#008060",
                      color: isAdmin ? "#202223" : "#ffffff",
                      padding: "10px 14px",
                      borderRadius: isAdmin ? "14px 14px 14px 2px" : "14px 14px 2px 14px",
                      fontSize: "13.5px",
                      lineHeight: "1.4",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.message}
                  </div>
                  <span style={{ fontSize: "10px", color: "#8c9196", marginTop: "3px" }}>
                    {formatTime(m.createdAt)} {isAdmin ? "• Support Agent" : "• You"}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isAdminTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "14px 14px 14px 2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#6d7175", marginRight: "4px" }}>Agent is typing</span>
                <span className="em-typing-dot"></span>
                <span className="em-typing-dot"></span>
                <span className="em-typing-dot"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick emoji helper */}
          <div style={{ display: "flex", gap: "6px", padding: "4px 12px", backgroundColor: "#fafbfb", borderTop: "1px solid #f1f2f3" }}>
            {["👋", "👍", "❤️", "🚀", "🎉"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInputMsg((prev) => prev + emoji)}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px" }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid #e1e3e5",
              display: "flex",
              gap: "8px",
              backgroundColor: "#ffffff",
            }}
          >
            <input
              type="text"
              placeholder="Ask us anything..."
              value={inputMsg}
              onChange={handleInputChange}
              style={{
                flex: 1,
                padding: "9px 14px",
                border: "1px solid #d2d5d8",
                borderRadius: "20px",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isSending}
              style={{
                backgroundColor: "#008060",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !inputMsg.trim() || isSending ? "not-allowed" : "pointer",
                opacity: !inputMsg.trim() || isSending ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#008060",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 6px 16px rgba(0, 128, 96, 0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          position: "relative",
          transition: "transform 0.2s ease",
        }}
      >
        {isOpen ? "✕" : "💬"}
        {hasUnread && !isOpen && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "14px",
              height: "14px",
              backgroundColor: "#d82c0d",
              borderRadius: "50%",
              border: "2px solid #ffffff",
            }}
          />
        )}
      </button>
    </div>
  );
}
