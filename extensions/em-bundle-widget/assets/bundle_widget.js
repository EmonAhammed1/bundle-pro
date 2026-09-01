/**
 * EM Bundle Storefront Widget - Enterprise Multi-Theme Engine
 * Handles dynamic bundle rendering, tier pricing, and smart cart auto-detection.
 */
(function () {
  "use strict";

  if (window.__EM_BUNDLE_INITIALIZED__) return;
  window.__EM_BUNDLE_INITIALIZED__ = true;

  document.addEventListener("DOMContentLoaded", initBundleWidget);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initBundleWidget();
  }

  function initBundleWidget() {
    const container = document.querySelector(".em-bundle-container");
    if (!container) return;

    const shop = container.getAttribute("data-shop");
    const productId = container.getAttribute("data-product-id");
    if (!shop || !productId) return;

    const loader = document.getElementById("em-bundle-loader");
    const appBox = document.getElementById("em-bundle-app");

    // Fetch active bundles & per-store custom styling/scripts
    const host = "https://bundle.emonahammed.shop";
    const apiUrl = `${host}/api/bundles?shop=${encodeURIComponent(shop)}&productId=${encodeURIComponent(productId)}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!data.bundles || data.bundles.length === 0) {
          container.style.display = "none";
          return;
        }

        // 1. Inject Per-Store Custom CSS if configured
        if (data.customCss && data.customCss.trim()) {
          let styleEl = document.getElementById("em-bundle-custom-css");
          if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "em-bundle-custom-css";
            document.head.appendChild(styleEl);
          }
          styleEl.textContent = data.customCss;
        }

        // 2. Execute Per-Store Custom JS if configured
        if (data.customJs && data.customJs.trim()) {
          try {
            const runCustomScript = new Function("data", "shop", data.customJs);
            runCustomScript(data, shop);
          } catch (scriptErr) {
            console.warn("[EM Bundle] Custom JS Error:", scriptErr);
          }
        }

        if (loader) loader.style.display = "none";
        if (appBox) {
          appBox.style.display = "block";
          renderBundles(data.bundles, appBox, shop, data.settings);
        }
      })
      .catch((err) => {
        console.warn("[EM Bundle] Could not load bundles:", err);
        container.style.display = "none";
      });
  }

  function renderBundles(bundles, targetEl, shop, settings) {
    const bundle = bundles[0];
    if (!bundle || !bundle.products || bundle.products.length === 0) return;

    let selectedProducts = [...bundle.products];

    // Record impression
    fetch("https://bundle.emonahammed.shop/api/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "record_view", bundleId: bundle.id }),
    }).catch(() => {});

    function calculatePrices() {
      const originalTotal = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
      let discountedTotal = originalTotal;

      if (bundle.discountType === "PERCENTAGE") {
        discountedTotal = originalTotal * (1 - bundle.discountValue / 100);
      } else if (bundle.discountType === "FIXED_AMOUNT") {
        discountedTotal = Math.max(0, originalTotal - bundle.discountValue);
      } else if (bundle.discountType === "FREE_SHIPPING") {
        discountedTotal = originalTotal;
      }

      const savedAmount = Math.max(0, originalTotal - discountedTotal);
      return {
        originalTotal: originalTotal.toFixed(2),
        discountedTotal: discountedTotal.toFixed(2),
        savedAmount: savedAmount.toFixed(2),
      };
    }

    function renderUI() {
      const prices = calculatePrices();
      const primaryColor = settings?.primaryColor || "#008060";
      const buttonText = settings?.buttonText || "Add Bundle to Cart";
      const widgetTitle = bundle.title || settings?.widgetTitle || "Frequently Bought Together";

      let html = `
        <div class="em-bundle-card">
          <div class="em-bundle-header">
            <h3 class="em-bundle-title">${escapeHtml(widgetTitle)}</h3>
            ${
              bundle.discountValue > 0
                ? `<span class="em-bundle-badge" style="background-color: ${primaryColor};">SAVE ${bundle.discountValue}% OFF</span>`
                : ""
            }
          </div>

          <div class="em-bundle-items-preview">
      `;

      bundle.products.forEach((prod, index) => {
        const isSelected = selectedProducts.some((p) => p.productId === prod.productId);
        html += `
          <div class="em-bundle-item-wrapper ${isSelected ? "" : "em-item-unchecked"}">
            <div class="em-bundle-image-box">
              <img src="${escapeHtml(prod.productImage || "")}" alt="${escapeHtml(prod.productTitle)}" class="em-bundle-img" />
            </div>
            <div class="em-bundle-item-details">
              <div class="em-bundle-item-name">${escapeHtml(prod.productTitle)}</div>
              <div class="em-bundle-item-price">$${parseFloat(prod.price).toFixed(2)}</div>
            </div>
          </div>
        `;

        if (index < bundle.products.length - 1) {
          html += `<div class="em-bundle-plus">+</div>`;
        }
      });

      html += `
          </div>

          <div class="em-bundle-checklist">
      `;

      bundle.products.forEach((prod) => {
        const isSelected = selectedProducts.some((p) => p.productId === prod.productId);
        html += `
          <label class="em-bundle-checkbox-label">
            <input type="checkbox" class="em-bundle-checkbox" data-product-id="${prod.productId}" ${isSelected ? "checked" : ""} />
            <span>${escapeHtml(prod.productTitle)} - <strong style="color: ${primaryColor};">$${parseFloat(prod.price).toFixed(2)}</strong></span>
          </label>
        `;
      });

      html += `
          </div>

          <div class="em-bundle-footer">
            <div class="em-bundle-pricing-summary">
              <div class="em-bundle-total-label">Total Bundle Price:</div>
              <div class="em-bundle-prices">
                <span class="em-bundle-final-price" style="color: ${primaryColor};">$${prices.discountedTotal}</span>
                ${
                  parseFloat(prices.savedAmount) > 0
                    ? `<span class="em-bundle-original-price">$${prices.originalTotal}</span>`
                    : ""
                }
              </div>
            </div>

            <button type="button" class="em-bundle-btn" id="em-bundle-add-btn" style="background-color: ${primaryColor};">
              <span class="em-btn-text">${escapeHtml(buttonText)}</span>
            </button>
          </div>
        </div>
      `;

      targetEl.innerHTML = html;
      attachEvents();
    }

    function attachEvents() {
      const checkboxes = targetEl.querySelectorAll(".em-bundle-checkbox");
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", (e) => {
          const target = e.target;
          const prodId = target.getAttribute("data-product-id");
          if (target.checked) {
            const prod = bundle.products.find((p) => p.productId === prodId);
            if (prod && !selectedProducts.some((p) => p.productId === prodId)) {
              selectedProducts.push(prod);
            }
          } else {
            selectedProducts = selectedProducts.filter((p) => p.productId !== prodId);
          }
          renderUI();
        });
      });

      const addBtn = targetEl.querySelector("#em-bundle-add-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          handleAddToCart(selectedProducts, bundle, addBtn);
        });
      }
    }

    renderUI();
  }

  /**
   * AJAX Add-To-Cart and Enterprise Smart Theme Cart Auto-Detection
   */
  function handleAddToCart(products, bundle, btn) {
    if (products.length === 0) {
      alert("Please select at least one product to add to cart.");
      return;
    }

    const originalBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="em-btn-spinner"></span> Adding bundle...`;

    // Fetch variant IDs for selected products
    const fetchVariantPromises = products.map((prod) => {
      const handle = prod.productHandle || getHandleFromGid(prod.productId);
      return fetch(`/products/${handle}.js`)
        .then((res) => res.json())
        .then((pData) => ({
          id: pData.variants[0].id,
          quantity: 1,
        }))
        .catch(() => null);
    });

    Promise.all(fetchVariantPromises)
      .then((items) => {
        const validItems = items.filter(Boolean);

        return fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ items: validItems }),
        });
      })
      .then((res) => res.json())
      .then((cartData) => {
        // Record purchase analytics
        fetch("https://bundle.emonahammed.shop/api/bundles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "record_purchase",
            bundleId: bundle.id,
            revenue: parseFloat(bundle.discountValue) || 0,
          }),
        }).catch(() => {});

        // Dispatch Global Custom Event for custom theme scripts
        window.dispatchEvent(
          new CustomEvent("em_bundle:added_to_cart", {
            detail: { bundle, products, cartData },
          })
        );

        btn.innerHTML = `✓ Bundle Added!`;

        // Trigger Smart Theme Cart Auto-Detection Engine
        setTimeout(() => {
          triggerSmartCartDrawer();
        }, 300);
      })
      .catch((err) => {
        console.error("[EM Bundle] Add to cart error:", err);
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        window.location.href = "/cart";
      });
  }

  /**
   * Enterprise Smart Theme & Cart Auto-Detection Engine
   * Seamlessly opens drawer carts across Dawn, Impulse, Prestige, Debutify, Warehouse, and 3rd-party cart apps.
   */
  function triggerSmartCartDrawer() {
    // 1. Dawn, Sense, Craft, Refresh & Shopify OS 2.0 Native Drawer / Notification
    const cartDrawer = document.querySelector("cart-drawer");
    if (cartDrawer && typeof cartDrawer.open === "function") {
      cartDrawer.open();
      refreshShopifySection("cart-drawer");
      refreshShopifySection("cart-icon-bubble");
      return;
    }

    const cartNotification = document.querySelector("cart-notification");
    if (cartNotification && typeof cartNotification.open === "function") {
      cartNotification.open();
      return;
    }

    // 2. Impulse & Archetype Themes (Motion, Stream, Expanse)
    if (window.theme && window.theme.CartDrawer && typeof window.theme.CartDrawer.open === "function") {
      window.theme.CartDrawer.open();
      return;
    }

    // 3. Prestige, Focal, Warehouse & Maestrooo Themes
    if (document.documentElement && typeof document.documentElement.dispatchEvent === "function") {
      document.documentElement.dispatchEvent(new CustomEvent("theme:cart:open", { bubbles: true }));
      document.documentElement.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true }));
    }

    // 4. Debutify Theme
    if (window.theme && window.theme.cartDrawer && typeof window.theme.cartDrawer.open === "function") {
      window.theme.cartDrawer.open();
      return;
    }

    // 5. Booster Theme
    if (window.BoosterTheme && window.BoosterTheme.CartDrawer) {
      window.BoosterTheme.CartDrawer.open();
      return;
    }

    // 6. 3rd-Party Cart Drawer Apps (UpCart, Slide Cart, Monster Cart, iCart)
    if (window.UpCart && typeof window.UpCart.open === "function") {
      window.UpCart.open();
      return;
    }
    if (window.SLIDECART && typeof window.SLIDECART.open === "function") {
      window.SLIDECART.open();
      return;
    }
    if (window.monsterCart && typeof window.monsterCart.openCartDrawer === "function") {
      window.monsterCart.openCartDrawer();
      return;
    }

    // 7. General Custom Event triggers for theme developers
    document.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true }));
    document.dispatchEvent(new CustomEvent("ajaxCart.afterCartLoad", { bubbles: true }));

    // 8. Fallback: If no AJAX drawer found, navigate smoothly to /cart
    setTimeout(() => {
      window.location.href = "/cart";
    }, 400);
  }

  function refreshShopifySection(sectionId) {
    fetch(`/?section_id=${sectionId}`)
      .then((res) => res.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newEl = doc.querySelector(`.${sectionId}`) || doc.getElementById(sectionId);
        const currentEl = document.querySelector(`.${sectionId}`) || document.getElementById(sectionId);
        if (newEl && currentEl) {
          currentEl.innerHTML = newEl.innerHTML;
        }
      })
      .catch(() => {});
  }

  function getHandleFromGid(gid) {
    if (!gid) return "";
    return gid.replace("gid://shopify/Product/", "");
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
