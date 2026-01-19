/**
 * EContable - Módulo Contabilidad Completo
 * Gestión de asientos contables, libros y estados financieros
 */

class ContabilidadModule {
    constructor() {
        this.asientos = [];
        this.cuentas = [];
        this.init();
    }

    init() {
        this.loadData();
        this.initializePlanCuentas();
    }

    loadData() {
        this.asientos = db.find('asientos') || [];
        this.cuentas = db.get('planCuentas') || [];
    }

    initializePlanCuentas() {
        if (this.cuentas.length === 0) {
            // Plan de cuentas básico ecuatoriano
            this.cuentas = [
                // ACTIVOS
                { codigo: '1', nombre: 'ACTIVO', tipo: 'Activo', nivel: 1, padre: null },
                { codigo: '1.1', nombre: 'ACTIVO CORRIENTE', tipo: 'Activo', nivel: 2, padre: '1' },
                { codigo: '1.1.01', nombre: 'Caja', tipo: 'Activo', nivel: 3, padre: '1.1' },
                { codigo: '1.1.02', nombre: 'Bancos', tipo: 'Activo', nivel: 3, padre: '1.1' },
                { codigo: '1.1.03', nombre: 'Cuentas por Cobrar Clientes', tipo: 'Activo', nivel: 3, padre: '1.1' },
                { codigo: '1.1.04', nombre: 'IVA Pagado', tipo: 'Activo', nivel: 3, padre: '1.1' },
                { codigo: '1.1.05', nombre: 'Inventario de Mercaderías', tipo: 'Activo', nivel: 3, padre: '1.1' },
                { codigo: '1.2', nombre: 'ACTIVO NO CORRIENTE', tipo: 'Activo', nivel: 2, padre: '1' },
                { codigo: '1.2.01', nombre: 'Muebles y Enseres', tipo: 'Activo', nivel: 3, padre: '1.2' },
                { codigo: '1.2.02', nombre: 'Equipos de Computación', tipo: 'Activo', nivel: 3, padre: '1.2' },
                { codigo: '1.2.03', nombre: 'Depreciación Acumulada', tipo: 'Activo', nivel: 3, padre: '1.2' },

                // PASIVOS
                { codigo: '2', nombre: 'PASIVO', tipo: 'Pasivo', nivel: 1, padre: null },
                { codigo: '2.1', nombre: 'PASIVO CORRIENTE', tipo: 'Pasivo', nivel: 2, padre: '2' },
                { codigo: '2.1.01', nombre: 'Cuentas por Pagar Proveedores', tipo: 'Pasivo', nivel: 3, padre: '2.1' },
                { codigo: '2.1.02', nombre: 'IVA Cobrado', tipo: 'Pasivo', nivel: 3, padre: '2.1' },
                { codigo: '2.1.03', nombre: 'Retenciones por Pagar', tipo: 'Pasivo', nivel: 3, padre: '2.1' },
                { codigo: '2.1.04', nombre: 'IESS por Pagar', tipo: 'Pasivo', nivel: 3, padre: '2.1' },

                // PATRIMONIO
                { codigo: '3', nombre: 'PATRIMONIO', tipo: 'Patrimonio', nivel: 1, padre: null },
                { codigo: '3.1', nombre: 'Capital Social', tipo: 'Patrimonio', nivel: 2, padre: '3' },
                { codigo: '3.2', nombre: 'Utilidad del Ejercicio', tipo: 'Patrimonio', nivel: 2, padre: '3' },
                { codigo: '3.3', nombre: 'Utilidades Retenidas', tipo: 'Patrimonio', nivel: 2, padre: '3' },

                // INGRESOS
                { codigo: '4', nombre: 'INGRESOS', tipo: 'Ingreso', nivel: 1, padre: null },
                { codigo: '4.1', nombre: 'INGRESOS OPERACIONALES', tipo: 'Ingreso', nivel: 2, padre: '4' },
                { codigo: '4.1.01', nombre: 'Ventas Tarifa 15%', tipo: 'Ingreso', nivel: 3, padre: '4.1' },
                { codigo: '4.1.02', nombre: 'Ventas Tarifa 0%', tipo: 'Ingreso', nivel: 3, padre: '4.1' },
                { codigo: '4.2', nombre: 'OTROS INGRESOS', tipo: 'Ingreso', nivel: 2, padre: '4' },

                // GASTOS
                { codigo: '5', nombre: 'GASTOS', tipo: 'Gasto', nivel: 1, padre: null },
                { codigo: '5.1', nombre: 'COSTO DE VENTAS', tipo: 'Gasto', nivel: 2, padre: '5' },
                { codigo: '5.1.01', nombre: 'Costo de Ventas', tipo: 'Gasto', nivel: 3, padre: '5.1' },
                { codigo: '5.2', nombre: 'GASTOS ADMINISTRATIVOS', tipo: 'Gasto', nivel: 2, padre: '5' },
                { codigo: '5.2.01', nombre: 'Sueldos y Salarios', tipo: 'Gasto', nivel: 3, padre: '5.2' },
                { codigo: '5.2.02', nombre: 'Servicios Básicos', tipo: 'Gasto', nivel: 3, padre: '5.2' },
                { codigo: '5.2.03', nombre: 'Arriendo', tipo: 'Gasto', nivel: 3, padre: '5.2' },
                { codigo: '5.3', nombre: 'GASTOS FINANCIEROS', tipo: 'Gasto', nivel: 2, padre: '5' },
                { codigo: '5.3.01', nombre: 'Intereses Bancarios', tipo: 'Gasto', nivel: 3, padre: '5.3' }
            ];

            db.set('planCuentas', this.cuentas);
        }
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="contabilidad-module">
                <div class="module-header">
                    <div>
                        <h2>Contabilidad</h2>
                        <p class="module-description">Gestiona asientos contables y estados financieros</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnBalanceComprobacion">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                            </svg>
                            Balance Comprobación
                        </button>
                        <button class="btn btn-outline" id="btnBalanceGeneral">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-width="2"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-width="2"/>
                            </svg>
                            Balance General
                        </button>
                        <button class="btn btn-outline" id="btnEstadoResultados">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 20V10M12 20V4M6 20v-6" stroke-width="2"/>
                            </svg>
                            Estado Resultados
                        </button>
                        <button class="btn btn-outline" id="btnPlanCuentas">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-width="2"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-width="2"/>
                            </svg>
                            Plan de Cuentas
                        </button>
                        <button class="btn btn-outline" id="btnLibroMayor">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke-width="2"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke-width="2"/>
                            </svg>
                            Libro Mayor
                        </button>
                        <button class="btn btn-outline" id="btnLibroDiarioReport">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                                <line x1="16" y1="13" x2="8" y2="13" stroke-width="2"/>
                                <line x1="16" y1="17" x2="8" y2="17" stroke-width="2"/>
                                <polyline points="10 9 9 9 8 9" stroke-width="2"/>
                            </svg>
                            Reporte Diario
                        </button>
                        <button class="btn btn-primary" id="btnNuevoAsiento">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nuevo Asiento
                        </button>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Activos</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.activos)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Pasivos</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.pasivos)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Patrimonio</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.patrimonio)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Asientos del Mes</div>
                        <div class="stat-value">${stats.asientosMes}</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Libro Diario</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchAsientos" placeholder="Buscar asiento..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="asientosList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderAsientos();
    }

    calculateStats() {
        // Calcular balances desde ventas y compras
        const ventas = db.find('ventas') || [];
        const compras = db.find('compras') || [];
        const productos = db.find('productos') || [];

        // Activos
        const inventario = productos.reduce((sum, p) => sum + ((p.stock || 0) * (p.precioCompra || 0)), 0);
        const cuentasPorCobrar = ventas.filter(v => v.estado === 'pendiente').reduce((sum, v) => sum + (v.total || 0), 0);
        const activos = inventario + cuentasPorCobrar;

        // Pasivos
        const cuentasPorPagar = compras.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.total || 0), 0);
        const ivaCobrado = ventas.reduce((sum, v) => sum + (v.iva || 0), 0);
        const pasivos = cuentasPorPagar + ivaCobrado;

        // Patrimonio
        const patrimonio = activos - pasivos;

        const hoy = new Date();
        const asientosMes = this.asientos.filter(a => {
            const fecha = new Date(a.fecha);
            return fecha.getMonth() === hoy.getMonth() &&
                fecha.getFullYear() === hoy.getFullYear();
        }).length;

        return { activos, pasivos, patrimonio, asientosMes };
    }

    renderAsientos() {
        const container = document.getElementById('asientosList');
        if (!container) return;

        if (this.asientos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-width="2"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-width="2"/>
                    </svg>
                    <h3>No hay asientos contables</h3>
                    <p>Los asientos se generan automáticamente desde ventas y compras</p>
                </div>
            `;
            return;
        }

        const asientosOrdenados = [...this.asientos].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Número</th>
                            <th>Concepto</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${asientosOrdenados.map(asiento => `
                            <tr>
                                <td>${Utils.formatDate(asiento.fecha)}</td>
                                <td><strong>${asiento.numero}</strong></td>
                                <td>${asiento.concepto}</td>
                                <td>${Utils.formatCurrency(asiento.totalDebe || 0)}</td>
                                <td>${Utils.formatCurrency(asiento.totalHaber || 0)}</td>
                                <td>
                                    <span class="status-badge ${asiento.estado === 'Publicado' ? 'status-badge-active' : 'status-badge-inactive'
            }">
                                        ${asiento.estado}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view" data-id="${asiento.id}" title="Ver">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
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
        const btnNuevo = container.querySelector('#btnNuevoAsiento');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showAsientoModal());
        }

        const btnPlan = container.querySelector('#btnPlanCuentas');
        if (btnPlan) {
            btnPlan.addEventListener('click', () => this.showPlanCuentas());
        }

        const btnMayor = container.querySelector('#btnLibroMayor');
        if (btnMayor) {
            btnMayor.addEventListener('click', () => this.showLibroMayor());
        }

        const btnDiarioRep = container.querySelector('#btnLibroDiarioReport');
        if (btnDiarioRep) {
            btnDiarioRep.addEventListener('click', () => this.showLibroDiarioReport());
        }

        const btnBalanceComp = container.querySelector('#btnBalanceComprobacion');
        if (btnBalanceComp) {
            btnBalanceComp.addEventListener('click', () => this.showBalanceComprobacion());
        }

        const btnBalanceGen = container.querySelector('#btnBalanceGeneral');
        if (btnBalanceGen) {
            btnBalanceGen.addEventListener('click', () => this.showBalanceGeneral());
        }

        const btnEstadoRes = container.querySelector('#btnEstadoResultados');
        if (btnEstadoRes) {
            btnEstadoRes.addEventListener('click', () => this.showEstadoResultados());
        }

        const searchInput = container.querySelector('#searchAsientos');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterAsientos(e.target.value);
            }, 300));
        }
    }

    setupTableActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewAsiento(id);
            });
        });
    }

    showAsientoModal() {
        Utils.showToast('Los asientos se generan automáticamente desde ventas y compras', 'info');
    }

    showPlanCuentas() {
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3>Plan de Cuentas - Ecuador</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.cuentas.map(cuenta => `
                                        <tr style="font-weight: ${cuenta.nivel === 1 ? 'bold' : cuenta.nivel === 2 ? '600' : 'normal'};">
                                            <td><strong>${cuenta.codigo}</strong></td>
                                            <td style="padding-left: ${(cuenta.nivel - 1) * 20}px;">${cuenta.nombre}</td>
                                            <td>${cuenta.tipo}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
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

    // CONTINUARÁ EN EL SIGUIENTE MENSAJE...
    showBalanceComprobacion() {
        const ventas = db.find('ventas') || [];
        const compras = db.find('compras') || [];
        const productos = db.find('productos') || [];

        // Calcular saldos por cuenta
        const saldos = this.calcularSaldosCuentas(ventas, compras, productos);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3>Balance de Comprobación</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        ${this.renderBalanceComprobacion(saldos)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="btnExportarBalance">Exportar CSV</button>
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

        const btnExportar = modalContainer.querySelector('#btnExportarBalance');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarBalanceComprobacion(saldos);
            });
        }
    }

    calcularSaldosCuentas(ventas, compras, productos) {
        const saldos = {};

        // Inicializar cuentas
        this.cuentas.forEach(cuenta => {
            if (cuenta.nivel === 3) { // Solo cuentas de detalle
                saldos[cuenta.codigo] = {
                    codigo: cuenta.codigo,
                    nombre: cuenta.nombre,
                    tipo: cuenta.tipo,
                    debe: 0,
                    haber: 0,
                    saldo: 0
                };
            }
        });

        // Inventario
        const valorInventario = productos.reduce((sum, p) =>
            sum + ((p.stock || 0) * (p.precioCompra || 0)), 0
        );
        if (saldos['1.1.05']) {
            saldos['1.1.05'].debe = valorInventario;
            saldos['1.1.05'].saldo = valorInventario;
        }

        // Cuentas por cobrar
        const cxc = ventas.filter(v => v.estado === 'pendiente')
            .reduce((sum, v) => sum + (v.total || 0), 0);
        if (saldos['1.1.03']) {
            saldos['1.1.03'].debe = cxc;
            saldos['1.1.03'].saldo = cxc;
        }

        // Cuentas por pagar
        const cxp = compras.filter(c => c.estado === 'pendiente')
            .reduce((sum, c) => sum + (c.total || 0), 0);
        if (saldos['2.1.01']) {
            saldos['2.1.01'].haber = cxp;
            saldos['2.1.01'].saldo = -cxp;
        }

        // Ventas
        const totalVentas = ventas.reduce((sum, v) => sum + ((v.subtotal || 0)), 0);
        if (saldos['4.1.01']) {
            saldos['4.1.01'].haber = totalVentas;
            saldos['4.1.01'].saldo = -totalVentas;
        }

        // IVA Cobrado
        const ivaCobrado = ventas.reduce((sum, v) => sum + (v.iva || 0), 0);
        if (saldos['2.1.02']) {
            saldos['2.1.02'].haber = ivaCobrado;
            saldos['2.1.02'].saldo = -ivaCobrado;
        }

        // IVA Pagado
        const ivaPagado = compras.reduce((sum, c) => sum + (c.iva || 0), 0);
        if (saldos['1.1.04']) {
            saldos['1.1.04'].debe = ivaPagado;
            saldos['1.1.04'].saldo = ivaPagado;
        }

        // Costo de ventas
        const costoVentas = compras.reduce((sum, c) => sum + ((c.subtotal || 0)), 0);
        if (saldos['5.1.01']) {
            saldos['5.1.01'].debe = costoVentas;
            saldos['5.1.01'].saldo = costoVentas;
        }

        return Object.values(saldos).filter(s => s.debe > 0 || s.haber > 0);
    }

    renderBalanceComprobacion(saldos) {
        const totalDebe = saldos.reduce((sum, s) => sum + s.debe, 0);
        const totalHaber = saldos.reduce((sum, s) => sum + s.haber, 0);

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${saldos.map(s => `
                            <tr>
                                <td><strong>${s.codigo}</strong></td>
                                <td>${s.nombre}</td>
                                <td>${s.debe > 0 ? Utils.formatCurrency(s.debe) : '-'}</td>
                                <td>${s.haber > 0 ? Utils.formatCurrency(s.haber) : '-'}</td>
                                <td class="${s.saldo >= 0 ? 'text-success' : 'text-danger'}">
                                    <strong>${Utils.formatCurrency(Math.abs(s.saldo))}</strong>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--bg-secondary); font-weight: bold;">
                            <td colspan="2">TOTALES</td>
                            <td>${Utils.formatCurrency(totalDebe)}</td>
                            <td>${Utils.formatCurrency(totalHaber)}</td>
                            <td>${Utils.formatCurrency(totalDebe - totalHaber)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    exportarBalanceComprobacion(saldos) {
        const data = [
            ['BALANCE DE COMPROBACIÓN'],
            [`Fecha: ${new Date().toLocaleDateString('es-EC')}`],
            [''],
            ['Código', 'Cuenta', 'Debe', 'Haber', 'Saldo']
        ];

        saldos.forEach(s => {
            data.push([
                s.codigo,
                s.nombre,
                s.debe,
                s.haber,
                s.saldo
            ]);
        });

        const totalDebe = saldos.reduce((sum, s) => sum + s.debe, 0);
        const totalHaber = saldos.reduce((sum, s) => sum + s.haber, 0);

        data.push(['', 'TOTALES', totalDebe, totalHaber, totalDebe - totalHaber]);

        Utils.exportToCSV(data, `Balance_Comprobacion_${new Date().toISOString().split('T')[0]}.csv`);
        Utils.showToast('Balance exportado correctamente', 'success');
    }

    showBalanceGeneral() {
        const ventas = db.find('ventas') || [];
        const compras = db.find('compras') || [];
        const productos = db.find('productos') || [];

        const balance = this.calcularBalanceGeneral(ventas, compras, productos);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3>Balance General</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        ${this.renderBalanceGeneral(balance)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="btnExportarBalanceGen">Exportar CSV</button>
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

    calcularBalanceGeneral(ventas, compras, productos) {
        // ACTIVOS
        const inventario = productos.reduce((sum, p) => sum + ((p.stock || 0) * (p.precioCompra || 0)), 0);
        const cuentasPorCobrar = ventas.filter(v => v.estado === 'pendiente').reduce((sum, v) => sum + (v.total || 0), 0);
        const ivaPagado = compras.reduce((sum, c) => sum + (c.iva || 0), 0);
        const activoCorriente = inventario + cuentasPorCobrar + ivaPagado;

        // PASIVOS
        const cuentasPorPagar = compras.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.total || 0), 0);
        const ivaCobrado = ventas.reduce((sum, v) => sum + (v.iva || 0), 0);
        const pasivoCorriente = cuentasPorPagar + ivaCobrado;

        // PATRIMONIO
        const ingresos = ventas.reduce((sum, v) => sum + (v.subtotal || 0), 0);
        const gastos = compras.reduce((sum, c) => sum + (c.subtotal || 0), 0);
        const utilidad = ingresos - gastos;
        const patrimonio = utilidad;

        const totalActivo = activoCorriente;
        const totalPasivo = pasivoCorriente;
        const totalPatrimonio = patrimonio;

        return {
            activos: {
                corriente: {
                    inventario,
                    cuentasPorCobrar,
                    ivaPagado,
                    total: activoCorriente
                },
                total: totalActivo
            },
            pasivos: {
                corriente: {
                    cuentasPorPagar,
                    ivaCobrado,
                    total: pasivoCorriente
                },
                total: totalPasivo
            },
            patrimonio: {
                utilidad,
                total: totalPatrimonio
            }
        };
    }

    renderBalanceGeneral(balance) {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <!-- ACTIVOS -->
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--color-primary);">ACTIVOS</h4>
                    <div class="table-container">
                        <table class="table">
                            <tbody>
                                <tr style="font-weight: bold;">
                                    <td>ACTIVO CORRIENTE</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">Inventario</td>
                                    <td>${Utils.formatCurrency(balance.activos.corriente.inventario)}</td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">Cuentas por Cobrar</td>
                                    <td>${Utils.formatCurrency(balance.activos.corriente.cuentasPorCobrar)}</td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">IVA Pagado</td>
                                    <td>${Utils.formatCurrency(balance.activos.corriente.ivaPagado)}</td>
                                </tr>
                                <tr style="font-weight: bold; background: var(--bg-secondary);">
                                    <td>TOTAL ACTIVO</td>
                                    <td>${Utils.formatCurrency(balance.activos.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- PASIVOS Y PATRIMONIO -->
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--color-danger);">PASIVOS</h4>
                    <div class="table-container">
                        <table class="table">
                            <tbody>
                                <tr style="font-weight: bold;">
                                    <td>PASIVO CORRIENTE</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">Cuentas por Pagar</td>
                                    <td>${Utils.formatCurrency(balance.pasivos.corriente.cuentasPorPagar)}</td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">IVA Cobrado</td>
                                    <td>${Utils.formatCurrency(balance.pasivos.corriente.ivaCobrado)}</td>
                                </tr>
                                <tr style="font-weight: bold; background: var(--bg-secondary);">
                                    <td>TOTAL PASIVO</td>
                                    <td>${Utils.formatCurrency(balance.pasivos.total)}</td>
                                </tr>
                                <tr style="height: 20px;"><td colspan="2"></td></tr>
                                <tr style="font-weight: bold;">
                                    <td>PATRIMONIO</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style="padding-left: 20px;">Utilidad del Ejercicio</td>
                                    <td class="${balance.patrimonio.utilidad >= 0 ? 'text-success' : 'text-danger'}">
                                        ${Utils.formatCurrency(balance.patrimonio.utilidad)}
                                    </td>
                                </tr>
                                <tr style="font-weight: bold; background: var(--bg-secondary);">
                                    <td>TOTAL PASIVO + PATRIMONIO</td>
                                    <td>${Utils.formatCurrency(balance.pasivos.total + balance.patrimonio.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="info-box info-box-info" style="margin-top: 24px;">
                <h4>Ecuación Contable</h4>
                <p style="font-size: 1.1rem; margin: 8px 0 0 0;">
                    <strong>Activos (${Utils.formatCurrency(balance.activos.total)})</strong> = 
                    <strong>Pasivos (${Utils.formatCurrency(balance.pasivos.total)})</strong> + 
                    <strong>Patrimonio (${Utils.formatCurrency(balance.patrimonio.total)})</strong>
                </p>
            </div>
        `;
    }

    showEstadoResultados() {
        const ventas = db.find('ventas') || [];
        const compras = db.find('compras') || [];

        const estado = this.calcularEstadoResultados(ventas, compras);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Estado de Resultados</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        ${this.renderEstadoResultados(estado)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="btnExportarEstado">Exportar CSV</button>
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

    calcularEstadoResultados(ventas, compras) {
        const ingresos = ventas.reduce((sum, v) => sum + (v.subtotal || 0), 0);
        const costoVentas = compras.reduce((sum, c) => sum + (c.subtotal || 0), 0);
        const utilidadBruta = ingresos - costoVentas;
        const gastosOperacionales = 0; // TODO: Implementar gastos
        const utilidadOperacional = utilidadBruta - gastosOperacionales;
        const gastosFinancieros = 0;
        const utilidadNeta = utilidadOperacional - gastosFinancieros;

        return {
            ingresos,
            costoVentas,
            utilidadBruta,
            gastosOperacionales,
            utilidadOperacional,
            gastosFinancieros,
            utilidadNeta
        };
    }

    renderEstadoResultados(estado) {
        return `
            <div class="table-container">
                <table class="table">
                    <tbody>
                        <tr style="font-weight: bold; background: var(--bg-secondary);">
                            <td>INGRESOS</td>
                            <td>${Utils.formatCurrency(estado.ingresos)}</td>
                        </tr>
                        <tr>
                            <td style="padding-left: 20px;">(-) Costo de Ventas</td>
                            <td>${Utils.formatCurrency(estado.costoVentas)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td>UTILIDAD BRUTA</td>
                            <td class="${estado.utilidadBruta >= 0 ? 'text-success' : 'text-danger'}">
                                ${Utils.formatCurrency(estado.utilidadBruta)}
                            </td>
                        </tr>
                        <tr style="height: 10px;"><td colspan="2"></td></tr>
                        <tr>
                            <td style="padding-left: 20px;">(-) Gastos Operacionales</td>
                            <td>${Utils.formatCurrency(estado.gastosOperacionales)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td>UTILIDAD OPERACIONAL</td>
                            <td class="${estado.utilidadOperacional >= 0 ? 'text-success' : 'text-danger'}">
                                ${Utils.formatCurrency(estado.utilidadOperacional)}
                            </td>
                        </tr>
                        <tr style="height: 10px;"><td colspan="2"></td></tr>
                        <tr>
                            <td style="padding-left: 20px;">(-) Gastos Financieros</td>
                            <td>${Utils.formatCurrency(estado.gastosFinancieros)}</td>
                        </tr>
                        <tr style="font-weight: bold; background: var(--bg-secondary); font-size: 1.1rem;">
                            <td>UTILIDAD NETA</td>
                            <td class="${estado.utilidadNeta >= 0 ? 'text-success' : 'text-danger'}">
                                <strong>${Utils.formatCurrency(estado.utilidadNeta)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${estado.utilidadNeta >= 0 ? `
                <div class="info-box info-box-success" style="margin-top: 24px;">
                    <h4>✅ Resultado Positivo</h4>
                    <p>La empresa generó una utilidad de ${Utils.formatCurrency(estado.utilidadNeta)} en el período.</p>
                </div>
            ` : `
                <div class="info-box info-box-danger" style="margin-top: 24px;">
                    <h4>⚠️ Resultado Negativo</h4>
                    <p>La empresa tuvo una pérdida de ${Utils.formatCurrency(Math.abs(estado.utilidadNeta))} en el período.</p>
                </div>
            `}
        `;
    }

    viewAsiento(id) {
        const asiento = db.findById('asientos', id);
        if (!asiento) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Asiento Contable #${asiento.numero}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <p><strong>${Utils.formatDate(asiento.fecha)}</strong></p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Concepto</label>
                            <p>${asiento.concepto}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Detalles</label>
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Cuenta</th>
                                            <th>Debe</th>
                                            <th>Haber</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(asiento.detalles || []).map(d => `
                                            <tr>
                                                <td>${d.cuentaCodigo} - ${d.cuentaNombre}</td>
                                                <td>${d.debe > 0 ? Utils.formatCurrency(d.debe) : '-'}</td>
                                                <td>${d.haber > 0 ? Utils.formatCurrency(d.haber) : '-'}</td>
                                            </tr>
                                        `).join('')}
                                        <tr style="font-weight: bold; background: var(--bg-secondary);">
                                            <td>TOTALES</td>
                                            <td>${Utils.formatCurrency(asiento.totalDebe)}</td>
                                            <td>${Utils.formatCurrency(asiento.totalHaber)}</td>
                                        </tr>
                                    </tbody>
                                </table>
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

    filterAsientos(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.asientos.filter(a =>
            a.concepto.toLowerCase().includes(lowerQuery) ||
            a.numero.toString().includes(lowerQuery)
        );

        const temp = this.asientos;
        this.asientos = filtered;
        this.renderAsientos();
        this.asientos = temp;
    }

    /**
     * Muestra el modal del Libro Mayor
     */
    showLibroMayor() {
        const modalContainer = document.getElementById('modalContainer');
        const fechaInicioDefault = new Date();
        fechaInicioDefault.setDate(1); // Primer día del mes

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px; height: 90vh; display: flex; flex-direction: column;">
                    <div class="modal-header">
                        <h3>Libro Mayor</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body" style="flex: 1; overflow-y: auto;">
                        <div class="filters-bar" style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                            <div class="filters-row" style="display: flex; gap: 16px; align-items: flex-end;">
                                <div class="form-group" style="margin: 0; flex: 1;">
                                    <label class="form-label">Cuenta Contable</label>
                                    <select class="form-select" id="mayorCuenta">
                                        <option value="">-- Seleccionar Cuenta --</option>
                                        ${this.cuentas.filter(c => c.nivel === 3).map(c =>
            `<option value="${c.codigo}">${c.codigo} - ${c.nombre}</option>`
        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0; width: 150px;">
                                    <label class="form-label">Desde</label>
                                    <input type="date" class="form-input" id="mayorFechaInicio" 
                                           value="${fechaInicioDefault.toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group" style="margin: 0; width: 150px;">
                                    <label class="form-label">Hasta</label>
                                    <input type="date" class="form-input" id="mayorFechaFin" 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <button class="btn btn-primary" id="btnGenerarMayor">
                                    Generar
                                </button>
                            </div>
                        </div>
                        <div id="libroMayorContent">
                            <div class="empty-state" style="padding: 40px;">
                                <p>Selecciona una cuenta y un rango de fechas para visualizar el mayor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal');
        closeButtons.forEach(btn => btn.addEventListener('click', () => modalContainer.innerHTML = ''));

        const btnGenerar = modalContainer.querySelector('#btnGenerarMayor');
        btnGenerar.addEventListener('click', () => {
            const cuentaCodigo = document.getElementById('mayorCuenta').value;
            const fechaInicio = document.getElementById('mayorFechaInicio').value;
            const fechaFin = document.getElementById('mayorFechaFin').value;

            if (!cuentaCodigo) {
                Utils.showToast('Por favor selecciona una cuenta', 'warning');
                return;
            }

            this.generarLibroMayor(cuentaCodigo, fechaInicio, fechaFin);
        });
    }

    /**
     * Genera y renderiza el contenido del Libro Mayor
     */
    generarLibroMayor(cuentaCodigo, fechaInicio, fechaFin) {
        const cuenta = this.cuentas.find(c => c.codigo === cuentaCodigo);
        const start = new Date(fechaInicio);
        start.setHours(0, 0, 0, 0);
        const end = new Date(fechaFin);
        end.setHours(23, 59, 59, 999);

        // Obtener movimientos
        let movimientos = [];
        this.asientos.forEach(asiento => {
            const fechaAsiento = new Date(asiento.fecha);
            if (fechaAsiento >= start && fechaAsiento <= end) {
                asiento.detalles.forEach(detalle => {
                    if (detalle.cuentaCodigo === cuentaCodigo) {
                        movimientos.push({
                            fecha: fechaAsiento,
                            asientoNumero: asiento.numero,
                            asientoId: asiento.id,
                            concepto: asiento.concepto,
                            debe: detalle.debe || 0,
                            haber: detalle.haber || 0
                        });
                    }
                });
            }
        });

        // Ordenar por fecha
        movimientos.sort((a, b) => a.fecha - b.fecha);

        // Renderizar
        const container = document.getElementById('libroMayorContent');

        let saldo = 0;
        let html = `
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0; color: var(--color-primary);">${cuenta.codigo} - ${cuenta.nombre}</h4>
                <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                    Del ${Utils.formatDate(fechaInicio)} al ${Utils.formatDate(fechaFin)}
                </p>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Asiento</th>
                            <th>Concepto</th>
                            <th class="text-right">Debe</th>
                            <th class="text-right">Haber</th>
                            <th class="text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (movimientos.length === 0) {
            html += `<tr><td colspan="6" class="text-center" style="padding: 20px;">No hay movimientos en este período</td></tr>`;
        } else {
            let totalDebe = 0;
            let totalHaber = 0;

            movimientos.forEach(mov => {
                // Cálculo de saldo según naturaleza (simplificado: Activo/Gasto suma Debe, Pasivo/Ingreso/Patrimonio suma Haber)
                // Usaremos lógica contable estándar: Saldo = Saldo Anterior + Debe - Haber
                // Aunque para Pasivos suele mostrarse acreedor, mantendremos criterio matemático Debe-Haber
                saldo += (mov.debe - mov.haber);
                totalDebe += mov.debe;
                totalHaber += mov.haber;

                html += `
                    <tr>
                        <td>${Utils.formatDate(mov.fecha)}</td>
                        <td>
                            <button class="btn-link" onclick="window.contabilidadModule.viewAsiento(${mov.asientoId})" style="background:none; border:none; color:var(--color-primary); cursor:pointer; text-decoration:underline;">
                                #${mov.asientoNumero}
                            </button>
                        </td>
                        <td>${mov.concepto}</td>
                        <td class="text-right">${mov.debe > 0 ? Utils.formatCurrency(mov.debe) : '-'}</td>
                        <td class="text-right">${mov.haber > 0 ? Utils.formatCurrency(mov.haber) : '-'}</td>
                        <td class="text-right" style="font-weight: 600; color: ${saldo >= 0 ? 'var(--text-primary)' : 'var(--color-danger)'}">
                            ${Utils.formatCurrency(saldo)}
                        </td>
                    </tr>
                `;
            });

            html += `
                    <tr style="background: var(--bg-secondary); font-weight: bold;">
                        <td colspan="3" class="text-right">TOTALES</td>
                        <td class="text-right">${Utils.formatCurrency(totalDebe)}</td>
                        <td class="text-right">${Utils.formatCurrency(totalHaber)}</td>
                        <td class="text-right">${Utils.formatCurrency(saldo)}</td>
                    </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button class="btn btn-outline" onclick="window.contabilidadModule.exportarLibroMayor('${cuentaCodigo}', '${fechaInicio}', '${fechaFin}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-right: 8px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                        <polyline points="7 10 12 15 17 10" stroke-width="2"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke-width="2"/>
                    </svg>
                    Exportar a CSV
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Exporta el Libro Mayor a CSV
     */
    exportarLibroMayor(cuentaCodigo, fechaInicio, fechaFin) {
        // ... Lógica similar a generarLibroMayor pero creando array para CSV ...
        // Simplificado para ahorrar espacio en este ejemplo, invocando un toast
        Utils.showToast('Exportando Libro Mayor...', 'info');

        const cuenta = this.cuentas.find(c => c.codigo === cuentaCodigo);
        const start = new Date(fechaInicio); start.setHours(0, 0, 0, 0);
        const end = new Date(fechaFin); end.setHours(23, 59, 59, 999);

        let data = [
            ['LIBRO MAYOR'],
            [`Cuenta: ${cuentaCodigo} - ${cuenta.nombre}`],
            [`Período: ${fechaInicio} al ${fechaFin}`],
            [''],
            ['Fecha', 'Asiento', 'Concepto', 'Debe', 'Haber', 'Saldo']
        ];

        let saldo = 0;
        this.asientos.forEach(asiento => {
            const fechaAsiento = new Date(asiento.fecha);
            if (fechaAsiento >= start && fechaAsiento <= end) {
                asiento.detalles.forEach(detalle => {
                    if (detalle.cuentaCodigo === cuentaCodigo) {
                        saldo += (detalle.debe - detalle.haber);
                        data.push([
                            Utils.formatDate(asiento.fecha),
                            asiento.numero,
                            asiento.concepto,
                            detalle.debe,
                            detalle.haber,
                            saldo.toFixed(2)
                        ]);
                    }
                });
            }
        });

        Utils.exportToCSV(data, `Libro_Mayor_${cuentaCodigo}_${fechaInicio}.csv`);
        Utils.showToast('Libro Mayor exportado correctamente', 'success');
    }

    /**
     * Muestra el reporte de Libro Diario
     */
    showLibroDiarioReport() {
        const modalContainer = document.getElementById('modalContainer');
        const fechaInicioDefault = new Date();
        fechaInicioDefault.setDate(1);

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px; height: 90vh; display: flex; flex-direction: column;">
                    <div class="modal-header">
                        <h3>Reporte Libro Diario</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body" style="flex: 1; overflow-y: auto;">
                        <div class="filters-bar" style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                            <div class="filters-row" style="display: flex; gap: 16px; align-items: flex-end;">
                                <div class="form-group" style="margin: 0; width: 150px;">
                                    <label class="form-label">Desde</label>
                                    <input type="date" class="form-input" id="diarioFechaInicio" 
                                           value="${fechaInicioDefault.toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group" style="margin: 0; width: 150px;">
                                    <label class="form-label">Hasta</label>
                                    <input type="date" class="form-input" id="diarioFechaFin" 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <button class="btn btn-primary" id="btnGenerarDiario">
                                    Generar Reporte
                                </button>
                            </div>
                        </div>
                        <div id="libroDiarioContent">
                            <div class="empty-state" style="padding: 40px;">
                                <p>Selecciona un rango de fechas para generar el Libro Diario.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal');
        closeButtons.forEach(btn => btn.addEventListener('click', () => modalContainer.innerHTML = ''));

        modalContainer.querySelector('#btnGenerarDiario').addEventListener('click', () => {
            const fi = document.getElementById('diarioFechaInicio').value;
            const ff = document.getElementById('diarioFechaFin').value;
            this.generarLibroDiario(fi, ff);
        });
    }

    generarLibroDiario(fechaInicio, fechaFin) {
        const start = new Date(fechaInicio); start.setHours(0, 0, 0, 0);
        const end = new Date(fechaFin); end.setHours(23, 59, 59, 999);

        const asientosFiltrados = this.asientos.filter(a => {
            const f = new Date(a.fecha);
            return f >= start && f <= end;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const container = document.getElementById('libroDiarioContent');

        let html = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Asiento #</th>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th class="text-right">Debe</th>
                            <th class="text-right">Haber</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (asientosFiltrados.length === 0) {
            html += `<tr><td colspan="6" class="text-center" style="padding: 20px;">No hay asientos en este período</td></tr>`;
        } else {
            let granTotalDebe = 0;
            let granTotalHaber = 0;

            asientosFiltrados.forEach(asiento => {
                // Cabecera del asiento
                html += `
                    <tr style="background: var(--bg-tertiary); border-top: 2px solid var(--border-color);">
                        <td style="font-weight:600;">${Utils.formatDate(asiento.fecha)}</td>
                        <td style="font-weight:600;">Asiento #${asiento.numero}</td>
                        <td colspan="4" style="font-style:italic;">${asiento.concepto}</td>
                    </tr>
                `;

                asiento.detalles.forEach(d => {
                    html += `
                        <tr>
                            <td></td>
                            <td></td>
                            <td>${d.cuentaCodigo}</td>
                            <td>${d.cuentaNombre}</td>
                            <td class="text-right">${d.debe > 0 ? Utils.formatCurrency(d.debe) : '-'}</td>
                            <td class="text-right">${d.haber > 0 ? Utils.formatCurrency(d.haber) : '-'}</td>
                        </tr>
                    `;
                    granTotalDebe += (d.debe || 0);
                    granTotalHaber += (d.haber || 0);
                });
            });

            html += `
                <tr style="background: var(--bg-secondary); border-top: 2px solid #000; font-weight: bold; font-size: 1.1em;">
                    <td colspan="4" class="text-right">TOTAL GENERAL</td>
                    <td class="text-right">${Utils.formatCurrency(granTotalDebe)}</td>
                    <td class="text-right">${Utils.formatCurrency(granTotalHaber)}</td>
                </tr>
            `;

            // Verificar cuadre
            if (Math.abs(granTotalDebe - granTotalHaber) > 0.01) {
                html += `
                    <tr>
                        <td colspan="6" class="text-center text-danger" style="padding: 10px; font-weight: bold;">
                            ⚠️ El reporte no cuadra por ${Utils.formatCurrency(Math.abs(granTotalDebe - granTotalHaber))}
                        </td>
                    </tr>
                `;
            }
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                 <button class="btn btn-outline" onclick="window.contabilidadModule.exportarLibroDiario('${fechaInicio}', '${fechaFin}')">
                    Exportar a CSV
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    exportarLibroDiario(fechaInicio, fechaFin) {
        Utils.showToast('Exportando Libro Diario...', 'info');
        // Lógica de exportación simplificada (sigue patrón anterior)
        // ...
        Utils.showToast('Función de exportación de diario simulada', 'success');
    }
}

window.contabilidadModule = new ContabilidadModule();
