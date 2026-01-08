/**
 * Sistema Contable Mónica - Aplicación Principal
 */

class App {
    constructor() {
        this.currentModule = 'dashboard';
        this.currentCompany = null;

        // Verificar autenticación antes de inicializar
        if (!this.checkAuth()) {
            return;
        }

        this.init();
    }

    /**
     * Verifica si el usuario está autenticado
     */
    checkAuth() {
        if (!window.authSystem || !window.authSystem.checkSession()) {
            window.location.href = 'login.html';
            return false;
        }

        // Mostrar información del usuario en el header
        this.displayUserInfo();
        return true;
    }

    /**
     * Muestra la información del usuario en el header
     */
    displayUserInfo() {
        const user = window.authSystem.getCurrentUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            const userRoleElement = document.getElementById('userRole');

            if (userNameElement) {
                userNameElement.textContent = user.nombre || user.username;
            }
            if (userRoleElement) {
                const roles = {
                    'admin': 'Administrador',
                    'contador': 'Contador',
                    'vendedor': 'Vendedor',
                    'comprador': 'Comprador',
                    'consulta': 'Consulta'
                };
                userRoleElement.textContent = roles[user.rol] || user.rol;
            }
        }
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.loadConfiguration();
        this.setupEventListeners();
        this.loadDashboard();
        this.loadCompanySelector();
    }

    /**
     * Carga la configuración
     */
    loadConfiguration() {
        const config = db.get('configuracion');
        if (config && config.empresaActual) {
            this.currentCompany = config.empresaActual;
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.navigateToModule(module);
            });
        });

        // Selector de empresa
        const companySelector = document.getElementById('companySelector');
        if (companySelector) {
            companySelector.addEventListener('change', (e) => {
                this.changeCompany(e.target.value);
            });
        }

        // Botón de cerrar sesión (Delegación de eventos para mayor robustez)
        document.addEventListener('click', (e) => {
            const logoutBtn = e.target.closest('#btnLogout');
            if (logoutBtn) {
                e.preventDefault();
                this.logout();
            }
        });

        // Toggle sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                // Si es móvil (ancho menor a 768px), usa 'active' para abrir/cerrar
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle('active');
                } else {
                    // Si es escritorio, usa 'collapsed' para minimizar
                    sidebar.classList.toggle('collapsed');
                }
            });
        }
    }

    /**
     * Navega a un módulo
     */
    navigateToModule(module) {
        // Ocultar todos los módulos
        document.querySelectorAll('.module-content').forEach(m => {
            m.classList.remove('active');
        });

        // Mostrar el módulo seleccionado
        const moduleElement = document.getElementById(`module-${module}`);
        if (moduleElement) {
            moduleElement.classList.add('active');
        }

        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`)?.classList.add('active');

        // Actualizar título y breadcrumb
        this.updateHeader(module);

        // Cargar contenido del módulo
        this.loadModuleContent(module);

        this.currentModule = module;
    }

    /**
     * Actualiza el header
     */
    updateHeader(module) {
        const titles = {
            'dashboard': 'Dashboard',
            'multiempresa': 'Gestión Multiempresa',
            'clientes': 'Clientes y Proveedores',
            'ventas': 'Ventas y Facturación Electrónica',
            'compras': 'Compras',
            'inventario': 'Inventario',
            'contabilidad': 'Contabilidad',
            'cuentas': 'Cuentas por Cobrar y Pagar',
            'reportes': 'Reportes Tributarios',
            'usuarios': 'Usuarios del Sistema',
            'bancos': 'Gestión Bancaria',
            'pos': 'Punto de Venta (Caja Rápida)',
            'activos': 'Activos Fijos y Depreciación',
            'nomina': 'Gestión de Talento Humano',
            'kardex': 'Kárdex Avanzado (Lotes/Caducidad)',
            'ia-asistente': 'Asistente Inteligente'
        };

        const pageTitle = document.getElementById('pageTitle');
        const breadcrumbPath = document.getElementById('breadcrumbPath');

        if (pageTitle) {
            pageTitle.textContent = titles[module] || 'Dashboard';
        }

        if (breadcrumbPath) {
            breadcrumbPath.textContent = `Inicio / ${titles[module] || 'Dashboard'}`;
        }
    }

    /**
     * Carga el contenido del módulo
     */
    loadModuleContent(module) {
        switch (module) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'multiempresa':
                this.loadMultiempresa();
                break;
            case 'clientes':
                this.loadClientes();
                break;
            case 'ventas':
                this.loadVentas();
                break;
            case 'compras':
                this.loadCompras();
                break;
            case 'inventario':
                this.loadInventario();
                break;
            case 'contabilidad':
                this.loadContabilidad();
                break;
            case 'cuentas':
                this.loadCuentas();
                break;
            case 'reportes':
                this.loadReportes();
                break;
            case 'usuarios':
                this.loadUsuarios();
                break;
            case 'ia-asistente':
                this.loadIAAsistente();
                break;
            case 'bancos':
                this.loadBancos();
                break;
            case 'pos':
                this.loadPOS();
                break;
            case 'activos':
                this.loadActivos();
                break;
            case 'nomina':
                this.loadNomina();
                break;
            case 'kardex':
                this.loadKardex();
                break;
        }
    }

    loadKardex() {
        const container = document.getElementById('module-kardex');
        if (window.kardexModule) {
            window.kardexModule.render(container);
        }
    }

    loadNomina() {
        const container = document.getElementById('module-nomina');
        if (window.nominaModule) {
            window.nominaModule.render(container);
        }
    }

    loadActivos() {
        const container = document.getElementById('module-activos');
        if (window.activosModule) {
            window.activosModule.render(container);
        }
    }

    loadPOS() {
        const container = document.getElementById('module-pos');
        if (window.posModule) {
            window.posModule.render(container);
        }
    }

    /**
     * Carga el dashboard
     */
    loadDashboard() {
        // Cargar alertas de IA
        this.loadAIAlerts();

        // Cargar KPIs
        this.loadKPIs();

        // Cargar actividad reciente
        this.loadRecentActivity();

        // Cargar gráficos
        this.loadCharts();
    }

    /**
     * Carga las alertas de IA
     */
    loadAIAlerts() {
        const alertsContainer = document.getElementById('aiAlerts');
        if (!alertsContainer) return;

        const alerts = aiAssistant.generateAlerts();

        if (alerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="alert-card alert-success">
                    <div class="alert-header">
                        <div class="alert-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/>
                                <polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="alert-content">
                            <h4>Todo en orden</h4>
                            <p>No hay alertas en este momento. El sistema está funcionando correctamente.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-card alert-${alert.type}">
                <div class="alert-header">
                    <div class="alert-icon">
                        ${this.getAlertIcon(alert.type)}
                    </div>
                    <div class="alert-content">
                        <h4>${alert.title}</h4>
                        <p>${alert.message}</p>
                    </div>
                </div>
                <div class="alert-footer">
                    <span class="alert-time">${alert.time}</span>
                    <span class="alert-action">${alert.action}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Obtiene el icono de alerta
     */
    getAlertIcon(type) {
        const icons = {
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="13" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"/></svg>',
            danger: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/></svg>',
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/><polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/></svg>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Carga los KPIs
     */
    loadKPIs() {
        const ventas = db.get('ventas') || [];
        const compras = db.get('compras') || [];
        const productos = db.get('productos') || [];
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();

        // Filtrar ventas del mes
        const ventasMes = ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        // Calcular totales
        const totalVentas = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalCompras = compras.reduce((sum, c) => sum + (c.total || 0), 0);
        const utilidad = totalVentas - totalCompras;
        const margen = totalVentas > 0 ? (utilidad / totalVentas) * 100 : 0;

        // IVA por declarar
        const ivaVentas = ventasMes.reduce((sum, v) => sum + (v.iva || 0), 0);
        const ivaCompras = compras.reduce((sum, c) => sum + (c.iva || 0), 0);
        const ivaPorPagar = ivaVentas - ivaCompras;

        // Inventario
        const valorInventario = productos.reduce((sum, p) =>
            sum + ((p.stock || 0) * (p.precioCompra || 0)), 0
        );
        const productosStockBajo = productos.filter(p =>
            p.stock <= (p.stockMinimo || 0)
        ).length;

        // Actualizar UI
        document.getElementById('kpiVentas').textContent = Utils.formatCurrency(totalVentas);
        document.getElementById('kpiUtilidad').textContent = Utils.formatCurrency(utilidad);
        document.getElementById('margenUtilidad').textContent = margen.toFixed(1) + '%';
        document.getElementById('kpiIVA').textContent = Utils.formatCurrency(ivaPorPagar);
        document.getElementById('kpiInventario').textContent = Utils.formatCurrency(valorInventario);
        document.getElementById('stockBajo').textContent = productosStockBajo;
        document.getElementById('productosAlerta').textContent = productosStockBajo;

        // Fecha de vencimiento IVA
        const fechaVencimiento = Utils.getIVADueDate(mesActual, anioActual);
        document.getElementById('vencimientoIVA').textContent = Utils.formatDate(fechaVencimiento);
    }

    /**
     * Carga la actividad reciente
     */
    loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const ventas = db.get('ventas') || [];
        const compras = db.get('compras') || [];

        // Combinar y ordenar por fecha
        const activities = [
            ...ventas.slice(-5).map(v => ({
                type: 'sale',
                title: `Venta #${v.numeroComprobante}`,
                description: `Cliente: ${v.clienteNombre || 'N/A'} - ${Utils.formatCurrency(v.total)}`,
                time: v.fecha
            })),
            ...compras.slice(-5).map(c => ({
                type: 'purchase',
                title: `Compra #${c.numeroComprobante}`,
                description: `Proveedor: ${c.proveedorNombre || 'N/A'} - ${Utils.formatCurrency(c.total)}`,
                time: c.fecha
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        if (activities.length === 0) {
            activityList.innerHTML = '<p class="text-secondary">No hay actividad reciente</p>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon activity-icon-${activity.type}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-description">${activity.description}</p>
                </div>
                <div class="activity-time">${Utils.timeAgo(activity.time)}</div>
            </div>
        `).join('');
    }

    /**
     * Obtiene el icono de actividad
     */
    getActivityIcon(type) {
        const icons = {
            sale: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/></svg>',
            purchase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke-width="2"/></svg>'
        };
        return icons[type] || icons.sale;
    }

    /**
     * Carga los gráficos
     */
    loadCharts() {
        // Aquí se cargarían los gráficos con Chart.js o similar
        // Por ahora, solo mostramos un placeholder
        console.log('Cargando gráficos...');
    }

    /**
     * Carga el selector de empresas
     */
    loadCompanySelector() {
        const selector = document.getElementById('companySelector');
        if (!selector) return;

        const empresas = db.get('empresas') || [];

        selector.innerHTML = '<option value="">Seleccionar empresa...</option>' +
            empresas.map(e => `
                <option value="${e.id}" ${e.id === this.currentCompany ? 'selected' : ''}>
                    ${e.razonSocial}
                </option>
            `).join('');
    }

    /**
     * Cambia la empresa actual
     */
    changeCompany(companyId) {
        this.currentCompany = parseInt(companyId);
        const config = db.get('configuracion') || {};
        config.empresaActual = this.currentCompany;
        db.set('configuracion', config);

        // Recargar el módulo actual
        this.loadModuleContent(this.currentModule);

        Utils.showToast('Empresa cambiada correctamente', 'success');
    }

    /**
     * Cierra sesión
     */
    logout() {
        Utils.confirm('¿Estás seguro de que deseas cerrar sesión?', () => {
            if (window.authSystem) {
                window.authSystem.logout();
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    /**
     * Métodos placeholder para otros módulos
     */
    loadMultiempresa() {
        const container = document.getElementById('module-multiempresa');
        if (window.multiempresaModule) {
            window.multiempresaModule.render(container);
        }
    }

    loadClientes() {
        const container = document.getElementById('module-clientes');
        if (window.clientesModule) {
            window.clientesModule.render(container);
        }
    }

    loadVentas() {
        const container = document.getElementById('module-ventas');
        if (window.ventasModule) {
            window.ventasModule.render(container);
        }
    }

    loadCompras() {
        const container = document.getElementById('module-compras');
        if (window.comprasModule) {
            window.comprasModule.render(container);
        }
    }

    loadInventario() {
        const container = document.getElementById('module-inventario');
        if (window.inventarioModule) {
            window.inventarioModule.render(container);
        }
    }

    loadContabilidad() {
        const container = document.getElementById('module-contabilidad');
        if (window.contabilidadModule) {
            window.contabilidadModule.render(container);
        }
    }

    loadCuentas() {
        const container = document.getElementById('module-cuentas');
        if (window.cuentasModule) {
            window.cuentasModule.render(container);
        }
    }

    loadReportes() {
        const container = document.getElementById('module-reportes');
        if (window.reportesModule) {
            window.reportesModule.render(container);
        }
    }

    loadUsuarios() {
        const container = document.getElementById('module-usuarios');
        if (window.usuariosModule) {
            window.usuariosModule.render(container);
        }
    }

    loadBancos() {
        const container = document.getElementById('module-bancos');
        if (window.bancosModule) {
            window.bancosModule.render(container);
        }
    }

    loadIAAsistente() {
        const container = document.getElementById('module-ia-asistente');
        container.innerHTML = '<div class="card"><div class="card-body"><h3>Asistente Inteligente</h3><p>Usa el botón flotante en la esquina inferior derecha para interactuar con el asistente.</p></div></div>';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
