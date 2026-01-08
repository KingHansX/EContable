/**
 * EContable - Módulo Cuentas por Cobrar/Pagar
 * Control de vencimientos y gestión de cobros y pagos
 */

class CuentasModule {
    constructor() {
        this.cuentasCobrar = [];
        this.cuentasPagar = [];
        this.init();
    }

    init() {
        this.loadData();
    }

    loadData() {
        // Cargar ventas pendientes (cuentas por cobrar)
        const ventas = db.find('ventas', { estado: 'pendiente' }) || [];
        this.cuentasCobrar = ventas.map(v => ({
            id: v.id,
            tipo: 'cobrar',
            fecha: v.fecha,
            fechaVencimiento: v.fechaVencimiento,
            numero: v.numeroComprobante,
            cliente: v.clienteNombre,
            identificacion: v.clienteIdentificacion,
            monto: v.total,
            estado: this.getEstadoVencimiento(v.fechaVencimiento)
        }));

        // Cargar compras pendientes (cuentas por pagar)
        const compras = db.find('compras', { estado: 'pendiente' }) || [];
        this.cuentasPagar = compras.map(c => ({
            id: c.id,
            tipo: 'pagar',
            fecha: c.fecha,
            fechaVencimiento: c.fechaVencimiento,
            numero: c.numeroComprobante,
            proveedor: c.proveedorNombre,
            identificacion: c.proveedorIdentificacion,
            monto: c.total,
            estado: this.getEstadoVencimiento(c.fechaVencimiento)
        }));
    }

    getEstadoVencimiento(fechaVencimiento) {
        if (!fechaVencimiento) return 'vigente';

        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) return 'vencida';
        if (diasRestantes <= 7) return 'por_vencer';
        return 'vigente';
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="cuentas-module">
                <div class="module-header">
                    <div>
                        <h2>Cuentas por Cobrar/Pagar</h2>
                        <p class="module-description">Control de vencimientos y gestión de cobros y pagos</p>
                    </div>
                </div>

                ${this.renderAlertas()}

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total por Cobrar</div>
                        <div class="stat-value text-success">${Utils.formatCurrency(stats.totalCobrar)}</div>
                        <div class="stat-subtitle">${stats.cantidadCobrar} facturas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total por Pagar</div>
                        <div class="stat-value text-danger">${Utils.formatCurrency(stats.totalPagar)}</div>
                        <div class="stat-subtitle">${stats.cantidadPagar} compras</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Vencidas por Cobrar</div>
                        <div class="stat-value text-warning">${Utils.formatCurrency(stats.vencidasCobrar)}</div>
                        <div class="stat-subtitle">${stats.cantidadVencidasCobrar} facturas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Vencidas por Pagar</div>
                        <div class="stat-value text-warning">${Utils.formatCurrency(stats.vencidasPagar)}</div>
                        <div class="stat-subtitle">${stats.cantidadVencidasPagar} compras</div>
                    </div>
                </div>

                <div class="tabs-container">
                    <div class="tabs-header">
                        <button class="tab-btn active" data-tab="cobrar">
                            Cuentas por Cobrar (${this.cuentasCobrar.length})
                        </button>
                        <button class="tab-btn" data-tab="pagar">
                            Cuentas por Pagar (${this.cuentasPagar.length})
                        </button>
                    </div>
                    <div class="tabs-content">
                        <div class="tab-pane active" id="tab-cobrar">
                            ${this.renderCuentasCobrar()}
                        </div>
                        <div class="tab-pane" id="tab-pagar">
                            ${this.renderCuentasPagar()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
    }

