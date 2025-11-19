// Application State
const state = {
    currentUser: null,
    currentStore: null,
    cart: [],
    orders: [],
    currentOrder: null,
    selectedProduct: null,
    selectedPayment: null,
    appliedCoupon: null
};

// Mock Data
const stores = [
    { id: 1, name: "McDonald's Centro", address: "Av. Corrientes 1234", distance: "1.2 km", phone: "(11) 4567-8900" },
    { id: 2, name: "McDonald's Palermo", address: "Av. Santa Fe 3456", distance: "2.5 km", phone: "(11) 4567-8901" },
    { id: 3, name: "McDonald's Belgrano", address: "Av. Cabildo 2345", distance: "3.8 km", phone: "(11) 4567-8902" }
];

const products = [
    {
        id: 1,
        name: "Big Mac",
        description: "Dos hamburguesas de carne, salsa especial, lechuga, queso, pepinillos y cebolla en pan con semillas de sésamo.",
        price: 2500,
        image: "public/big-mac-hamburger.jpg",
        category: "hamburguesas",
        options: [
            { id: "sauce", name: "Salsa", type: "radio", choices: ["Con salsa", "Sin salsa"] }
        ]
    },
    {
        id: 2,
        name: "Cuarto de Libra",
        description: "Hamburguesa de carne de 125g, queso cheddar, cebolla, pepinillos, ketchup y mostaza.",
        price: 2800,
        image: "public/quarter-pounder-burger.jpg",
        category: "hamburguesas",
        options: [
            { id: "cheese", name: "Queso", type: "radio", choices: ["Con queso", "Sin queso"] }
        ]
    },
    {
        id: 3,
        name: "McNuggets x10",
        description: "10 piezas de nuggets de pollo dorados y crujientes.",
        price: 1800,
        image: "public/chicken-mcnuggets.jpg",
        category: "pollo",
        options: [
            { id: "sauces", name: "Salsas (elige hasta 2)", type: "checkbox", choices: ["BBQ", "Mostaza y Miel", "Agridulce"] }
        ]
    },
    {
        id: 4,
        name: "McFlurry Oreo",
        description: "Helado cremoso con trozos de galleta Oreo.",
        price: 1500,
        image: "public/mcflurry-oreo-ice-cream.jpg",
        category: "postres"
    },
    {
        id: 5,
        name: "Papas Fritas Grandes",
        description: "Papas fritas doradas y crujientes en tamaño grande.",
        price: 1200,
        image: "public/french-fries-large.jpg",
        category: "acompañamientos"
    },
    {
        id: 6,
        name: "Coca-Cola Grande",
        description: "Bebida Coca-Cola tamaño grande.",
        price: 900,
        image: "public/coca-cola-large-cup.jpg",
        category: "bebidas"
    },
    {
        id: 7,
        name: "McCombo Big Mac",
        description: "Big Mac + Papas Grandes + Bebida Grande. ¡Solo disponible en la app!",
        price: 3800,
        image: "public/big-mac-combo-meal.jpg",
        category: "combos",
        isCombo: true
    },
    {
        id: 8,
        name: "McCombo Cuarto de Libra",
        description: "Cuarto de Libra + Papas Grandes + Bebida Grande. ¡Solo disponible en la app!",
        price: 4100,
        image: "public/quarter-pounder-combo-meal.jpg",
        category: "combos",
        isCombo: true
    }
];

const coupons = {
    "MCNAVIDAD": { discount: 0.20, description: "20% de descuento" },
    "HALLOWEEN": { discount: 0.15, description: "15% de descuento" },
    "VERANO2025": { discount: 0.10, description: "10% de descuento" },
    "COMBO50": { discount: 0.50, description: "50% en combos", appliesTo: "combos" }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    hideLoading();
    checkAuth();
});

function hideLoading() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }, 1000);
}

// Auth Functions
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        state.currentUser = JSON.parse(user);
        checkLocation();
    } else {
        showView('auth-view');
    }
}

function toggleAuthForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!email.endsWith('@gmail.com')) {
        showAlert('El email debe terminar en @gmail.com', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const user = { name, email, password };
    localStorage.setItem('currentUser', JSON.stringify(user));
    state.currentUser = user;
    
    showAlert('¡Cuenta creada exitosamente!', 'success');
    
    setTimeout(() => {
        checkLocation();
    }, 1000);
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email.endsWith('@gmail.com')) {
        showAlert('El email debe terminar en @gmail.com', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const user = { name: email.split('@')[0], email, password };
    localStorage.setItem('currentUser', JSON.stringify(user));
    state.currentUser = user;
    
    showAlert('¡Inicio de sesión exitoso!', 'success');
    
    setTimeout(() => {
        checkLocation();
    }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentStore');
    state.currentUser = null;
    state.currentStore = null;
    state.cart = [];
    showView('auth-view');
    showAlert('Sesión cerrada', 'info');
}

// Location Functions
function checkLocation() {
    const hasLocation = localStorage.getItem('locationEnabled');
    if (hasLocation) {
        checkStore();
    } else {
        showView('location-view');
    }
}

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                localStorage.setItem('locationEnabled', 'true');
                showAlert('Ubicación activada correctamente', 'success');
                setTimeout(() => {
                    checkStore();
                }, 1000);
            },
            (error) => {
                localStorage.setItem('locationEnabled', 'true');
                showAlert('Ubicación activada correctamente', 'success');
                setTimeout(() => {
                    checkStore();
                }, 1000);
            }
        );
    } else {
        localStorage.setItem('locationEnabled', 'true');
        showAlert('Ubicación activada correctamente', 'success');
        setTimeout(() => {
            checkStore();
        }, 1000);
    }
}

// Store Functions
function checkStore() {
    const store = localStorage.getItem('currentStore');
    if (store) {
        state.currentStore = JSON.parse(store);
        loadMainApp();
    } else {
        showStoreSelection();
    }
}

function showStoreSelection() {
    showView('store-view');
    const storesList = document.getElementById('stores-list');
    storesList.innerHTML = stores.map(store => `
        <div class="store-card" onclick="selectStore(${store.id})">
            <h3><i class="fas fa-store"></i> ${store.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${store.address}</p>
            <p><i class="fas fa-phone"></i> ${store.phone}</p>
            <span class="store-distance">${store.distance}</span>
        </div>
    `).join('');
}

function selectStore(storeId) {
    const store = stores.find(s => s.id === storeId);
    state.currentStore = store;
    localStorage.setItem('currentStore', JSON.stringify(store));
    showAlert(`Local seleccionado: ${store.name}`, 'success');
    setTimeout(() => {
        loadMainApp();
    }, 1000);
}

function changeStore() {
    showStoreSelection();
}

// Main App Functions
function loadMainApp() {
    showView('main-view');
    document.getElementById('current-store').textContent = state.currentStore.name;
    loadProducts();
    loadOrderHistory();
}

function loadProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">$${product.price}</div>
                    <button class="btn-add" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Product Detail Modal
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    state.selectedProduct = { ...product, quantity: 1, selectedOptions: {} };
    
    document.getElementById('product-modal-title').textContent = product.name;
    document.getElementById('product-modal-image').src = product.image;
    document.getElementById('product-modal-description').textContent = product.description;
    document.getElementById('product-modal-price').textContent = `$${product.price}`;
    document.getElementById('product-quantity').textContent = '1';
    
    const optionsContainer = document.getElementById('product-options');
    if (product.options && product.options.length > 0) {
        optionsContainer.innerHTML = product.options.map(option => `
            <div class="option-group">
                <h4>${option.name}</h4>
                ${option.choices.map((choice, idx) => `
                    <div class="option-item" onclick="selectOption('${option.id}', '${choice}', '${option.type}')">
                        <input type="${option.type}" name="${option.id}" value="${choice}" 
                               ${option.type === 'radio' && idx === 0 ? 'checked' : ''}>
                        <span>${choice}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
        
        product.options.forEach(option => {
            if (option.type === 'radio') {
                state.selectedProduct.selectedOptions[option.id] = option.choices[0];
            }
        });
    } else {
        optionsContainer.innerHTML = '';
    }
    
    showModal('product-modal');
}

function selectOption(optionId, choice, type) {
    if (type === 'radio') {
        state.selectedProduct.selectedOptions[optionId] = choice;
    } else if (type === 'checkbox') {
        if (!state.selectedProduct.selectedOptions[optionId]) {
            state.selectedProduct.selectedOptions[optionId] = [];
        }
        const index = state.selectedProduct.selectedOptions[optionId].indexOf(choice);
        if (index > -1) {
            state.selectedProduct.selectedOptions[optionId].splice(index, 1);
        } else {
            state.selectedProduct.selectedOptions[optionId].push(choice);
        }
    }
}

