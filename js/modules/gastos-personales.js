/**
 * EContable - Módulo Gastos Personales
 * Registro de gastos personales deducibles del IR según SRI Ecuador
 */

class GastosPersonalesModule {
    constructor() {
        this.gastos = [];
        this.categorias = [
            { id: 'vivienda', nombre: 'Vivienda', limite: 0.325, icon: 'home' },
            { id: 'educacion', nombre: 'Educación', limite: 0.325, icon: 'book' },
            { id: 'salud', nombre: 'Salud', limite: 0.325, icon: 'heart' },
            { id: 'alimentacion', nombre: 'Alimentación', limite: 0.325, icon: 'shopping-cart' },
            { id: 'vestimenta', nombre: 'Vestimenta', limite: 0.325, icon: 'shopping-bag' },
            { id: 'turismo', nombre: 'Turismo', limite: 0.325, icon: 'map' }
        ];
        this.init();
    }

    async init() {
        await this.loadData();
    }

    async loadData() {
        this.gastos = await db.get('gastosPersonales') || [];
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();
        const anioActual = new Date().getFullYear();

        container.innerHTML = `
            <div class="gastos-personales-module">
                <div class="module-header">
                    <div>
                        <h2>Gastos Personales</h2>
                        <p class="module-description">Registra tus gastos personales deducibles del Impuesto a la Renta</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnSimulador">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/>
                            </svg>
                            Simulador IR
                        </button>
                        <button class="btn btn-primary" id="btnNuevoGasto">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nuevo Gasto
                        </button>
                    </div>
                </div>

                <!-- Alertas IA -->
                ${this.renderAlertas(stats)}

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Gastos ${anioActual}</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.totalAnio)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Deducible Proyectado</div>
                        <div class="stat-value text-success">${Utils.formatCurrency(stats.deducible)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Ahorro Estimado IR</div>
                        <div class="stat-value text-primary">${Utils.formatCurrency(stats.ahorroIR)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Gastos Registrados</div>
                        <div class="stat-value">${stats.totalGastos}</div>
                    </div>
                </div>

                <!-- Resumen por Categoría -->
                <div class="card">
                    <div class="card-header">
                        <h3>Resumen por Categoría - ${anioActual}</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderResumenCategorias(stats)}
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filters-bar">
                    <div class="filters-row">
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Año</label>
                            <select class="form-select" id="filterAnio">
                                ${this.getAniosDisponibles().map(anio =>
            `<option value="${anio}" ${anio === anioActual ? 'selected' : ''}>${anio}</option>`
        ).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Categoría</label>
                            <select class="form-select" id="filterCategoria">
                                <option value="">Todas las categorías</option>
                                ${this.categorias.map(cat =>
            `<option value="${cat.id}">${cat.nombre}</option>`
        ).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Mes</label>
                            <select class="form-select" id="filterMes">
                                <option value="">Todos los meses</option>
                                ${Array.from({ length: 12 }, (_, i) => i + 1).map(mes =>
            `<option value="${mes}">${this.getNombreMes(mes)}</option>`
        ).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Lista de Gastos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Gastos Registrados</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchGastos" placeholder="Buscar gasto..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="gastosList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderGastos();
    }

    renderAlertas(stats) {
        const alertas = [];

        // Alerta si está cerca del límite
        if (stats.porcentajeUsado > 80) {
            alertas.push({
                tipo: 'warning',
                mensaje: `Has utilizado el ${stats.porcentajeUsado.toFixed(1)}% del límite deducible. Considera optimizar tus gastos.`
            });
        }

        // Alerta si faltan gastos por registrar
        const mesActual = new Date().getMonth() + 1;
        const gastosEsteMes = this.gastos.filter(g => {
            const fecha = new Date(g.fecha);
            return fecha.getMonth() + 1 === mesActual;
        }).length;

        if (gastosEsteMes === 0 && mesActual > 1) {
            alertas.push({
                tipo: 'info',
                mensaje: 'No has registrado gastos este mes. Recuerda mantener tus registros actualizados.'
            });
        }

        if (alertas.length === 0) return '';

        return alertas.map(alerta => `
            <div class="info-box info-box-${alerta.tipo}">
                <h4>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
                    </svg>
                    Alerta IA
                    <span class="badge badge-ai">IA</span>
                </h4>
                <p>${alerta.mensaje}</p>
            </div>
        `).join('');
    }

    calculateStats() {
        const anioActual = new Date().getFullYear();
        const gastosAnio = this.gastos.filter(g => {
            const fecha = new Date(g.fecha);
            return fecha.getFullYear() === anioActual;
        });

        const totalAnio = gastosAnio.reduce((sum, g) => sum + (g.monto || 0), 0);

        // Calcular límite deducible (7 canastas básicas familiares)
        const canastaBF = 817.09; // Valor 2024 Ecuador (actualizar según año)
        const limiteTotal = canastaBF * 7;

        // El deducible es el menor entre el total de gastos y el límite
        const deducible = Math.min(totalAnio, limiteTotal);

        // Estimar ahorro en IR (asumiendo tasa promedio del 15%)
        const ahorroIR = deducible * 0.15;

        const porcentajeUsado = (totalAnio / limiteTotal) * 100;

        // Calcular por categoría
        const porCategoria = {};
        this.categorias.forEach(cat => {
            const gastosCategoria = gastosAnio.filter(g => g.categoria === cat.id);
            porCategoria[cat.id] = {
                total: gastosCategoria.reduce((sum, g) => sum + (g.monto || 0), 0),
                cantidad: gastosCategoria.length,
                limite: limiteTotal * cat.limite
            };
        });

        return {
            totalAnio,
            deducible,
            ahorroIR,
            totalGastos: gastosAnio.length,
            limiteTotal,
            porcentajeUsado,
            porCategoria
        };
    }

    renderResumenCategorias(stats) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Total Gastado</th>
                            <th>Límite</th>
                            <th>% Utilizado</th>
                            <th>Gastos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.categorias.map(cat => {
            const data = stats.porCategoria[cat.id];
            const porcentaje = (data.total / data.limite) * 100;
            return `
                                <tr>
                                    <td><strong>${cat.nombre}</strong></td>
                                    <td>${Utils.formatCurrency(data.total)}</td>
                                    <td>${Utils.formatCurrency(data.limite)}</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                                                <div style="width: ${Math.min(porcentaje, 100)}%; height: 100%; background: ${porcentaje > 100 ? 'var(--color-danger)' : 'var(--color-success)'}; transition: width 0.3s;"></div>
                                            </div>
                                            <span style="min-width: 60px; text-align: right;">${porcentaje.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td>${data.cantidad}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--bg-secondary); font-weight: bold;">
                            <td>TOTAL</td>
                            <td>${Utils.formatCurrency(stats.totalAnio)}</td>
                            <td>${Utils.formatCurrency(stats.limiteTotal)}</td>
                            <td>${stats.porcentajeUsado.toFixed(1)}%</td>
                            <td>${stats.totalGastos}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    renderGastos() {
        const container = document.getElementById('gastosList');
        if (!container) return;

        if (this.gastos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                    </svg>
                    <h3>No hay gastos registrados</h3>
                    <p>Comienza a registrar tus gastos personales deducibles</p>
                </div>
            `;
            return;
        }

        const gastosOrdenados = [...this.gastos].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>RUC/Cédula</th>
                            <th>Factura</th>
                            <th>Monto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gastosOrdenados.map(gasto => {
            const categoria = this.categorias.find(c => c.id === gasto.categoria);
            return `
                                <tr>
                                    <td>${Utils.formatDate(gasto.fecha)}</td>
                                    <td>
                                        <span class="badge" style="background: var(--color-primary); color: white;">
                                            ${categoria ? categoria.nombre : gasto.categoria}
                                        </span>
                                    </td>
                                    <td>${gasto.descripcion}</td>
                                    <td>${gasto.rucProveedor}</td>
                                    <td>${gasto.numeroFactura}</td>
                                    <td><strong>${Utils.formatCurrency(gasto.monto)}</strong></td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn-table-action btn-view" data-id="${gasto.id}" title="Ver">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                    <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-edit" data-id="${gasto.id}" title="Editar">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-delete" data-id="${gasto.id}" title="Eliminar">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                                                </svg>
                                            </button>
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

    setupEventListeners(container) {
        const btnNuevo = container.querySelector('#btnNuevoGasto');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showGastoModal());
        }

        const btnSimulador = container.querySelector('#btnSimulador');
        if (btnSimulador) {
            btnSimulador.addEventListener('click', () => this.showSimuladorIR());
        }

        const searchInput = container.querySelector('#searchGastos');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterGastos(e.target.value);
            }, 300));
        }

        const filterAnio = container.querySelector('#filterAnio');
        const filterCategoria = container.querySelector('#filterCategoria');
        const filterMes = container.querySelector('#filterMes');

        [filterAnio, filterCategoria, filterMes].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    setupTableActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewGasto(id);
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editGasto(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteGasto(id);
            });
        });
    }

    showGastoModal(gasto = null) {
        const isEdit = gasto !== null;
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nuevo'} Gasto Personal</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formGasto">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Fecha</label>
                                    <input type="date" class="form-input" id="fecha" 
                                           value="${gasto?.fecha?.split('T')[0] || new Date().toISOString().split('T')[0]}" 
                                           required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Categoría</label>
                                    <select class="form-select" id="categoria" required>
                                        <option value="">Seleccionar...</option>
                                        ${this.categorias.map(cat =>
            `<option value="${cat.id}" ${gasto?.categoria === cat.id ? 'selected' : ''}>
                                                ${cat.nombre}
                                            </option>`
        ).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Descripción</label>
                                <input type="text" class="form-input" id="descripcion" 
                                       value="${gasto?.descripcion || ''}" 
                                       placeholder="Ej: Pago de arriendo, Matrícula escolar, etc." required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">RUC/Cédula Proveedor</label>
                                    <input type="text" class="form-input" id="rucProveedor" 
                                           value="${gasto?.rucProveedor || ''}" 
                                           placeholder="0123456789001" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Número de Factura</label>
                                    <input type="text" class="form-input" id="numeroFactura" 
                                           value="${gasto?.numeroFactura || ''}" 
                                           placeholder="001-001-000000001" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Monto</label>
                                <input type="number" class="form-input" id="monto" 
                                       value="${gasto?.monto || ''}" 
                                       placeholder="0.00" step="0.01" min="0" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Notas</label>
                                <textarea class="form-textarea" id="notas" 
                                          placeholder="Notas adicionales (opcional)">${gasto?.notas || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-gasto">
                            ${isEdit ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal, .btn-cancel-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });

        const saveButton = modalContainer.querySelector('.btn-save-gasto');
        saveButton.addEventListener('click', () => {
            this.saveGasto(gasto?.id);
        });
    }

    saveGasto(id = null) {
        const form = document.getElementById('formGasto');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const ruc = document.getElementById('rucProveedor').value.trim();

        // Validar RUC/Cédula
        if (ruc.length === 10 && !Utils.validateCedula(ruc)) {
            Utils.showToast('Cédula inválida', 'error');
            return;
        }

        if (ruc.length === 13 && !Utils.validateRUC(ruc)) {
            Utils.showToast('RUC inválido', 'error');
            return;
        }

        const data = {
            fecha: new Date(document.getElementById('fecha').value).toISOString(),
            categoria: document.getElementById('categoria').value,
            descripcion: document.getElementById('descripcion').value.trim(),
            rucProveedor: ruc,
            numeroFactura: document.getElementById('numeroFactura').value.trim(),
            monto: parseFloat(document.getElementById('monto').value),
            notas: document.getElementById('notas').value.trim()
        };

        try {
            if (id) {
                db.update('gastosPersonales', id, data);
                Utils.showToast('Gasto actualizado correctamente', 'success');
            } else {
                db.insert('gastosPersonales', data);
                Utils.showToast('Gasto registrado correctamente', 'success');
            }

            document.getElementById('modalContainer').innerHTML = '';
            await this.loadData();

            // Re-renderizar todo el módulo para actualizar stats
            const container = document.querySelector('.gastos-personales-module').parentElement;
            this.render(container);

        } catch (error) {
            Utils.showToast('Error al guardar el gasto', 'error');
            console.error(error);
        }
    }

    viewGasto(id) {
        const gasto = await db.findById('gastosPersonales', id);
        if (!gasto) return;

        const categoria = this.categorias.find(c => c.id === gasto.categoria);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Detalle del Gasto</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha</label>
                                <p><strong>${Utils.formatDate(gasto.fecha)}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Categoría</label>
                                <p><strong>${categoria ? categoria.nombre : gasto.categoria}</strong></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Descripción</label>
                            <p>${gasto.descripcion}</p>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">RUC/Cédula Proveedor</label>
                                <p>${gasto.rucProveedor}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Número de Factura</label>
                                <p>${gasto.numeroFactura}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Monto</label>
                            <p><strong style="font-size: 1.5rem; color: var(--color-primary);">${Utils.formatCurrency(gasto.monto)}</strong></p>
                        </div>
                        ${gasto.notas ? `
                            <div class="form-group">
                                <label class="form-label">Notas</label>
                                <p>${gasto.notas}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                        <button class="btn btn-primary btn-edit-from-view" data-id="${id}">
                            Editar
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

        const editButton = modalContainer.querySelector('.btn-edit-from-view');
        editButton.addEventListener('click', () => {
            modalContainer.innerHTML = '';
            this.editGasto(id);
        });
    }

    editGasto(id) {
        const gasto = await db.findById('gastosPersonales', id);
        if (gasto) {
            this.showGastoModal(gasto);
        }
    }

    deleteGasto(id) {
        const gasto = await db.findById('gastosPersonales', id);
        if (!gasto) return;

        Utils.confirm(
            `¿Estás seguro de eliminar el gasto "${gasto.descripcion}"?`,
            () => {
                db.remove('gastosPersonales', id);
                Utils.showToast('Gasto eliminado correctamente', 'success');
                await this.loadData();

                // Re-renderizar
                const container = document.querySelector('.gastos-personales-module').parentElement;
                this.render(container);
            }
        );
    }

    showSimuladorIR() {
        Utils.showToast('Simulador de Impuesto a la Renta en desarrollo', 'info');
        // TODO: Implementar simulador completo
    }

    filterGastos(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.gastos.filter(g =>
            g.descripcion.toLowerCase().includes(lowerQuery) ||
            g.numeroFactura.toLowerCase().includes(lowerQuery) ||
            g.rucProveedor.includes(lowerQuery)
        );

        const temp = this.gastos;
        this.gastos = filtered;
        this.renderGastos();
        this.gastos = temp;
    }

    applyFilters() {
        const anio = parseInt(document.getElementById('filterAnio')?.value);
        const categoria = document.getElementById('filterCategoria')?.value;
        const mes = parseInt(document.getElementById('filterMes')?.value);

        let filtered = await db.get('gastosPersonales') || [];

        if (anio) {
            filtered = filtered.filter(g => {
                const fecha = new Date(g.fecha);
                return fecha.getFullYear() === anio;
            });
        }

        if (categoria) {
            filtered = filtered.filter(g => g.categoria === categoria);
        }

        if (mes) {
            filtered = filtered.filter(g => {
                const fecha = new Date(g.fecha);
                return fecha.getMonth() + 1 === mes;
            });
        }

        this.gastos = filtered;
        this.renderGastos();
        this.gastos = await db.get('gastosPersonales') || [];
    }

    getAniosDisponibles() {
        const anioActual = new Date().getFullYear();
        return [anioActual, anioActual - 1, anioActual - 2];
    }

    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1];
    }
}

window.gastosPersonalesModule = new GastosPersonalesModule();
