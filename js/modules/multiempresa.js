/**
 * Sistema Contable Mónica - Módulo Multiempresa
 * Gestión de múltiples empresas
 */

class MultiempresaModule {
    constructor() {
        this.empresas = [];
        this.empresaActual = null;
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    async init() {
        await this.loadEmpresas();
        await this.loadEmpresaActual();
    }

    /**
     * Carga las empresas
     */
    async loadEmpresas() {
        this.empresas = await db.get('empresas') || [];
    }

    /**
     * Carga la empresa actual
     */
    loadEmpresaActual() {
        const config = db.get('configuracion') || {};
        if (config.empresaActual) {
            this.empresaActual = db.findById('empresas', config.empresaActual);
        }
    }

    /**
     * Renderiza el módulo
     */
    render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="multiempresa-module">
                <!-- Header -->
                <div class="module-header">
                    <div>
                        <h2>Gestión Multiempresa</h2>
                        <p class="module-description">Administra las empresas del sistema</p>
                    </div>
                    <button class="btn btn-primary" id="btnNuevaEmpresa">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                        </svg>
                        Nueva Empresa
                    </button>
                </div>

                <!-- Empresa Actual -->
                ${this.renderEmpresaActual()}

                <!-- Lista de Empresas -->
                <div class="card">
                    <div class="card-header">
                        <h3>Empresas Registradas</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchEmpresas" placeholder="Buscar empresa..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="empresasList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderEmpresas();
    }

