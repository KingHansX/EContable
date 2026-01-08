/**
 * Sistema Contable Mónica - Módulo Activos Fijos
 * Gestión de bienes, depreciación y vida útil.
 */

class ActivosModule {
    constructor() {
        this.activos = [];
        this.init();
    }

    async init() {
        // Nada específico al inicar, se carga en render
    }

    async loadData() {
        try {
            if (db.useBackend) {
                const response = await fetch(`${db.apiUrl}/activos_fijos`);
                this.activos = await response.json();
            } else {
                // Fallback ficticio o local si se implementara
                this.activos = [];
            }
        } catch (e) {
            console.error("Error cargando activos", e);
            Utils.showToast("Error al cargar activos fijos", "error");
        }
    }

    async render(container) {
        if (!container) return;
        await this.loadData();

        const totalActivos = this.activos.reduce((sum, a) => sum + (a.costo_adquisicion || 0), 0);
        const totalDepreciado = this.activos.reduce((sum, a) => sum + (a.depreciacion_acumulada || 0), 0);
        const valorLibros = totalActivos - totalDepreciado;

        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>Activos Fijos</h2>
                    <p class="module-description">Control de bienes, maquinaria, vehículos y depreciaciones.</p>
                </div>
                <div style="display:flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="window.activosModule.runDepreciation()">
                        📉 Depreciar Mes
                    </button>
                    <button class="btn btn-primary" onclick="window.activosModule.showNewAssetModal()">
                        + Nuevo Activo
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Valor en Activos</div>
                    <div class="stat-value">${Utils.formatCurrency(totalActivos)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Depreciación Acum.</div>
                    <div class="stat-value text-danger">-${Utils.formatCurrency(totalDepreciado)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Valor en Libros</div>
                    <div class="stat-value text-success">${Utils.formatCurrency(valorLibros)}</div>
                </div>
            </div>

            <!-- Tabla -->
            <div class="card">
                <div class="card-header">
                    <h3>Listado de Bienes</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre/Descripción</th>
                                    <th>Fecha Adq.</th>
                                    <th>Vida Útil</th>
                                    <th>Costo</th>
                                    <th>Depreciación</th>
                                    <th>V. Libros</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.activos.length > 0 ? this.activos.map(a => `
                                    <tr>
                                        <td><strong>${a.codigo}</strong></td>
                                        <td>
                                            ${a.nombre}<br>
                                            <span class="text-secondary" style="font-size:0.85em">${a.categoria || 'General'}</span>
                                        </td>
                                        <td>${Utils.formatDate(a.fecha_adquisicion)}</td>
                                        <td>${a.vida_util_anios} años</td>
                                        <td>${Utils.formatCurrency(a.costo_adquisicion)}</td>
                                        <td class="text-danger">-${Utils.formatCurrency(a.depreciacion_acumulada)}</td>
                                        <td><strong>${Utils.formatCurrency(a.valor_en_libros)}</strong></td>
                                        <td><span class="status-badge status-badge-paid">${a.estado}</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="8" class="text-center">No hay activos registrados.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    showNewAssetModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Registrar Nuevo Activo</h3>
                        <button class="btn-close-modal" onclick="document.getElementById('modalContainer').innerHTML=''">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formAsset">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Código</label>
                                    <input type="text" class="form-input" id="codigo" placeholder="Ej: VEH-001" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Categoría</label>
                                    <select class="form-select" id="categoria">
                                        <option value="Vehículos">Vehículos (5 años)</option>
                                        <option value="Equipos de Cómputo">Equipos de Cómputo (3 años)</option>
                                        <option value="Muebles y Enseres">Muebles y Enseres (10 años)</option>
                                        <option value="Edificios">Edificios (20 años)</option>
                                        <option value="Maquinaria">Maquinaria (10 años)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nombre del Activo</label>
                                <input type="text" class="form-input" id="nombre" placeholder="Ej: Camioneta Hilux" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Fecha Adquisición</label>
                                    <input type="date" class="form-input" id="fecha_adquisicion" value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Costo ($)</label>
                                    <input type="number" class="form-input" id="costo" step="0.01" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Valor Residual ($)</label>
                                    <input type="number" class="form-input" id="residual" step="0.01" value="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Vida Útil (Años)</label>
                                    <input type="number" class="form-input" id="vida_util" value="5" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('modalContainer').innerHTML=''">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.activosModule.saveAsset()">Guardar Activo</button>
                    </div>
                </div>
            </div>
        `;

        // Auto-set vida util based on category
        document.getElementById('categoria').addEventListener('change', (e) => {
            const map = {
                'Vehículos': 5,
                'Equipos de Cómputo': 3,
                'Muebles y Enseres': 10,
                'Edificios': 20,
                'Maquinaria': 10
            };
            document.getElementById('vida_util').value = map[e.target.value] || 5;
        });
    }

    async saveAsset() {
        const data = {
            codigo: document.getElementById('codigo').value,
            nombre: document.getElementById('nombre').value,
            categoria: document.getElementById('categoria').value,
            fecha_adquisicion: document.getElementById('fecha_adquisicion').value,
            costo_adquisicion: parseFloat(document.getElementById('costo').value),
            valor_residual: parseFloat(document.getElementById('residual').value) || 0,
            vida_util_anios: parseInt(document.getElementById('vida_util').value),
            porcentaje_depreciacion: 100 / parseInt(document.getElementById('vida_util').value)
        };

        if (!data.codigo || !data.nombre || isNaN(data.costo_adquisicion)) {
            Utils.showToast("Complete los campos obligatorios", "warning");
            return;
        }

        try {
            if (db.useBackend) {
                await fetch(`${db.apiUrl}/activos_fijos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                Utils.showToast("Activo guardado correctamente", "success");
                document.getElementById('modalContainer').innerHTML = '';
                this.render(document.getElementById('module-activos'));
            }
        } catch (e) {
            Utils.showToast("Error guardando activo", "error");
        }
    }

    async runDepreciation() {
        if (!confirm("¿Ejecutar proceso de depreciación de este mes?\nEsto actualizará el valor en libros de todos los activos.")) return;

        try {
            if (db.useBackend) {
                const res = await fetch(`${db.apiUrl}/activos_fijos/depreciar`, { method: 'POST' });
                const result = await res.json();
                Utils.showToast(`Proceso finalizado. Depreciados: ${result.activos_procesados}, Total: ${Utils.formatCurrency(result.total_depreciado)}`, "success");
                this.render(document.getElementById('module-activos'));
            }
        } catch (e) {
            Utils.showToast("Error en proceso de depreciación", "error");
        }
    }
}

window.activosModule = new ActivosModule();
