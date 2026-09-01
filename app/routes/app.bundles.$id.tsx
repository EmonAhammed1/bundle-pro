import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, useSubmit, useNavigate } from "@remix-run/react";
import { useState, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Banner,
  Thumbnail,
  Divider,
  Box,
  InlineGrid,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getBundleById, updateBundle, deleteBundle } from "../models/bundle.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const bundleId = params.id as string;

  const bundle = await getBundleById(bundleId, shop);
  if (!bundle) {
    throw new Response("Bundle Not Found", { status: 404 });
  }

  return json({ bundle });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const bundleId = params.id as string;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteBundle(bundleId, shop);
    return redirect("/app");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const discountType = (formData.get("discountType") as "PERCENTAGE" | "FIXED_AMOUNT") || "PERCENTAGE";
  const discountValue = parseFloat((formData.get("discountValue") as string) || "0");
  const badgeText = formData.get("badgeText") as string;
  const status = (formData.get("status") as "ACTIVE" | "DRAFT") || "ACTIVE";
  const productsRaw = formData.get("products") as string;

  if (!title || title.trim() === "") {
    return json({ error: "Bundle title is required" }, { status: 400 });
  }

  let products = [];
  try {
    products = JSON.parse(productsRaw || "[]");
  } catch {
    return json({ error: "Invalid product selection" }, { status: 400 });
  }

  if (products.length < 1) {
    return json({ error: "Please select at least 1 product for the bundle" }, { status: 400 });
  }

  const bundleType = (formData.get("bundleType") as any) || "FREQUENTLY_BOUGHT_TOGETHER";

  await updateBundle(bundleId, shop, {
    title,
    description,
    bundleType,
    discountType,
    discountValue,
    badgeText,
    status,
    products,
  });

  return redirect("/app");
};