    /**
     * Renderiza la empresa actual
     */
    renderEmpresaActual() {
        if (!this.empresaActual) {
            return `
                <div class="info-box info-box-warning">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                        </svg>
                        No hay empresa seleccionada
                    </h4>
                    <p>Selecciona una empresa para comenzar a trabajar o crea una nueva.</p>
                </div>
            `;
        }

        return `
            <div class="card empresa-actual-card">
                <div class="card-header">
                    <h3>Empresa Actual</h3>
                    <span class="badge badge-ai">Activa</span>
                </div>
                <div class="card-body">
                    <div class="empresa-actual-info">
                        <div class="empresa-logo">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="empresa-details">
                            <h4>${this.empresaActual.razonSocial}</h4>
                            <p><strong>RUC:</strong> ${this.empresaActual.ruc}</p>
                            <p><strong>Nombre Comercial:</strong> ${this.empresaActual.nombreComercial || 'N/A'}</p>
                            <p><strong>Régimen:</strong> ${this.empresaActual.regimenTributario || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza la lista de empresas
     */
    renderEmpresas() {
        const container = document.getElementById('empresasList');
        if (!container) return;

        if (this.empresas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-width="2"/>
                    </svg>
                    <h3>No hay empresas registradas</h3>
                    <p>Crea tu primera empresa para comenzar</p>
                    <button class="btn btn-primary" onclick="document.getElementById('btnNuevaEmpresa').click()">
                        Crear Empresa
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>RUC</th>
                            <th>Razón Social</th>
                            <th>Nombre Comercial</th>
                            <th>Régimen</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.empresas.map(empresa => `
                            <tr>
                                <td><strong>${empresa.ruc}</strong></td>
                                <td>${empresa.razonSocial}</td>
                                <td>${empresa.nombreComercial || '-'}</td>
                                <td>${empresa.regimenTributario || '-'}</td>
                                <td>
                                    <span class="status-badge ${empresa.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                        ${empresa.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-table-action btn-select" data-id="${empresa.id}" title="Seleccionar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <polyline points="20 6 9 17 4 12" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-edit" data-id="${empresa.id}" title="Editar">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                            </svg>
                                        </button>
                                        <button class="btn-table-action btn-delete" data-id="${empresa.id}" title="Eliminar">
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
        // Botón nueva empresa
        const btnNueva = container.querySelector('#btnNuevaEmpresa');
        if (btnNueva) {
            btnNueva.addEventListener('click', () => this.showEmpresaModal());
        }

        // Búsqueda
        const searchInput = container.querySelector('#searchEmpresas');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterEmpresas(e.target.value);
            }, 300));
        }
    }

    /**
     * Configura las acciones de la tabla
     */
    setupTableActions() {
        // Seleccionar empresa
        document.querySelectorAll('.btn-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.selectEmpresa(id);
            });
        });

        // Editar empresa
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editEmpresa(id);
            });
        });

        // Eliminar empresa
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteEmpresa(id);
            });
        });
    }

    /**
     * Muestra el modal de empresa
     */
    showEmpresaModal(empresa = null) {
        const isEdit = empresa !== null;
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nueva'} Empresa</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEmpresa">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">RUC</label>
                                    <input type="text" class="form-input" id="ruc" 
                                           value="${empresa?.ruc || ''}" 
                                           placeholder="1234567890001" 
                                           maxlength="13" required>
                                    <span class="form-help">13 dígitos</span>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Régimen Tributario</label>
                                    <select class="form-select" id="regimenTributario" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="General" ${empresa?.regimenTributario === 'General' ? 'selected' : ''}>General</option>
                                        <option value="RISE" ${empresa?.regimenTributario === 'RISE' ? 'selected' : ''}>RISE</option>
                                        <option value="Especial" ${empresa?.regimenTributario === 'Especial' ? 'selected' : ''}>Especial</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Razón Social</label>
                                <input type="text" class="form-input" id="razonSocial" 
                                       value="${empresa?.razonSocial || ''}" 
                                       placeholder="EMPRESA EJEMPLO S.A." required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Nombre Comercial</label>
                                <input type="text" class="form-input" id="nombreComercial" 
                                       value="${empresa?.nombreComercial || ''}" 
                                       placeholder="Empresa Ejemplo">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Actividad Económica</label>
                                <input type="text" class="form-input" id="actividadEconomica" 
                                       value="${empresa?.actividadEconomica || ''}" 
                                       placeholder="Venta al por menor">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Teléfono</label>
                                    <input type="tel" class="form-input" id="telefono" 
                                           value="${empresa?.telefono || ''}" 
                                           placeholder="02-2345678">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="email" 
                                           value="${empresa?.email || ''}" 
                                           placeholder="info@empresa.ec">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Dirección</label>
                                <textarea class="form-textarea" id="direccion" 
                                          placeholder="Dirección completa">${empresa?.direccion || ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Representante Legal</label>
                                <input type="text" class="form-input" id="representanteLegal" 
                                       value="${empresa?.representanteLegal || ''}" 
                                       placeholder="Nombre del representante">
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="activo" ${empresa?.activo !== false ? 'checked' : ''}>
                                    <span>Empresa activa</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-empresa">
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

        const saveButton = modalContainer.querySelector('.btn-save-empresa');
        saveButton.addEventListener('click', () => {
            this.saveEmpresa(empresa?.id);
        });

        // Validación de RUC en tiempo real
        const rucInput = modalContainer.querySelector('#ruc');
        rucInput.addEventListener('blur', () => {
            const ruc = rucInput.value;
            if (ruc && !Utils.validateRUC(ruc)) {
                rucInput.style.borderColor = 'var(--color-danger)';
                Utils.showToast('RUC inválido', 'error');
            } else {
                rucInput.style.borderColor = '';
            }
        });
    }

    /**
     * Guarda una empresa
     */
    saveEmpresa(id = null) {
        const form = document.getElementById('formEmpresa');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            ruc: document.getElementById('ruc').value.trim(),
            razonSocial: document.getElementById('razonSocial').value.trim(),
            nombreComercial: document.getElementById('nombreComercial').value.trim(),
            actividadEconomica: document.getElementById('actividadEconomica').value.trim(),
            regimenTributario: document.getElementById('regimenTributario').value,
            telefono: document.getElementById('telefono').value.trim(),
            email: document.getElementById('email').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            representanteLegal: document.getElementById('representanteLegal').value.trim(),
            activo: document.getElementById('activo').checked
        };

        // Validar RUC
        if (!Utils.validateRUC(data.ruc)) {
            Utils.showToast('El RUC ingresado no es válido', 'error');
            return;
        }

        // Validar email
        if (data.email && !Utils.validateEmail(data.email)) {
            Utils.showToast('El email ingresado no es válido', 'error');
            return;
        }

        // Verificar RUC duplicado
        const empresas = db.find('empresas', { ruc: data.ruc });
        if (empresas.length > 0 && (!id || empresas[0].id !== id)) {
            Utils.showToast('Ya existe una empresa con este RUC', 'error');
            return;
        }

        try {
            if (id) {
                db.update('empresas', id, data);
                Utils.showToast('Empresa actualizada correctamente', 'success');
            } else {
                const newEmpresa = db.insert('empresas', data);

                // Si es la primera empresa, seleccionarla automáticamente
                if (this.empresas.length === 0) {
                    this.selectEmpresa(newEmpresa.id);
                }

                Utils.showToast('Empresa creada correctamente', 'success');
            }

            // Cerrar modal y recargar
            document.getElementById('modalContainer').innerHTML = '';
            this.loadEmpresas();
            this.renderEmpresas();

            // Actualizar selector de empresas en el header
            if (window.app) {
                window.app.loadCompanySelector();
            }

        } catch (error) {
            Utils.showToast('Error al guardar la empresa', 'error');
            console.error(error);
        }
    }

    /**
     * Selecciona una empresa como actual
     */
    selectEmpresa(id) {
        const empresa = db.findById('empresas', id);
        if (!empresa) return;

        const config = db.get('configuracion') || {};
        config.empresaActual = id;
        db.set('configuracion', config);

        this.empresaActual = empresa;
        Utils.showToast(`Empresa "${empresa.razonSocial}" seleccionada`, 'success');

        // Actualizar UI
        const container = document.querySelector('.multiempresa-module');
        if (container) {
            const empresaActualSection = container.querySelector('.empresa-actual-card')?.parentElement;
            if (empresaActualSection) {
                empresaActualSection.outerHTML = this.renderEmpresaActual();
            }
        }

        // Actualizar selector en header
        if (window.app) {
            window.app.loadCompanySelector();
            window.app.changeCompany(id);
        }
    }

    /**
     * Edita una empresa
     */
    editEmpresa(id) {
        const empresa = db.findById('empresas', id);
        if (empresa) {
            this.showEmpresaModal(empresa);
        }
    }

    /**
     * Elimina una empresa
     */
    deleteEmpresa(id) {
        const empresa = db.findById('empresas', id);
        if (!empresa) return;

        Utils.confirm(
            `¿Estás seguro de eliminar la empresa "${empresa.razonSocial}"? Esta acción no se puede deshacer.`,
            () => {
                // Verificar si es la empresa actual
                const config = db.get('configuracion') || {};
                if (config.empresaActual === id) {
                    config.empresaActual = null;
                    db.set('configuracion', config);
                    this.empresaActual = null;
                }

                db.remove('empresas', id);
                Utils.showToast('Empresa eliminada correctamente', 'success');

                this.loadEmpresas();
                this.renderEmpresas();

                // Actualizar UI
                const container = document.querySelector('.multiempresa-module');
                if (container) {
                    const empresaActualSection = container.querySelector('.empresa-actual-card')?.parentElement;
                    if (empresaActualSection) {
                        empresaActualSection.outerHTML = this.renderEmpresaActual();
                    }
                }

                if (window.app) {
                    window.app.loadCompanySelector();
                }
            }
        );
    }

    /**
     * Filtra empresas
     */
    filterEmpresas(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.empresas.filter(empresa =>
            empresa.razonSocial.toLowerCase().includes(lowerQuery) ||
            empresa.ruc.includes(lowerQuery) ||
            (empresa.nombreComercial && empresa.nombreComercial.toLowerCase().includes(lowerQuery))
        );

        const tempEmpresas = this.empresas;
        this.empresas = filtered;
        this.renderEmpresas();
        this.empresas = tempEmpresas;
    }
}

// Instancia global
window.multiempresaModule = new MultiempresaModule();
