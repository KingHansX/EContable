/**
 * Módulo de Bancos - EContable
 * Gestión de Cuentas Corrientes, Cheques y Conciliación
 */

class BancosModule {
    constructor() {
        this.cuentas = [];
        this.movimientos = [];
        this.currentCuenta = null;
        this.init();
    }

    async init() {
        await this.loadData();
    }

    async loadData() {
        // Cargar desde DB local o Backend
        if (db.useBackend) {
            try {
                const res = await fetch(`${db.apiUrl}/bancos`);
                this.cuentas = await res.json();
            } catch (e) { console.error(e); }
        } else {
            this.cuentas = db.find('cuentas_bancarias') || [];
        }
    }

    render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="bancos-module">
                <div class="module-header">
                    <div>
                        <h2>Bancos y Cuentas</h2>
                        <p class="module-description">Gestión de cheques, depósitos y conciliaciones</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnConciliar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/>
                                <polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/>
                            </svg>
                            Conciliación
                        </button>
                        <button class="btn btn-primary" id="btnNuevaCuenta">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nueva Cuenta
                        </button>
                    </div>
                </div>

                <div class="grid-layout" style="display: grid; grid-template-columns: 300px 1fr; gap: 24px; margin-top: 20px;">
                    <!-- Sidebar Cuentas -->
                    <div class="card">
                        <div class="card-header">
                            <h3>Mis Cuentas</h3>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            <div class="cuentas-list" id="listaCuentasBancarias">
                                ${this.renderListaCuentas()}
                            </div>
                        </div>
                    </div>

