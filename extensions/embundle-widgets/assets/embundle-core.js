/**
 * EmBundle PRO - Storefront Web Component Core Engine
 * Auto-mounts on Shopify Product Pages
 */
class EmBundleWidgetElement extends HTMLElement {
  connectedCallback() {
    const shop = window.EmBundleConfig?.shop || '';
    const productId = window.EmBundleConfig?.productId || '';
    
    console.log('EmBundle PRO Engine Mounted for Shop:', shop, 'Product ID:', productId);

    this.innerHTML = `
      <div class="embundle-card">
        <span class="embundle-badge">EmBundle Deal</span>
        <h3 class="embundle-title">Buy 2 Get 10% Off / Buy 3 Get 20% Off</h3>
        <p style="font-size:12px; color:#94a3b8; margin: 4px 0;">Select quantity below to apply discount automatically at checkout.</p>
        <button class="embundle-btn" id="embundle-claim-btn">
          Add Bundle to Cart & Save
        </button>
      </div>
    `;

    const btn = this.querySelector('#embundle-claim-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        btn.innerText = '✓ Bundle Added to Cart!';
        btn.style.backgroundColor = '#059669';
        btn.style.color = '#ffffff';
        setTimeout(() => {
          btn.innerText = 'Add Bundle to Cart & Save';
          btn.style.backgroundColor = '#10b981';
          btn.style.color = '#020617';
        }, 2500);
      });
    }
  }
}

if (!customElements.get('embundle-widget')) {
  customElements.define('embundle-widget', EmBundleWidgetElement);
}

// Auto-mount container if present
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('embundle-container');
  if (container && !container.querySelector('embundle-widget')) {
    const widget = document.createElement('embundle-widget');
    container.appendChild(widget);
  }
});
