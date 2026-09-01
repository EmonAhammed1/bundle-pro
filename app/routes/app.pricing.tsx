import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
  List,
  Box,
  Banner,
  InlineGrid,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let subscription = await prisma.subscription.findUnique({
    where: { shop },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        shop,
        planName: "FREE",
        status: "ACTIVE",
        bundleLimit: 3,
      },
    });
  }

  return json({ subscription });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const plan = formData.get("plan") as string;

  const limits: Record<string, number> = {
    FREE: 3,
    STARTER: 10,
    PRO: 9999,
    ELITE: 99999,
  };

  await prisma.subscription.upsert({
    where: { shop },
    update: {
      planName: plan,
      bundleLimit: limits[plan] || 3,
    },
    create: {
      shop,
      planName: plan,
      bundleLimit: limits[plan] || 3,
    },
  });

  return json({ success: true, message: `Upgraded to ${plan} Plan successfully!` });
};

export default function PricingPage() {
  const { subscription } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const plans = [
    {
      id: "FREE",
      name: "Free Forever",
      price: "$0",
      period: "forever",
      desc: "Great for new stores testing their first bundle offers.",
      badge: "Current Plan",
      features: [
        "Up to 3 Active Bundles",
        "Frequently Bought Together Widget",
        "Standard Percentage/Fixed Discounts",
        "Community Support",
      ],
      highlight: false,
    },
    {
      id: "STARTER",
      name: "Starter",
      price: "$9.99",
      period: "/month",
      desc: "Perfect for growing stores scaling average order value.",
      badge: "Popular",
      features: [
        "Up to 10 Active Bundles",
        "Volume Discounts & Quantity Breaks",
        "Frequently Bought Together",
        "Live Widget Customizer",
        "7-Day Free Trial",
        "Standard Email Support",
      ],
      highlight: false,
    },
    {
      id: "PRO",
      name: "Pro Growth",
      price: "$19.99",
      period: "/month",
      desc: "Full power bundling engine for high-volume stores.",
      badge: "Best Value",
      features: [
        "Unlimited Active Bundles",
        "Mix & Match Box Builder",
        "Buy X Get Y (BOGO Free / Deals)",
        "Advanced Conversion Analytics",
        "Custom Badge & Button Styles",
        "14-Day Free Trial",
        "Priority 24/7 Support",
      ],
      highlight: true,
    },
    {
      id: "ELITE",
      name: "Fast Bundle Elite",
      price: "$49.99",
      period: "/month",
      desc: "Dedicated VIP support & custom integrations for Shopify Plus.",
      badge: "Enterprise",
      features: [
        "Everything in Pro Growth",
        "Dedicated Account Manager",
        "Custom Theme Code Assistance",
        "Early Access to AI Features",
        "SLA Guarantee",
      ],
      highlight: false,
    },
  ];

  return (
    <Page fullWidth title="Flexible Pricing Plans">
      <TitleBar title="Pricing" />

      <BlockStack gap="500">
        <Banner tone="info">
          <p>
            Choose the plan that fits your business stage. All paid plans include a <strong>14-day free trial</strong> — cancel anytime without risk.
          </p>
        </Banner>

        <Layout>
          {plans.map((plan) => {
            const isCurrent = subscription.planName === plan.id;
            return (
              <Layout.Section key={plan.id} variant="oneThird">
                <Box
                  background={plan.highlight ? "bg-surface-selected" : "bg-surface"}
                  borderRadius="200"
                  borderWidth={plan.highlight ? "025" : "0"}
                  borderColor={plan.highlight ? "border-brand" : "transparent"}
                >
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingMd" as="h3">
                          {plan.name}
                        </Text>
                        {isCurrent ? (
                          <Badge tone="success">Active Plan</Badge>
                        ) : (
                          <Badge tone={plan.highlight ? "magic" : "info"}>{plan.badge}</Badge>
                        )}
                      </InlineStack>

                      <InlineStack align="start" blockAlign="baseline" gap="100">
                        <Text variant="heading2xl" fontWeight="bold" as="p">
                          {plan.price}
                        </Text>
                        <Text tone="subdued" as="span">
                          {plan.period}
                        </Text>
                      </InlineStack>

                      <Text variant="bodySm" tone="subdued" as="p">
                        {plan.desc}
                      </Text>

                      <Divider />

                      <Text variant="bodySm" fontWeight="bold" as="p">
                        Included Features:
                      </Text>

                      <List type="bullet">
                        {plan.features.map((feat, i) => (
                          <List.Item key={i}>{feat}</List.Item>
                        ))}
                      </List>

                      <Divider />

                      <Button
                        variant={plan.highlight ? "primary" : "secondary"}
                        fullWidth
                        disabled={isCurrent}
                        onClick={() => {
                          fetcher.submit({ plan: plan.id }, { method: "POST" });
                        }}
                      >
                        {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>
            );
          })}
        </Layout>
      </BlockStack>
    </Page>
  );
}