    renderAlertas() {
        const vencidasCobrar = this.cuentasCobrar.filter(c => c.estado === 'vencida');
        const vencidasPagar = this.cuentasPagar.filter(c => c.estado === 'vencida');
        const porVencerCobrar = this.cuentasCobrar.filter(c => c.estado === 'por_vencer');
        const porVencerPagar = this.cuentasPagar.filter(c => c.estado === 'por_vencer');

        if (vencidasCobrar.length === 0 && vencidasPagar.length === 0 &&
            porVencerCobrar.length === 0 && porVencerPagar.length === 0) {
            return '';
        }

        let alertas = '';

        if (vencidasCobrar.length > 0) {
            alertas += `
                <div class="info-box info-box-danger">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                        </svg>
                        Facturas Vencidas por Cobrar
                        <span class="badge badge-ai">IA</span>
                    </h4>
                    <p>${vencidasCobrar.length} factura(s) vencida(s) por un total de ${Utils.formatCurrency(
                vencidasCobrar.reduce((sum, c) => sum + c.monto, 0)
            )}</p>
                </div>
            `;
        }

        if (vencidasPagar.length > 0) {
            alertas += `
                <div class="info-box info-box-danger">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                        </svg>
                        Compras Vencidas por Pagar
                        <span class="badge badge-ai">IA</span>
                    </h4>
                    <p>${vencidasPagar.length} compra(s) vencida(s) por un total de ${Utils.formatCurrency(
                vencidasPagar.reduce((sum, c) => sum + c.monto, 0)
            )}</p>
                </div>
            `;
        }

        if (porVencerCobrar.length > 0) {
            alertas += `
                <div class="info-box info-box-warning">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                            <path d="M12 6v6l4 2" stroke-width="2"/>
                        </svg>
                        Facturas por Vencer (próximos 7 días)
                    </h4>
                    <p>${porVencerCobrar.length} factura(s) por vencer</p>
                </div>
            `;
        }

        if (porVencerPagar.length > 0) {
            alertas += `
                <div class="info-box info-box-warning">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                            <path d="M12 6v6l4 2" stroke-width="2"/>
                        </svg>
                        Compras por Vencer (próximos 7 días)
                    </h4>
                    <p>${porVencerPagar.length} compra(s) por vencer</p>
                </div>
            `;
        }

        return alertas;
    }

    calculateStats() {
        const totalCobrar = this.cuentasCobrar.reduce((sum, c) => sum + c.monto, 0);
        const totalPagar = this.cuentasPagar.reduce((sum, c) => sum + c.monto, 0);

        const vencidasCobrar = this.cuentasCobrar.filter(c => c.estado === 'vencida');
        const vencidasPagar = this.cuentasPagar.filter(c => c.estado === 'vencida');

        return {
            totalCobrar,
            totalPagar,
            cantidadCobrar: this.cuentasCobrar.length,
            cantidadPagar: this.cuentasPagar.length,
            vencidasCobrar: vencidasCobrar.reduce((sum, c) => sum + c.monto, 0),
            vencidasPagar: vencidasPagar.reduce((sum, c) => sum + c.monto, 0),
            cantidadVencidasCobrar: vencidasCobrar.length,
            cantidadVencidasPagar: vencidasPagar.length
        };
    }

