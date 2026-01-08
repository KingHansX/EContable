/**
 * Sistema Contable Mónica - Módulo Compras
 * Gestión completa de compras y proveedores
 */

class ComprasModule {
    constructor() {
        this.compras = [];
        this.proveedores = [];
        this.productos = [];
        this.currentCompra = null;
        this.init();
    }

    init() {
        this.loadData();
    }

    loadData() {
        this.compras = db.find('compras') || [];
        this.proveedores = db.find('proveedores') || [];
        this.productos = db.find('productos', { activo: true }) || [];
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="compras-module">
                <div class="module-header">
                    <div>
                        <h2>Compras</h2>
                        <p class="module-description">Gestiona tus compras y controla tus cuentas por pagar</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnCargaMasiva">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                <polyline points="17 8 12 3 7 8" stroke-width="2"/>
                                <line x1="12" y1="3" x2="12" y2="15" stroke-width="2"/>
                            </svg>
                            Carga Masiva
                        </button>
                        <button class="btn btn-primary" id="btnNuevaCompra">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nueva Compra
                        </button>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Compras del Mes</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.comprasMes)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Compras</div>
                        <div class="stat-value">${stats.totalCompras}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Por Pagar</div>
                        <div class="stat-value text-warning">${Utils.formatCurrency(stats.porPagar)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">IVA Pagado</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.ivaPagado)}</div>
                    </div>
                </div>

                <div class="filters-bar">
                    <div class="filters-row">
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Estado</label>
                            <select class="form-select" id="filterEstado">
                                <option value="">Todos</option>
                                <option value="pagada">Pagadas</option>
                                <option value="pendiente">Pendientes</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Proveedor</label>
                            <select class="form-select" id="filterProveedor">
                                <option value="">Todos los proveedores</option>
                                ${this.proveedores.map(p => `<option value="${p.id}">${p.razonSocial}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Compras Registradas</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchCompras" placeholder="Buscar compra..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="comprasList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderCompras();
    }

    calculateStats() {
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();

        const comprasMes = this.compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        const totalMes = comprasMes.reduce((sum, c) => sum + (c.total || 0), 0);
        const porPagar = this.compras
            .filter(c => c.estado === 'pendiente')
            .reduce((sum, c) => sum + (c.total || 0), 0);
        const ivaPagado = comprasMes.reduce((sum, c) => sum + (c.iva || 0), 0);

        return {
            comprasMes: totalMes,
            totalCompras: comprasMes.length,
            porPagar,
            ivaPagado
        };
    }

    renderCompras() {
        const container = document.getElementById('comprasList');
        if (!container) return;

        if (this.compras.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke-width="2"/>
                        <line x1="3" y1="6" x2="21" y2="6" stroke-width="2"/>
                    </svg>
                    <h3>No hay compras registradas</h3>
                    <p>Registra tu primera compra para comenzar</p>
                </div>
            `;
            return;
        }

        const comprasOrdenadas = [...this.compras].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Número</th>
                            <th>Proveedor</th>
                            <th>Subtotal</th>
                            <th>IVA</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comprasOrdenadas.map(compra => `
                            <tr>
                                <td>${Utils.formatDate(compra.fecha)}</td>
                                <td><strong>${compra.numeroComprobante}</strong></td>
                                <td>
                                    <strong>${compra.proveedorNombre}</strong><br>
                                    <small class="text-secondary">${compra.proveedorIdentificacion}</small>
                                </td>
                                <td>${Utils.formatCurrency(compra.subtotal || 0)}</td>
                                <td>${Utils.formatCurrency(compra.iva || 0)}</td>
                                <td><strong>${Utils.formatCurrency(compra.total || 0)}</strong></td>
                                <td>
                                    <span class="status-badge ${compra.estado === 'pagada' ? 'status-badge-paid' : 'status-badge-pending'}">
                                        ${compra.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view" data-id="${compra.id}" title="Ver">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        ${compra.estado === 'pendiente' ? `
                                            <button class="btn-table-action btn-pay" data-id="${compra.id}" title="Registrar Pago">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                                                </svg>
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.setupTableActions();
    }

    setupEventListeners(container) {
        const btnNueva = container.querySelector('#btnNuevaCompra');
        if (btnNueva) {
            btnNueva.addEventListener('click', () => this.showCompraModal());
        }

        const btnCargaMasiva = container.querySelector('#btnCargaMasiva');
        if (btnCargaMasiva) {
            btnCargaMasiva.addEventListener('click', () => this.showCargaMasivaModal());
        }

        const searchInput = container.querySelector('#searchCompras');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterCompras(e.target.value);
            }, 300));
        }

        const filterEstado = container.querySelector('#filterEstado');
        const filterProveedor = container.querySelector('#filterProveedor');

        [filterEstado, filterProveedor].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    setupTableActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewCompra(id);
            });
        });

        document.querySelectorAll('.btn-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.registerPayment(id);
            });
        });
    }

    showCompraModal() {
        const modalContainer = document.getElementById('modalContainer');

        this.currentCompra = {
            fecha: new Date().toISOString().split('T')[0],
            proveedorId: null,
            detalles: [],
            subtotal: 0,
            iva: 0,
            total: 0,
            formaPago: 'Transferencia'
        };

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3>Nueva Compra</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formCompra">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Fecha</label>
                                    <input type="date" class="form-input" id="fecha" 
                                           value="${this.currentCompra.fecha}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Proveedor</label>
                                    <select class="form-select" id="proveedorId" required>
                                        <option value="">Seleccionar proveedor...</option>
                                        ${this.proveedores.map(p =>
            `<option value="${p.id}">${p.razonSocial} - ${p.identificacion}</option>`
        ).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Número de Comprobante</label>
                                    <input type="text" class="form-input" id="numeroComprobante" 
                                           placeholder="001-001-000000001" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Tipo de Comprobante</label>
                                    <select class="form-select" id="tipoComprobante">
                                        <option value="Factura">Factura</option>
                                        <option value="Nota de Venta">Nota de Venta</option>
                                        <option value="Liquidación de Compra">Liquidación de Compra</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Agregar Producto</label>
                                <div style="display: flex; gap: 12px;">
                                    <select class="form-select" id="productoSelect" style="flex: 1;">
                                        <option value="">Seleccionar producto...</option>
                                        ${this.productos.map(p =>
            `<option value="${p.id}" data-precio="${p.precioCompra}" data-iva="${p.tarifaIVA}">
                                                ${p.nombre} - ${Utils.formatCurrency(p.precioCompra)}
                                            </option>`
        ).join('')}
                                    </select>
                                    <button type="button" class="btn btn-primary" id="btnAgregarProducto">
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            <div class="table-container" style="margin-bottom: 20px;">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>IVA</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="detallesCompra">
                                        <tr>
                                            <td colspan="6" class="text-center text-secondary">
                                                No hay productos agregados
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
                                <div class="form-group" style="margin: 0 0 16px 0;">
                                    <label class="form-label">Forma de Pago</label>
                                    <select class="form-select" id="formaPago">
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Crédito">Crédito</option>
                                    </select>
                                </div>
                                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Subtotal:</span>
                                    <strong id="displaySubtotal">$0.00</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>IVA 12%:</span>
                                    <strong id="displayIVA">$0.00</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 1.25rem; color: var(--color-primary);">
                                    <strong>TOTAL:</strong>
                                    <strong id="displayTotal">$0.00</strong>
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 16px;">
                                <label class="form-label">Observaciones</label>
                                <textarea class="form-textarea" id="observaciones" 
                                          placeholder="Observaciones adicionales"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-compra">
                            Guardar Compra
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupCompraModalListeners(modalContainer);
    }

    setupCompraModalListeners(modalContainer) {
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal, .btn-cancel-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
                this.currentCompra = null;
            });
        });

        const btnAgregar = modalContainer.querySelector('#btnAgregarProducto');
        btnAgregar.addEventListener('click', () => this.agregarProducto());

        const btnSave = modalContainer.querySelector('.btn-save-compra');
        btnSave.addEventListener('click', () => this.saveCompra());
    }

    agregarProducto() {
        const productoSelect = document.getElementById('productoSelect');
        const productoId = parseInt(productoSelect.value);

        if (!productoId) {
            Utils.showToast('Selecciona un producto', 'warning');
            return;
        }

        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        const existente = this.currentCompra.detalles.find(d => d.productoId === productoId);
        if (existente) {
            existente.cantidad++;
        } else {
            this.currentCompra.detalles.push({
                productoId: producto.id,
                productoNombre: producto.nombre,
                cantidad: 1,
                precioUnitario: producto.precioCompra,
                tarifaIVA: producto.tarifaIVA,
                subtotal: producto.precioCompra
            });
        }

        productoSelect.value = '';
        this.updateDetallesTable();
        this.calculateTotals();
    }

    updateDetallesTable() {
        const tbody = document.getElementById('detallesCompra');

        if (this.currentCompra.detalles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-secondary">
                        No hay productos agregados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentCompra.detalles.map((detalle, index) => `
            <tr>
                <td><strong>${detalle.productoNombre}</strong></td>
                <td>
                    <input type="number" class="form-input" style="width: 80px;" 
                           value="${detalle.cantidad}" min="1" 
                           onchange="window.comprasModule.updateCantidad(${index}, this.value)">
                </td>
                <td>${Utils.formatCurrency(detalle.precioUnitario)}</td>
                <td>${detalle.tarifaIVA}%</td>
                <td><strong>${Utils.formatCurrency(detalle.cantidad * detalle.precioUnitario)}</strong></td>
                <td>
                    <button type="button" class="btn-table-action btn-delete" 
                            onclick="window.comprasModule.removeDetalle(${index})" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateCantidad(index, cantidad) {
        const cant = parseInt(cantidad) || 1;
        this.currentCompra.detalles[index].cantidad = cant;
        this.calculateTotals();
    }

    removeDetalle(index) {
        this.currentCompra.detalles.splice(index, 1);
        this.updateDetallesTable();
        this.calculateTotals();
    }

    calculateTotals() {
        let subtotal = 0;
        let iva = 0;

        this.currentCompra.detalles.forEach(detalle => {
            const subtotalDetalle = detalle.cantidad * detalle.precioUnitario;
            subtotal += subtotalDetalle;

            if (detalle.tarifaIVA === 12) {
                iva += subtotalDetalle * 0.12;
            }
        });

        this.currentCompra.subtotal = subtotal;
        this.currentCompra.iva = iva;
        this.currentCompra.total = subtotal + iva;

        document.getElementById('displaySubtotal').textContent = Utils.formatCurrency(subtotal);
        document.getElementById('displayIVA').textContent = Utils.formatCurrency(iva);
        document.getElementById('displayTotal').textContent = Utils.formatCurrency(subtotal + iva);
    }

    saveCompra() {
        const form = document.getElementById('formCompra');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (this.currentCompra.detalles.length === 0) {
            Utils.showToast('Agrega al menos un producto', 'warning');
            return;
        }

        const proveedorId = parseInt(document.getElementById('proveedorId').value);
        const proveedor = this.proveedores.find(p => p.id === proveedorId);

        if (!proveedor) {
            Utils.showToast('Selecciona un proveedor válido', 'error');
            return;
        }

        const compra = {
            fecha: new Date(document.getElementById('fecha').value).toISOString(),
            numeroComprobante: document.getElementById('numeroComprobante').value.trim(),
            tipoComprobante: document.getElementById('tipoComprobante').value,
            proveedorId: proveedor.id,
            proveedorNombre: proveedor.razonSocial,
            proveedorIdentificacion: proveedor.identificacion,
            detalles: this.currentCompra.detalles,
            subtotal: this.currentCompra.subtotal,
            iva: this.currentCompra.iva,
            total: this.currentCompra.total,
            estado: document.getElementById('formaPago').value === 'Crédito' ? 'pendiente' : 'pagada',
            formaPago: document.getElementById('formaPago').value,
            observaciones: document.getElementById('observaciones').value.trim()
        };

        try {
            const compraGuardada = db.insert('compras', compra);

            // Generar asiento contable automático
            Utils.generarAsientoCompra(compraGuardada);

            // Actualizar inventario
            this.currentCompra.detalles.forEach(detalle => {
                const producto = db.findById('productos', detalle.productoId);
                if (producto) {
                    db.update('productos', producto.id, {
                        stock: (producto.stock || 0) + detalle.cantidad,
                        precioCompra: detalle.precioUnitario
                    });
                }
            });

            Utils.showToast('Compra registrada correctamente', 'success');
            document.getElementById('modalContainer').innerHTML = '';
            this.currentCompra = null;

            this.loadData();
            this.renderCompras();

        } catch (error) {
            Utils.showToast('Error al guardar la compra', 'error');
            console.error(error);
        }
    }

    viewCompra(id) {
        const compra = db.findById('compras', id);
        if (!compra) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Compra ${compra.numeroComprobante}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha</label>
                                <p><strong>${Utils.formatDate(compra.fecha)}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Estado</label>
                                <p>
                                    <span class="status-badge ${compra.estado === 'pagada' ? 'status-badge-paid' : 'status-badge-pending'}">
                                        ${compra.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Proveedor</label>
                            <p><strong>${compra.proveedorNombre}</strong><br>
                            <small>${compra.proveedorIdentificacion}</small></p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Productos</label>
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(compra.detalles || []).map(d => `
                                            <tr>
                                                <td>${d.productoNombre}</td>
                                                <td>${d.cantidad}</td>
                                                <td>${Utils.formatCurrency(d.precioUnitario)}</td>
                                                <td>${Utils.formatCurrency(d.cantidad * d.precioUnitario)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Subtotal:</span>
                                <strong>${Utils.formatCurrency(compra.subtotal)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>IVA 12%:</span>
                                <strong>${Utils.formatCurrency(compra.iva)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.25rem;">
                                <strong>TOTAL:</strong>
                                <strong>${Utils.formatCurrency(compra.total)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });
    }

    registerPayment(id) {
        const compra = db.findById('compras', id);
        if (!compra) return;

        Utils.confirm(
            `¿Registrar pago de ${Utils.formatCurrency(compra.total)} para la compra ${compra.numeroComprobante}?`,
            () => {
                db.update('compras', id, { estado: 'pagada' });
                Utils.showToast('Pago registrado correctamente', 'success');
                this.loadData();
                this.renderCompras();
            }
        );
    }

    filterCompras(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.compras.filter(c =>
            c.numeroComprobante.toLowerCase().includes(lowerQuery) ||
            c.proveedorNombre.toLowerCase().includes(lowerQuery) ||
            c.proveedorIdentificacion.includes(lowerQuery)
        );

        const temp = this.compras;
        this.compras = filtered;
        this.renderCompras();
        this.compras = temp;
    }

    applyFilters() {
        const estado = document.getElementById('filterEstado')?.value;
        const proveedorId = document.getElementById('filterProveedor')?.value;

        let filtered = db.find('compras') || [];

        if (estado) {
            filtered = filtered.filter(c => c.estado === estado);
        }

        if (proveedorId) {
            filtered = filtered.filter(c => c.proveedorId === parseInt(proveedorId));
        }

        this.compras = filtered;
        this.renderCompras();
        this.compras = db.find('compras') || [];
    }

    /**
     * Muestra el modal de carga masiva
     */
    showCargaMasivaModal() {
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Carga Masiva de Compras</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="info-box info-box-info">
                            <h4>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                    <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
                                </svg>
                                Formatos Soportados
                            </h4>
                            <p>Puedes cargar compras desde archivos XML (SRI), TXT, CSV o XLSX.</p>
                            <ul style="margin: 8px 0 0 20px;">
                                <li><strong>XML:</strong> Facturas electrónicas del SRI</li>
                                <li><strong>TXT:</strong> Formato delimitado por pipes (|)</li>
                                <li><strong>CSV:</strong> Valores separados por comas</li>
                                <li><strong>XLSX:</strong> Archivo de Excel</li>
                            </ul>
                        </div>

                        <div class="form-group" style="margin-top: 24px;">
                            <label class="form-label form-label-required">Seleccionar Archivo</label>
                            <input type="file" class="form-input" id="archivoCompras" 
                                   accept=".xml,.txt,.csv,.xlsx" required>
                            <small class="form-help">Formatos: XML, TXT, CSV, XLSX</small>
                        </div>

                        <div id="previewCarga" style="margin-top: 24px; display: none;">
                            <h4>Vista Previa</h4>
                            <div id="previewContent"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cancelar</button>
                        <button class="btn btn-primary" id="btnProcesarCarga">
                            Procesar Archivo
                        </button>
                    </div>
                </div>
            </div>
        `;

        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });

        const fileInput = modalContainer.querySelector('#archivoCompras');
        fileInput.addEventListener('change', (e) => {
            this.previewArchivo(e.target.files[0]);
        });

        const btnProcesar = modalContainer.querySelector('#btnProcesarCarga');
        btnProcesar.addEventListener('click', () => {
            this.procesarCargaMasiva();
        });
    }

    /**
     * Previsualiza el archivo cargado
     */
    async previewArchivo(file) {
        if (!file) return;

        const extension = file.name.split('.').pop().toLowerCase();
        const previewDiv = document.getElementById('previewCarga');
        const previewContent = document.getElementById('previewContent');

        previewDiv.style.display = 'block';
        previewContent.innerHTML = '<p>Procesando archivo...</p>';

        try {
            const text = await file.text();
            let preview = '';

            switch (extension) {
                case 'xml':
                    preview = this.previewXML(text);
                    break;
                case 'txt':
                    preview = this.previewTXT(text);
                    break;
                case 'csv':
                    preview = this.previewCSV(text);
                    break;
                default:
                    preview = '<p>Formato no soportado para vista previa</p>';
            }

            previewContent.innerHTML = preview;
        } catch (error) {
            previewContent.innerHTML = '<p class="text-danger">Error al leer el archivo</p>';
            console.error(error);
        }
    }

    previewXML(text) {
        const lines = text.split('\n').slice(0, 10);
        return `<pre style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; overflow-x: auto;">${lines.join('\n')}</pre>`;
    }

    previewTXT(text) {
        const lines = text.split('\n').filter(l => l.trim()).slice(0, 5);
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Línea</th>
                            <th>Contenido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lines.map((line, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><code>${line}</code></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p><small>Mostrando primeras 5 líneas de ${text.split('\n').length} total</small></p>
        `;
    }

    previewCSV(text) {
        const lines = text.split('\n').filter(l => l.trim()).slice(0, 6);
        const headers = lines[0]?.split(',') || [];
        const rows = lines.slice(1);

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h.trim()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.split(',').map(cell => `<td>${cell.trim()}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p><small>Mostrando primeras 5 filas</small></p>
        `;
    }

    /**
     * Procesa la carga masiva
     */
    async procesarCargaMasiva() {
        const fileInput = document.getElementById('archivoCompras');
        const file = fileInput.files[0];

        if (!file) {
            Utils.showToast('Selecciona un archivo', 'warning');
            return;
        }

        const extension = file.name.split('.').pop().toLowerCase();

        try {
            const text = await file.text();
            let compras = [];

            switch (extension) {
                case 'xml':
                    compras = this.parsearXML(text);
                    break;
                case 'txt':
                    compras = this.parsearTXT(text);
                    break;
                case 'csv':
                    compras = this.parsearCSV(text);
                    break;
                default:
                    Utils.showToast('Formato no soportado', 'error');
                    return;
            }

            if (compras.length === 0) {
                Utils.showToast('No se encontraron compras válidas en el archivo', 'warning');
                return;
            }

            // Guardar compras procesando entidades faltantes
            let guardadas = 0;

            for (const compra of compras) {
                try {
                    // 1. Verificar/Crear Proveedor
                    let proveedor = this.proveedores.find(p => p.identificacion === compra.proveedorIdentificacion);
                    if (!proveedor) {
                        const nuevoProveedor = {
                            identificacion: compra.proveedorIdentificacion,
                            razonSocial: compra.proveedorNombre,
                            nombreComercial: compra.proveedorNombre,
                            direccion: 'Dirección de XML',
                            telefono: '0990000000',
                            email: 'proveedor@xml.com',
                            tipoIdentificacion: compra.proveedorIdentificacion.length === 13 ? 'RUC' : 'Cédula',
                            activo: true
                        };
                        proveedor = db.insert('proveedores', nuevoProveedor);
                        this.proveedores.push(proveedor); // Actualizar caché local
                    }
                    compra.proveedorId = proveedor.id;

                    // 2. Procesar Detalles y Productos
                    compra.detalles = []; // Limpiar para llenar con IDs reales

                    if (compra.rawDetalles) {
                        for (const item of compra.rawDetalles) {
                            // Buscar producto por código
                            let producto = this.productos.find(p => p.codigo === item.codigoXML);

                            if (!producto) {
                                // Crear PRODUCTO NUEVO AUTOMÁTICAMENTE
                                const nuevoProducto = {
                                    codigo: item.codigoXML,
                                    nombre: item.descripcionXML || 'Producto XML',
                                    descripcion: 'Importado desde XML',
                                    categoria: 'General',
                                    unidadMedida: 'Unidad',
                                    precioCompra: item.precioUnitario,
                                    precioVenta: item.precioUnitario * 1.40, // Margen automático 40%
                                    stock: 0, // Se sumará después
                                    stockMinimo: 5,
                                    tarifaIVA: item.tarifaIVA,
                                    activo: true
                                };
                                producto = db.insert('productos', nuevoProducto);
                                this.productos.push(producto);
                            }

                            // Agregar al detalle oficial
                            compra.detalles.push({
                                productoId: producto.id,
                                productoNombre: producto.nombre,
                                cantidad: item.cantidad,
                                precioUnitario: item.precioUnitario,
                                tarifaIVA: item.tarifaIVA,
                                subtotal: item.subtotal
                            });
                        }
                        delete compra.rawDetalles; // Limpiar auxiliar
                    }

                    // 3. Guardar Compra
                    const compraGuardada = db.insert('compras', compra);

                    // 4. Asiento Contable
                    Utils.generarAsientoCompra(compraGuardada);

                    // 5. ACTUALIZAR STOCK INVENTARIO
                    compraGuardada.detalles.forEach(detalle => {
                        const prod = db.findById('productos', detalle.productoId);
                        if (prod) {
                            // Promedio Ponderado para nuevo precio de compra
                            const stockActual = prod.stock || 0;
                            const costoActual = prod.precioCompra || 0;
                            const nuevoStock = stockActual + detalle.cantidad;

                            // Fórmula: ((StockActual * CostoActual) + (CantCompra * CostoCompra)) / NuevoStock
                            let nuevoCosto = costoActual;
                            if (nuevoStock > 0) {
                                nuevoCosto = ((stockActual * costoActual) + (detalle.cantidad * detalle.precioUnitario)) / nuevoStock;
                            }

                            db.update('productos', prod.id, {
                                stock: nuevoStock,
                                precioCompra: parseFloat(nuevoCosto.toFixed(4)) // Guardar con precisión
                            });
                        }
                    });

                    guardadas++;
                } catch (error) {
                    console.error('Error al procesar compra XML:', error);
                }
            }

            Utils.showToast(`${guardadas} compras cargadas correctamente`, 'success');
            document.getElementById('modalContainer').innerHTML = '';

            this.loadData();
            this.renderCompras();

        } catch (error) {
            Utils.showToast('Error al procesar el archivo', 'error');
            console.error(error);
        }
    }

    /**
     * Parsea archivo XML (formato SRI)
     */
    /**
     * Parsea archivo XML (formato SRI)
     */
    parsearXML(text) {
        const compras = [];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');

        // Buscar facturas en el XML
        // Nota: Un XML SRI suele tener UNA sola factura, pero por si acaso es un lote:
        const facturas = xmlDoc.querySelectorAll('factura');
        // Si no hay tags 'factura', intentar buscar desde la raiz si es una factura individual
        const docs = facturas.length > 0 ? Array.from(facturas) : [xmlDoc];

        for (let doc of docs) {
            const infoTributaria = doc.querySelector('infoTributaria');
            const infoFactura = doc.querySelector('infoFactura');
            const detallesNode = doc.querySelector('detalles');

            if (!infoTributaria || !infoFactura) continue;

            const ruc = this.getNodeText(infoTributaria, 'ruc');
            const razonSocial = this.getNodeText(infoTributaria, 'razonSocial');
            const estab = this.getNodeText(infoTributaria, 'estab') || '001';
            const ptoEmi = this.getNodeText(infoTributaria, 'ptoEmi') || '001';
            const secuencial = this.getNodeText(infoTributaria, 'secuencial') || '000000001';
            const numeroComprobante = `${estab}-${ptoEmi}-${secuencial}`;

            const fecha = this.getNodeText(infoFactura, 'fechaEmision');
            const totalSinImpuestos = parseFloat(this.getNodeText(infoFactura, 'totalSinImpuestos') || 0);
            const importeTotal = parseFloat(this.getNodeText(infoFactura, 'importeTotal') || 0);

            // Parsear detalles
            const detalles = [];
            if (detallesNode) {
                const items = detallesNode.querySelectorAll('detalle');
                items.forEach(item => {
                    const codigo = this.getNodeText(item, 'codigoPrincipal') || this.getNodeText(item, 'codigoAuxiliar') || 'SIN-CODIGO';
                    const descripcion = this.getNodeText(item, 'descripcion');
                    const cantidad = parseFloat(this.getNodeText(item, 'cantidad') || 0);
                    const precioUnitario = parseFloat(this.getNodeText(item, 'precioUnitario') || 0);

                    // Calcular IVA del item si es posible
                    let tarifaIVA = 0;
                    const impuestos = item.querySelectorAll('impuesto');
                    impuestos.forEach(imp => {
                        // Código 2 es IVA, Tarifa 2 es 12% (histórico) o actual según tabla
                        // Simplificación: si tarifa es > 0 asumimos 12, sino 0
                        const tarifa = parseFloat(this.getNodeText(imp, 'tarifa') || 0);
                        if (tarifa > 0) tarifaIVA = 12; // Asumir 12% estándar por defecto si hay impuesto
                    });

                    detalles.push({
                        codigoXML: codigo,
                        descripcionXML: descripcion,
                        cantidad: cantidad,
                        precioUnitario: precioUnitario,
                        tarifaIVA: tarifaIVA,
                        subtotal: cantidad * precioUnitario
                    });
                });
            }

            compras.push({
                fecha: this.convertirFechaSRI(fecha),
                numeroComprobante,
                tipoComprobante: 'Factura',
                proveedorIdentificacion: ruc,
                proveedorNombre: razonSocial, // Para creación automática
                rawDetalles: detalles, // Detalles crudos para procesar después
                subtotal: totalSinImpuestos,
                iva: importeTotal - totalSinImpuestos,
                total: importeTotal,
                estado: 'pagada',
                formaPago: 'Transferencia',
                observaciones: 'Cargado desde XML SRI'
            });
        }

        return compras;
    }

    getNodeText(parent, tag) {
        return parent.querySelector(tag)?.textContent || '';
    }

    /**
     * Parsea archivo TXT (formato delimitado)
     */
    parsearTXT(text) {
        const compras = [];
        const lines = text.split('\n').filter(l => l.trim());

        lines.forEach(line => {
            const campos = line.split('|');
            if (campos.length < 6) return;

            // Formato: FECHA|RUC|RAZON_SOCIAL|NUMERO|SUBTOTAL|IVA
            compras.push({
                fecha: new Date(campos[0].trim()).toISOString(),
                numeroComprobante: campos[3].trim(),
                tipoComprobante: 'Factura',
                proveedorId: null,
                proveedorNombre: campos[2].trim(),
                proveedorIdentificacion: campos[1].trim(),
                detalles: [],
                subtotal: parseFloat(campos[4].trim()),
                iva: parseFloat(campos[5].trim()),
                total: parseFloat(campos[4].trim()) + parseFloat(campos[5].trim()),
                estado: 'pagada',
                formaPago: 'Transferencia',
                observaciones: 'Cargado desde TXT'
            });
        });

        return compras;
    }

    /**
     * Parsea archivo CSV
     */
    parsearCSV(text) {
        const compras = [];
        const lines = text.split('\n').filter(l => l.trim());

        // Saltar encabezado
        for (let i = 1; i < lines.length; i++) {
            const campos = lines[i].split(',');
            if (campos.length < 6) continue;

            compras.push({
                fecha: new Date(campos[0].trim()).toISOString(),
                numeroComprobante: campos[3].trim(),
                tipoComprobante: 'Factura',
                proveedorId: null,
                proveedorNombre: campos[2].trim(),
                proveedorIdentificacion: campos[1].trim(),
                detalles: [],
                subtotal: parseFloat(campos[4].trim()),
                iva: parseFloat(campos[5].trim()),
                total: parseFloat(campos[4].trim()) + parseFloat(campos[5].trim()),
                estado: 'pagada',
                formaPago: 'Transferencia',
                observaciones: 'Cargado desde CSV'
            });
        }

        return compras;
    }

    /**
     * Convierte fecha del formato SRI (dd/mm/yyyy) a ISO
     */
    convertirFechaSRI(fechaSRI) {
        if (!fechaSRI) return new Date().toISOString();

        const partes = fechaSRI.split('/');
        if (partes.length !== 3) return new Date().toISOString();

        const [dia, mes, anio] = partes;
        return new Date(`${anio}-${mes}-${dia}`).toISOString();
    }
}

window.comprasModule = new ComprasModule();
