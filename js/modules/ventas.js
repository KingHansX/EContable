/**
 * Sistema Contable Mónica - Módulo Ventas y Facturación
 * Sistema completo de facturación electrónica
 */

class VentasModule {
    constructor() {
        this.ventas = [];
        this.clientes = [];
        this.productos = [];
        this.currentVenta = null;
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    async init() {
        await this.loadData();
    }

    /**
     * Carga los datos
     */
    async loadData() {
        this.ventas = await db.get('ventas') || [];
        this.clientes = await db.get('clientes') || [];
        this.productos = await db.get('productos', { activo: true }) || [];
    }

    /**
     * Renderiza el módulo
     */
    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="ventas-module">
                <!-- Header -->
                <div class="module-header">
                    <div>
                        <h2>Ventas y Facturación Electrónica</h2>
                        <p class="module-description">Gestiona tus ventas y genera facturas electrónicas SRI</p>
                    </div>
                    <button class="btn btn-primary" id="btnNuevaVenta">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                        </svg>
                        Nueva Factura
                    </button>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Ventas del Mes</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.ventasMes)}</div>
                        <div class="stat-change ${stats.variacion >= 0 ? 'stat-change-positive' : 'stat-change-negative'}">
                            ${stats.variacion >= 0 ? '↑' : '↓'} ${Math.abs(stats.variacion).toFixed(1)}% vs mes anterior
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Facturas</div>
                        <div class="stat-value">${stats.totalFacturas}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Por Cobrar</div>
                        <div class="stat-value text-warning">${Utils.formatCurrency(stats.porCobrar)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">IVA Generado</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.ivaGenerado)}</div>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filters-bar">
                    <div class="filters-row">
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Estado</label>
                            <select class="form-select" id="filterEstado">
                                <option value="">Todos</option>
                                <option value="pagada">Pagadas</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="vencida">Vencidas</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Período</label>
                            <select class="form-select" id="filterPeriodo">
                                <option value="mes">Este mes</option>
                                <option value="trimestre">Este trimestre</option>
                                <option value="año">Este año</option>
                                <option value="todo">Todo</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Cliente</label>
                            <select class="form-select" id="filterCliente">
                                <option value="">Todos los clientes</option>
                                ${this.clientes.map(c => `<option value="${c.id}">${c.razonSocial}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Lista de Ventas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Facturas</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchVentas" placeholder="Buscar factura..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="ventasList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderVentas();
    }

    /**
     * Calcula estadísticas
     */
    calculateStats() {
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
        const anioActual = hoy.getFullYear();

        const ventasMes = this.ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        const ventasMesAnterior = this.ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mesAnterior;
        });

        const totalMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalMesAnterior = ventasMesAnterior.reduce((sum, v) => sum + (v.total || 0), 0);
        const variacion = totalMesAnterior > 0 ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100 : 0;

        const porCobrar = this.ventas
            .filter(v => v.estado === 'pendiente')
            .reduce((sum, v) => sum + (v.total || 0), 0);

        const ivaGenerado = ventasMes.reduce((sum, v) => sum + (v.iva || 0), 0);

        return {
            ventasMes: totalMes,
            totalFacturas: ventasMes.length,
            porCobrar,
            ivaGenerado,
            variacion
        };
    }

    /**
     * Renderiza la lista de ventas
     */
    renderVentas() {
        const container = document.getElementById('ventasList');
        if (!container) return;

        if (this.ventas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                        <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                    </svg>
                    <h3>No hay facturas registradas</h3>
                    <p>Crea tu primera factura para comenzar</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha descendente
        const ventasOrdenadas = [...this.ventas].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Subtotal</th>
                            <th>IVA</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ventasOrdenadas.map(venta => {
            const esVencida = venta.estado === 'pendiente' &&
                venta.fechaVencimiento &&
                new Date(venta.fechaVencimiento) < new Date();

            return `
                                <tr>
                                    <td>${Utils.formatDate(venta.fecha)}</td>
                                    <td><strong>${venta.numeroComprobante}</strong></td>
                                    <td>
                                        <strong>${venta.clienteNombre}</strong><br>
                                        <small class="text-secondary">${venta.clienteIdentificacion}</small>
                                    </td>
                                    <td>${Utils.formatCurrency(venta.subtotal || 0)}</td>
                                    <td>${Utils.formatCurrency(venta.iva || 0)}</td>
                                    <td><strong>${Utils.formatCurrency(venta.total || 0)}</strong></td>
                                    <td>
                                        <span class="status-badge ${esVencida ? 'status-badge-overdue' :
                    venta.estado === 'pagada' ? 'status-badge-paid' : 'status-badge-pending'
                }">
                                            ${esVencida ? 'Vencida' : venta.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn-table-action btn-view" data-id="${venta.id}" title="Ver">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                    <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-print" data-id="${venta.id}" title="Imprimir">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <polyline points="6 9 6 2 18 2 18 9" stroke-width="2"/>
                                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-width="2"/>
                                                    <rect x="6" y="14" width="12" height="8" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            ${venta.estado === 'pendiente' ? `
                                                <button class="btn-table-action btn-pay" data-id="${venta.id}" title="Registrar Pago">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                                                    </svg>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.setupTableActions();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners(container) {
        // Botón nueva venta
        const btnNueva = container.querySelector('#btnNuevaVenta');
        if (btnNueva) {
            btnNueva.addEventListener('click', () => this.showVentaModal());
        }

        // Búsqueda
        const searchInput = container.querySelector('#searchVentas');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterVentas(e.target.value);
            }, 300));
        }

        // Filtros
        const filterEstado = container.querySelector('#filterEstado');
        const filterPeriodo = container.querySelector('#filterPeriodo');
        const filterCliente = container.querySelector('#filterCliente');

        [filterEstado, filterPeriodo, filterCliente].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    /**
     * Configura las acciones de la tabla
     */
    setupTableActions() {
        // Ver
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewVenta(id);
            });
        });

        // Imprimir
        document.querySelectorAll('.btn-print').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.printVenta(id);
            });
        });

        // Registrar pago
        document.querySelectorAll('.btn-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.registerPayment(id);
            });
        });
    }

    /**
     * Muestra el modal de nueva venta
     */
    showVentaModal() {
        const modalContainer = document.getElementById('modalContainer');

        // Inicializar venta actual
        this.currentVenta = {
            fecha: new Date().toISOString().split('T')[0],
            clienteId: null,
            detalles: [],
            subtotal: 0,
            descuento: 0,
            subtotalNeto: 0,
            iva: 0,
            total: 0,
            formaPago: 'Efectivo'
        };

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3>Nueva Factura</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formVenta">
                            <!-- Datos Generales -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Fecha</label>
                                    <input type="date" class="form-input" id="fecha" 
                                           value="${this.currentVenta.fecha}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Cliente</label>
                                    <select class="form-select" id="clienteId" required>
                                        <option value="">Seleccionar cliente...</option>
                                        ${this.clientes.map(c =>
            `<option value="${c.id}">${c.razonSocial} - ${c.identificacion}</option>`
        ).join('')}
                                    </select>
                                </div>
                            </div>

                            <!-- Productos -->
                            <div class="form-group">
                                <label class="form-label">Agregar Producto</label>
                                <div style="display: flex; gap: 12px;">
                                    <select class="form-select" id="productoSelect" style="flex: 1;">
                                        <option value="">Seleccionar producto...</option>
                                        ${this.productos.map(p =>
            `<option value="${p.id}" data-precio="${p.precioVenta}" data-iva="${p.tarifaIVA}">
                                                ${p.nombre} - ${Utils.formatCurrency(p.precioVenta)} (Stock: ${p.stock})
                                            </option>`
        ).join('')}
                                    </select>
                                    <button type="button" class="btn btn-primary" id="btnAgregarProducto">
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            <!-- Tabla de Detalles -->
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
                                    <tbody id="detallesVenta">
                                        <tr>
                                            <td colspan="6" class="text-center text-secondary">
                                                No hay productos agregados
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Totales -->
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px;">
                                <div class="form-row">
                                    <div class="form-group" style="margin: 0;">
                                        <label class="form-label">Forma de Pago</label>
                                        <select class="form-select" id="formaPago">
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Transferencia">Transferencia</option>
                                            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                                            <option value="Crédito">Crédito</option>
                                        </select>
                                    </div>
                                    <div class="form-group" id="diasCreditoGroup" style="margin: 0; display: none;">
                                        <label class="form-label">Días de Crédito</label>
                                        <input type="number" class="form-input" id="diasCredito" 
                                               value="30" min="1" max="180">
                                    </div>
                                </div>
                                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Subtotal:</span>
                                    <strong id="displaySubtotal">$0.00</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>IVA 15%:</span>
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
                        <button class="btn btn-primary btn-save-venta">
                            Guardar Factura
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupVentaModalListeners(modalContainer);
    }

    /**
     * Configura los listeners del modal de venta
     */
    setupVentaModalListeners(modalContainer) {
        // Cerrar modal
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal, .btn-cancel-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
                this.currentVenta = null;
            });
        });

        // Agregar producto
        const btnAgregar = modalContainer.querySelector('#btnAgregarProducto');
        btnAgregar.addEventListener('click', () => this.agregarProducto());

        // Forma de pago
        const formaPagoSelect = modalContainer.querySelector('#formaPago');
        formaPagoSelect.addEventListener('change', (e) => {
            const diasCreditoGroup = modalContainer.querySelector('#diasCreditoGroup');
            diasCreditoGroup.style.display = e.target.value === 'Crédito' ? 'block' : 'none';
        });

        // Guardar venta
        const btnSave = modalContainer.querySelector('.btn-save-venta');
        btnSave.addEventListener('click', () => this.saveVenta());
    }

    /**
     * Agrega un producto al detalle
     */
    agregarProducto() {
        const productoSelect = document.getElementById('productoSelect');
        const productoId = parseInt(productoSelect.value);

        if (!productoId) {
            Utils.showToast('Selecciona un producto', 'warning');
            return;
        }

        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        // Verificar si ya existe
        const existente = this.currentVenta.detalles.find(d => d.productoId === productoId);
        if (existente) {
            existente.cantidad++;
        } else {
            this.currentVenta.detalles.push({
                productoId: producto.id,
                productoNombre: producto.nombre,
                cantidad: 1,
                precioUnitario: producto.precioVenta,
                tarifaIVA: producto.tarifaIVA,
                subtotal: producto.precioVenta
            });
        }

        productoSelect.value = '';
        this.updateDetallesTable();
        this.calculateTotals();
    }

    /**
     * Actualiza la tabla de detalles
     */
    updateDetallesTable() {
        const tbody = document.getElementById('detallesVenta');

        if (this.currentVenta.detalles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-secondary">
                        No hay productos agregados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentVenta.detalles.map((detalle, index) => `
            <tr>
                <td><strong>${detalle.productoNombre}</strong></td>
                <td>
                    <input type="number" class="form-input" style="width: 80px;" 
                           value="${detalle.cantidad}" min="1" 
                           onchange="window.ventasModule.updateCantidad(${index}, this.value)">
                </td>
                <td>${Utils.formatCurrency(detalle.precioUnitario)}</td>
                <td>${detalle.tarifaIVA}%</td>
                <td><strong>${Utils.formatCurrency(detalle.cantidad * detalle.precioUnitario)}</strong></td>
                <td>
                    <button type="button" class="btn-table-action btn-delete" 
                            onclick="window.ventasModule.removeDetalle(${index})" title="Eliminar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Actualiza cantidad de un detalle
     */
    updateCantidad(index, cantidad) {
        const cant = parseInt(cantidad) || 1;
        this.currentVenta.detalles[index].cantidad = cant;
        this.calculateTotals();
    }

    /**
     * Elimina un detalle
     */
    removeDetalle(index) {
        this.currentVenta.detalles.splice(index, 1);
        this.updateDetallesTable();
        this.calculateTotals();
    }

    /**
     * Calcula los totales
     */
    calculateTotals() {
        let subtotal = 0;
        let iva = 0;

        this.currentVenta.detalles.forEach(detalle => {
            const subtotalDetalle = detalle.cantidad * detalle.precioUnitario;
            subtotal += subtotalDetalle;

            if (detalle.tarifaIVA === 15) {
                iva += subtotalDetalle * 0.15;
            }
        });

        this.currentVenta.subtotal = subtotal;
        this.currentVenta.iva = iva;
        this.currentVenta.total = subtotal + iva;

        // Actualizar display
        document.getElementById('displaySubtotal').textContent = Utils.formatCurrency(subtotal);
        document.getElementById('displayIVA').textContent = Utils.formatCurrency(iva);
        document.getElementById('displayTotal').textContent = Utils.formatCurrency(subtotal + iva);
    }

    /**
     * Guarda la venta
     */
    saveVenta() {
        const form = document.getElementById('formVenta');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (this.currentVenta.detalles.length === 0) {
            Utils.showToast('Agrega al menos un producto', 'warning');
            return;
        }

        const clienteId = parseInt(document.getElementById('clienteId').value);
        const cliente = this.clientes.find(c => c.id === clienteId);

        if (!cliente) {
            Utils.showToast('Selecciona un cliente válido', 'error');
            return;
        }

        const formaPago = document.getElementById('formaPago').value;
        const fecha = document.getElementById('fecha').value;

        // Generar número de comprobante
        const ultimaVenta = this.ventas.length > 0
            ? Math.max(...this.ventas.map(v => {
                const parts = v.numeroComprobante.split('-');
                return parseInt(parts[2]) || 0;
            }))
            : 0;

        const numeroComprobante = Utils.generateComprobanteNumber('001', '001', ultimaVenta + 1);

        // Calcular fecha de vencimiento si es crédito
        let fechaVencimiento = null;
        if (formaPago === 'Crédito') {
            const diasCredito = parseInt(document.getElementById('diasCredito').value) || 30;
            const fechaVenc = new Date(fecha);
            fechaVenc.setDate(fechaVenc.getDate() + diasCredito);
            fechaVencimiento = fechaVenc.toISOString();
        }

        const venta = {
            fecha: new Date(fecha).toISOString(),
            numeroComprobante,
            tipoComprobante: 'Factura',
            clienteId: cliente.id,
            clienteNombre: cliente.razonSocial,
            clienteIdentificacion: cliente.identificacion,
            detalles: this.currentVenta.detalles,
            subtotal: this.currentVenta.subtotal,
            descuento: 0,
            subtotalNeto: this.currentVenta.subtotal,
            tarifaIVA: 15,
            iva: this.currentVenta.iva,
            total: this.currentVenta.total,
            estado: formaPago === 'Crédito' ? 'pendiente' : 'pagada',
            formaPago,
            fechaVencimiento,
            observaciones: document.getElementById('observaciones').value.trim()
        };

        try {
            const ventaGuardada = db.insert('ventas', venta);

            // Generar asiento contable automático
            Utils.generarAsientoVenta(ventaGuardada);

            // Actualizar inventario
            this.currentVenta.detalles.forEach(detalle => {
                const producto = await db.findById('productos', detalle.productoId);
                if (producto) {
                    db.update('productos', producto.id, {
                        stock: (producto.stock || 0) - detalle.cantidad
                    });
                }
            });

            Utils.showToast('Factura creada correctamente', 'success');
            document.getElementById('modalContainer').innerHTML = '';
            this.currentVenta = null;

            await this.loadData();
            this.renderVentas();

            // Actualizar stats
            const container = document.querySelector('.ventas-module');
            if (container) {
                const stats = this.calculateStats();
                const statValues = container.querySelectorAll('.stat-value');
                if (statValues.length >= 4) {
                    statValues[0].textContent = Utils.formatCurrency(stats.ventasMes);
                    statValues[1].textContent = stats.totalFacturas;
                    statValues[2].textContent = Utils.formatCurrency(stats.porCobrar);
                    statValues[3].textContent = Utils.formatCurrency(stats.ivaGenerado);
                }
            }

        } catch (error) {
            Utils.showToast('Error al guardar la factura', 'error');
            console.error(error);
        }
    }

    /**
     * Ver venta
     */
    viewVenta(id) {
        const venta = await db.findById('ventas', id);
        if (!venta) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Factura ${venta.numeroComprobante}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha</label>
                                <p><strong>${Utils.formatDate(venta.fecha)}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Estado</label>
                                <p>
                                    <span class="status-badge ${venta.estado === 'pagada' ? 'status-badge-paid' : 'status-badge-pending'}">
                                        ${venta.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cliente</label>
                            <p><strong>${venta.clienteNombre}</strong><br>
                            <small>${venta.clienteIdentificacion}</small></p>
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
                                        ${(venta.detalles || []).map(d => `
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
                                <strong>${Utils.formatCurrency(venta.subtotal)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>IVA 15%:</span>
                                <strong>${Utils.formatCurrency(venta.iva)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.25rem;">
                                <strong>TOTAL:</strong>
                                <strong>${Utils.formatCurrency(venta.total)}</strong>
                            </div>
                        </div>
                        ${venta.observaciones ? `
                            <div class="form-group" style="margin-top: 16px;">
                                <label class="form-label">Observaciones</label>
                                <p>${venta.observaciones}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                        <button class="btn btn-outline" onclick="window.ventasModule.printVenta(${id})">
                            Imprimir
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
    }

    /**
     * Imprime una venta
     */
    printVenta(id) {
        Utils.showToast('Función de impresión en desarrollo', 'info');
        // TODO: Implementar impresión de factura
    }

    /**
     * Registra un pago
     */
    registerPayment(id) {
        const venta = await db.findById('ventas', id);
        if (!venta) return;

        Utils.confirm(
            `¿Registrar pago de ${Utils.formatCurrency(venta.total)} para la factura ${venta.numeroComprobante}?`,
            () => {
                db.update('ventas', id, { estado: 'pagada' });
                Utils.showToast('Pago registrado correctamente', 'success');
                await this.loadData();
                this.renderVentas();
            }
        );
    }

    /**
     * Filtra ventas
     */
    filterVentas(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.ventas.filter(v =>
            v.numeroComprobante.toLowerCase().includes(lowerQuery) ||
            v.clienteNombre.toLowerCase().includes(lowerQuery) ||
            v.clienteIdentificacion.includes(lowerQuery)
        );

        const temp = this.ventas;
        this.ventas = filtered;
        this.renderVentas();
        this.ventas = temp;
    }

    /**
     * Aplica filtros
     */
    applyFilters() {
        const estado = document.getElementById('filterEstado')?.value;
        const periodo = document.getElementById('filterPeriodo')?.value;
        const clienteId = document.getElementById('filterCliente')?.value;

        let filtered = await db.get('ventas') || [];

        // Filtro de estado
        if (estado) {
            if (estado === 'vencida') {
                filtered = filtered.filter(v =>
                    v.estado === 'pendiente' &&
                    v.fechaVencimiento &&
                    new Date(v.fechaVencimiento) < new Date()
                );
            } else {
                filtered = filtered.filter(v => v.estado === estado);
            }
        }

        // Filtro de período
        if (periodo && periodo !== 'todo') {
            const hoy = new Date();
            filtered = filtered.filter(v => {
                const fecha = new Date(v.fecha);
                if (periodo === 'mes') {
                    return fecha.getMonth() === hoy.getMonth() &&
                        fecha.getFullYear() === hoy.getFullYear();
                } else if (periodo === 'trimestre') {
                    const trimestre = Math.floor(hoy.getMonth() / 3);
                    const trimestreVenta = Math.floor(fecha.getMonth() / 3);
                    return trimestreVenta === trimestre &&
                        fecha.getFullYear() === hoy.getFullYear();
                } else if (periodo === 'año') {
                    return fecha.getFullYear() === hoy.getFullYear();
                }
                return true;
            });
        }

        // Filtro de cliente
        if (clienteId) {
            filtered = filtered.filter(v => v.clienteId === parseInt(clienteId));
        }

        this.ventas = filtered;
        this.renderVentas();
        this.ventas = await db.get('ventas') || [];
    }
}

// Instancia global
window.ventasModule = new VentasModule();