    renderCuentasCobrar() {
        if (this.cuentasCobrar.length === 0) {
            return `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke-width="2"/>
                    </svg>
                    <h3>No hay cuentas por cobrar</h3>
                    <p>Todas las facturas están pagadas</p>
                </div>
            `;
        }

        const ordenadas = [...this.cuentasCobrar].sort((a, b) => {
            if (!a.fechaVencimiento) return 1;
            if (!b.fechaVencimiento) return -1;
            return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
        });

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Factura</th>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordenadas.map(cuenta => {
            const diasVencimiento = cuenta.fechaVencimiento
                ? Math.ceil((new Date(cuenta.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

            return `
                                <tr>
                                    <td>${Utils.formatDate(cuenta.fecha)}</td>
                                    <td><strong>${cuenta.numero}</strong></td>
                                    <td>
                                        <strong>${cuenta.cliente}</strong><br>
                                        <small class="text-secondary">${cuenta.identificacion}</small>
                                    </td>
                                    <td><strong>${Utils.formatCurrency(cuenta.monto)}</strong></td>
                                    <td>
                                        ${cuenta.fechaVencimiento ? Utils.formatDate(cuenta.fechaVencimiento) : 'N/A'}<br>
                                        ${diasVencimiento !== null ? `
                                            <small class="${diasVencimiento < 0 ? 'text-danger' : diasVencimiento <= 7 ? 'text-warning' : 'text-secondary'}">
                                                ${diasVencimiento < 0 ? `Vencida hace ${Math.abs(diasVencimiento)} días` :
                        diasVencimiento === 0 ? 'Vence hoy' :
                            `Vence en ${diasVencimiento} días`}
                                            </small>
                                        ` : ''}
                                    </td>
                                    <td>
                                        <span class="status-badge ${cuenta.estado === 'vencida' ? 'status-badge-overdue' :
                    cuenta.estado === 'por_vencer' ? 'status-badge-pending' :
                        'status-badge-active'
                }">
                                            ${cuenta.estado === 'vencida' ? 'Vencida' :
                    cuenta.estado === 'por_vencer' ? 'Por Vencer' :
                        'Vigente'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-table-action btn-pay" data-id="${cuenta.id}" data-tipo="venta" title="Registrar Cobro">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderCuentasPagar() {
        if (this.cuentasPagar.length === 0) {
            return `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke-width="2"/>
                    </svg>
                    <h3>No hay cuentas por pagar</h3>
                    <p>Todas las compras están pagadas</p>
                </div>
            `;
        }

        const ordenadas = [...this.cuentasPagar].sort((a, b) => {
            if (!a.fechaVencimiento) return 1;
            if (!b.fechaVencimiento) return -1;
            return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
        });

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Compra</th>
                            <th>Proveedor</th>
                            <th>Monto</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordenadas.map(cuenta => {
            const diasVencimiento = cuenta.fechaVencimiento
                ? Math.ceil((new Date(cuenta.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

            return `
                                <tr>
                                    <td>${Utils.formatDate(cuenta.fecha)}</td>
                                    <td><strong>${cuenta.numero}</strong></td>
                                    <td>
                                        <strong>${cuenta.proveedor}</strong><br>
                                        <small class="text-secondary">${cuenta.identificacion}</small>
                                    </td>
                                    <td><strong>${Utils.formatCurrency(cuenta.monto)}</strong></td>
                                    <td>
                                        ${cuenta.fechaVencimiento ? Utils.formatDate(cuenta.fechaVencimiento) : 'N/A'}<br>
                                        ${diasVencimiento !== null ? `
                                            <small class="${diasVencimiento < 0 ? 'text-danger' : diasVencimiento <= 7 ? 'text-warning' : 'text-secondary'}">
                                                ${diasVencimiento < 0 ? `Vencida hace ${Math.abs(diasVencimiento)} días` :
                        diasVencimiento === 0 ? 'Vence hoy' :
                            `Vence en ${diasVencimiento} días`}
                                            </small>
                                        ` : ''}
                                    </td>
                                    <td>
                                        <span class="status-badge ${cuenta.estado === 'vencida' ? 'status-badge-overdue' :
                    cuenta.estado === 'por_vencer' ? 'status-badge-pending' :
                        'status-badge-active'
                }">
                                            ${cuenta.estado === 'vencida' ? 'Vencida' :
                    cuenta.estado === 'por_vencer' ? 'Por Vencer' :
                        'Vigente'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-table-action btn-pay" data-id="${cuenta.id}" data-tipo="compra" title="Registrar Pago">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners(container) {
        // Tabs
        const tabButtons = container.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;

                // Actualizar botones
                tabButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Actualizar contenido
                container.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                container.querySelector(`#tab-${tab}`).classList.add('active');
            });
        });

        // Botones de pago
        setTimeout(() => {
            document.querySelectorAll('.btn-pay').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    const tipo = e.currentTarget.dataset.tipo;
                    this.registrarPago(id, tipo);
                });
            });
        }, 100);
    }

    registrarPago(id, tipo) {
        const tabla = tipo === 'venta' ? 'ventas' : 'compras';
        const registro = db.findById(tabla, id);

        if (!registro) return;

        Utils.confirm(
            `¿Registrar ${tipo === 'venta' ? 'cobro' : 'pago'} de ${Utils.formatCurrency(registro.total)}?`,
            () => {
                db.update(tabla, id, { estado: 'pagada' });
                Utils.showToast(`${tipo === 'venta' ? 'Cobro' : 'Pago'} registrado correctamente`, 'success');

                this.loadData();

                // Re-renderizar el módulo
                const container = document.querySelector('.cuentas-module').parentElement;
                this.render(container);
            }
        );
    }
}

window.cuentasModule = new CuentasModule();
