import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  ProgressBar,
  Banner,
  Box,
  Divider,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getBundles, getBundleStats } from "../models/bundle.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const bundles = await getBundles(shop);
  const stats = await getBundleStats(shop);

  return json({ bundles, stats });
};

export default function AnalyticsPage() {
  const { bundles, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const rows = bundles.map((b) => {
    const cvr = b.views > 0 ? ((b.purchases / b.views) * 100).toFixed(1) + "%" : "0.0%";
    return [
      b.title,
      b.status === "ACTIVE" ? "Active" : "Draft",
      b.views.toString(),
      b.purchases.toString(),
      cvr,
      `$${b.revenue.toFixed(2)}`,
    ];
  });

  return (
    <Page fullWidth title="Bundle Analytics & Performance">
      <TitleBar title="Analytics" />

      <BlockStack gap="500">
        <Banner tone="info">
          <p>
            Bundle analytics automatically track when customers view bundle widgets and purchase
            complementary products together on your storefront.
          </p>
        </Banner>

        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued" as="h3">
                  Total Bundle Revenue
                </Text>
                <Text variant="heading2xl" fontWeight="bold" tone="success" as="p">
                  ${stats.totalRevenue.toFixed(2)}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  Revenue driven exclusively by EM Bundle offers
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued" as="h3">
                  Average Conversion Rate
                </Text>
                <Text variant="heading2xl" fontWeight="bold" tone="magic" as="p">
                  {stats.conversionRate}%
                </Text>
                <ProgressBar progress={Math.min(100, parseFloat(stats.conversionRate) * 5)} size="small" tone="primary" />
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" tone="subdued" as="h3">
                  Total Bundle Orders
                </Text>
                <Text variant="heading2xl" fontWeight="bold" as="p">
                  {stats.totalPurchases}
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  From {stats.totalViews} total widget impressions
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Card padding="0">
          <Box padding="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">
                Bundle Breakdown
              </Text>
              <Button onClick={() => navigate("/app/bundles/new")} variant="primary">
                Add New Bundle
              </Button>
            </InlineStack>
          </Box>
          <Divider />

          {bundles.length === 0 ? (
            <Box padding="600">
              <Text tone="subdued" as="p" alignment="center">
                No bundle data available yet. Create active bundles to start recording analytics!
              </Text>
            </Box>
          ) : (
            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
              headings={["Bundle Name", "Status", "Impressions", "Purchases", "Conversion Rate", "Revenue"]}
              rows={rows}
            />
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
