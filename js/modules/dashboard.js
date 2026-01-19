/**
 * Sistema Contable Mónica - Dashboard Principal
 * Resumen ejecutivo con gráficos e indicadores clave (KPIs)
 */

class DashboardModule {
    constructor() {
        this.data = {
            ventasMes: 0,
            comprasMes: 0,
            cuentasPorCobrar: 0,
            bancosSaldo: 0,
            ventasDiarias: []
        };
    }

    async init() {
        // Se llama al cargar la app
        await this.loadKPIData();
    }

    async loadKPIData() {
        try {
            // Obtener empresa seleccionada
            const empresaId = db.get('empresaActual');

            // Calcular datos localmente desde localStorage
            const ventas = db.get('ventas') || [];
            const compras = db.get('compras') || [];

            // Obtener mes y año actual
            const hoy = new Date();
            const mesActual = hoy.getMonth() + 1;
            const anioActual = hoy.getFullYear();

            // Filtrar ventas del mes actual
            const ventasMes = ventas.filter(v => {
                const fecha = new Date(v.fecha);
                return fecha.getMonth() + 1 === mesActual &&
                    fecha.getFullYear() === anioActual;
            });

            // Filtrar compras del mes actual
            const comprasMes = compras.filter(c => {
                const fecha = new Date(c.fecha);
                return fecha.getMonth() + 1 === mesActual &&
                    fecha.getFullYear() === anioActual;
            });

            // Calcular totales
            this.data.ventasMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
            this.data.comprasMes = comprasMes.reduce((sum, c) => sum + (c.total || 0), 0);

            // Calcular cuentas por cobrar (ventas pendientes)
            this.data.cuentasPorCobrar = ventas
                .filter(v => v.estado !== 'pagada')
                .reduce((sum, v) => sum + (v.total || 0), 0);

            // Calcular saldo en bancos (simplificado - diferencia entre ventas y compras)
            // En un sistema real, esto vendría de los movimientos bancarios
            this.data.bancosSaldo = this.data.ventasMes - this.data.comprasMes;

            // Calcular ventas diarias de los últimos 7 días
            this.data.ventasDiarias = this.calcularVentasDiarias(ventas);

        } catch (e) {
            console.warn("Dashboard data load failed", e);
            // Mantener valores en 0 si hay error
            this.data = {
                ventasMes: 0,
                comprasMes: 0,
                cuentasPorCobrar: 0,
                bancosSaldo: 0,
                ventasDiarias: []
            };
        }
    }

    calcularVentasDiarias(ventas) {
        const hoy = new Date();
        const dias = [];

        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i);

