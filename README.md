# 🚀 Bundle Pro (EM Bundle) - Enterprise Shopify Bundle App

**Bundle Pro** is a high-performance, full-featured Shopify Bundle & Upsell Application built with **Remix**, **Prisma ORM**, **Shopify Polaris UI**, and **Shopify Online Store 2.0 Theme App Extensions**.

Inspired by industry leaders like **FastBundle**, Bundle Pro enables Shopify merchants to boost Average Order Value (AOV) through automated product bundling, volume discounts, mix-and-match box builders, and real-time live merchant support.

---

## ✨ Key Features & Capabilities

### 📦 1. FastBundle 5-Strategy Bundle Engine
* **Frequently Bought Together (FBT):** Amazon-style bundle recommendations with interactive checkboxes and total savings.
* **Volume Discounts / Quantity Breaks:** Tiered pricing incentives (e.g., *Buy 2 Get 10% OFF, Buy 3 Get 20% OFF*).
* **Mix & Match Box Builder:** Build-your-own custom bundle packages.
* **Buy X Get Y (BOGO):** Buy product X, receive product Y at a discount or free.
* **Simple / Fixed Bundle Kits:** Pre-packaged product bundles sold with fixed price discounts.

### 🎨 2. Storefront Theme App Extension & Enterprise Multi-Theme Engine
* Built with **Online Store 2.0 App Blocks & Global App Embeds**.
* **Zero Theme Modification:** Clean, non-destructive Shopify CDN delivery.
* **Smart Auto-Detection Engine:** Automatically detects and integrates with:
  * Shopify OS 2.0 Native Drawers (Dawn, Sense, Craft, Refresh, Studio, etc.)
  * Premium Themes (Impulse, Prestige, Motion, Focal, Warehouse, Debutify, Booster)
  * 3rd-Party Cart Drawer Apps (UpCart, Slide Cart, Monster Cart, iCart)

### 💬 3. Live Real-Time Merchant Support Desk
* **Merchant In-App Chat Bubble:** Floating Polaris chat widget inside merchant admin.
* **Standalone Support Portal:** Dedicated web inbox at `/admin-inbox` for instant replies.
* **Live Typing Indicators:** Real-time animated `typing...` status with sound notifications.
* **Store Diagnostics & Bundle Inspector:** Real-time view of store domains, active subscriptions, created bundles, and product items.
* **Per-Store Live Custom CSS & JS Injector:** Fix theme spacing, button styles, or inject custom JS hooks for any specific store directly from the admin inbox!

### 📊 4. Advanced Analytics & Subscription Billing
* Real-time tracking of bundle impressions, click-through rates (CTR), orders, and total bundle revenue.
* 4-Tier Subscription plans (Free, Starter, Pro, Elite) with Shopify Billing API integration.
* Full GDPR compliance webhooks (`customers/data_request`, `customers/redact`, `shop/redact`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | Remix / Vite |
| **Backend & ORM** | Node.js (v20+), Prisma ORM |
| **Database** | SQLite (Dev) / PostgreSQL / MySQL |
| **Admin UI** | Shopify Polaris & Shopify App Bridge |
| **Storefront Extension** | Liquid, Vanilla JS, CSS (Shopify Theme App Extension) |
| **Reverse Proxy & SSL** | Caddy v2, Cloudflare SSL |
| **Process Manager** | PM2 Daemon (Port 8080) |

---

## 📁 Repository Directory Structure

```text
├── app/
│   ├── components/
│   │   └── MerchantLiveChat.tsx       # In-app merchant floating support widget
│   ├── models/
│   │   ├── bundle.server.ts           # Bundle CRUD, rules, and settings
│   │   └── chat.server.ts             # Live chat & store diagnostics engine
│   ├── routes/
│   │   ├── app._index.tsx             # Merchant bundle management dashboard
│   │   ├── app.bundles.new.tsx        # 5-strategy bundle creation wizard
│   │   ├── app.bundles.$id.tsx        # Edit existing bundle offers
│   │   ├── app.analytics.tsx          # Revenue & impression analytics
│   │   ├── app.settings.tsx           # Storefront widget visual designer
│   │   ├── app.pricing.tsx            # Subscription plans & billing
│   │   ├── app.admin-chat.tsx         # Embedded App Admin live chat inbox
│   │   ├── admin-inbox.tsx            # Standalone Support & Diagnostic Portal
│   │   ├── api.bundles.ts             # Storefront bundle & analytics API
│   │   └── api.chat.ts                # Real-time chat & typing API
│   ├── shopify.server.ts              # Shopify API authentication & scopes
│   └── root.tsx
├── extensions/
│   └── em-bundle-widget/              # Theme App Extension (OS 2.0)
│       ├── assets/
│       │   ├── bundle_widget.js       # Auto-detection & AJAX cart engine
│       │   └── bundle_widget.css      # Shimmer loaders & widget styles
│       └── blocks/
│           ├── bundle_widget.liquid   # Product page app block
│           └── bundle_embed.liquid    # Automatic global app embed
├── prisma/
│   └── schema.prisma                  # Database models (Bundle, Chat, Settings)
├── ecosystem.config.cjs               # PM2 production process configuration
├── shopify.app.toml                   # Shopify app configuration & GDPR webhooks
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 20+
* Shopify CLI (`npm install -g @shopify/cli@latest`)
* Shopify Partner Account & Development Store

### 2. Installation
```bash
# Clone the repository
git clone git@github.com:EmonAhammed1/bundle-pro.git
cd bundle-pro

# Install dependencies
npm install

# Initialize Database Schema
npx prisma db push
npx prisma generate
```

### 3. Local Development
```bash
# Run local dev server with Shopify CLI
npm run dev
```

### 4. Build & Production Deployment
```bash
# Build Remix client & server bundles
npm run build

# Start production server using PM2
pm2 start ecosystem.config.cjs
```

---

## 📄 License
Private & Proprietary - Built for **EmShop / Emon Ahammed**. All Rights Reserved.