function increaseQuantity() {
    if (state.selectedProduct.quantity < 20) {
        state.selectedProduct.quantity++;
        document.getElementById('product-quantity').textContent = state.selectedProduct.quantity;
    } else {
        showAlert('No se pueden pedir más de 20 unidades', 'error');
    }
}

function decreaseQuantity() {
    if (state.selectedProduct.quantity > 1) {
        state.selectedProduct.quantity--;
        document.getElementById('product-quantity').textContent = state.selectedProduct.quantity;
    }
}

function addToCartFromModal() {
    addToCart(state.selectedProduct);
    closeProductModal();
    showAlert('Producto agregado al carrito', 'success');
}

function closeProductModal() {
    closeModal('product-modal');
    state.selectedProduct = null;
}

// Cart Functions
function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    addToCart({ ...product, quantity: 1, selectedOptions: {} });
    showAlert('Producto agregado al carrito', 'success');
}

function addToCart(product) {
    const existingIndex = state.cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions)
    );
    
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += product.quantity;
    } else {
        state.cart.push({ ...product });
    }
    
    updateCartCount();
}

function updateCartCount() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function showCart() {
    const cartItems = document.getElementById('cart-items');
    
    if (state.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos para continuar</p>
            </div>
        `;
        document.getElementById('checkout-btn').disabled = true;
    } else {
        cartItems.innerHTML = state.cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${Object.keys(item.selectedOptions).length > 0 ? `
                        <div class="cart-item-options">
                            ${Object.entries(item.selectedOptions).map(([key, value]) => 
                                Array.isArray(value) ? value.join(', ') : value
                            ).join(' • ')}
                        </div>
                    ` : ''}
                    <div class="cart-item-price">$${item.price * item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-quantity" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-quantity" onclick="updateCartQuantity(${index}, 1)">+</button>
                    <button class="btn-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        document.getElementById('checkout-btn').disabled = false;
    }
    
    updateCartSummary();
    showModal('cart-modal');
}

function updateCartQuantity(index, change) {
    state.cart[index].quantity += change;
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    } else if (state.cart[index].quantity > 20) {
        state.cart[index].quantity = 20;
        showAlert('No se pueden pedir más de 20 unidades', 'error');
    }
    updateCartCount();
    showCart();
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartCount();
    showCart();
    showAlert('Producto eliminado del carrito', 'info');
}

function updateCartSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (state.appliedCoupon) {
        const coupon = coupons[state.appliedCoupon];
        if (coupon.appliesTo) {
            const categoryTotal = state.cart
                .filter(item => item.category === coupon.appliesTo)
                .reduce((sum, item) => sum + (item.price * item.quantity), 0);
            discount = categoryTotal * coupon.discount;
        } else {
            discount = subtotal * coupon.discount;
        }
        
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('discount-code').textContent = state.appliedCoupon;
        document.getElementById('cart-discount').textContent = `-$${Math.round(discount)}`;
    } else {
        document.getElementById('discount-row').style.display = 'none';
    }
    
    const total = subtotal - discount;
    
    document.getElementById('cart-subtotal').textContent = `$${subtotal}`;
    document.getElementById('cart-total').textContent = `$${Math.round(total)}`;
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const code = couponInput.value.toUpperCase().trim();
    
    if (!code) {
        showAlert('Ingresa un código de cupón', 'error');
        return;
    }
    
    if (coupons[code]) {
        state.appliedCoupon = code;
        updateCartSummary();
        couponInput.value = '';
        showAlert(`Cupón aplicado: ${coupons[code].description}`, 'success');
    } else {
        showAlert('Código de cupón inválido', 'error');
    }
}

function closeCart() {
    closeModal('cart-modal');
}

// Payment Functions
function proceedToPayment() {
    if (state.cart.length === 0) {
        showAlert('Tu carrito está vacío', 'error');
        return;
    }
    
    const total = calculateTotal();
    document.getElementById('payment-total').textContent = `$${total}`;
    
    closeCart();
    showModal('payment-modal');
}

function calculateTotal() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (state.appliedCoupon) {
        const coupon = coupons[state.appliedCoupon];
        if (coupon.appliesTo) {
            const categoryTotal = state.cart
                .filter(item => item.category === coupon.appliesTo)
                .reduce((sum, item) => sum + (item.price * item.quantity), 0);
            discount = categoryTotal * coupon.discount;
        } else {
            discount = subtotal * coupon.discount;
        }
    }
    
    return Math.round(subtotal - discount);
}

function selectPayment(method) {
    state.selectedPayment = method;
    
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    document.querySelectorAll('.payment-method input[type="radio"]').forEach(radio => {
        radio.checked = radio.value === method;
    });
    
    document.getElementById('confirm-payment-btn').disabled = false;
}

function confirmPayment() {
    if (!state.selectedPayment) {
        showAlert('Selecciona un método de pago', 'error');
        return;
    }
    
    const order = {
        id: Date.now(),
        number: Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString(),
        items: [...state.cart],
        total: calculateTotal(),
        payment: state.selectedPayment,
        coupon: state.appliedCoupon,
        status: 'received',
        store: state.currentStore
    };
    
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    history.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(history));
    
    state.currentOrder = order;
    state.cart = [];
    state.appliedCoupon = null;
    state.selectedPayment = null;
    updateCartCount();
    
    closePayment();
    showAlert('¡Pago confirmado! Tu pedido está en proceso', 'success');
    
    setTimeout(() => {
        showOrderStatus();
        simulateOrderProgress();
    }, 1000);
}

function closePayment() {
    closeModal('payment-modal');
    state.selectedPayment = null;
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('confirm-payment-btn').disabled = true;
}

// Order Status Functions
function showOrderStatus() {
    if (!state.currentOrder) return;
    
    document.getElementById('order-number').textContent = state.currentOrder.number;
    
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step-received').classList.add('active');
    
    document.getElementById('cancel-order-btn').disabled = false;
    
    showModal('order-status-modal');
}

function simulateOrderProgress() {
    setTimeout(() => {
        if (state.currentOrder && state.currentOrder.status === 'received') {
            state.currentOrder.status = 'preparing';
            document.getElementById('step-preparing').classList.add('active');
            updateOrderInHistory();
        }
    }, 5000);
    
    setTimeout(() => {
        if (state.currentOrder && state.currentOrder.status === 'preparing') {
            state.currentOrder.status = 'ready';
            document.getElementById('step-ready').classList.add('active');
            document.getElementById('cancel-order-btn').disabled = true;
            updateOrderInHistory();
            showAlert('¡Tu pedido está listo para retirar!', 'success');
        }
    }, 15000);
}

function updateOrderInHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const index = history.findIndex(o => o.id === state.currentOrder.id);
    if (index > -1) {
        history[index] = state.currentOrder;
        localStorage.setItem('orderHistory', JSON.stringify(history));
    }
}

function cancelOrder() {
    if (state.currentOrder && state.currentOrder.status === 'received') {
        state.currentOrder.status = 'cancelled';
        updateOrderInHistory();
        closeOrderStatus();
        showAlert('Pedido cancelado. El reembolso se procesará en 24-48 horas', 'info');
        state.currentOrder = null;
    } else {
        showAlert('No se puede cancelar el pedido en este momento', 'error');
    }
}

function closeOrderStatus() {
    closeModal('order-status-modal');
}

// History Functions
function loadOrderHistory() {
    state.orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
}

function showHistory() {
    loadOrderHistory();
    const historyList = document.getElementById('history-list');
    
    if (state.orders.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-receipt"></i>
                <h3>No hay pedidos anteriores</h3>
                <p>Tus pedidos aparecerán aquí</p>
            </div>
        `;
    } else {
        historyList.innerHTML = state.orders.map(order => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-number">Pedido #${order.number}</span>
                    <span class="history-date">${new Date(order.date).toLocaleDateString('es-AR')}</span>
                </div>
                <div class="history-items">
                    ${order.items.slice(0, 3).map(item => `
                        <p>${item.quantity}x ${item.name}</p>
                    `).join('')}
                    ${order.items.length > 3 ? `<p>... y ${order.items.length - 3} más</p>` : ''}
                </div>
                <div class="history-footer">
                    <span class="history-total">Total: $${order.total}</span>
                    <span class="history-status ${order.status === 'cancelled' ? 'cancelled' : 'completed'}">
                        ${order.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    showModal('history-modal');
}

function closeHistory() {
    closeModal('history-modal');
}

// Utility Functions
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
