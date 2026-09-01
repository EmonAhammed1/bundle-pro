import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit, useNavigate } from "@remix-run/react";
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
  RadioButton,
  Grid,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { PlusIcon, DeleteIcon, StarFilledIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { createBundle, type BundleType, type VolumeTier, type BxgyRule } from "../models/bundle.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const bundleType = (formData.get("bundleType") as BundleType) || "FREQUENTLY_BOUGHT_TOGETHER";
  const discountType = (formData.get("discountType") as "PERCENTAGE" | "FIXED_AMOUNT") || "PERCENTAGE";
  const discountValue = parseFloat((formData.get("discountValue") as string) || "0");
  const badgeText = formData.get("badgeText") as string;
  const status = (formData.get("status") as "ACTIVE" | "DRAFT") || "ACTIVE";
  const tierRulesRaw = formData.get("tierRules") as string;
  const bxgyRulesRaw = formData.get("bxgyRules") as string;
  const mixMatchMin = parseInt((formData.get("mixMatchMin") as string) || "2");
  const mixMatchMax = parseInt((formData.get("mixMatchMax") as string) || "6");
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
    return json({ error: "Please select at least 1 product to create this bundle offer" }, { status: 400 });
  }

  let tierRules: VolumeTier[] | undefined;
  if (tierRulesRaw) {
    try {
      tierRules = JSON.parse(tierRulesRaw);
    } catch {}
  }

  let bxgyRules: BxgyRule | undefined;
  if (bxgyRulesRaw) {
    try {
      bxgyRules = JSON.parse(bxgyRulesRaw);
    } catch {}
  }

  await createBundle(shop, {
    title,
    description,
    bundleType,
    discountType,
    discountValue,
    badgeText,
    status,
    tierRules,
    bxgyRules,
    mixMatchMin,
    mixMatchMax,
    products,
  });

  return redirect("/app");
};

interface SelectedProduct {
  productId: string;
  variantId?: string;
  productTitle: string;
  productImage?: string;
  price: number;
  quantity: number;
  isMainItem?: boolean;
  isRewardItem?: boolean;
}