export default function EditBundle() {
  const { bundle } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const isSubmitting = navigation.state === "submitting";

  const [title, setTitle] = useState(bundle.title);
  const [description, setDescription] = useState(bundle.description || "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    (bundle.discountType as any) || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(bundle.discountValue.toString());
  const [badgeText, setBadgeText] = useState(bundle.badgeText || "");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">((bundle.status as any) || "ACTIVE");
  const [selectedProducts, setSelectedProducts] = useState<any[]>(
    bundle.products.map((p) => ({
      productId: p.productId,
      variantId: p.variantId,
      productTitle: p.productTitle,
      productImage: p.productImage,
      price: p.price,
      quantity: p.quantity,
    }))
  );

  const handleSelectProducts = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: true,
      });

      if (selected && selected.length > 0) {
        const formatted = selected.map((prod: any) => {
          const firstVariant = prod.variants?.[0];
          const price = firstVariant?.price ? parseFloat(firstVariant.price) : 29.99;
          const image = prod.images?.[0]?.originalSrc || "";

          return {
            productId: prod.id,
            variantId: firstVariant?.id,
            productTitle: prod.title,
            productImage: image,
            price,
            quantity: 1,
          };
        });

        setSelectedProducts(formatted);
      }
    } catch (err) {
      console.error("Resource picker error:", err);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    setSelectedProducts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, newQty) } : item))
    );
  };

  const originalTotalPrice = useMemo(() => {
    return selectedProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);
  }, [selectedProducts]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(discountValue) || 0;
    if (discountType === "PERCENTAGE") {
      return (originalTotalPrice * val) / 100;
    }
    return Math.min(originalTotalPrice, val);
  }, [originalTotalPrice, discountType, discountValue]);

  const finalBundlePrice = useMemo(() => {
    return Math.max(0, originalTotalPrice - discountAmount);
  }, [originalTotalPrice, discountAmount]);

  const handleSubmit = () => {
    submit(
      {
        intent: "update",
        title,
        description,
        discountType,
        discountValue,
        badgeText,
        status,
        products: JSON.stringify(selectedProducts),
      },
      { method: "POST" }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${bundle.title}"?`)) {
      submit({ intent: "delete" }, { method: "POST" });
    }
  };

  return (
    <Page
      backAction={{ content: "Bundles", onAction: () => navigate("/app") }}
      title={`Edit "${bundle.title}"`}
      secondaryActions={[
        {
          content: "Delete Bundle",
          destructive: true,
          onAction: handleDelete,
        },
      ]}
      primaryAction={{
        content: "Save Changes",
        loading: isSubmitting,
        disabled: !title || selectedProducts.length < 2,
        onAction: handleSubmit,
      }}
    >
      <TitleBar title={`Edit Bundle`} />

      <BlockStack gap="500">
        {actionData?.error && (
          <Banner tone="critical">
            <p>{actionData.error}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Bundle Information
                  </Text>
                  <TextField
                    label="Bundle Title"
                    value={title}
                    onChange={setTitle}
                    autoComplete="off"
                  />
                  <TextField
                    label="Description"
                    value={description}
                    onChange={setDescription}
                    multiline={3}
                    autoComplete="off"
                  />
                  <TextField
                    label="Storefront Badge Text"
                    value={badgeText}
                    onChange={setBadgeText}
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Products in this Bundle
                    </Text>
                    <Button
                      variant="primary"
                      icon={PlusIcon}
                      onClick={handleSelectProducts}
                    >
                      Update Products
                    </Button>
                  </InlineStack>

                  <Divider />

                  <BlockStack gap="300">
                    {selectedProducts.map((product, idx) => (
                      <Box
                        key={product.productId + idx}
                        padding="300"
                        background="bg-surface-secondary"
                        borderRadius="200"
                      >
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="300" blockAlign="center">
                            <Thumbnail
                              source={
                                product.productImage ||
                                "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                              }
                              alt={product.productTitle}
                              size="small"
                            />
                            <BlockStack gap="050">
                              <Text variant="bodyMd" fontWeight="semibold" as="span">
                                {product.productTitle}
                              </Text>
                              <Text variant="bodySm" tone="subdued" as="span">
                                ${product.price.toFixed(2)} each
                              </Text>
                            </BlockStack>
                          </InlineStack>

                          <InlineStack gap="300" blockAlign="center">
                            <Box width="80px">
                              <TextField
                                label="Qty"
                                labelHidden
                                type="number"
                                min={1}
                                value={product.quantity.toString()}
                                onChange={(val) => handleQuantityChange(idx, parseInt(val) || 1)}
                                autoComplete="off"
                              />
                            </Box>
                            <Text variant="bodyMd" fontWeight="bold" as="span">
                              ${(product.price * product.quantity).toFixed(2)}
                            </Text>
                            <Button
                              icon={DeleteIcon}
                              tone="critical"
                              variant="plain"
                              onClick={() => handleRemoveProduct(idx)}
                            />
                          </InlineStack>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Discount Configuration
                  </Text>
                  <InlineGrid columns={["twoThirds", "oneThird"]} gap="400">
                    <Select
                      label="Discount Type"
                      options={[
                        { label: "Percentage Discount (%)", value: "PERCENTAGE" },
                        { label: "Fixed Amount Discount ($)", value: "FIXED_AMOUNT" },
                      ]}
                      value={discountType}
                      onChange={(val) => setDiscountType(val as any)}
                    />
                    <TextField
                      label={discountType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount ($)"}
                      type="number"
                      min={0}
                      suffix={discountType === "PERCENTAGE" ? "%" : "$"}
                      value={discountValue}
                      onChange={setDiscountValue}
                      autoComplete="off"
                    />
                  </InlineGrid>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Live Pricing Preview
                  </Text>
                  <Divider />

                  <InlineStack align="space-between">
                    <Text variant="bodyMd" tone="subdued" as="span">
                      Original Total:
                    </Text>
                    <Text variant="bodyMd" as="span">
                      ${originalTotalPrice.toFixed(2)}
                    </Text>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text variant="bodyMd" tone="success" as="span">
                      Bundle Discount:
                    </Text>
                    <Text variant="bodyMd" tone="success" fontWeight="bold" as="span">
                      -${discountAmount.toFixed(2)}
                    </Text>
                  </InlineStack>

                  <Divider />

                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="span">
                      Customer Pays:
                    </Text>
                    <Text variant="headingLg" fontWeight="bold" tone="magic" as="span">
                      ${finalBundlePrice.toFixed(2)}
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Status
                  </Text>
                  <Select
                    label="Bundle Status"
                    labelHidden
                    options={[
                      { label: "Active (Visible on Storefront)", value: "ACTIVE" },
                      { label: "Draft (Hidden)", value: "DRAFT" },
                    ]}
                    value={status}
                    onChange={(val) => setStatus(val as any)}
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
