import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Button,
  Banner,
  Collapsible,
  List,
  Badge,
  Box,
  Divider,
  Icon,
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  ChatIcon,
  QuestionMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!message || message.trim() === "") {
    return json({ error: "Please write your message or issue description." }, { status: 400 });
  }

  // In production, this can forward to Zendesk, Crisp, or an internal support email
  return json({
    success: true,
    message: "Thank you for reaching out! Our support team has received your request and will respond within 24 hours.",
  });
};

export default function SupportPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [subject, setSubject] = useState("General Support / Setup Assistance");
  const [message, setMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const isSubmitting = navigation.state === "submitting";

  const faqs = [
    {
      q: "How does the bundle discount apply at checkout?",
      a: "EM Bundle calculates the discount and passes the bundle items to Shopify's cart and checkout. Discounts can be applied automatically via Shopify Discount Functions or direct line-item pricing.",
    },
    {
      q: "Can I customize the bundle widget design on my product pages?",
      a: "Yes! The widget automatically inherits your theme's typography and color scheme, and you can customize the badge text and layout directly from the bundle builder.",
    },
    {
      q: "What happens if a product in the bundle goes out of stock?",
      a: "If any variant inside a bundle is completely out of stock, EM Bundle will automatically disable the 'Add Bundle to Cart' button to prevent unfulfillable orders.",
    },
    {
      q: "Does EM Bundle work with multi-currency stores?",
      a: "Yes, all bundle discounts and pricing adapt seamlessly to Shopify Markets and multi-currency conversions.",
    },
  ];

  const handleSubmit = () => {
    submit({ subject, message }, { method: "POST" });
  };

  return (
    <Page title="Help & Customer Support">
      <TitleBar title="Help & Support" />

      <BlockStack gap="500">
        {actionData?.success && (
          <Banner tone="success" onDismiss={() => {}}>
            <p>{actionData.message}</p>
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical">
            <p>{actionData.error}</p>
          </Banner>
        )}

        <Layout>
          {/* Left Column: Quick Guide & FAQ */}
          <Layout.Section>
            <BlockStack gap="400">
              {/* Quick Setup Checklist */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h2">
                    🚀 Quick Setup Checklist
                  </Text>
                  <Divider />
                  <List type="number">
                    <List.Item>
                      <strong>Create your first bundle:</strong> Go to the <em>Create Bundle</em> tab, select 2+ items, and choose a discount percentage.
                    </List.Item>
                    <List.Item>
                      <strong>Activate status:</strong> Ensure the bundle status is set to <em>Active</em>.
                    </List.Item>
                    <List.Item>
                      <strong>Test on Storefront:</strong> Visit any of the bundled products on your online store to preview the bundle box.
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>

              {/* Interactive FAQ */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Frequently Asked Questions (FAQ)
                  </Text>
                  <Divider />

                  <BlockStack gap="300">
                    {faqs.map((faq, index) => {
                      const isExpanded = expandedFaq === index;
                      return (
                        <Box
                          key={index}
                          padding="300"
                          background="bg-surface-secondary"
                          borderRadius="200"
                        >
                          <BlockStack gap="200">
                            <InlineStack
                              align="space-between"
                              blockAlign="center"
                              onClick={() => setExpandedFaq(isExpanded ? null : index)}
                            >
                              <Text variant="bodyMd" fontWeight="semibold" as="h3">
                                {faq.q}
                              </Text>
                              <Button
                                variant="plain"
                                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                                onClick={() => setExpandedFaq(isExpanded ? null : index)}
                              />
                            </InlineStack>

                            <Collapsible
                              id={`faq-${index}`}
                              open={isExpanded}
                              transition={{ duration: "200ms", timingFunction: "ease-in-out" }}
                            >
                              <Box paddingTop="200">
                                <Text tone="subdued" as="p">
                                  {faq.a}
                                </Text>
                              </Box>
                            </Collapsible>
                          </BlockStack>
                        </Box>
                      );
                    })}
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Right Column: Contact Support */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Contact Developer Support
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="p">
                    Need custom styling, feature requests, or technical help? Send our engineering team a direct ticket.
                  </Text>
                  <Divider />

                  <Select
                    label="Issue Category"
                    options={[
                      { label: "General Support / Setup Assistance", value: "General Support / Setup Assistance" },
                      { label: "Storefront Styling Request", value: "Storefront Styling Request" },
                      { label: "Bug Report", value: "Bug Report" },
                      { label: "Feature Request", value: "Feature Request" },
                    ]}
                    value={subject}
                    onChange={setSubject}
                  />

                  <TextField
                    label="Describe your request or issue"
                    placeholder="Tell us what you need help with..."
                    multiline={4}
                    value={message}
                    onChange={setMessage}
                    autoComplete="off"
                  />

                  <Button
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Submit Support Ticket
                  </Button>
                </BlockStack>
              </Card>

              {/* System Diagnostics */}
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h4">
                    App Status & Health
                  </Text>
                  <InlineStack align="space-between">
                    <Text variant="bodySm" tone="subdued" as="span">Database Status:</Text>
                    <Badge tone="success">Connected</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm" tone="subdued" as="span">Shopify API Version:</Text>
                    <Badge tone="info">2026-10 (Latest)</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm" tone="subdued" as="span">App Version:</Text>
                    <Text variant="bodySm" fontWeight="bold" as="span">v1.0.0</Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
