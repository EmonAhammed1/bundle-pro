import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigate, Link } from "@remix-run/react";
import { useState, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  BlockStack,
  Badge,
  IndexTable,
  useIndexResourceState,
  Thumbnail,
  EmptyState,
  Banner,
  TextField,
  ButtonGroup,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { PlusIcon, DeleteIcon, EditIcon, ViewIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import {
  getBundles,
  getBundleStats,
  deleteBundle,
  toggleBundleStatus,
  createBundle,
} from "../models/bundle.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const bundles = await getBundles(shop);
  const stats = await getBundleStats(shop);

  return json({ bundles, stats, shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_status") {
    const id = formData.get("id") as string;
    await toggleBundleStatus(id, shop);
    return json({ success: true, message: "Status updated successfully" });
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await deleteBundle(id, shop);
    return json({ success: true, message: "Bundle deleted successfully" });
  }

  if (intent === "seed_demo") {
    // Create a demo sample bundle so the merchant can see how it works instantly
    await createBundle(shop, {
      title: "Summer Starter Bundle",
      description: "Get our best-selling summer items together with a special 20% discount!",
      discountType: "PERCENTAGE",
      discountValue: 20,
      badgeText: "Save 20% Today",
      status: "ACTIVE",
      products: [
        {
          productId: "gid://shopify/Product/demo-1",
          productTitle: "Classic Cotton T-Shirt",
          price: 35.0,
          quantity: 1,
        },
        {
          productId: "gid://shopify/Product/demo-2",
          productTitle: "Canvas Summer Cap",
          price: 25.0,
          quantity: 1,
        },
      ],
    });
    return json({ success: true, message: "Sample bundle created" });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

export default function Dashboard() {
  const { bundles, stats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesSearch =
        bundle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedTab === 1) return matchesSearch && bundle.status === "ACTIVE";
      if (selectedTab === 2) return matchesSearch && bundle.status === "DRAFT";
      return matchesSearch;
    });
  }, [bundles, searchQuery, selectedTab]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredBundles);

  const resourceName = {
    singular: "bundle",
    plural: "bundles",
  };

  const rowMarkup = filteredBundles.map((bundle, index) => {
    const originalPrice = bundle.products.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const bundlePrice =
      bundle.discountType === "PERCENTAGE"
        ? originalPrice * (1 - bundle.discountValue / 100)
        : Math.max(0, originalPrice - bundle.discountValue);

    return (
      <IndexTable.Row
        id={bundle.id}
        key={bundle.id}
        selected={selectedResources.includes(bundle.id)}
        position={index}
      >
        <IndexTable.Cell>
          <BlockStack gap="100">
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {bundle.title}
            </Text>
            {bundle.description && (
              <Text variant="bodySm" tone="subdued" as="span">
                {bundle.description.length > 50
                  ? `${bundle.description.substring(0, 50)}...`
                  : bundle.description}
              </Text>
            )}
          </BlockStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <InlineStack gap="200" align="start">
            <Badge tone="info">{`${bundle.products.length} Products`}</Badge>
            <Text variant="bodySm" tone="subdued" as="span">
              {bundle.products.map((p) => p.productTitle).slice(0, 2).join(", ")}
              {bundle.products.length > 2 && "..."}
            </Text>
          </InlineStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone="success">
            {bundle.discountType === "PERCENTAGE"
              ? `${bundle.discountValue}% OFF`
              : `$${bundle.discountValue.toFixed(2)} OFF`}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <BlockStack gap="050">
            <Text variant="bodyMd" fontWeight="semibold" as="span">
              ${bundlePrice.toFixed(2)}
            </Text>
            {originalPrice > 0 && (
              <Text variant="bodyXs" tone="subdued" textDecorationLine="line-through" as="span">
                ${originalPrice.toFixed(2)}
              </Text>
            )}
          </BlockStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone={bundle.status === "ACTIVE" ? "success" : "subdued"}>
            {bundle.status}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text variant="bodySm" as="span">
            {`${bundle.views} views • ${bundle.purchases} sales`}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <ButtonGroup variant="segmented">
            <Button
              size="micro"
              onClick={() => {
                fetcher.submit(
                  { intent: "toggle_status", id: bundle.id },
                  { method: "POST" }
                );
              }}
            >
              {bundle.status === "ACTIVE" ? "Pause" : "Activate"}
            </Button>
            <Button
              size="micro"
              icon={EditIcon}
              onClick={() => navigate(`/app/bundles/${bundle.id}`)}
            />
            <Button
              size="micro"
              tone="critical"
              icon={DeleteIcon}
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${bundle.title}"?`)) {
                  fetcher.submit(
                    { intent: "delete", id: bundle.id },
                    { method: "POST" }
                  );
                }
              }}
            />
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page fullWidth>
      <TitleBar title="EM Bundle Dashboard">
        <button
          variant="primary"
          onClick={() => navigate("/app/bundles/new")}
        >
          Create Bundle
        </button>
      </TitleBar>

      <BlockStack gap="500">
        {/* Top Analytics Metrics */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Bundles
                </Text>
                <InlineStack align="space-between">
                  <Text variant="heading2xl" as="p" fontWeight="bold">
                    {stats.totalBundles}
                  </Text>
                  <Badge tone={stats.activeBundles > 0 ? "success" : "subdued"}>
                    {`${stats.activeBundles} Active`}
                  </Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Bundle Views & Impressions
                </Text>
                <InlineStack align="space-between">
                  <Text variant="heading2xl" as="p" fontWeight="bold">
                    {stats.totalViews}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="span">
                    {`${stats.totalPurchases} Orders`}
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Bundle Revenue
                </Text>
                <InlineStack align="space-between">
                  <Text variant="heading2xl" as="p" fontWeight="bold">
                    ${stats.totalRevenue.toFixed(2)}
                  </Text>
                  <Badge tone="info">{`${stats.conversionRate}% CVR`}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Bundles Table */}
        <Card padding="0">
          <Box padding="400">
            <InlineStack align="space-between" blockAlign="center" gap="400">
              <InlineStack gap="200">
                <ButtonGroup variant="segmented">
                  <Button
                    pressed={selectedTab === 0}
                    onClick={() => setSelectedTab(0)}
                  >
                    All ({bundles.length})
                  </Button>
                  <Button
                    pressed={selectedTab === 1}
                    onClick={() => setSelectedTab(1)}
                  >
                    Active ({stats.activeBundles})
                  </Button>
                  <Button
                    pressed={selectedTab === 2}
                    onClick={() => setSelectedTab(2)}
                  >
                    Draft ({bundles.length - stats.activeBundles})
                  </Button>
                </ButtonGroup>
              </InlineStack>

              <Box minWidth="260px">
                <TextField
                  label="Search bundles"
                  labelHidden
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={() => setSearchQuery("")}
                />
              </Box>
            </InlineStack>
          </Box>

          <Divider />

          {filteredBundles.length === 0 ? (
            <Box padding="800">
              <EmptyState
                heading="Create your first high-converting bundle"
                action={{
                  content: "Create Bundle",
                  onAction: () => navigate("/app/bundles/new"),
                }}
                secondaryAction={{
                  content: "Load Demo Bundle",
                  onAction: () => {
                    fetcher.submit({ intent: "seed_demo" }, { method: "POST" });
                  },
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Combine complementary products together with special discounts to increase your store's
                  Average Order Value (AOV).
                </p>
              </EmptyState>
            </Box>
          ) : (
            <IndexTable
              resourceName={resourceName}
              itemCount={filteredBundles.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Bundle Name" },
                { title: "Products" },
                { title: "Discount" },
                { title: "Price" },
                { title: "Status" },
                { title: "Performance" },
                { title: "Actions" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
