/**
 * EContable - Módulo Usuarios
 * Gestión de usuarios y roles del sistema
 */

class UsuariosModule {
    constructor() {
        this.usuarios = [];
        this.roles = [
            { id: 'admin', nombre: 'Administrador', permisos: ['all'] },
            { id: 'contador', nombre: 'Contador', permisos: ['contabilidad', 'reportes', 'ventas', 'compras', 'view'] },
            { id: 'vendedor', nombre: 'Vendedor', permisos: ['ventas', 'clientes', 'view'] },
            { id: 'comprador', nombre: 'Comprador', permisos: ['compras', 'proveedores', 'inventario', 'view'] },
            { id: 'consulta', nombre: 'Solo Consulta', permisos: ['view'] }
        ];
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeDefaultUser();
    }

    async loadData() {
        this.usuarios = await db.get('usuarios') || [];
    }

    initializeDefaultUser() {
        // Crear usuario admin por defecto si no existe
        if (this.usuarios.length === 0) {
            const adminUser = {
                username: 'admin',
                nombre: 'Administrador',
                email: 'admin@econtable.ec',
                identificacion: '0000000000',
                tipoIdentificacion: 'Cédula',
                rol: 'admin',
                activo: true,
                fechaCreacion: new Date().toISOString()
            };
            db.insert('usuarios', adminUser);
            this.usuarios = [adminUser];
        }
    }

    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="usuarios-module">
                <div class="module-header">
                    <div>
                        <h2>Usuarios del Sistema</h2>
                        <p class="module-description">Gestiona usuarios y sus permisos</p>
                    </div>
                    <button class="btn btn-primary" id="btnNuevoUsuario">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                        </svg>
                        Nuevo Usuario
                    </button>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Usuarios</div>
                        <div class="stat-value">${stats.total}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Usuarios Activos</div>
                        <div class="stat-value text-success">${stats.activos}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Administradores</div>
                        <div class="stat-value">${stats.admins}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Contadores</div>
                        <div class="stat-value">${stats.contadores}</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Lista de Usuarios</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchUsuarios" placeholder="Buscar usuario..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="usuariosList"></div>
                    </div>
                </div>

