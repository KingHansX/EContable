/**
 * Sistema Contable Mónica - Módulo Kárdex Avanzado
 * Control de Lotes, Caducidad y Trazabilidad.
 */

class KardexModule {
    constructor() {
        this.lotes = [];
        this.products = [];
    }

    async render(container) {
        if (!container) return;

        await this.loadData();

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>Kárdex Avanzado</h2>
                    <p class="module-description">Gestión de lotes, fechas de caducidad y trazabilidad de productos.</p>
                </div>
                <div style="display:flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="window.kardexModule.showIngresoModal()">
                        📦 Nueva Entrada (Lote)
                    </button>
                    <button class="btn btn-secondary" onclick="window.kardexModule.toggleView()">
                        📊 Ver Reporte
                    </button>
                </div>
            </div>

            <!-- Dashboard de Caducidad -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Lotes Totales</div>
                    <div class="stat-value">${this.lotes.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Por Vencer (30 días)</div>
                    <div class="stat-value text-warning">${this.countExpiringSoon()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Vencidos</div>
                    <div class="stat-value text-danger animated flash">${this.countExpired()}</div>
                </div>
            </div>

            <!-- Tabla de Lotes Activos -->
            <div class="card">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>Inventario por Lotes</h3>
                    <input type="text" placeholder="Buscar producto..." class="form-input" style="width: 250px;" oninput="window.kardexModule.filterTable(this.value)">
                </div>
                <div class="card-body" style="padding:0;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Lote #</th>
                                <th>Caducidad</th>
                                <th>Cantidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaLotes">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (db.useBackend) {
                const [resLotes, resProd] = await Promise.all([
                    fetch(`${db.apiUrl}/kardex/lotes?solo_activos=true`),
                    fetch(`${db.apiUrl}/productos`)
                ]);
                this.lotes = await resLotes.json();
                this.products = await resProd.json();
            }
        } catch (e) {
            console.error("Error loading kardex", e);
        }
    }

    renderTableRows(filter = '') {
        const filtered = this.lotes.filter(l =>
            l.producto_nombre.toLowerCase().includes(filter.toLowerCase()) ||
            l.numero_lote.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) return '<tr><td colspan="6" class="text-center">No hay lotes activos.</td></tr>';

        return filtered.map(l => {
            const daysToExpiry = this.getDaysToExpiry(l.fecha_caducidad);
            let statusBadge = `<span class="badge badge-success">OK</span>`;
            if (daysToExpiry < 0) statusBadge = `<span class="badge badge-danger">VENCIDO</span>`;
            else if (daysToExpiry < 30) statusBadge = `<span class="badge badge-warning">POR VENCER</span>`;

            return `
                <tr>
                    <td><strong>${l.producto_nombre}</strong></td>
                    <td>${l.numero_lote}</td>
                    <td>${l.fecha_caducidad} <small class="text-secondary">(${daysToExpiry} días)</small></td>
                    <td><strong>${l.cantidad_actual}</strong></td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline text-danger" title="Dar de Baja">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getDaysToExpiry(dateStr) {
        const expiry = new Date(dateStr);
        const now = new Date();
        const diff = expiry - now;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    countExpiringSoon() {
        return this.lotes.filter(l => {
            const days = this.getDaysToExpiry(l.fecha_caducidad);
            return days >= 0 && days <= 30;
        }).length;
    }

    countExpired() {
        return this.lotes.filter(l => this.getDaysToExpiry(l.fecha_caducidad) < 0).length;
    }

    filterTable(val) {
        document.getElementById('tablaLotes').innerHTML = this.renderTableRows(val);
    }

    toggleView() {
        // Placeholder for report view toggle
        Utils.showToast("Vista de reporte (Próximamente)");
    }

    showIngresoModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Entrada de Mercadería (Con Lote)</h3>
                        <button class="btn-close-modal" onclick="document.getElementById('modalContainer').innerHTML=''">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formKardex">
                            <div class="form-group">
                                <label>Producto</label>
                                <select id="kProd" class="form-select">
                                    ${this.products.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cantidad</label>
                                    <input type="number" id="kCant" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Costo Unitario ($)</label>
                                    <input type="number" id="kCosto" class="form-input" step="0.01" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Lote #</label>
                                    <input type="text" id="kLote" class="form-input" placeholder="Ej: L-2026-001" required>
                                </div>
                                <div class="form-group">
                                    <label>Fecha Caducidad</label>
                                    <input type="date" id="kCaducidad" class="form-input" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('modalContainer').innerHTML=''">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.kardexModule.saveIngreso()">Registrar Entrada</button>
                    </div>
                </div>
            </div>
        `;
    }

    async saveIngreso() {
        const data = {
            producto_id: document.getElementById('kProd').value,
            cantidad: parseFloat(document.getElementById('kCant').value),
            costo: parseFloat(document.getElementById('kCosto').value),
            tipo_movimiento: 'COMPRA',
            ref: 'Ingreso Manual Kárdex',
            lote: {
                numero: document.getElementById('kLote').value,
                caducidad: document.getElementById('kCaducidad').value
            }
        };

        if (!data.cantidad || !data.lote.numero || !data.lote.caducidad) {
            Utils.showToast("Complete todos los campos del lote", "warning");
            return;
        }

        try {
            if (db.useBackend) {
                await fetch(`${db.apiUrl}/kardex/entrada`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                Utils.showToast("Entrada registrada con éxito", "success");
                document.getElementById('modalContainer').innerHTML = '';
                this.render(document.getElementById('module-kardex'));
            }
        } catch (e) {
            Utils.showToast("Error al registrar entrada", "error");
        }
    }
}

window.kardexModule = new KardexModule();
