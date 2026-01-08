/**
 * Sistema Contable Mónica - Módulo Punto de Venta (POS)
 * Interfaz optimizada para ventas rápidas de mostrador
 */

class POSModule {
    constructor() {
        this.cart = [];
        this.products = [];
        this.clients = [];
        this.currentClient = null;
        this.init();
    }

    init() {
        // En una app real, esto podría recargarse cada vez que se entra al módulo
    }

    async loadData() {
        try {
            if (db.useBackend) {
                // Cargar productos
                const resProd = await fetch(`${db.apiUrl}/productos`);
                this.products = await resProd.json();

                // Cargar clientes
                const resCli = await fetch(`${db.apiUrl}/personas?tipo=cliente`);
                this.clients = await resCli.json();
            } else {
                this.products = db.find('productos', { activo: true }) || [];
                this.clients = db.find('clientes') || [];
            }
            // Consumidor final por defecto
            this.currentClient = this.clients.find(c => c.identificacion === '9999999999999') || {
                id: 0,
                razonSocial: 'CONSUMIDOR FINAL',
                identificacion: '9999999999999'
            };
        } catch (e) {
            console.error("Error loading POS data", e);
            Utils.showToast("Error cargando datos del POS", "error");
        }
    }

    async render(container) {
        if (!container) return;

        await this.loadData();

        container.innerHTML = `
            <div class="pos-container" style="display: flex; gap: 20px; height: calc(100vh - 140px);">
                <!-- Panel Izquierdo: Catálogo de Productos -->
                <div class="pos-catalog" style="flex: 2; display: flex; flex-direction: column; gap: 15px;">
                    <!-- A -->
                    <div class="card" style="padding: 15px;">
                        <div class="search-bar" style="display: flex; gap: 10px;">
                            <input type="text" id="posSearch" class="form-input" placeholder="🔍 Buscar producto (Código o Nombre)..." style="font-size: 1.2rem;">
                            <button class="btn btn-secondary" onclick="window.posModule.loadData()">🔄</button>
                        </div>
                        <div class="categories-bar" style="display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 5px;">
                            <button class="btn btn-outline btn-sm active">Todos</button>
                            <!-- Categorías dinámicas aquí si las hubiera -->
                        </div>
                    </div>

                    <!-- Grid de Productos -->
                    <div class="products-grid" id="posProductsGrid" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; padding-right: 5px;">
                        ${this.renderProductGrid()}
                    </div>
                </div>

                <!-- Panel Derecho: Carrito y Totales -->
                <div class="pos-cart-panel" style="flex: 1; background: var(--bg-primary); border-radius: var(--border-radius-lg); display: flex; flex-direction: column; border: 1px solid var(--border-color);">
                    <!-- Info Cliente -->
                    <div class="cart-header" style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <h3 style="margin:0;">Venta en Curso</h3>
                            <span class="badge badge-ai" style="font-size: 0.9em;">#POS-${new Date().getTime().toString().slice(-6)}</span>
                        </div>
                        <div class="client-selector" style="display: flex; gap: 5px;">
                            <select id="posClientSelect" class="form-select" onchange="window.posModule.changeClient(this.value)">
                                <option value="0">CONSUMIDOR FINAL</option>
                                ${this.clients.map(c => `<option value="${c.id}">${c.razon_social || c.razonSocial}</option>`).join('')}
                            </select>
                            <button class="btn btn-secondary" title="Nuevo Cliente">+</button>
                        </div>
                    </div>

                    <!-- Lista Items -->
                    <div class="cart-items" id="posCartItems" style="flex: 1; overflow-y: auto; padding: 10px;">
                        ${this.renderCartItems()}
                    </div>

                    <!-- Totales -->
                    <div class="cart-footer" style="padding: 20px; background: var(--bg-tertiary); border-radius: 0 0 12px 12px;">
                        <div class="totals-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Subtotal:</span>
                            <span id="posSubtotal">$0.00</span>
                        </div>
                        <div class="totals-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>IVA (15%):</span>
                            <span id="posIva">$0.00</span>
                        </div>
                        <div class="totals-row" style="display: flex; justify-content: space-between; font-size: 1.5rem; font-weight: bold; color: var(--color-primary); margin-top: 10px;">
                            <span>TOTAL:</span>
                            <span id="posTotal">$0.00</span>
                        </div>
                        
                        <div class="actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-danger" onclick="window.posModule.clearCart()">Cancelar</button>
                            <button class="btn btn-success" style="grid-column: span 2; font-size: 1.2rem; padding: 15px;" onclick="window.posModule.processPayment()">
                                💳 COBRAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupSearchListener();
    }

    renderProductGrid(filter = '') {
        const filtered = this.products.filter(p =>
            p.nombre.toLowerCase().includes(filter.toLowerCase()) ||
            p.codigo.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) return '<p class="text-center" style="grid-column: 1/-1; padding: 20px;">No se encontraron productos</p>';

        return filtered.map(p => `
            <div class="product-card" 
                 onclick="window.posModule.addToCart(${p.id})"
                 style="background: var(--bg-secondary); padding: 10px; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); transition: transform 0.1s; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="height: 80px; background: #333; display: flex; align-items: center; justify-content: center; border-radius: 4px; marginBottom: 5px; color: #fff; font-size: 2em; font-weight: bold;">
                    ${p.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h5 style="margin: 5px 0; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.nombre}</h5>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="text-primary" style="font-weight: bold;">$${parseFloat(p.precio_venta).toFixed(2)}</span>
                        <small class="text-secondary" style="font-size: 0.7em;">Stock: ${p.stock}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCartItems() {
        if (this.cart.length === 0) return '<p class="text-center text-secondary" style="margin-top: 50px;">Carrito vacío</p>';

        return this.cart.map((item, index) => `
            <div class="cart-item" style="display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: center;">
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${item.nombre}</div>
                    <small class="text-secondary">$${item.precio.toFixed(2)} x ${item.cantidad}</small>
                </div>
                <div style="font-weight: bold;">$${(item.precio * item.cantidad).toFixed(2)}</div>
                <button class="btn btn-sm btn-danger" onclick="window.posModule.removeFromCart(${index})" style="padding: 2px 6px;">×</button>
            </div>
        `).join('');
    }

    setupSearchListener() {
        const input = document.getElementById('posSearch');
        if (input) {
            input.addEventListener('input', (e) => {
                const grid = document.getElementById('posProductsGrid');
                grid.innerHTML = this.renderProductGrid(e.target.value);
            });
            input.focus();
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Validar Stock
        const existing = this.cart.find(item => item.id === productId);
        const currentQty = existing ? existing.cantidad : 0;

        if (currentQty + 1 > product.stock) {
            Utils.showToast('Stock insuficiente', 'warning');
            return;
        }

        if (existing) {
            existing.cantidad++;
        } else {
            this.cart.push({
                id: product.id,
                nombre: product.nombre,
                precio: parseFloat(product.precio_venta),
                iva_tarifa: product.tarifa_iva || 15,
                cantidad: 1
            });
        }
        this.updateCartUI();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartUI();
    }

    clearCart() {
        if (confirm("¿Vaciar carrito?")) {
            this.cart = [];
            this.updateCartUI();
        }
    }

    updateCartUI() {
        document.getElementById('posCartItems').innerHTML = this.renderCartItems();
        this.calculateTotals();
    }

    calculateTotals() {
        let subtotal = 0;
        let totalIva = 0;

        this.cart.forEach(item => {
            const itemSubtotal = item.precio * item.cantidad;
            subtotal += itemSubtotal;
            if (item.iva_tarifa > 0) {
                totalIva += itemSubtotal * (item.iva_tarifa / 100);
            }
        });

        const total = subtotal + totalIva;

        document.getElementById('posSubtotal').textContent = Utils.formatCurrency(subtotal);
        document.getElementById('posIva').textContent = Utils.formatCurrency(totalIva);
        document.getElementById('posTotal').textContent = Utils.formatCurrency(total);
    }

    changeClient(clientId) {
        // Lógica para cambiar cliente actual (si es necesario guardar ref)
    }

    async processPayment() {
        if (this.cart.length === 0) {
            Utils.showToast('El carrito está vacío', 'warning');
            return;
        }

        const total = parseFloat(document.getElementById('posTotal').textContent.replace('$', ''));

        if (confirm(`¿Confirmar venta por ${Utils.formatCurrency(total)}?`)) {
            const venta = {
                fecha: new Date().toISOString(),
                cliente_id: document.getElementById('posClientSelect').value,
                detalles: this.cart,
                total: total,
                forma_pago: 'EFECTIVO'
            };

            try {
                if (db.useBackend) {
                    const response = await fetch(`${db.apiUrl}/ventas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(venta)
                    });

                    if (!response.ok) throw new Error('Error en el servidor');

                    const data = await response.json();

                    Utils.showToast(`Venta ${data.numero_comprobante} Registrada!`, 'success');

                    if (data.xml_generado) {
                        if (confirm("¿Descargar XML de Factura Electrónica?")) {
                            this.downloadXML(data.xml_generado, `factura-${data.numero_comprobante}.xml`);
                        }
                    }
                } else {
                    Utils.showToast('Venta local registrada (Sin XML)', 'success');
                }

                this.cart = [];
                this.updateCartUI();
                this.loadData();
            } catch (e) {
                console.error(e);
                Utils.showToast('Error al procesar venta: ' + e.message, 'error');
            }
        }
    }

    downloadXML(content, filename) {
        const blob = new Blob([content], { type: 'text/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Inicializar
window.posModule = new POSModule();