                <div class="card" style="margin-top: 24px;">
                    <div class="card-header">
                        <h3>Roles y Permisos</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderRoles()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderUsuarios();
    }

    calculateStats() {
        const activos = this.usuarios.filter(u => u.activo).length;
        const admins = this.usuarios.filter(u => u.rol === 'admin').length;
        const contadores = this.usuarios.filter(u => u.rol === 'contador').length;

        return {
            total: this.usuarios.length,
            activos,
            admins,
            contadores
        };
    }

    renderUsuarios() {
        const container = document.getElementById('usuariosList');
        if (!container) return;

        if (this.usuarios.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke-width="2"/>
                    </svg>
                    <h3>No hay usuarios registrados</h3>
                    <p>Crea el primer usuario para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Identificación</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.usuarios.map(usuario => {
            const rol = this.roles.find(r => r.id === usuario.rol);
            return `
                                <tr>
                                    <td><strong>${usuario.username}</strong></td>
                                    <td>${usuario.nombre}</td>
                                    <td>${usuario.email}</td>
                                    <td>
                                        ${usuario.tipoIdentificacion}: ${usuario.identificacion}
                                    </td>
                                    <td>
                                        <span class="badge" style="background: var(--color-primary); color: white; padding: 4px 12px; border-radius: 12px;">
                                            ${rol ? rol.nombre : usuario.rol}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge ${usuario.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                            ${usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn-table-action btn-view" data-id="${usuario.id}" title="Ver">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                    <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-edit" data-id="${usuario.id}" title="Editar">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            ${usuario.username !== 'admin' ? `
                                                <button class="btn-table-action btn-delete" data-id="${usuario.id}" title="Eliminar">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                                                    </svg>
                                                </button>
                                            ` : ''}
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

    renderRoles() {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Rol</th>
                            <th>Permisos</th>
                            <th>Usuarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.roles.map(rol => {
            const usuariosConRol = this.usuarios.filter(u => u.rol === rol.id).length;
            return `
                                <tr>
                                    <td><strong>${rol.nombre}</strong></td>
                                    <td>
                                        ${rol.permisos.includes('all')
                    ? '<span class="badge badge-ai">Todos los permisos</span>'
                    : rol.permisos.map(p => `<span class="badge" style="margin: 2px;">${p}</span>`).join('')
                }
                                    </td>
                                    <td>${usuariosConRol} usuario(s)</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners(container) {
        const btnNuevo = container.querySelector('#btnNuevoUsuario');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showUsuarioModal());
        }

        const searchInput = container.querySelector('#searchUsuarios');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterUsuarios(e.target.value);
            }, 300));
        }
    }

    setupTableActions() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewUsuario(id);
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editUsuario(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteUsuario(id);
            });
        });
    }

    showUsuarioModal(usuario = null) {
        const isEdit = usuario !== null;
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nuevo'} Usuario</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formUsuario">
                            <div class="form-group">
                                <label class="form-label form-label-required">Nombre de Usuario</label>
                                <input type="text" class="form-input" id="username" 
                                       value="${usuario?.username || ''}" 
                                       ${isEdit ? 'readonly' : ''} 
                                       placeholder="usuario123" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Nombre Completo</label>
                                <input type="text" class="form-input" id="nombre" 
                                       value="${usuario?.nombre || ''}" 
                                       placeholder="Juan Pérez" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Email</label>
                                <input type="email" class="form-input" id="email" 
                                       value="${usuario?.email || ''}" 
                                       placeholder="usuario@empresa.com" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Tipo de Identificación</label>
                                    <select class="form-select" id="tipoIdentificacion" required>
                                        <option value="Cédula" ${usuario?.tipoIdentificacion === 'Cédula' ? 'selected' : ''}>Cédula</option>
                                        <option value="RUC" ${usuario?.tipoIdentificacion === 'RUC' ? 'selected' : ''}>RUC</option>
                                        <option value="Pasaporte" ${usuario?.tipoIdentificacion === 'Pasaporte' ? 'selected' : ''}>Pasaporte</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Número de Identificación</label>
                                    <input type="text" class="form-input" id="identificacion" 
                                           value="${usuario?.identificacion || ''}" 
                                           placeholder="0123456789" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Rol</label>
                                <select class="form-select" id="rol" required>
                                    ${this.roles.map(rol =>
            `<option value="${rol.id}" ${usuario?.rol === rol.id ? 'selected' : ''}>
                                            ${rol.nombre}
                                        </option>`
        ).join('')}
                                </select>
                                <span class="form-help" id="rolDescription"></span>
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="activo" ${usuario?.activo !== false ? 'checked' : ''}>
                                    <span>Usuario activo</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-usuario">
                            ${isEdit ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal, .btn-cancel-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });

        const saveButton = modalContainer.querySelector('.btn-save-usuario');
        saveButton.addEventListener('click', () => {
            this.saveUsuario(usuario?.id);
        });

        // Mostrar descripción del rol
        const rolSelect = modalContainer.querySelector('#rol');
        const rolDescription = modalContainer.querySelector('#rolDescription');

        const updateRolDescription = () => {
            const selectedRol = this.roles.find(r => r.id === rolSelect.value);
            if (selectedRol) {
                rolDescription.textContent = `Permisos: ${selectedRol.permisos.join(', ')}`;
            }
        };

        rolSelect.addEventListener('change', updateRolDescription);
        updateRolDescription();
    }

    saveUsuario(id = null) {
        const form = document.getElementById('formUsuario');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const tipoId = document.getElementById('tipoIdentificacion').value;
        const identificacion = document.getElementById('identificacion').value.trim();

        // Validar identificación
        if (tipoId === 'Cédula' && !Utils.validateCedula(identificacion)) {
            Utils.showToast('Cédula inválida', 'error');
            return;
        }

        if (tipoId === 'RUC' && !Utils.validateRUC(identificacion)) {
            Utils.showToast('RUC inválido', 'error');
            return;
        }

        const data = {
            username: document.getElementById('username').value.trim().toLowerCase(),
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            tipoIdentificacion: tipoId,
            identificacion,
            rol: document.getElementById('rol').value,
            activo: document.getElementById('activo').checked
        };

        // Validar email
        if (!Utils.validateEmail(data.email)) {
            Utils.showToast('Email inválido', 'error');
            return;
        }

        // Validar username único
        const existente = this.usuarios.find(u => u.username === data.username && (!id || u.id !== id));
        if (existente) {
            Utils.showToast('El nombre de usuario ya existe', 'error');
            return;
        }

        try {
            if (id) {
                db.update('usuarios', id, data);
                Utils.showToast('Usuario actualizado correctamente', 'success');
            } else {
                data.fechaCreacion = new Date().toISOString();
                db.insert('usuarios', data);
                Utils.showToast('Usuario creado correctamente', 'success');
            }

            document.getElementById('modalContainer').innerHTML = '';
            await this.loadData();
            this.renderUsuarios();

        } catch (error) {
            Utils.showToast('Error al guardar el usuario', 'error');
            console.error(error);
        }
    }

    viewUsuario(id) {
        const usuario = await db.findById('usuarios', id);
        if (!usuario) return;

        const rol = this.roles.find(r => r.id === usuario.rol);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${usuario.nombre}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Usuario</label>
                            <p><strong>${usuario.username}</strong></p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <p>${usuario.email}</p>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipo de Identificación</label>
                                <p>${usuario.tipoIdentificacion}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Número</label>
                                <p>${usuario.identificacion}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Rol</label>
                            <p><strong>${rol ? rol.nombre : usuario.rol}</strong></p>
                            ${rol ? `<small class="text-secondary">Permisos: ${rol.permisos.join(', ')}</small>` : ''}
                        </div>
                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <p>
                                <span class="status-badge ${usuario.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                    ${usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha de Creación</label>
                            <p>${Utils.formatDate(usuario.fechaCreacion)}</p>
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
            this.editUsuario(id);
        });
    }

    editUsuario(id) {
        const usuario = await db.findById('usuarios', id);
        if (usuario) {
            this.showUsuarioModal(usuario);
        }
    }

    deleteUsuario(id) {
        const usuario = await db.findById('usuarios', id);
        if (!usuario) return;

        if (usuario.username === 'admin') {
            Utils.showToast('No se puede eliminar el usuario administrador', 'error');
            return;
        }

        Utils.confirm(
            `¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`,
            () => {
                db.remove('usuarios', id);
                Utils.showToast('Usuario eliminado correctamente', 'success');
                await this.loadData();
                this.renderUsuarios();
            }
        );
    }

    filterUsuarios(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.usuarios.filter(u =>
            u.username.toLowerCase().includes(lowerQuery) ||
            u.nombre.toLowerCase().includes(lowerQuery) ||
            u.email.toLowerCase().includes(lowerQuery) ||
            u.identificacion.includes(lowerQuery)
        );

        const temp = this.usuarios;
        this.usuarios = filtered;
        this.renderUsuarios();
        this.usuarios = temp;
    }
}

window.usuariosModule = new UsuariosModule();
