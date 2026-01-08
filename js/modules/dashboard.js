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
            if (db.useBackend) {
                // En un sistema real, haríamos una sola llamada a /api/dashboard/stats
                // Aquí simularemos agregando datos de llamadas existentes o endpoint nuevo
                const stats = await fetch(`${db.apiUrl}/dashboard/stats`).then(r => r.json()).catch(() => null);

                if (stats) {
                    this.data = stats;
                } else {
                    // Fallback si no existe endpoint, calculamos localmente lo que podamos o mostramos ceros
                }
            }
        } catch (e) {
            console.warn("Dashboard data load failed", e);
        }
    }

    async render(container) {
        if (!container) return;
        await this.loadKPIData();

        container.innerHTML = `
            <div class="dashboard-header" style="margin-bottom: 20px;">
                <h2>Tablero de Control</h2>
                <p class="text-secondary">Resumen ejecutivo de la empresa - ${new Date().toLocaleDateString()}</p>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid" style="margin-bottom: 30px;">
                <div class="stat-card">
                    <div class="stat-icon" style="background:var(--color-primary); color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">💵</div>
                    <div class="stat-label">Ventas del Mes</div>
                    <div class="stat-value text-primary">${Utils.formatCurrency(this.data.ventasMes || 0)}</div>
                    <small class="text-secondary">Facturación bruta</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#e74c3c; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">📉</div>
                    <div class="stat-label">Gastos / Compras</div>
                    <div class="stat-value text-danger">${Utils.formatCurrency(this.data.comprasMes || 0)}</div>
                    <small class="text-secondary">Egresos operativos</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#f1c40f; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">🏦</div>
                    <div class="stat-label">Saldo en Bancos</div>
                    <div class="stat-value">${Utils.formatCurrency(this.data.bancosSaldo || 0)}</div>
                    <small class="text-secondary">Disponible real</small>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#2ecc71; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">📦</div>
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