                    <!-- Detalles y Movimientos -->
                    <div class="card">
                        <div class="card-header">
                            <h3 id="tituloCuentaSeleccionada">Selecciona una cuenta</h3>
                            <div class="actions" id="accionesCuenta" style="display: none;">
                                <button class="btn btn-sm btn-outline" onclick="window.bancosModule.nuevoMovimiento('CHEQUE')">Girrar Cheque</button>
                                <button class="btn btn-sm btn-outline" onclick="window.bancosModule.nuevoMovimiento('DEPOSITO')">Depósito</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="panelMovimientos">
                                <div class="empty-state">
                                    <p>Selecciona una cuenta bancaria para ver sus movimientos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
    }

    renderListaCuentas() {
        if (this.cuentas.length === 0) return '<div style="padding: 16px;">No hay cuentas registradas</div>';

        return this.cuentas.map(c => `
            <div class="cuenta-item ${this.currentCuenta?.id === c.id ? 'active' : ''}" 
                 onclick="window.bancosModule.selectCuenta(${c.id})"
                 style="padding: 16px; border-bottom: 1px solid var(--border-color); cursor: pointer; hover: background: var(--bg-hover);">
                <div style="font-weight: 600;">${c.banco_nombre}</div>
                <div style="font-size: 0.9em; color: var(--text-secondary);">${c.numero_cuenta}</div>
                <div style="font-weight: bold; color: var(--color-primary); margin-top: 4px;">
                    ${Utils.formatCurrency(c.saldo_actual)}
                </div>
            </div>
        `).join('');
    }

    async selectCuenta(id) {
        this.currentCuenta = this.cuentas.find(c => c.id === id);

        // Actualizar UI selección
        document.querySelectorAll('.cuenta-item').forEach(el => el.classList.remove('active'));
        // (Sería mejor re-renderizar lista pero por simplicidad)

        document.getElementById('tituloCuentaSeleccionada').textContent = `${this.currentCuenta.banco_nombre} - ${this.currentCuenta.numero_cuenta}`;
        document.getElementById('accionesCuenta').style.display = 'flex';

        await this.loadMovimientos(id);
    }

    async loadMovimientos(cuentaId) {
        const container = document.getElementById('panelMovimientos');
        container.innerHTML = '<p>Cargando movimientos...</p>';

        try {
            let movimientos = [];
            if (db.useBackend) {
                const res = await fetch(`${db.apiUrl}/movimientos_bancarios?cuenta_id=${cuentaId}`);
                movimientos = await res.json();
            }
            this.movimientosActuales = movimientos; // Guardar para conciliación
            this.renderMovimientosTabla(movimientos);
        } catch (e) {
            container.innerHTML = '<p class="text-danger">Error al cargar movimientos</p>';
        }
    }

    renderMovimientosTabla(movimientos) {
        const container = document.getElementById('panelMovimientos');
        if (movimientos.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No hay movimientos registrados en esta cuenta</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Ref</th>
                            <th>Tipo</th>
                            <th>Beneficiario/Concepto</th>
                            <th class="text-right">Débitos</th>
                            <th class="text-right">Créditos</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movimientos.map(m => `
                            <tr>
                                <td>${Utils.formatDate(m.fecha)}</td>
                                <td>${m.numero_referencia || '-'}</td>
                                <td>${m.tipo_movimiento}</td>
                                <td>
                                    <strong>${m.beneficiario || ''}</strong><br>
                                    <small>${m.concepto || ''}</small>
                                </td>
                                <td class="text-right text-danger">${m.tipo_accion === 'HABER' ? Utils.formatCurrency(m.monto) : '-'}</td>
                                <td class="text-right text-success">${m.tipo_accion === 'DEBE' ? Utils.formatCurrency(m.monto) : '-'}</td>
                                <td><span class="status-badge status-${m.estado.toLowerCase()}">${m.estado}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners(container) {
        container.querySelector('#btnNuevaCuenta').addEventListener('click', () => this.showModalNuevaCuenta());
        container.querySelector('#btnConciliar').addEventListener('click', () => this.showConciliacion());
    }

    showConciliacion() {
        if (!this.currentCuenta) {
            Utils.showToast('Selecciona primero una cuenta para conciliar', 'warning');
            return;
        }

        // Filtrar movimientos NO conciliados
        const pendientes = this.movimientosActuales ? this.movimientosActuales.filter(m => m.estado !== 'CONCILIADO') : [];

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog modal-lg">
                    <div class="modal-header">
                        <h3>Conciliación Bancaria - ${this.currentCuenta.banco_nombre}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Marca las transacciones que aparecen en tu Estado de Cuenta Real.</p>
                        <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Check</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Referencia</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendientes.map(m => `
                                        <tr>
                                            <td><input type="checkbox" class="check-conciliar" data-id="${m.id}" value="${m.id}"></td>
                                            <td>${Utils.formatDate(m.fecha)}</td>
                                            <td>${m.tipo_movimiento}</td>
                                            <td>${m.numero_referencia || ''}</td>
                                            <td class="${m.tipo_accion === 'DEBE' ? 'text-success' : 'text-danger'}">
                                                ${Utils.formatCurrency(m.monto)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ${pendientes.length === 0 ? '<p class="text-center p-3">Todo está conciliado 🎉</p>' : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.bancosModule.guardarConciliacion()">Confirmar Conciliación</button>
                    </div>
                </div>
            </div>
        `;

        modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.onclick = () => modalContainer.innerHTML = '');
    }

    async guardarConciliacion() {
        const checks = document.querySelectorAll('.check-conciliar:checked');
        if (checks.length === 0) {
            alert("No has seleccionado ninguna transacción.");
            return;
        }

        const ids = Array.from(checks).map(c => c.value);
        const fechaHoy = new Date().toISOString().split('T')[0];

        if (db.useBackend) {
            // Actualizar uno por uno (Idealmente sería un endpoint bulk)
            for (const id of ids) {
                await fetch(`${db.apiUrl}/movimientos_bancarios/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: 'CONCILIADO', fecha_conciliacion: fechaHoy })
                });
            }
        }

        document.getElementById('modalContainer').innerHTML = '';
        Utils.showToast(`${ids.length} movimientos conciliados correctamente`, 'success');
        await this.selectCuenta(this.currentCuenta.id); // Recargar
    }

    showModalNuevaCuenta() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Registrar Nueva Cuenta Bancaria</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formCuentaBanco">
                            <div class="form-group">
                                <label class="form-label">Banco</label>
                                <input type="text" class="form-input" id="bancoNombre" placeholder="Ej. Banco Pichincha" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Número de Cuenta</label>
                                <input type="text" class="form-input" id="numeroCuenta" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="tipoCuenta">
                                    <option value="CORRIENTE">Corriente</option>
                                    <option value="AHORROS">Ahorros</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Saldo Inicial</label>
                                <input type="number" step="0.01" class="form-input" id="saldoInicial" value="0.00">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-close-modal">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.bancosModule.guardarCuenta()">Guardar</button>
                    </div>
                </div>
            </div>
        `;

        modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.onclick = () => modalContainer.innerHTML = '');
    }

    async guardarCuenta() {
        const data = {
            banco_nombre: document.getElementById('bancoNombre').value,
            numero_cuenta: document.getElementById('numeroCuenta').value,
            tipo_cuenta: document.getElementById('tipoCuenta').value,
            saldo_inicial: parseFloat(document.getElementById('saldoInicial').value) || 0,
            titular: 'Empresa Principal' // TODO: Dinámico
        };

        if (db.useBackend) {
            await fetch(`${db.apiUrl}/bancos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        document.getElementById('modalContainer').innerHTML = '';
        Utils.showToast('Cuenta creada exitosamente', 'success');
        await this.loadData();
        this.render(document.getElementById('module-bancos')); // Re-render
    }

    nuevoMovimiento(tipo) {
        // Implementar modal de movimiento (Cheque/Depósito)
        alert('Funcionalidad de registrar ' + tipo + ' en desarrollo para la próxima iteración.');
    }
}

window.bancosModule = new BancosModule();
