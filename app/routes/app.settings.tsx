import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Divider,
  Box,
  InlineGrid,
  RangeSlider,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getShopSettings, updateShopSettings } from "../models/bundle.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const primaryColor = formData.get("primaryColor") as string;
  const accentColor = formData.get("accentColor") as string;
  const buttonText = formData.get("buttonText") as string;
  const widgetTitle = formData.get("widgetTitle") as string;
  const borderRadius = parseInt((formData.get("borderRadius") as string) || "8");
  const showSaveBadge = formData.get("showSaveBadge") === "true";

  await updateShopSettings(session.shop, {
    primaryColor,
    accentColor,
    buttonText,
    widgetTitle,
    borderRadius,
    showSaveBadge,
  });

  return json({ success: true, message: "Widget settings saved successfully!" });
};

export default function WidgetSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const isSubmitting = navigation.state === "submitting";

  const [widgetTitle, setWidgetTitle] = useState(settings.widgetTitle || "Frequently Bought Together");
  const [buttonText, setButtonText] = useState(settings.buttonText || "Add Bundle to Cart");
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || "#008060");
  const [accentColor, setAccentColor] = useState(settings.accentColor || "#E3F1DF");
  const [borderRadius, setBorderRadius] = useState<number>(settings.borderRadius || 8);
  const [showSaveBadge, setShowSaveBadge] = useState<boolean>(settings.showSaveBadge ?? true);

  const handleSave = () => {
    submit(
      {
        widgetTitle,
        buttonText,
        primaryColor,
        accentColor,
        borderRadius: borderRadius.toString(),
        showSaveBadge: showSaveBadge ? "true" : "false",
      },
      { method: "POST" }
    );
  };

  return (
    <Page
      title="Storefront Widget Styling"
      primaryAction={{
        content: "Save Design",
        loading: isSubmitting,
        onAction: handleSave,
      }}
    >
      <TitleBar title="Widget Settings" />

      <BlockStack gap="500">
        {actionData?.success && (
          <Banner tone="success">
            <p>{actionData.message}</p>
          </Banner>
        )}

        <Layout>
          {/* Customization Options */}
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Text & Messaging
                  </Text>
                  <TextField
                    label="Widget Header Title"
                    value={widgetTitle}
                    onChange={setWidgetTitle}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button Text"
                    value={buttonText}
                    onChange={setButtonText}
                    autoComplete="off"
                  />
                  <Checkbox
                    label="Display Savings Badge (e.g. Save 20%)"
                    checked={showSaveBadge}
                    onChange={setShowSaveBadge}
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Colors & Appearance
                  </Text>
                  <InlineGrid columns={["1fr", "1fr"]} gap="400">
                    <TextField
                      label="Primary Button Color"
                      value={primaryColor}
                      onChange={setPrimaryColor}
                      autoComplete="off"
                      prefix={
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            backgroundColor: primaryColor,
                            border: "1px solid #ccc",
                          }}
                        />
                      }
                    />
                    <TextField
                      label="Badge Background Color"
                      value={accentColor}
                      onChange={setAccentColor}
                      autoComplete="off"
                      prefix={
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            backgroundColor: accentColor,
                            border: "1px solid #ccc",
                          }}
                        />
                      }
                    />
                  </InlineGrid>

                  <RangeSlider
                    label={`Corner Rounding (${borderRadius}px)`}
                    min={0}
                    max={24}
                    value={borderRadius}
                    onChange={(val) => setBorderRadius(val as number)}
                    output
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Real-time Widget Preview */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Live Storefront Preview
                  </Text>
                  <Divider />

                  <div
                    style={{
                      border: "1px solid #e1e3e5",
                      borderRadius: `${borderRadius}px`,
                      padding: "16px",
                      background: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "14px", color: "#202223" }}>{widgetTitle}</span>
                      {showSaveBadge && (
                        <span
                          style={{
                            backgroundColor: accentColor,
                            color: primaryColor,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          Save 20%
                        </span>
                      )}
                    </div>

                    {/* Mini Thumbnails */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", backgroundColor: "#f1f2f3", borderRadius: "4px", border: "1px solid #dfe3e8" }} />
                      <span style={{ fontWeight: "bold", color: "#8c9196" }}>+</span>
                      <div style={{ width: "40px", height: "40px", backgroundColor: "#f1f2f3", borderRadius: "4px", border: "1px solid #dfe3e8" }} />
                    </div>

                    <div style={{ borderTop: "1px solid #f1f2f3", paddingTop: "10px", marginTop: "10px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "8px", color: "#202223" }}>
                        Total: $59.99 <span style={{ textDecoration: "line-through", fontSize: "12px", color: "#8c9196" }}>$75.00</span>
                      </div>
                      <button
                        type="button"
                        style={{
                          width: "100%",
                          padding: "8px",
                          backgroundColor: primaryColor,
                          color: "#ffffff",
                          border: "none",
                          borderRadius: `${borderRadius}px`,
                          fontWeight: "bold",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