            const ventasDia = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta.toDateString() === fecha.toDateString();
            });

            const totalDia = ventasDia.reduce((sum, v) => sum + (v.total || 0), 0);

            dias.push({
                dia: fecha.toLocaleDateString('es-EC', { weekday: 'short' }),
                total: totalDia
            });
        }

        return dias;
    }

    async render(container) {
        if (!container) {
            console.error('Dashboard: Container no proporcionado');
            return;
        }

        // Pequeño delay para asegurar que todo esté cargado
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verificar dependencias críticas
        if (typeof Utils === 'undefined') {
            console.error('Dashboard: Utils no está disponible');
            container.innerHTML = `
                <div class="error-container" style="padding: 40px; text-align: center;">
                    <h3>Error de Inicialización</h3>
                    <p>Las dependencias del sistema no están cargadas correctamente.</p>
                    <p>Por favor, recarga la página.</p>
                </div>
            `;
            return;
        }

        // Mostrar estado de carga
        container.innerHTML = `
            <div class="loading-container" style="padding: 40px; text-align: center;">
                <div style="margin: 0 auto 20px; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary, #e67e22); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p>Cargando dashboard...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;

        try {
            await this.loadKPIData();
            this.renderDashboard(container);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            container.innerHTML = `
                <div class="error-container" style="padding: 40px; text-align: center;">
                    <h3>Error al Cargar Dashboard</h3>
                    <p>${error.message || 'Error desconocido'}</p>
                    <button onclick="window.dashboardModule.render(document.getElementById('module-dashboard'))" class="btn btn-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    renderDashboard(container) {

        container.innerHTML = `
            <div class="dashboard-header" style="margin-bottom: 20px;">
                <h2>Tablero de Control</h2>
                <p class="text-secondary">Resumen ejecutivo de la empresa - ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid" style="margin-bottom: 30px;">
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(211, 84, 0, 0.2); color:#e67e22; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div class="stat-label">Ventas del Mes</div>
                    <div class="stat-value" style="color:#e67e22">${Utils.formatCurrency(this.data.ventasMes || 0)}</div>
                    <small class="text-secondary">Facturación bruta</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(192, 57, 43, 0.2); color:#e74c3c; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                            <polyline points="17 18 23 18 23 12"></polyline>
                        </svg>
                    </div>
                    <div class="stat-label">Gastos / Compras</div>
                    <div class="stat-value text-danger">${Utils.formatCurrency(this.data.comprasMes || 0)}</div>
                    <small class="text-secondary">Egresos operativos</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(241, 196, 15, 0.2); color:#f1c40f; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="21" x2="21" y2="21"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                            <path d="M5 6l7-3 7 3"></path>
                            <path d="M4 10v11"></path>
                            <path d="M20 10v11"></path>
                            <path d="M8 14v3"></path>
                            <path d="M12 14v3"></path>
                            <path d="M16 14v3"></path>
                        </svg>
                    </div>
                    <div class="stat-label">Saldo en Bancos</div>
                    <div class="stat-value" style="color:#f1c40f">${Utils.formatCurrency(this.data.bancosSaldo || 0)}</div>
                    <small class="text-secondary">Disponible real</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(46, 204, 113, 0.2); color:#2ecc71; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="stat-label">CxC Clientes</div>
                    <div class="stat-value text-success">${Utils.formatCurrency(this.data.cuentasPorCobrar || 0)}</div>
                    <small class="text-secondary">Cartera pendiente</small>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <!-- Gráfico Principal -->
                <div class="card">
                    <div class="card-header">
                        <h3>Tendencia de Ventas (Últimos 7 días)</h3>
                    </div>
                    <div class="card-body" style="height: 300px; display: flex; align-items: flex-end; justify-content: space-around; padding: 20px;">
                        ${this.renderBarChart()}
                    </div>
                </div>

                <!-- Accesos Rápidos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Acciones Rápidas</h3>
                    </div>
                    <div class="card-body" style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn btn-outline" onclick="app.loadPOS()" style="text-align:left; padding: 15px;">🛒 Punto de Venta</button>
                        <button class="btn btn-outline" onclick="app.loadFacturacion()" style="text-align:left; padding: 15px;">📝 Nueva Factura</button>
                        <button class="btn btn-outline" onclick="app.loadBancos()" style="text-align:left; padding: 15px;">🏦 Ver Bancos</button>
                        <button class="btn btn-outline" onclick="app.loadReportes()" style="text-align:left; padding: 15px;">📊 Reportes Gerenciales</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderBarChart() {
        if (!this.data.ventasDiarias || this.data.ventasDiarias.length === 0) {
            return '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">No hay datos de ventas recientes</div>';
        }

        const maxVal = Math.max(...this.data.ventasDiarias.map(d => d.total));

        return this.data.ventasDiarias.map(day => `
            <div style="display:flex; flex-direction:column; align-items:center; width: 10%;">
                <div style="
                    height: ${maxVal > 0 ? (day.total / maxVal) * 200 : 0}px; 
                    width: 30px; 
                    background: var(--color-primary); 
                    border-radius: 4px 4px 0 0;
                    transition: height 0.5s ease;
                    min-height: 2px;
                " title="$${day.total}"></div>
                <div style="margin-top: 5px; font-size: 0.8em; color: var(--text-secondary);">${day.dia}</div>
            </div>
        `).join('');
    }
}

window.dashboardModule = new DashboardModule();
