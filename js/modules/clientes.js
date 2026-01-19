/**
 * Sistema Contable Mónica - Módulo Clientes y Proveedores
 * Gestión completa de contactos
 */

class ClientesModule {
    constructor() {
        this.clientes = [];
        this.proveedores = [];
        this.currentTab = 'clientes';
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
        this.clientes = await db.get('clientes') || [];
        this.proveedores = await db.get('proveedores') || [];
    }

    /**
     * Renderiza el módulo
     */
    render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="clientes-module">
                <!-- Header -->
                <div class="module-header">
                    <div>
                        <h2>Clientes y Proveedores</h2>
                        <p class="module-description">Gestiona tus contactos comerciales</p>
                    </div>
                    <button class="btn btn-primary" id="btnNuevoContacto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                        </svg>
                        Nuevo Contacto
                    </button>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Clientes</div>
                        <div class="stat-value">${this.clientes.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Clientes Activos</div>
                        <div class="stat-value">${this.clientes.filter(c => c.activo).length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Proveedores</div>
                        <div class="stat-value">${this.proveedores.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Proveedores Activos</div>
                        <div class="stat-value">${this.proveedores.filter(p => p.activo).length}</div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="card">
                    <div class="tabs">
                        <button class="tab active" data-tab="clientes">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/>
                                <circle cx="9" cy="7" r="4" stroke-width="2"/>
                            </svg>
                            Clientes
                        </button>
                        <button class="tab" data-tab="proveedores">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke-width="2"/>
                                <circle cx="9" cy="7" r="4" stroke-width="2"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                            </svg>
                            Proveedores
                        </button>
                    </div>

                    <div class="card-body">
                        <!-- Tab Clientes -->
                        <div class="tab-content active" id="tab-clientes">
                            <div class="data-table-header">
                                <div class="data-table-search">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                        <path d="m21 21-4.35-4.35" stroke-width="2"/>
                                    </svg>
                                    <input type="text" id="searchClientes" placeholder="Buscar cliente..." class="form-input">
                                </div>
                                <div class="data-table-actions">
                                    <button class="btn btn-outline" id="btnExportClientes">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2"/>
                                        </svg>
                                        Exportar
                                    </button>
                                </div>
                            </div>
                            <div id="clientesList"></div>
                        </div>

                        <!-- Tab Proveedores -->
                        <div class="tab-content" id="tab-proveedores">
                            <div class="data-table-header">
                                <div class="data-table-search">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                        <path d="m21 21-4.35-4.35" stroke-width="2"/>
                                    </svg>
                                    <input type="text" id="searchProveedores" placeholder="Buscar proveedor..." class="form-input">
                                </div>
                                <div class="data-table-actions">
                                    <button class="btn btn-outline" id="btnExportProveedores">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2"/>
                                        </svg>
                                        Exportar
                                    </button>
                                </div>
                            </div>
                            <div id="proveedoresList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderClientes();
        this.renderProveedores();
    }

    /**
     * Renderiza la lista de clientes
     */
    renderClientes() {
        const container = document.getElementById('clientesList');
        if (!container) return;

        if (this.clientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/>
                        <circle cx="9" cy="7" r="4" stroke-width="2"/>
                    </svg>
                    <h3>No hay clientes registrados</h3>
                    <p>Crea tu primer cliente para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Identificación</th>
                            <th>Razón Social</th>
                            <th>Tipo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.clientes.map(cliente => `
                            <tr>
                                <td>
                                    <strong>${cliente.identificacion}</strong><br>
                                    <small class="text-secondary">${cliente.tipoIdentificacion}</small>
                                </td>
                                <td>
                                    <strong>${cliente.razonSocial}</strong><br>
                                    <small class="text-secondary">${cliente.nombreComercial || '-'}</small>
                                </td>
                                <td>${cliente.tipoContribuyente || '-'}</td>
                                <td>${cliente.email || '-'}</td>
                                <td>${cliente.telefono || '-'}</td>
                                <td>
                                    <span class="status-badge ${cliente.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                        ${cliente.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view" data-type="cliente" data-id="${cliente.id}" title="Ver">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-edit" data-type="cliente" data-id="${cliente.id}" title="Editar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-delete" data-type="cliente" data-id="${cliente.id}" title="Eliminar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
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

    /**
     * Renderiza la lista de proveedores
     */
    renderProveedores() {
        const container = document.getElementById('proveedoresList');
        if (!container) return;

        if (this.proveedores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke-width="2"/>
                        <circle cx="9" cy="7" r="4" stroke-width="2"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                    </svg>
                    <h3>No hay proveedores registrados</h3>
                    <p>Crea tu primer proveedor para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Identificación</th>
                            <th>Razón Social</th>
                            <th>Tipo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.proveedores.map(proveedor => `
                            <tr>
                                <td>
                                    <strong>${proveedor.identificacion}</strong><br>
                                    <small class="text-secondary">${proveedor.tipoIdentificacion}</small>
                                </td>
                                <td>
                                    <strong>${proveedor.razonSocial}</strong><br>
                                    <small class="text-secondary">${proveedor.nombreComercial || '-'}</small>
                                </td>
                                <td>${proveedor.tipoContribuyente || '-'}</td>
                                <td>${proveedor.email || '-'}</td>
                                <td>${proveedor.telefono || '-'}</td>
                                <td>
                                    <span class="status-badge ${proveedor.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                        ${proveedor.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-view" data-type="proveedor" data-id="${proveedor.id}" title="Ver">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-edit" data-type="proveedor" data-id="${proveedor.id}" title="Editar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-delete" data-type="proveedor" data-id="${proveedor.id}" title="Eliminar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
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

    /**
     * Configura los event listeners
     */
    setupEventListeners(container) {
        // Botón nuevo contacto
        const btnNuevo = container.querySelector('#btnNuevoContacto');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => {
                this.showContactoModal(this.currentTab);
            });
        }

        // Tabs
        container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Búsqueda clientes
        const searchClientes = container.querySelector('#searchClientes');
        if (searchClientes) {
            searchClientes.addEventListener('input', Utils.debounce((e) => {
                this.filterData('clientes', e.target.value);
            }, 300));
        }

        // Búsqueda proveedores
        const searchProveedores = container.querySelector('#searchProveedores');
        if (searchProveedores) {
            searchProveedores.addEventListener('input', Utils.debounce((e) => {
                this.filterData('proveedores', e.target.value);
            }, 300));
        }

        // Exportar
        const btnExportClientes = container.querySelector('#btnExportClientes');
        if (btnExportClientes) {
            btnExportClientes.addEventListener('click', () => {
                Utils.exportToCSV(this.clientes, 'clientes.csv');
            });
        }

        const btnExportProveedores = container.querySelector('#btnExportProveedores');
        if (btnExportProveedores) {
            btnExportProveedores.addEventListener('click', () => {
                Utils.exportToCSV(this.proveedores, 'proveedores.csv');
            });
        }
    }

    /**
     * Configura las acciones de la tabla
     */
    setupTableActions() {
        // Ver
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewContacto(type, id);
            });
        });

        // Editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const id = parseInt(e.currentTarget.dataset.id);
                this.editContacto(type, id);
            });
        });

        // Eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteContacto(type, id);
            });
        });
    }

    /**
     * Cambia de tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Actualizar tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    /**
     * Muestra el modal de contacto
     */
    showContactoModal(type, contacto = null) {
        const isEdit = contacto !== null;
        const isCliente = type === 'clientes' || type === 'cliente';
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nuevo'} ${isCliente ? 'Cliente' : 'Proveedor'}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formContacto">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Tipo de Identificación</label>
                                    <select class="form-select" id="tipoIdentificacion" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="RUC" ${contacto?.tipoIdentificacion === 'RUC' ? 'selected' : ''}>RUC</option>
                                        <option value="Cédula" ${contacto?.tipoIdentificacion === 'Cédula' ? 'selected' : ''}>Cédula</option>
                                        <option value="Pasaporte" ${contacto?.tipoIdentificacion === 'Pasaporte' ? 'selected' : ''}>Pasaporte</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Identificación</label>
                                    <input type="text" class="form-input" id="identificacion" 
                                           value="${contacto?.identificacion || ''}" 
                                           placeholder="Número de identificación" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Razón Social</label>
                                <input type="text" class="form-input" id="razonSocial" 
                                       value="${contacto?.razonSocial || ''}" 
                                       placeholder="Nombre o razón social" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Nombre Comercial</label>
                                <input type="text" class="form-input" id="nombreComercial" 
                                       value="${contacto?.nombreComercial || ''}" 
                                       placeholder="Nombre comercial">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Tipo de Contribuyente</label>
                                <select class="form-select" id="tipoContribuyente">
                                    <option value="">Seleccionar...</option>
                                    <option value="Especial" ${contacto?.tipoContribuyente === 'Especial' ? 'selected' : ''}>Especial</option>
                                    <option value="General" ${contacto?.tipoContribuyente === 'General' ? 'selected' : ''}>General</option>
                                    <option value="RISE" ${contacto?.tipoContribuyente === 'RISE' ? 'selected' : ''}>RISE</option>
                                    <option value="Persona Natural" ${contacto?.tipoContribuyente === 'Persona Natural' ? 'selected' : ''}>Persona Natural</option>
                                </select>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="email" 
                                           value="${contacto?.email || ''}" 
                                           placeholder="correo@ejemplo.com">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Teléfono</label>
                                    <input type="tel" class="form-input" id="telefono" 
                                           value="${contacto?.telefono || ''}" 
                                           placeholder="0987654321">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Dirección</label>
                                <textarea class="form-textarea" id="direccion" 
                                          placeholder="Dirección completa">${contacto?.direccion || ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="activo" ${contacto?.activo !== false ? 'checked' : ''}>
                                    <span>${isCliente ? 'Cliente' : 'Proveedor'} activo</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-contacto">
                            ${isEdit ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners del modal
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal, .btn-cancel-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });

        const saveButton = modalContainer.querySelector('.btn-save-contacto');
        saveButton.addEventListener('click', () => {
            this.saveContacto(type, contacto?.id);
        });

        // Validación de identificación
        const tipoIdSelect = modalContainer.querySelector('#tipoIdentificacion');
        const idInput = modalContainer.querySelector('#identificacion');

        tipoIdSelect.addEventListener('change', () => {
            idInput.value = '';
        });

        idInput.addEventListener('blur', () => {
            const tipo = tipoIdSelect.value;
            const id = idInput.value;

            if (tipo === 'RUC' && id && !Utils.validateRUC(id)) {
                idInput.style.borderColor = 'var(--color-danger)';
                Utils.showToast('RUC inválido', 'error');
            } else if (tipo === 'Cédula' && id && !Utils.validateCedula(id)) {
                idInput.style.borderColor = 'var(--color-danger)';
                Utils.showToast('Cédula inválida', 'error');
            } else {
                idInput.style.borderColor = '';
            }
        });
    }

    /**
     * Guarda un contacto
     */
    saveContacto(type, id = null) {
        const form = document.getElementById('formContacto');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const isCliente = type === 'clientes' || type === 'cliente';
        const table = isCliente ? 'clientes' : 'proveedores';

        const data = {
            tipoIdentificacion: document.getElementById('tipoIdentificacion').value,
            identificacion: document.getElementById('identificacion').value.trim(),
            razonSocial: document.getElementById('razonSocial').value.trim(),
            nombreComercial: document.getElementById('nombreComercial').value.trim(),
            tipoContribuyente: document.getElementById('tipoContribuyente').value,
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            activo: document.getElementById('activo').checked
        };

        // Validaciones
        if (data.tipoIdentificacion === 'RUC' && !Utils.validateRUC(data.identificacion)) {
            Utils.showToast('El RUC ingresado no es válido', 'error');
            return;
        }

        if (data.tipoIdentificacion === 'Cédula' && !Utils.validateCedula(data.identificacion)) {
            Utils.showToast('La cédula ingresada no es válida', 'error');
            return;
        }

        if (data.email && !Utils.validateEmail(data.email)) {
            Utils.showToast('El email ingresado no es válido', 'error');
            return;
        }

        try {
            if (id) {
                db.update(table, id, data);
                Utils.showToast(`${isCliente ? 'Cliente' : 'Proveedor'} actualizado correctamente`, 'success');
            } else {
                db.insert(table, data);
                Utils.showToast(`${isCliente ? 'Cliente' : 'Proveedor'} creado correctamente`, 'success');
            }

            document.getElementById('modalContainer').innerHTML = '';
            await this.loadData();
            this.renderClientes();
            this.renderProveedores();

        } catch (error) {
            Utils.showToast('Error al guardar el contacto', 'error');
            console.error(error);
        }
    }

    /**
     * Ver contacto
     */
    viewContacto(type, id) {
        const table = type === 'cliente' ? 'clientes' : 'proveedores';
        const contacto = await db.findById(table, id);
        if (!contacto) return;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${contacto.razonSocial}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipo de Identificación</label>
                                <p><strong>${contacto.tipoIdentificacion}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Identificación</label>
                                <p><strong>${contacto.identificacion}</strong></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Razón Social</label>
                            <p>${contacto.razonSocial}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nombre Comercial</label>
                            <p>${contacto.nombreComercial || '-'}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo de Contribuyente</label>
                            <p>${contacto.tipoContribuyente || '-'}</p>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <p>${contacto.email || '-'}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <p>${contacto.telefono || '-'}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dirección</label>
                            <p>${contacto.direccion || '-'}</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <p>
                                <span class="status-badge ${contacto.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                    ${contacto.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                        <button class="btn btn-primary btn-edit-from-view" data-type="${type}" data-id="${id}">
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
            this.editContacto(type, id);
        });
    }

    /**
     * Edita un contacto
     */
    editContacto(type, id) {
        const table = type === 'cliente' ? 'clientes' : 'proveedores';
        const contacto = await db.findById(table, id);
        if (contacto) {
            this.showContactoModal(type, contacto);
        }
    }

    /**
     * Elimina un contacto
     */
    deleteContacto(type, id) {
        const table = type === 'cliente' ? 'clientes' : 'proveedores';
        const contacto = await db.findById(table, id);
        if (!contacto) return;

        const isCliente = type === 'cliente';

        Utils.confirm(
            `¿Estás seguro de eliminar ${isCliente ? 'el cliente' : 'el proveedor'} "${contacto.razonSocial}"? Esta acción no se puede deshacer.`,
            () => {
                db.remove(table, id);
                Utils.showToast(`${isCliente ? 'Cliente' : 'Proveedor'} eliminado correctamente`, 'success');

                await this.loadData();
                this.renderClientes();
                this.renderProveedores();
            }
        );
    }

    /**
     * Filtra datos
     */
    filterData(type, query) {
        const lowerQuery = query.toLowerCase();
        const data = type === 'clientes' ? this.clientes : this.proveedores;

        const filtered = data.filter(item =>
            item.razonSocial.toLowerCase().includes(lowerQuery) ||
            item.identificacion.includes(lowerQuery) ||
            (item.nombreComercial && item.nombreComercial.toLowerCase().includes(lowerQuery)) ||
            (item.email && item.email.toLowerCase().includes(lowerQuery))
        );

        if (type === 'clientes') {
            const temp = this.clientes;
            this.clientes = filtered;
            this.renderClientes();
            this.clientes = temp;
        } else {
            const temp = this.proveedores;
            this.proveedores = filtered;
            this.renderProveedores();
            this.proveedores = temp;
        }
    }
}

// Instancia global
window.clientesModule = new ClientesModule();
