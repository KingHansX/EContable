/**
 * EContable - Módulo Nómina
 * Gestión completa de nómina, IESS y provisiones según legislación ecuatoriana
 */

class NominaModule {
    constructor() {
        this.empleados = [];
        this.roles = [];
        this.salarioBasico = 460; // SBU 2024 Ecuador
        this.init();
    }

    init() {
        this.loadData();
    }

    loadData() {
        this.empleados = db.find('empleados') || [];
        this.roles = db.find('rolesPago') || [];
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();

        container.innerHTML = `
            <div class="nomina-module">
                <div class="module-header">
                    <div>
                        <h2>Nómina</h2>
                        <p class="module-description">Gestión de nómina, IESS y provisiones</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnGenerarRol">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                            </svg>
                            Generar Rol de Pagos
                        </button>
                        <button class="btn btn-primary" id="btnNuevoEmpleado">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nuevo Empleado
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Empleados</div>
                        <div class="stat-value">${stats.totalEmpleados}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Nómina Mensual</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.nominaMensual)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">IESS Patronal</div>
                        <div class="stat-value text-warning">${Utils.formatCurrency(stats.iessPatronal)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Provisiones Mes</div>
                        <div class="stat-value text-primary">${Utils.formatCurrency(stats.provisionesMes)}</div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="card" style="margin-top: 24px;">
                    <div class="card-header">
                        <div style="display: flex; gap: 16px; border-bottom: 2px solid var(--border-color);">
                            <button class="tab-button active" data-tab="empleados">Empleados</button>
                            <button class="tab-button" data-tab="roles">Roles de Pago</button>
                            <button class="tab-button" data-tab="provisiones">Provisiones</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="tab-empleados" class="tab-content active">
                            ${this.renderEmpleados()}
                        </div>
                        <div id="tab-roles" class="tab-content" style="display: none;">
                            ${this.renderRoles()}
                        </div>
                        <div id="tab-provisiones" class="tab-content" style="display: none;">
                            ${this.renderProvisiones()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
    }

    calculateStats() {
        const empleadosActivos = this.empleados.filter(e => e.activo);
        const nominaMensual = empleadosActivos.reduce((sum, e) => sum + (e.sueldo || 0), 0);

        // IESS Patronal: 12.15% del sueldo
        const iessPatronal = nominaMensual * 0.1215;

        // Provisiones mensuales (aproximado)
        const provisionesMes = empleadosActivos.reduce((sum, e) => {
            const sueldo = e.sueldo || 0;
            // Décimo tercero: sueldo/12
            // Décimo cuarto: SBU/12
            // Vacaciones: sueldo/24
            // Fondos de reserva: sueldo * 8.33% (después del primer año)
            return sum + (sueldo / 12) + (this.salarioBasico / 12) + (sueldo / 24) + (sueldo * 0.0833);
        }, 0);

        return {
            totalEmpleados: empleadosActivos.length,
            nominaMensual,
            iessPatronal,
            provisionesMes
        };
    }

    renderEmpleados() {
        if (this.empleados.length === 0) {
            return `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke-width="2"/>
                    </svg>
                    <h3>No hay empleados registrados</h3>
                    <p>Agrega tu primer empleado para comenzar</p>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Cédula</th>
                            <th>Cargo</th>
                            <th>Sueldo</th>
                            <th>Fecha Ingreso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.empleados.map(emp => `
                            <tr>
                                <td><strong>${emp.nombre}</strong></td>
                                <td>${emp.cedula}</td>
                                <td>${emp.cargo}</td>
                                <td><strong>${Utils.formatCurrency(emp.sueldo)}</strong></td>
                                <td>${Utils.formatDate(emp.fechaIngreso)}</td>
                                <td>
                                    <span class="status-badge ${emp.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                        ${emp.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view" data-id="${emp.id}" title="Ver">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-edit" data-id="${emp.id}" title="Editar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-calculate" data-id="${emp.id}" title="Calcular Liquidación">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                                                <line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/>
                                                <line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/>
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
    }

    renderRoles() {
        if (this.roles.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No hay roles de pago generados</h3>
                    <p>Genera el primer rol de pagos del mes</p>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th>Empleados</th>
                            <th>Total Ingresos</th>
                            <th>Total Egresos</th>
                            <th>Neto a Pagar</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.roles.map(rol => `
                            <tr>
                                <td><strong>${rol.mes}/${rol.anio}</strong></td>
                                <td>${rol.empleados.length}</td>
                                <td>${Utils.formatCurrency(rol.totalIngresos)}</td>
                                <td>${Utils.formatCurrency(rol.totalEgresos)}</td>
                                <td><strong>${Utils.formatCurrency(rol.netoAPagar)}</strong></td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view-rol" data-id="${rol.id}" title="Ver Detalle">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-export" data-id="${rol.id}" title="Exportar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                                <polyline points="7 10 12 15 17 10" stroke-width="2"/>
                                                <line x1="12" y1="15" x2="12" y2="3" stroke-width="2"/>
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
    }

    renderProvisiones() {
        const empleadosActivos = this.empleados.filter(e => e.activo);

        if (empleadosActivos.length === 0) {
            return '<p>No hay empleados activos para calcular provisiones</p>';
        }

        const provisiones = empleadosActivos.map(emp => {
            const sueldo = emp.sueldo || 0;
            const fechaIngreso = new Date(emp.fechaIngreso);
            const hoy = new Date();
            const mesesTrabajados = (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 +
                (hoy.getMonth() - fechaIngreso.getMonth());

            return {
                empleado: emp.nombre,
                decimoTercero: sueldo / 12,
                decimoCuarto: this.salarioBasico / 12,
                vacaciones: sueldo / 24,
                fondosReserva: mesesTrabajados >= 12 ? sueldo * 0.0833 : 0,
                total: (sueldo / 12) + (this.salarioBasico / 12) + (sueldo / 24) +
                    (mesesTrabajados >= 12 ? sueldo * 0.0833 : 0)
            };
        });

        const totalProvisiones = provisiones.reduce((sum, p) => sum + p.total, 0);

        return `
            <div class="info-box info-box-info" style="margin-bottom: 24px;">
                <h4>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
                    </svg>
                    Provisiones Mensuales
                </h4>
                <p>Las provisiones se calculan mensualmente y deben ser registradas contablemente.</p>
            </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Décimo Tercero</th>
                            <th>Décimo Cuarto</th>
                            <th>Vacaciones</th>
                            <th>Fondos de Reserva</th>
                            <th>Total Mensual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${provisiones.map(p => `
                            <tr>
                                <td><strong>${p.empleado}</strong></td>
                                <td>${Utils.formatCurrency(p.decimoTercero)}</td>
                                <td>${Utils.formatCurrency(p.decimoCuarto)}</td>
                                <td>${Utils.formatCurrency(p.vacaciones)}</td>
                                <td>${Utils.formatCurrency(p.fondosReserva)}</td>
                                <td><strong>${Utils.formatCurrency(p.total)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--bg-secondary); font-weight: bold;">
                            <td>TOTAL</td>
                            <td>${Utils.formatCurrency(provisiones.reduce((s, p) => s + p.decimoTercero, 0))}</td>
                            <td>${Utils.formatCurrency(provisiones.reduce((s, p) => s + p.decimoCuarto, 0))}</td>
                            <td>${Utils.formatCurrency(provisiones.reduce((s, p) => s + p.vacaciones, 0))}</td>
                            <td>${Utils.formatCurrency(provisiones.reduce((s, p) => s + p.fondosReserva, 0))}</td>
                            <td>${Utils.formatCurrency(totalProvisiones)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    setupEventListeners(container) {
        // Botón nuevo empleado
        const btnNuevo = container.querySelector('#btnNuevoEmpleado');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showEmpleadoModal());
        }

        // Botón generar rol
        const btnGenerarRol = container.querySelector('#btnGenerarRol');
        if (btnGenerarRol) {
            btnGenerarRol.addEventListener('click', () => this.generarRolPagos());
        }

        // Tabs
        container.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Acciones de empleados
        this.setupEmpleadoActions();
        this.setupRolActions();
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`tab-${tab}`).style.display = 'block';
    }

    setupEmpleadoActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewEmpleado(id);
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editEmpleado(id);
            });
        });

        document.querySelectorAll('.btn-calculate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.calcularLiquidacion(id);
            });
        });
    }

    setupRolActions() {
        document.querySelectorAll('.btn-view-rol').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewRol(id);
            });
        });

        document.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.exportarRol(id);
            });
        });
    }

    showEmpleadoModal(empleado = null) {
        const isEdit = empleado !== null;
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nuevo'} Empleado</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEmpleado">
                            <div class="form-group">
                                <label class="form-label form-label-required">Nombre Completo</label>
                                <input type="text" class="form-input" id="nombre" 
                                       value="${empleado?.nombre || ''}" 
                                       placeholder="Juan Pérez García" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Cédula</label>
                                    <input type="text" class="form-input" id="cedula" 
                                           value="${empleado?.cedula || ''}" 
                                           placeholder="0123456789" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Cargo</label>
                                    <input type="text" class="form-input" id="cargo" 
                                           value="${empleado?.cargo || ''}" 
                                           placeholder="Contador" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Sueldo Mensual</label>
                                    <input type="number" class="form-input" id="sueldo" 
                                           value="${empleado?.sueldo || ''}" 
                                           placeholder="460.00" step="0.01" min="460" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Fecha de Ingreso</label>
                                    <input type="date" class="form-input" id="fechaIngreso" 
                                           value="${empleado?.fechaIngreso?.split('T')[0] || ''}" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="email" 
                                       value="${empleado?.email || ''}" 
                                       placeholder="empleado@empresa.com">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" class="form-input" id="telefono" 
                                       value="${empleado?.telefono || ''}" 
                                       placeholder="0987654321">
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="activo" ${empleado?.activo !== false ? 'checked' : ''}>
                                    <span>Empleado activo</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-empleado">
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

        const saveButton = modalContainer.querySelector('.btn-save-empleado');
        saveButton.addEventListener('click', () => {
            this.saveEmpleado(empleado?.id);
        });
    }

    saveEmpleado(id = null) {
        const form = document.getElementById('formEmpleado');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const cedula = document.getElementById('cedula').value.trim();

        // Validar cédula
        if (!Utils.validateCedula(cedula)) {
            Utils.showToast('Cédula inválida', 'error');
            return;
        }

        const data = {
            nombre: document.getElementById('nombre').value.trim(),
            cedula,
            cargo: document.getElementById('cargo').value.trim(),
            sueldo: parseFloat(document.getElementById('sueldo').value),
            fechaIngreso: new Date(document.getElementById('fechaIngreso').value).toISOString(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            activo: document.getElementById('activo').checked
        };

        try {
            if (id) {
                db.update('empleados', id, data);
                Utils.showToast('Empleado actualizado correctamente', 'success');
            } else {
                db.insert('empleados', data);
                Utils.showToast('Empleado registrado correctamente', 'success');
            }

            document.getElementById('modalContainer').innerHTML = '';
            this.loadData();

            const container = document.querySelector('.nomina-module').parentElement;
            this.render(container);

        } catch (error) {
            Utils.showToast('Error al guardar el empleado', 'error');
            console.error(error);
        }
    }

    viewEmpleado(id) {
        const empleado = db.findById('empleados', id);
        if (!empleado) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${empleado.nombre}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Cédula</label>
                                <p><strong>${empleado.cedula}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Cargo</label>
                                <p><strong>${empleado.cargo}</strong></p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Sueldo</label>
                                <p><strong>${Utils.formatCurrency(empleado.sueldo)}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fecha de Ingreso</label>
                                <p>${Utils.formatDate(empleado.fechaIngreso)}</p>
                            </div>
                        </div>
                        ${empleado.email ? `
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <p>${empleado.email}</p>
                            </div>
                        ` : ''}
                        ${empleado.telefono ? `
                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <p>${empleado.telefono}</p>
                            </div>
                        ` : ''}
                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <p>
                                <span class="status-badge ${empleado.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                    ${empleado.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
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
            this.editEmpleado(id);
        });
    }

    editEmpleado(id) {
        const empleado = db.findById('empleados', id);
        if (empleado) {
            this.showEmpleadoModal(empleado);
        }
    }

    calcularLiquidacion(id) {
        const empleado = db.findById('empleados', id);
        if (!empleado) return;

        const fechaIngreso = new Date(empleado.fechaIngreso);
        const fechaSalida = new Date();
        const diasTrabajados = Math.floor((fechaSalida - fechaIngreso) / (1000 * 60 * 60 * 24));
        const aniosTrabajados = diasTrabajados / 365;

        const sueldo = empleado.sueldo;

        // Cálculos
        const decimoTercero = (sueldo / 12) * (diasTrabajados / 365) * 12;
        const decimoCuarto = (this.salarioBasico / 12) * (diasTrabajados / 365) * 12;
        const vacaciones = (sueldo / 24) * (diasTrabajados / 365) * 12;
        const fondosReserva = aniosTrabajados >= 1 ? sueldo * 0.0833 * Math.floor(aniosTrabajados) * 12 : 0;
        const desahucio = aniosTrabajados >= 1 ? sueldo * Math.min(Math.floor(aniosTrabajados), 25) : 0;

        const totalLiquidacion = decimoTercero + decimoCuarto + vacaciones + fondosReserva + desahucio;

        Utils.confirm(
            `<div style="text-align: left;">
                <h4>Liquidación de ${empleado.nombre}</h4>
                <p><strong>Días trabajados:</strong> ${diasTrabajados} días (${aniosTrabajados.toFixed(2)} años)</p>
                <hr>
                <p>Décimo Tercero: ${Utils.formatCurrency(decimoTercero)}</p>
                <p>Décimo Cuarto: ${Utils.formatCurrency(decimoCuarto)}</p>
                <p>Vacaciones: ${Utils.formatCurrency(vacaciones)}</p>
                <p>Fondos de Reserva: ${Utils.formatCurrency(fondosReserva)}</p>
                <p>Desahucio: ${Utils.formatCurrency(desahucio)}</p>
                <hr>
                <p><strong>TOTAL LIQUIDACIÓN: ${Utils.formatCurrency(totalLiquidacion)}</strong></p>
            </div>`,
            () => {
                Utils.showToast('Cálculo de liquidación realizado', 'success');
            }
        );
    }

    generarRolPagos() {
        const empleadosActivos = this.empleados.filter(e => e.activo);

        if (empleadosActivos.length === 0) {
            Utils.showToast('No hay empleados activos', 'warning');
            return;
        }

        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const anio = hoy.getFullYear();

        const empleadosRol = empleadosActivos.map(emp => {
            const sueldo = emp.sueldo;
            const iessPersonal = sueldo * 0.0945; // 9.45%
            const anticipos = 0; // Podría venir de otra tabla

            return {
                empleadoId: emp.id,
                nombre: emp.nombre,
                sueldo,
                ingresos: sueldo,
                iessPersonal,
                anticipos,
                egresos: iessPersonal + anticipos,
                netoRecibir: sueldo - iessPersonal - anticipos
            };
        });

        const totalIngresos = empleadosRol.reduce((s, e) => s + e.ingresos, 0);
        const totalEgresos = empleadosRol.reduce((s, e) => s + e.egresos, 0);
        const netoAPagar = totalIngresos - totalEgresos;

        const rol = {
            mes,
            anio,
            fechaGeneracion: new Date().toISOString(),
            empleados: empleadosRol,
            totalIngresos,
            totalEgresos,
            netoAPagar
        };

        db.insert('rolesPago', rol);
        Utils.showToast('Rol de pagos generado correctamente', 'success');

        this.loadData();
        const container = document.querySelector('.nomina-module').parentElement;
        this.render(container);
        this.switchTab('roles');
    }

    viewRol(id) {
        const rol = db.findById('rolesPago', id);
        if (!rol) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1000px;">
                    <div class="modal-header">
                        <h3>Rol de Pagos - ${rol.mes}/${rol.anio}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Sueldo</th>
                                        <th>IESS Personal</th>
                                        <th>Anticipos</th>
                                        <th>Total Egresos</th>
                                        <th>Neto a Recibir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rol.empleados.map(emp => `
                                        <tr>
                                            <td><strong>${emp.nombre}</strong></td>
                                            <td>${Utils.formatCurrency(emp.sueldo)}</td>
                                            <td>${Utils.formatCurrency(emp.iessPersonal)}</td>
                                            <td>${Utils.formatCurrency(emp.anticipos)}</td>
                                            <td>${Utils.formatCurrency(emp.egresos)}</td>
                                            <td><strong>${Utils.formatCurrency(emp.netoRecibir)}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="background: var(--bg-secondary); font-weight: bold;">
                                        <td>TOTAL</td>
                                        <td>${Utils.formatCurrency(rol.totalIngresos)}</td>
                                        <td colspan="2"></td>
                                        <td>${Utils.formatCurrency(rol.totalEgresos)}</td>
                                        <td>${Utils.formatCurrency(rol.netoAPagar)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.nominaModule.exportarRol(${id})">
                            Exportar
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

    exportarRol(id) {
        const rol = db.findById('rolesPago', id);
        if (!rol) return;

        const data = rol.empleados.map(emp => ({
            'Empleado': emp.nombre,
            'Sueldo': emp.sueldo,
            'IESS Personal': emp.iessPersonal,
            'Anticipos': emp.anticipos,
            'Total Egresos': emp.egresos,
            'Neto a Recibir': emp.netoRecibir
        }));

        Utils.exportToCSV(data, `RolPagos_${rol.mes}_${rol.anio}.csv`);
        Utils.showToast('Rol exportado correctamente', 'success');
    }
}

window.nominaModule = new NominaModule();