export default function CreateBundle() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const isSubmitting = navigation.state === "submitting";

  // Form States
  const [bundleType, setBundleType] = useState<BundleType>("FREQUENTLY_BOUGHT_TOGETHER");
  const [title, setTitle] = useState("Frequently Bought Together Offer");
  const [description, setDescription] = useState("Get these matching items together and save instantly!");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("15");
  const [badgeText, setBadgeText] = useState("Bundle & Save 15%");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("ACTIVE");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // Volume Discount Tiers
  const [tiers, setTiers] = useState<VolumeTier[]>([
    { qty: 1, discount: 0, label: "Standard Pack" },
    { qty: 2, discount: 10, label: "Popular: Buy 2 Save 10%" },
    { qty: 3, discount: 20, label: "Best Value: Buy 3 Save 20%" },
  ]);

  // BXGY Rules
  const [bxgyBuyQty, setBxgyBuyQty] = useState("2");
  const [bxgyGetQty, setBxgyGetQty] = useState("1");
  const [bxgyDiscount, setBxgyDiscount] = useState("100"); // 100 = Free

  // Mix and Match limits
  const [mixMin, setMixMin] = useState("2");
  const [mixMax, setMixMax] = useState("5");

  const handleBundleTypeSelect = (type: BundleType) => {
    setBundleType(type);
    if (type === "FREQUENTLY_BOUGHT_TOGETHER") {
      setTitle("Frequently Bought Together");
      setBadgeText("Bundle & Save 15%");
      setDiscountValue("15");
    } else if (type === "VOLUME_DISCOUNT") {
      setTitle("Buy More & Save Tiered Discount");
      setBadgeText("Tiered Volume Savings");
    } else if (type === "MIX_AND_MATCH") {
      setTitle("Custom Box Builder (Mix & Match)");
      setBadgeText("Build Your Custom Box");
      setDiscountValue("20");
    } else if (type === "BUY_X_GET_Y") {
      setTitle("Buy 2 Get 1 FREE Special Offer");
      setBadgeText("BOGO Free Gift Offer");
    } else if (type === "SIMPLE_BUNDLE") {
      setTitle("Curated Combo Pack");
      setBadgeText("Complete Set Special Price");
      setDiscountValue("25");
    }
  };

  const handleSelectProducts = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: true,
      });

      if (selected && selected.length > 0) {
        const formatted: SelectedProduct[] = selected.map((prod: any) => {
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

  const handleAddSampleProducts = () => {
    setSelectedProducts([
      {
        productId: "gid://shopify/Product/101",
        productTitle: "Premium Cotton Crewneck T-Shirt",
        productImage: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/shirt.png",
        price: 32.0,
        quantity: 1,
        isMainItem: true,
      },
      {
        productId: "gid://shopify/Product/102",
        productTitle: "Canvas Daily Backpack",
        productImage: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/bag.png",
        price: 48.0,
        quantity: 1,
        isRewardItem: false,
      },
      {
        productId: "gid://shopify/Product/103",
        productTitle: "Stainless Steel Water Bottle",
        productImage: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/bottle.png",
        price: 24.0,
        quantity: 1,
        isRewardItem: true,
      },
    ]);
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
        title,
        description,
        bundleType,
        discountType,
        discountValue,
        badgeText,
        status,
        tierRules: JSON.stringify(tiers),
        bxgyRules: JSON.stringify({
          buyQty: parseInt(bxgyBuyQty) || 2,
          getQty: parseInt(bxgyGetQty) || 1,
          getDiscount: parseFloat(bxgyDiscount) || 100,
        }),
        mixMatchMin: mixMin,
        mixMatchMax: mixMax,
        products: JSON.stringify(selectedProducts),
      },
      { method: "POST" }
    );
  };

  const bundleTypesList = [
    {
      id: "FREQUENTLY_BOUGHT_TOGETHER" as BundleType,
      title: "Frequently Bought Together (FBT)",
      desc: "Amazon-style recommendation box on product pages with 1-click 'Add All to Cart'.",
      badge: "High Conversion",
    },
    {
      id: "VOLUME_DISCOUNT" as BundleType,
      title: "Volume Discounts / Quantity Breaks",
      desc: "Tiered discounts encouraging shoppers to buy higher quantities (Buy 2 Get 10%, Buy 3 Get 20%).",
      badge: "AOV Booster",
    },
    {
      id: "MIX_AND_MATCH" as BundleType,
      title: "Mix & Match / Box Builder",
      desc: "Allow customers to choose custom combinations from a curated selection.",
      badge: "Customer Favorite",
    },
    {
      id: "BUY_X_GET_Y" as BundleType,
      title: "Buy X Get Y (BOGO Free / Discount)",
      desc: "Reward customers with a free or deeply discounted item when buying specific products.",
      badge: "Viral Promo",
    },
    {
      id: "SIMPLE_BUNDLE" as BundleType,
      title: "Fixed / Combo Pack",
      desc: "Sell curated groups of products together as one cohesive value package.",
      badge: "Classic Set",
    },
  ];

  return (
    <Page
      backAction={{ content: "Bundles", onAction: () => navigate("/app") }}
      title="Create Bundle Strategy"
      primaryAction={{
        content: "Publish Bundle",
        loading: isSubmitting,
        disabled: !title || selectedProducts.length === 0,
        onAction: handleSubmit,
      }}
    >
      <TitleBar title="New Bundle" />

      <BlockStack gap="500">
        {actionData?.error && (
          <Banner tone="critical">
            <p>{actionData.error}</p>
          </Banner>
        )}

        {/* 1. Choose Bundle Strategy */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">
                1. Select Bundle Type (Fast Bundle Engine)
              </Text>
              <Badge tone="magic">5 Powerful Strategies</Badge>
            </InlineStack>
            <Divider />

            <BlockStack gap="300">
              {bundleTypesList.map((type) => {
                const isSelected = bundleType === type.id;
                return (
                  <Box
                    key={type.id}
                    padding="400"
                    background={isSelected ? "bg-surface-selected" : "bg-surface-secondary"}
                    borderRadius="200"
                    borderWidth={isSelected ? "025" : "0"}
                    borderColor={isSelected ? "border-brand" : "transparent"}
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <RadioButton
                        label={
                          <InlineStack gap="200" blockAlign="center">
                            <Text variant="bodyMd" fontWeight={isSelected ? "bold" : "medium"} as="span">
                              {type.title}
                            </Text>
                            <Badge tone={isSelected ? "success" : "info"}>{type.badge}</Badge>
                          </InlineStack>
                        }
                        helpText={type.desc}
                        checked={isSelected}
                        id={type.id}
                        name="bundleTypeSelector"
                        onChange={() => handleBundleTypeSelect(type.id)}
                      />
                    </InlineStack>
                  </Box>
                );
              })}
            </BlockStack>
          </BlockStack>
        </Card>

        <Layout>
          {/* Main Configuration Details */}
          <Layout.Section>
            <BlockStack gap="400">
              {/* Basic Information */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    2. General Information
                  </Text>
                  <TextField
                    label="Offer Title"
                    value={title}
                    onChange={setTitle}
                    autoComplete="off"
                  />
                  <TextField
                    label="Description"
                    value={description}
                    onChange={setDescription}
                    multiline={2}
                    autoComplete="off"
                  />
                  <TextField
                    label="Badge Callout Text"
                    value={badgeText}
                    onChange={setBadgeText}
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              {/* Product Selection Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="050">
                      <Text variant="headingMd" as="h2">
                        3. Products in this Offer
                      </Text>
                      <Text variant="bodySm" tone="subdued" as="p">
                        {bundleType === "VOLUME_DISCOUNT"
                          ? "Select the product(s) eligible for quantity breaks."
                          : "Select 2 or more products from your catalog."}
                      </Text>
                    </BlockStack>
                    <ButtonGroup>
                      <Button variant="primary" icon={PlusIcon} onClick={handleSelectProducts}>
                        Select from Store
                      </Button>
                      {selectedProducts.length === 0 && (
                        <Button onClick={handleAddSampleProducts}>
                          Add Sample Items
                        </Button>
                      )}
                    </ButtonGroup>
                  </InlineStack>

                  <Divider />

                  {selectedProducts.length === 0 ? (
                    <Box padding="600">
                      <Text tone="subdued" as="p" alignment="center">
                        No products added yet. Click <strong>"Select from Store"</strong> to load items via Shopify Resource Picker.
                      </Text>
                    </Box>
                  ) : (
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
                                  ${product.price.toFixed(2)}
                                </Text>
                              </BlockStack>
                            </InlineStack>

                            <InlineStack gap="300" blockAlign="center">
                              {bundleType !== "VOLUME_DISCOUNT" && (
                                <Box width="70px">
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
                              )}
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
                  )}
                </BlockStack>
              </Card>

              {/* Dynamic Type Specific Rule Builders */}
              {bundleType === "VOLUME_DISCOUNT" && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      4. Tiered Quantity Breaks
                    </Text>
                    <Text variant="bodySm" tone="subdued" as="p">
                      Define the discount percentage when a shopper buys more units.
                    </Text>
                    <Divider />

                    <BlockStack gap="300">
                      {tiers.map((tier, idx) => (
                        <InlineGrid key={idx} columns={["1fr", "1fr", "2fr", "auto"]} gap="300">
                          <TextField
                            label="Quantity"
                            type="number"
                            value={tier.qty.toString()}
                            onChange={(val) => {
                              const newTiers = [...tiers];
                              newTiers[idx].qty = parseInt(val) || 1;
                              setTiers(newTiers);
                            }}
                            autoComplete="off"
                          />
                          <TextField
                            label="Discount (%)"
                            type="number"
                            suffix="%"
                            value={tier.discount.toString()}
                            onChange={(val) => {
                              const newTiers = [...tiers];
                              newTiers[idx].discount = parseFloat(val) || 0;
                              setTiers(newTiers);
                            }}
                            autoComplete="off"
                          />
                          <TextField
                            label="Label on Badge"
                            value={tier.label || ""}
                            onChange={(val) => {
                              const newTiers = [...tiers];
                              newTiers[idx].label = val;
                              setTiers(newTiers);
                            }}
                            autoComplete="off"
                          />
                          <Box paddingTop="600">
                            <Button
                              tone="critical"
                              icon={DeleteIcon}
                              onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                            />
                          </Box>
                        </InlineGrid>
                      ))}

                      <Button
                        onClick={() =>
                          setTiers([
                            ...tiers,
                            {
                              qty: tiers.length + 1,
                              discount: tiers.length * 10,
                              label: `Buy ${tiers.length + 1} Save ${tiers.length * 10}%`,
                            },
                          ])
                        }
                      >
                        + Add Tier
                      </Button>
                    </BlockStack>
                  </BlockStack>
                </Card>
              )}

              {bundleType === "BUY_X_GET_Y" && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      4. Buy X Get Y (BOGO) Rules
                    </Text>
                    <Divider />
                    <InlineGrid columns={["1fr", "1fr", "1fr"]} gap="400">
                      <TextField
                        label="Buy Quantity (X)"
                        type="number"
                        min={1}
                        value={bxgyBuyQty}
                        onChange={setBxgyBuyQty}
                        autoComplete="off"
                      />
                      <TextField
                        label="Get Quantity (Y)"
                        type="number"
                        min={1}
                        value={bxgyGetQty}
                        onChange={setBxgyGetQty}
                        autoComplete="off"
                      />
                      <TextField
                        label="Reward Discount (%)"
                        type="number"
                        suffix="% (100 = Free)"
                        value={bxgyDiscount}
                        onChange={setBxgyDiscount}
                        autoComplete="off"
                      />
                    </InlineGrid>
                  </BlockStack>
                </Card>
              )}

              {bundleType === "MIX_AND_MATCH" && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      4. Mix & Match Box Rules
                    </Text>
                    <Divider />
                    <InlineGrid columns={["1fr", "1fr", "1fr"]} gap="400">
                      <TextField
                        label="Minimum Items Required"
                        type="number"
                        min={2}
                        value={mixMin}
                        onChange={setMixMin}
                        autoComplete="off"
                      />
                      <TextField
                        label="Maximum Items in Box"
                        type="number"
                        min={2}
                        value={mixMax}
                        onChange={setMixMax}
                        autoComplete="off"
                      />
                      <TextField
                        label="Box Discount (%)"
                        type="number"
                        suffix="%"
                        value={discountValue}
                        onChange={setDiscountValue}
                        autoComplete="off"
                      />
                    </InlineGrid>
                  </BlockStack>
                </Card>
              )}

              {["FREQUENTLY_BOUGHT_TOGETHER", "SIMPLE_BUNDLE"].includes(bundleType) && (
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">
                      4. Discount Settings
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
              )}
            </BlockStack>
          </Layout.Section>

          {/* Right Sidebar */}
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
                      Original Items:
                    </Text>
                    <Text variant="bodyMd" as="span">
                      ${originalTotalPrice.toFixed(2)}
                    </Text>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text variant="bodyMd" tone="success" as="span">
                      Savings Discount:
                    </Text>
                    <Text variant="bodyMd" tone="success" fontWeight="bold" as="span">
                      -${discountAmount.toFixed(2)}
                    </Text>
                  </InlineStack>

                  <Divider />

                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="span">
                      Bundle Price:
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
                    Status & Visibility
                  </Text>
                  <Select
                    label="Status"
                    labelHidden
                    options={[
                      { label: "Active (Visible on Store)", value: "ACTIVE" },
                      { label: "Draft (Hidden)", value: "DRAFT" },
                    ]}
                    value={status}
                    onChange={(val) => setStatus(val as any)}
                  />
                  <Button
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                    disabled={!title || selectedProducts.length === 0}
                    onClick={handleSubmit}
                  >
                    Publish Bundle Offer
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
