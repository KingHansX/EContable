/**
 * Sistema Contable Mónica - Módulo de Nómina
 * Gestión de empleados y generación de roles de pago
 */

class NominaModule {
    constructor() {
        this.empleados = [];
        this.roles = [];
        this.mesActual = new Date().getMonth() + 1;
        this.anioActual = new Date().getFullYear();
    }

    async render(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>Nómina y Roles de Pago</h2>
                    <p class="module-description">Gestión de RRHH, Sueldos y Cálculo IESS.</p>
                </div>
                <div style="display:flex; gap: 10px;">
                     <div style="display:flex; align-items:center; gap:5px; background:var(--bg-secondary); padding:5px 10px; border-radius:8px;">
                        <select id="nominaMes" class="form-select" style="width: auto; padding: 2px 5px;" onchange="window.nominaModule.loadRoles()">
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => `<option value="${m}" ${m === this.mesActual ? 'selected' : ''}>Mes ${m}</option>`).join('')}
                        </select>
                        <select id="nominaAnio" class="form-select" style="width: auto; padding: 2px 5px;" onchange="window.nominaModule.loadRoles()">
                            <option value="2025">2025</option>
                            <option value="2026" selected>2026</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" onclick="window.nominaModule.generateRoles()">
                        💰 Generar Roles
                    </button>
                    <button class="btn btn-primary" onclick="window.nominaModule.showNewEmployeeModal()">
                        + Nuevo Empleado
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; height: calc(100vh - 200px);">
                <!-- Lista Empleados -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <div class="card-header">
                        <h3>Empleados</h3>
                    </div>
                    <div class="card-body" style="overflow-y: auto; flex:1; padding:0;">
                        <div id="listaEmpleados" class="list-group">
                            <!-- Se llena dinámicamente -->
                            <div class="text-center p-3 text-secondary">Cargando...</div>
                        </div>
                    </div>
                </div>

                <!-- Roles de Pago -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <div class="card-header">
                        <h3>Roles de Pago (Mes Seleccionado)</h3>
                    </div>
                    <div class="card-body" style="overflow-y: auto;">
                        <table class="table" style="font-size: 0.9em;">
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Sueldo Base</th>
                                    <th>Ingresos</th>
                                    <th>Egresos (IESS)</th>
                                    <th>A Recibir</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tablaRoles">
                                <tr><td colspan="6" class="text-center">Seleccione Generar Roles para calcular.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        await this.loadEmpleados();
        await this.loadRoles();
    }

    async loadEmpleados() {
        try {
            if (db.useBackend) {
                const res = await fetch(`${db.apiUrl}/empleados`);
                this.empleados = await res.json();
            }
            this.renderListaEmpleados();
        } catch (e) {
            console.error("Error cargando empleados", e);
        }
    }

    renderListaEmpleados() {
        const container = document.getElementById('listaEmpleados');
        if (!container) return;

        if (this.empleados.length === 0) {
            container.innerHTML = '<div class="text-center p-3 text-secondary">No hay empleados registrados.</div>';
            return;
        }

        container.innerHTML = this.empleados.map(e => `
            <div class="list-item" style="padding: 10px 15px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight:bold;">${e.nombres} ${e.apellidos}</div>
                    <div style="font-size:0.8em; color:var(--text-secondary);">${e.cargo}</div>
                </div>
                <div class="badge badge-success">$${e.sueldo_base}</div>
            </div>
        `).join('');
    }

    async loadRoles() {
        const mes = document.getElementById('nominaMes').value;
        const anio = document.getElementById('nominaAnio').value;

        try {
            if (db.useBackend) {
                const res = await fetch(`${db.apiUrl}/roles_pago?mes=${mes}&anio=${anio}`);
                this.roles = await res.json();
                this.renderTablaRoles();
            }
        } catch (e) {
            console.error(e);
        }
    }

    renderTablaRoles() {
        const tbody = document.getElementById('tablaRoles');
        if (!tbody) return;

        if (this.roles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary">No hay roles generados para este mes.<br>Presione "Generar Roles" para calcular.</td></tr>';
            return;
        }

        tbody.innerHTML = this.roles.map(r => `
            <tr>
                <td><strong>${r.nombres} ${r.apellidos}</strong><br><small>${r.cedula}</small></td>
                <td>${Utils.formatCurrency(r.sueldo_ganado)}</td>
                <td class="text-success">${Utils.formatCurrency(r.sueldo_ganado + (r.monto_horas_extras || 0) + (r.bonificaciones || 0))}</td>
                <td class="text-danger">-${Utils.formatCurrency((r.aporte_iess_personal || 0) + (r.prestamos_anticipos || 0))}</td>
                <td><strong style="font-size:1.1em">${Utils.formatCurrency(r.liquido_recibir)}</strong></td>
                <td><span class="status-badge status-badge-paid">${r.estado}</span></td>
            </tr>
        `).join('');
    }

    async generateRoles() {
        if (!confirm("¿Generar roles para TODOS los empleados activos?\nSe calculará el 9.45% de aporte IESS automáticamente.")) return;

        const mes = document.getElementById('nominaMes').value;
        const anio = document.getElementById('nominaAnio').value;

        try {
            if (db.useBackend) {
                const res = await fetch(`${db.apiUrl}/roles_pago/generar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mes, anio })
                });
                const data = await res.json();
                Utils.showToast(data.message, "success");
                this.loadRoles();
            }
        } catch (e) {
            Utils.showToast("Error generando roles", "error");
        }
    }

    showNewEmployeeModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>Nuevo Empleado</h3>
                        <button class="btn-close-modal" onclick="document.getElementById('modalContainer').innerHTML=''">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEmpleado">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cédula</label>
                                    <input type="text" id="empCedula" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Fecha Ingreso</label>
                                    <input type="date" id="empFecha" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombres</label>
                                    <input type="text" id="empNombres" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Apellidos</label>
                                    <input type="text" id="empApellidos" class="form-input" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cargo</label>
                                    <input type="text" id="empCargo" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Sueldo Base ($)</label>
                                    <input type="number" id="empSueldo" class="form-input" step="0.01" required>
                                </div>
                            </div>
                             <div class="form-row">
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="empEmail" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="text" id="empTelefono" class="form-input">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('modalContainer').innerHTML=''">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.nominaModule.saveEmployee()">Guardar</button>
                    </div>
                </div>
            </div>
        `;
    }

    async saveEmployee() {
        const data = {
            cedula: document.getElementById('empCedula').value,
            nombres: document.getElementById('empNombres').value,
            apellidos: document.getElementById('empApellidos').value,
            cargo: document.getElementById('empCargo').value,
            sueldo_base: parseFloat(document.getElementById('empSueldo').value),
            fecha_ingreso: document.getElementById('empFecha').value,
            email: document.getElementById('empEmail').value,
            telefono: document.getElementById('empTelefono').value
        };

        if (!data.cedula || !data.nombres || !data.sueldo_base) {
            Utils.showToast("Complete los campos obligatorios", "warning");
            return;
        }

        try {
            if (db.useBackend) {
                await fetch(`${db.apiUrl}/empleados`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                Utils.showToast("Empleado registrado", "success");
                document.getElementById('modalContainer').innerHTML = '';
                this.loadEmpleados();
            }
        } catch (e) {
            Utils.showToast("Error guardando empleado", "error");
        }
    }
}

window.nominaModule = new NominaModule();
