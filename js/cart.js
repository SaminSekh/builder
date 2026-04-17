/**
 * cart.js - Lightweight E-commerce Cart System
 * Supports Adding items, Sidebar Drawer, and WhatsApp/Telegram Checkout
 */

const Cart = (() => {
    let items = [];
    let isOpen = false;
    let config = {
        whatsapp: '',
        telegram: '',
        currency: '₹',
        cartTitle: 'Your Basket'
    };

    // Initialize from localStorage
    function init() {
        const saved = localStorage.getItem('sf-cart-items');
        if (saved) {
            try { items = JSON.parse(saved); } catch(e) { items = []; }
        }
        
        // Inject Cart CSS if not present
        if (!document.getElementById('sf-cart-styles')) {
            const style = document.createElement('style');
            style.id = 'sf-cart-styles';
            style.textContent = `
                .sf-cart-drawer {
                    position: fixed; top: 0; right: -420px; width: 400px; height: 100%;
                    background: #fff; box-shadow: -10px 0 30px rgba(0,0,0,0.15);
                    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 10000;
                    display: flex; flex-direction: column; font-family: 'Inter', sans-serif;
                }
                .sf-cart-drawer.open { right: 0; }
                .sf-cart-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999;
                    display: none; opacity: 0; transition: opacity 0.3s;
                }
                .sf-cart-overlay.open { display: block; opacity: 1; }
                
                .sf-cart-header { padding: 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
                .sf-cart-header h3 { margin: 0; font-size: 1.4rem; font-weight: 800; color: #111; letter-spacing: -0.5px; }
                .sf-cart-close { cursor: pointer; font-size: 1.8rem; color: #333; border: none; background: none; line-height: 1; transition: transform 0.2s; }
                .sf-cart-close:hover { transform: rotate(90deg); color: #ff4d4d; }
                
                .sf-cart-body { flex: 1; overflow-y: auto; padding: 24px; scrollbar-width: thin; }
                .sf-cart-item { display: flex; gap: 16px; margin-bottom: 24px; position: relative; animation: slideIn 0.3s ease-out; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                
                .sf-cart-item-img { width: 85px; height: 85px; border-radius: 12px; object-fit: cover; background: #f8f9fa; border: 1px solid #eee; }
                .sf-cart-item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
                .sf-cart-item-name { font-weight: 700; font-size: 1rem; color: #111; margin-bottom: 4px; display: block; line-height: 1.3; }
                .sf-cart-item-price { color: #6c63ff; font-weight: 800; font-size: 1.05rem; }
                
                .sf-cart-item-qty { display: flex; align-items: center; gap: 0; margin-top: 10px; background: #f0f2f5; border-radius: 8px; width: fit-content; overflow: hidden; }
                .sf-cart-qty-btn { width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: background 0.2s; }
                .sf-cart-qty-btn:hover { background: #e2e6ea; }
                .sf-cart-qty-val { width: 32px; text-align: center; font-size: 0.95rem; font-weight: 700; }
                
                .sf-cart-item-remove { position: absolute; top: 0; right: 0; color: #ccc; cursor: pointer; border: none; background: none; font-size: 1.1rem; transition: color 0.2s; }
                .sf-cart-item-remove:hover { color: #ff4d4d; }
                
                .sf-cart-footer { padding: 24px; border-top: 1px solid #f0f0f0; background: #fff; }
                .sf-cart-total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem; color: #666; }
                .sf-cart-total-final { font-size: 1.35rem; font-weight: 900; color: #111; margin-top: 15px; border-top: 2px dashed #f0f0f0; padding-top: 15px; }
                
                .sf-cart-checkout-btn { 
                    width: 100%; padding: 18px; border-radius: 12px; border: none; 
                    background: #111; color: #fff; font-weight: 700; font-size: 1.1rem;
                    cursor: pointer; margin-top: 20px; transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .sf-cart-checkout-btn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
                .sf-cart-checkout-btn:active { transform: translateY(0); }
                
                .sf-cart-badge {
                    position: absolute; top: -5px; right: -5px;
                    background: #6c63ff; color: #fff; font-size: 10px; font-weight: 800;
                    min-width: 20px; height: 20px; border-radius: 10px; padding: 0 5px;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                /* Coupons */
                .sf-cart-coupon { display: flex; gap: 8px; margin-bottom: 20px; }
                .sf-cart-coupon input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
                .sf-cart-coupon input:focus { border-color: #6c63ff; }
                .sf-cart-coupon button { padding: 0 16px; border-radius: 8px; border: 1px solid #111; background: #fff; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .sf-cart-coupon button:hover { background: #111; color: #fff; }

                /* Modal */
                .sf-checkout-modal {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);
                    background: #fff; padding: 32px; border-radius: 20px; z-index: 10002;
                    width: 90%; max-width: 480px; display: none; flex-direction: column; gap: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .sf-checkout-modal.open { display: flex; transform: translate(-50%, -50%) scale(1); }
                .sf-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10001; display: none;
                }
                .sf-modal-overlay.open { display: block; }
                .sf-modal-title { font-size: 1.5rem; font-weight: 800; text-align: center; color: #111; margin-bottom: 8px; }
                .sf-modal-subtitle { text-align: center; color: #666; font-size: 0.95rem; margin-top: -15px; margin-bottom: 10px; }
                
                .sf-checkout-options { display: flex; gap: 16px; }
                .sf-checkout-opt {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px;
                    padding: 24px 16px; border: 2px solid #f0f0f0; border-radius: 16px; cursor: pointer; transition: all 0.2s;
                }
                .sf-checkout-opt:hover { border-color: #6c63ff; background: #f9f9ff; transform: translateY(-4px); }
                .sf-checkout-opt.selected { border-color: #2ecc71; background: #f0fff4; box-shadow: 0 8px 20px rgba(46, 204, 113, 0.15); }
                .sf-checkout-opt i { font-size: 2.5rem; }
                .sf-checkout-opt.wa i { color: #25d366; }
                .sf-checkout-opt.tg i { color: #0088cc; }
                .sf-checkout-opt span { font-weight: 700; font-size: 0.95rem; }
                
                .sf-modal-actions { display: flex; gap: 12px; margin-top: 10px; }
                .sf-modal-btn { flex: 1; padding: 15px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
                .sf-btn-cancel { background: #f1f3f5; color: #495057; }
                .sf-btn-cancel:hover { background: #e9ecef; }
                .sf-btn-confirm { background: #6c63ff; color: #fff; box-shadow: 0 4px 15px rgba(108, 99, 255, 0.2); }
                .sf-btn-confirm:hover { background: #5a52d5; transform: translateY(-2px); }

                @media (max-width: 480px) {
                    .sf-cart-drawer { width: 100%; right: -100%; }
                }
            `;
            document.head.appendChild(style);
        }

        // Create Drawer HTML if not present
        if (!document.getElementById('sf-cart-drawer')) {
            const drawer = document.createElement('div');
            drawer.id = 'sf-cart-drawer';
            drawer.className = 'sf-cart-drawer';
            document.body.appendChild(drawer);

            const overlay = document.createElement('div');
            overlay.id = 'sf-cart-overlay';
            overlay.className = 'sf-cart-overlay';
            overlay.onclick = close;
            document.body.appendChild(overlay);

            // Checkout Modal
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'sf-modal-overlay';
            modalOverlay.className = 'sf-modal-overlay';
            document.body.appendChild(modalOverlay);

            const modal = document.createElement('div');
            modal.id = 'sf-checkout-modal';
            modal.className = 'sf-checkout-modal';
            modal.innerHTML = `
                <div class="sf-modal-title">Checkout</div>
                <div class="sf-modal-subtitle">Choose your preferred way to place order</div>
                <div class="sf-checkout-options">
                    <div class="sf-checkout-opt wa" onclick="Cart.setCheckoutTarget('wa')">
                        <i class="fa-brands fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </div>
                    <div class="sf-checkout-opt tg" onclick="Cart.setCheckoutTarget('tg')">
                        <i class="fa-brands fa-telegram"></i>
                        <span>Telegram</span>
                    </div>
                </div>
                <div class="sf-modal-actions">
                    <button class="sf-modal-btn sf-btn-cancel" onclick="Cart.closeModal()">Keep Shopping</button>
                    <button class="sf-modal-btn sf-btn-confirm" onclick="Cart.proceedToSocial()">Place Order</button>
                </div>
            `;
            document.body.appendChild(modal);
        }

        render();
    }

    function setConfig(newConfig) {
        config = { ...config, ...newConfig };
        render(); // update title/currency if changed
    }

    /**
     * Extracts product information from a button's container
     * @param {HTMLElement} btn 
     */
    function extractData(btn) {
        if (!btn) return {};
        // Look for the closest block container
        const container = btn.closest('.canvas-block, section, div[style*="background"], .sf-container, .sf-box-block') || btn.parentElement;
        if (!container) return {};

        const data = {
            name: 'Product',
            price: '0',
            image: ''
        };

        // 1. Find Image
        const img = container.querySelector('img');
        if (img) data.image = img.src;

        // 2. Find Name (Headings or specific classes)
        const heading = container.querySelector('h1, h2, h3, h4, h5, h6, .sf-cart-item-name, [style*="font-weight:700"], [style*="font-weight:800"]');
        if (heading) data.name = heading.innerText;

        // 3. Find Price (Regex search for currency symbols followed by numbers)
        const text = container.innerText;
        const priceMatch = text.match(/[$₹£€]\s?\d+[\d,.]*/);
        if (priceMatch) {
            data.price = priceMatch[0];
        }

        return data;
    }

    function add(item = {}, btn = null) {
        // Auto-extract if missing data
        if (btn && (!item.name || !item.price || !item.image)) {
            const extracted = extractData(btn);
            item.name = item.name || btn.getAttribute('data-name') || extracted.name;
            item.price = item.price || btn.getAttribute('data-price') || extracted.price;
            item.image = item.image || btn.getAttribute('data-image') || extracted.image;
        }

        const itemName = item.name || 'Product';
        const itemPrice = item.price || '0';
        const itemImg = item.image || item.img || '';

        const existing = items.find(i => i.name === itemName);
        if (existing) {
            existing.qty++;
        } else {
            items.push({ name: itemName, price: itemPrice, img: itemImg, qty: 1 });
        }
        localStorage.setItem('sf-cart-items', JSON.stringify(items));
        render();
        open();
    }

    function updateQty(index, delta) {
        items[index].qty += delta;
        if (items[index].qty <= 0) {
            items.splice(index, 1);
        }
        localStorage.setItem('sf-cart-items', JSON.stringify(items));
        render();
    }

    function remove(index) {
        items.splice(index, 1);
        localStorage.setItem('sf-cart-items', JSON.stringify(items));
        render();
    }

    function open() {
        document.getElementById('sf-cart-drawer').classList.add('open');
        document.getElementById('sf-cart-overlay').classList.add('open');
    }

    function close() {
        document.getElementById('sf-cart-drawer').classList.remove('open');
        document.getElementById('sf-cart-overlay').classList.remove('open');
    }

    let selectedTarget = 'wa';
    function setCheckoutTarget(target) {
        selectedTarget = target;
        document.querySelectorAll('.sf-checkout-opt').forEach(el => el.classList.remove('selected'));
        const opt = document.querySelector('.sf-checkout-opt.' + target);
        if (opt) opt.classList.add('selected');
    }

    function showModal() {
        if (items.length === 0) return;
        document.getElementById('sf-checkout-modal').classList.add('open');
        document.getElementById('sf-modal-overlay').classList.add('open');
        setCheckoutTarget('wa');
    }

    function closeModal() {
        document.getElementById('sf-checkout-modal').classList.remove('open');
        document.getElementById('sf-modal-overlay').classList.remove('open');
    }

    function proceedToSocial() {
        const total = items.reduce((sum, item) => {
            const p = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
            return sum + (p * item.qty);
        }, 0);
        
        let message = `🛒 *New Order from Website*\n\n`;
        items.forEach(item => {
            message += `• ${item.name} x${item.qty} - ${item.price}\n`;
        });
        message += `\n💰 *Total: ${config.currency}${total.toLocaleString()}*\n`;

        if (selectedTarget === 'wa') {
            const waUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        } else {
            const tgUrl = `https://t.me/${config.telegram}?text=${encodeURIComponent(message)}`;
            window.open(tgUrl, '_blank');
        }
        closeModal();
    }

    function render() {
        const drawer = document.getElementById('sf-cart-drawer');
        if (!drawer) return;

        const subtotal = items.reduce((sum, item) => {
            const p = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
            return sum + (p * item.qty);
        }, 0);
        
        drawer.innerHTML = `
            <div class="sf-cart-header">
                <h3>${config.cartTitle}</h3>
                <button class="sf-cart-close" onclick="Cart.close()">&times;</button>
            </div>
            <div class="sf-cart-body">
                ${items.length === 0 ? '<div style="text-align:center;padding-top:80px;color:#ccc;"><i class="fa-solid fa-basket-shopping fa-4x" style="margin-bottom:20px;opacity:0.2;"></i><p style="font-size:1.1rem;font-weight:600;">Your basket is empty</p></div>' : ''}
                ${items.map((item, i) => `
                    <div class="sf-cart-item">
                        <img src="${item.img}" class="sf-cart-item-img" onerror="this.src='https://placehold.co/100x100?text=Product'"/>
                        <div class="sf-cart-item-info">
                            <div>
                                <span class="sf-cart-item-name">${item.name}</span>
                                <span class="sf-cart-item-price">${item.price}</span>
                            </div>
                            <div class="sf-cart-item-qty">
                                <button class="sf-cart-qty-btn" onclick="Cart.updateQty(${i}, -1)">-</button>
                                <span class="sf-cart-qty-val">${item.qty}</span>
                                <button class="sf-cart-qty-btn" onclick="Cart.updateQty(${i}, 1)">+</button>
                            </div>
                        </div>
                        <button class="sf-cart-item-remove" onclick="Cart.remove(${i})"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                `).join('')}
            </div>
            <div class="sf-cart-footer">
                <div class="sf-cart-coupon">
                    <input type="text" placeholder="Promo code">
                    <button>Apply</button>
                </div>
                <div class="sf-cart-total-row">
                    <span>Subtotal</span>
                    <span>${config.currency}${subtotal.toLocaleString()}</span>
                </div>
                <div class="sf-cart-total-row">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                </div>
                <div class="sf-cart-total-row sf-cart-total-final">
                    <span>Total</span>
                    <span>${config.currency}${subtotal.toLocaleString()}</span>
                </div>
                <button class="sf-cart-checkout-btn" onclick="Cart.showModal()">Place Order</button>
            </div>
        `;

        // Update Navbar Badge if exists
        const badges = document.querySelectorAll('.sf-cart-badge');
        const count = items.reduce((sum, item) => sum + item.qty, 0);
        badges.forEach(b => {
            b.textContent = count;
            b.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    return { init, add, updateQty, remove, open, close, setConfig, showModal, closeModal, setCheckoutTarget, proceedToSocial };
})();

// Auto-init
if (typeof window !== 'undefined') {
    window.Cart = Cart;
    document.addEventListener('DOMContentLoaded', () => Cart.init());
}
