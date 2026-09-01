import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  Box,
  TextField,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAllConversations, getChatMessages, sendChatMessage, markMessagesAsRead } from "../models/chat.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const conversations = await getAllConversations();
  return json({ conversations });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const shop = formData.get("shop") as string;
  const message = formData.get("message") as string;

  if (shop && message) {
    await sendChatMessage(shop, "ADMIN", message);
    await markMessagesAsRead(shop, "ADMIN");
  }

  return json({ success: true });
};

export default function AdminChatInbox() {
  const { conversations } = useLoaderData<typeof loader>();
  const [selectedShop, setSelectedShop] = useState<string>(conversations[0]?.shop || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const fetcher = useFetcher();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll active conversation messages
  useEffect(() => {
    if (!selectedShop) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?shop=${encodeURIComponent(selectedShop)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [selectedShop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedShop) return;

    fetcher.submit(
      { shop: selectedShop, message: replyText.trim() },
      { method: "POST" }
    );
    setReplyText("");
  };

  return (
    <Page fullWidth title="Live Support Inbox (App Admin)">
      <TitleBar title="Live Chat Inbox" />

      <Layout>
        {/* Left Side: Store Conversations List */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  Merchant Chats
                </Text>
                <Badge tone="info">{conversations.length} Stores</Badge>
              </InlineStack>
              <Divider />

              {conversations.length === 0 ? (
                <Box padding="400">
                  <Text tone="subdued" as="p" alignment="center">
                    No active chat conversations yet.
                  </Text>
                </Box>
              ) : (
                <BlockStack gap="200">
                  {conversations.map((conv) => {
                    const isSelected = selectedShop === conv.shop;
                    return (
                      <Box
                        key={conv.shop}
                        padding="300"
                        background={isSelected ? "bg-surface-selected" : "bg-surface-secondary"}
                        borderRadius="200"
                        borderWidth={isSelected ? "025" : "0"}
                        borderColor={isSelected ? "border-brand" : "transparent"}
                      >
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedShop(conv.shop)}
                        >
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="bodyMd" fontWeight={isSelected ? "bold" : "semibold"} as="span">
                              🏪 {conv.shop.replace(".myshopify.com", "")}
                            </Text>
                            {conv.unread > 0 && <Badge tone="critical">{conv.unread} new</Badge>}
                          </InlineStack>
                          <Text variant="bodySm" tone="subdued" truncate as="p">
                            {conv.lastMessage}
                          </Text>
                        </div>
                      </Box>
                    );
                  })}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Right Side: Active Chat Window */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="050">
                  <Text variant="headingMd" as="h2">
                    {selectedShop ? `Chat with: ${selectedShop}` : "Select a Conversation"}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Live real-time messaging with the merchant.
                  </Text>
                </BlockStack>
                {selectedShop && <Badge tone="success">Online</Badge>}
              </InlineStack>

              <Divider />

              {/* Messages Feed */}
              <div
                style={{
                  height: "380px",
                  overflowY: "auto",
                  backgroundColor: "#f6f6f7",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", color: "#8c9196" }}>
                    No messages yet in this conversation.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.sender === "ADMIN";
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isAdmin ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isAdmin ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: isAdmin ? "#008060" : "#ffffff",
                            color: isAdmin ? "#ffffff" : "#202223",
                            padding: "10px 14px",
                            borderRadius: isAdmin ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            fontSize: "14px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                        >
                          {m.message}
                        </div>
                        <span style={{ fontSize: "10px", color: "#8c9196", marginTop: "2px" }}>
                          {isAdmin ? "You (App Support)" : "Merchant"}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              {selectedShop && (
                <InlineStack gap="300" blockAlign="center">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Reply Message"
                      labelHidden
                      placeholder="Type your reply to the merchant..."
                      value={replyText}
                      onChange={setReplyText}
                      autoComplete="off"
                    />
                  </div>
                  <Button variant="primary" onClick={handleSendReply} disabled={!replyText.trim()}>
                    Send Reply
                  </Button>
                </InlineStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
