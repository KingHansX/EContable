/**
 * Sistema Contable Mónica - Módulo Inventario
 * Gestión completa de productos y stock
 */

class InventarioModule {
    constructor() {
        this.productos = [];
        this.categorias = [];
        this.init();
    }

    /**
     * Inicializa el módulo
     */
    init() {
        this.loadData();
    }

    /**
     * Carga los datos
     */
    loadData() {
        this.productos = db.find('productos') || [];
        // Extraer categorías únicas
        this.categorias = [...new Set(this.productos.map(p => p.categoria).filter(c => c))];
    }

    /**
     * Renderiza el módulo
     */
    render(container) {
        if (!container) return;

        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="inventario-module">
                <!-- Header -->
                <div class="module-header">
                    <div>
                        <h2>Inventario</h2>
                        <p class="module-description">Gestiona tus productos y controla el stock</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" id="btnKardex">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                            </svg>
                            Kardex
                        </button>
                        <button class="btn btn-primary" id="btnNuevoProducto">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                                <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                            </svg>
                            Nuevo Producto
                        </button>
                    </div>
                </div>

                <!-- Alertas IA -->
                ${this.renderAlertasStock()}

                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Total Productos</div>
                        <div class="stat-value">${stats.total}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Productos Activos</div>
                        <div class="stat-value">${stats.activos}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Valor Total</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.valorTotal)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Stock Bajo</div>
                        <div class="stat-value text-danger">${stats.stockBajo}</div>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filters-bar">
                    <div class="filters-row">
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Categoría</label>
                            <select class="form-select" id="filterCategoria">
                                <option value="">Todas las categorías</option>
                                ${this.categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Estado</label>
                            <select class="form-select" id="filterEstado">
                                <option value="">Todos</option>
                                <option value="activo">Activos</option>
                                <option value="inactivo">Inactivos</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label">Stock</label>
                            <select class="form-select" id="filterStock">
                                <option value="">Todos</option>
                                <option value="bajo">Stock bajo</option>
                                <option value="normal">Stock normal</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Lista de Productos -->
                <div class="card">
                    <div class="card-header">
                        <h3>Productos</h3>
                        <div class="data-table-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8" stroke-width="2"/>
                                <path d="m21 21-4.35-4.35" stroke-width="2"/>
                            </svg>
                            <input type="text" id="searchProductos" placeholder="Buscar producto..." class="form-input">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="productosList"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        this.renderProductos();
    }

    /**
     * Renderiza alertas de stock
     */
    renderAlertasStock() {
        const productosStockBajo = this.productos.filter(p =>
            p.activo && p.stock <= (p.stockMinimo || 0)
        );

        if (productosStockBajo.length === 0) {
            return '';
        }

        return `
            <div class="info-box info-box-warning">
                <h4>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                    </svg>
                    Stock Bajo Detectado
                    <span class="badge badge-ai">IA</span>
                </h4>
                <p>${productosStockBajo.length} producto(s) tienen stock por debajo del mínimo:</p>
                <ul style="margin: 8px 0 0 20px; font-size: 14px;">
                    ${productosStockBajo.slice(0, 5).map(p =>
            `<li><strong>${p.nombre}</strong> - Stock: ${p.stock} (Mínimo: ${p.stockMinimo})</li>`
        ).join('')}
                    ${productosStockBajo.length > 5 ? `<li>... y ${productosStockBajo.length - 5} más</li>` : ''}
                </ul>
            </div>
        `;
    }

    /**
     * Calcula estadísticas
     */
    calculateStats() {
        const activos = this.productos.filter(p => p.activo);
        const valorTotal = this.productos.reduce((sum, p) =>
            sum + ((p.stock || 0) * (p.precioCompra || 0)), 0
        );
        const stockBajo = this.productos.filter(p =>
            p.activo && p.stock <= (p.stockMinimo || 0)
        ).length;

        return {
            total: this.productos.length,
            activos: activos.length,
            valorTotal,
            stockBajo
        };
    }

    /**
     * Renderiza la lista de productos
     */
    renderProductos() {
        const container = document.getElementById('productosList');
        if (!container) return;

        if (this.productos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke-width="2"/>
                    </svg>
                    <h3>No hay productos registrados</h3>
                    <p>Crea tu primer producto para comenzar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Precio Compra</th>
                            <th>Precio Venta</th>
                            <th>IVA</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.productos.map(producto => {
            const stockBajo = producto.stock <= (producto.stockMinimo || 0);
            return `
                                <tr ${stockBajo ? 'style="background: rgba(245, 158, 11, 0.05);"' : ''}>
                                    <td><strong>${producto.codigo}</strong></td>
                                    <td>
                                        <strong>${producto.nombre}</strong><br>
                                        <small class="text-secondary">${producto.descripcion || '-'}</small>
                                    </td>
                                    <td>${producto.categoria || '-'}</td>
                                    <td>
                                        <strong class="${stockBajo ? 'text-danger' : ''}">${producto.stock || 0}</strong>
                                        ${stockBajo ? '<br><small class="text-danger">⚠️ Stock bajo</small>' : ''}
                                        <br><small class="text-secondary">Mín: ${producto.stockMinimo || 0}</small>
                                    </td>
                                    <td>${Utils.formatCurrency(producto.precioCompra || 0)}</td>
                                    <td>${Utils.formatCurrency(producto.precioVenta || 0)}</td>
                                    <td>${producto.tarifaIVA || 0}%</td>
                                    <td>
                                        <span class="status-badge ${producto.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                            ${producto.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn-table-action btn-view" data-id="${producto.id}" title="Ver">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                                    <circle cx="12" cy="12" r="3" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-edit" data-id="${producto.id}" title="Editar">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                                                </svg>
                                            </button>
                                            <button class="btn-table-action btn-delete" data-id="${producto.id}" title="Eliminar">
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

    /**
     * Configura los event listeners
     */
    setupEventListeners(container) {
        // Botón nuevo producto
        const btnNuevo = container.querySelector('#btnNuevoProducto');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.showProductoModal());
        }

        // Botón Kardex
        const btnKardex = container.querySelector('#btnKardex');
        if (btnKardex) {
            btnKardex.addEventListener('click', () => this.showKardex());
        }

        // Búsqueda
        const searchInput = container.querySelector('#searchProductos');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterProductos(e.target.value);
            }, 300));
        }

        // Filtros
        const filterCategoria = container.querySelector('#filterCategoria');
        const filterEstado = container.querySelector('#filterEstado');
        const filterStock = container.querySelector('#filterStock');

        [filterCategoria, filterEstado, filterStock].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    /**
     * Configura las acciones de la tabla
     */
    setupTableActions() {
        // Ver
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.viewProducto(id);
            });
        });

        // Editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editProducto(id);
            });
        });

        // Eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.deleteProducto(id);
            });
        });
    }

    /**
     * Muestra el modal de producto
     */
    showProductoModal(producto = null) {
        const isEdit = producto !== null;
        const modalContainer = document.getElementById('modalContainer');

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar' : 'Nuevo'} Producto</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="formProducto">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Código</label>
                                    <input type="text" class="form-input" id="codigo" 
                                           value="${producto?.codigo || ''}" 
                                           placeholder="PROD001" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Categoría</label>
                                    <input type="text" class="form-input" id="categoria" 
                                           value="${producto?.categoria || ''}" 
                                           placeholder="Electrónica" list="categoriasList">
                                    <datalist id="categoriasList">
                                        ${this.categorias.map(cat => `<option value="${cat}">`).join('')}
                                    </datalist>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label form-label-required">Nombre del Producto</label>
                                <input type="text" class="form-input" id="nombre" 
                                       value="${producto?.nombre || ''}" 
                                       placeholder="Nombre del producto" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Descripción</label>
                                <textarea class="form-textarea" id="descripcion" 
                                          placeholder="Descripción detallada del producto">${producto?.descripcion || ''}</textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Unidad de Medida</label>
                                    <select class="form-select" id="unidadMedida">
                                        <option value="Unidad" ${producto?.unidadMedida === 'Unidad' ? 'selected' : ''}>Unidad</option>
                                        <option value="Caja" ${producto?.unidadMedida === 'Caja' ? 'selected' : ''}>Caja</option>
                                        <option value="Paquete" ${producto?.unidadMedida === 'Paquete' ? 'selected' : ''}>Paquete</option>
                                        <option value="Kilogramo" ${producto?.unidadMedida === 'Kilogramo' ? 'selected' : ''}>Kilogramo</option>
                                        <option value="Litro" ${producto?.unidadMedida === 'Litro' ? 'selected' : ''}>Litro</option>
                                        <option value="Metro" ${producto?.unidadMedida === 'Metro' ? 'selected' : ''}>Metro</option>
                                        <option value="Servicio" ${producto?.unidadMedida === 'Servicio' ? 'selected' : ''}>Servicio</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Tarifa IVA</label>
                                    <select class="form-select" id="tarifaIVA" required>
                                        <option value="12" ${producto?.tarifaIVA === 12 ? 'selected' : ''}>12%</option>
                                        <option value="0" ${producto?.tarifaIVA === 0 ? 'selected' : ''}>0%</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label form-label-required">Precio de Compra</label>
                                    <input type="number" class="form-input" id="precioCompra" 
                                           value="${producto?.precioCompra || ''}" 
                                           placeholder="0.00" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label form-label-required">Precio de Venta</label>
                                    <input type="number" class="form-input" id="precioVenta" 
                                           value="${producto?.precioVenta || ''}" 
                                           placeholder="0.00" step="0.01" min="0" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Stock Actual</label>
                                    <input type="number" class="form-input" id="stock" 
                                           value="${producto?.stock || 0}" 
                                           placeholder="0" min="0" ${isEdit ? 'readonly' : ''}>
                                    ${isEdit ? '<span class="form-help">Usa movimientos de inventario para ajustar el stock</span>' : ''}
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Stock Mínimo</label>
                                    <input type="number" class="form-input" id="stockMinimo" 
                                           value="${producto?.stockMinimo || 0}" 
                                           placeholder="0" min="0">
                                    <span class="form-help">Alerta cuando el stock llegue a este nivel</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="activo" ${producto?.activo !== false ? 'checked' : ''}>
                                    <span>Producto activo</span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel-modal">Cancelar</button>
                        <button class="btn btn-primary btn-save-producto">
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

        const saveButton = modalContainer.querySelector('.btn-save-producto');
        saveButton.addEventListener('click', () => {
            this.saveProducto(producto?.id);
        });

        // Calcular margen automáticamente
        const precioCompraInput = modalContainer.querySelector('#precioCompra');
        const precioVentaInput = modalContainer.querySelector('#precioVenta');

        const calcularMargen = () => {
            const compra = parseFloat(precioCompraInput.value) || 0;
            const venta = parseFloat(precioVentaInput.value) || 0;
            if (compra > 0 && venta > 0) {
                const margen = ((venta - compra) / compra * 100).toFixed(2);
                console.log(`Margen: ${margen}%`);
            }
        };

        precioCompraInput.addEventListener('blur', calcularMargen);
        precioVentaInput.addEventListener('blur', calcularMargen);
    }

    /**
     * Guarda un producto
     */
    saveProducto(id = null) {
        const form = document.getElementById('formProducto');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            codigo: document.getElementById('codigo').value.trim().toUpperCase(),
            nombre: document.getElementById('nombre').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            categoria: document.getElementById('categoria').value.trim(),
            unidadMedida: document.getElementById('unidadMedida').value,
            precioCompra: parseFloat(document.getElementById('precioCompra').value) || 0,
            precioVenta: parseFloat(document.getElementById('precioVenta').value) || 0,
            stock: parseInt(document.getElementById('stock').value) || 0,
            stockMinimo: parseInt(document.getElementById('stockMinimo').value) || 0,
            tarifaIVA: parseInt(document.getElementById('tarifaIVA').value),
            activo: document.getElementById('activo').checked
        };

        // Validar código duplicado
        const productos = db.find('productos', { codigo: data.codigo });
        if (productos.length > 0 && (!id || productos[0].id !== id)) {
            Utils.showToast('Ya existe un producto con este código', 'error');
            return;
        }

        // Validar precios
        if (data.precioVenta < data.precioCompra) {
            if (!confirm('El precio de venta es menor al precio de compra. ¿Deseas continuar?')) {
                return;
            }
        }

        try {
            if (id) {
                // Mantener el stock actual si es edición
                const productoActual = db.findById('productos', id);
                data.stock = productoActual.stock;

                db.update('productos', id, data);
                Utils.showToast('Producto actualizado correctamente', 'success');
            } else {
                db.insert('productos', data);
                Utils.showToast('Producto creado correctamente', 'success');
            }

            document.getElementById('modalContainer').innerHTML = '';
            this.loadData();
            this.renderProductos();

            // Actualizar stats
            const container = document.querySelector('.inventario-module');
            if (container) {
                const stats = this.calculateStats();
                container.querySelectorAll('.stat-value').forEach((el, index) => {
                    const values = [stats.total, stats.activos, Utils.formatCurrency(stats.valorTotal), stats.stockBajo];
                    el.textContent = values[index];
                });
            }

        } catch (error) {
            Utils.showToast('Error al guardar el producto', 'error');
            console.error(error);
        }
    }

    /**
     * Ver producto
     */
    viewProducto(id) {
        const producto = db.findById('productos', id);
        if (!producto) return;

        const margen = producto.precioCompra > 0
            ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra * 100).toFixed(2)
            : 0;

        const valorStock = (producto.stock || 0) * (producto.precioCompra || 0);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>${producto.nombre}</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Código</label>
                                <p><strong>${producto.codigo}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Categoría</label>
                                <p>${producto.categoria || '-'}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Descripción</label>
                            <p>${producto.descripcion || '-'}</p>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Unidad de Medida</label>
                                <p>${producto.unidadMedida || '-'}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tarifa IVA</label>
                                <p>${producto.tarifaIVA}%</p>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Precio de Compra</label>
                                <p><strong>${Utils.formatCurrency(producto.precioCompra)}</strong></p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Precio de Venta</label>
                                <p><strong>${Utils.formatCurrency(producto.precioVenta)}</strong></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Margen de Utilidad</label>
                            <p class="${margen > 0 ? 'text-success' : 'text-danger'}">
                                <strong>${margen}%</strong>
                            </p>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Stock Actual</label>
                                <p><strong>${producto.stock || 0}</strong> ${producto.unidadMedida || 'unidades'}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Stock Mínimo</label>
                                <p>${producto.stockMinimo || 0} ${producto.unidadMedida || 'unidades'}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Valor en Stock</label>
                            <p><strong>${Utils.formatCurrency(valorStock)}</strong></p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <p>
                                <span class="status-badge ${producto.activo ? 'status-badge-active' : 'status-badge-inactive'}">
                                    ${producto.activo ? 'Activo' : 'Inactivo'}
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
            this.editProducto(id);
        });
    }

    /**
     * Edita un producto
     */
    editProducto(id) {
        const producto = db.findById('productos', id);
        if (producto) {
            this.showProductoModal(producto);
        }
    }

    /**
     * Elimina un producto
     */
    deleteProducto(id) {
        const producto = db.findById('productos', id);
        if (!producto) return;

        Utils.confirm(
            `¿Estás seguro de eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
            () => {
                db.remove('productos', id);
                Utils.showToast('Producto eliminado correctamente', 'success');

                this.loadData();
                this.renderProductos();
            }
        );
    }

    /**
     * Filtra productos
     */
    filterProductos(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.productos.filter(p =>
            p.nombre.toLowerCase().includes(lowerQuery) ||
            p.codigo.toLowerCase().includes(lowerQuery) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(lowerQuery)) ||
            (p.categoria && p.categoria.toLowerCase().includes(lowerQuery))
        );

        const temp = this.productos;
        this.productos = filtered;
        this.renderProductos();
        this.productos = temp;
    }

    /**
     * Aplica filtros
     */
    applyFilters() {
        const categoria = document.getElementById('filterCategoria')?.value;
        const estado = document.getElementById('filterEstado')?.value;
        const stock = document.getElementById('filterStock')?.value;

        let filtered = [...this.productos];

        if (categoria) {
            filtered = filtered.filter(p => p.categoria === categoria);
        }

        if (estado === 'activo') {
            filtered = filtered.filter(p => p.activo);
        } else if (estado === 'inactivo') {
            filtered = filtered.filter(p => !p.activo);
        }

        if (stock === 'bajo') {
            filtered = filtered.filter(p => p.stock <= (p.stockMinimo || 0));
        } else if (stock === 'normal') {
            filtered = filtered.filter(p => p.stock > (p.stockMinimo || 0));
        }

        const temp = this.productos;
        this.productos = filtered;
        this.renderProductos();
        this.productos = temp;
    }

    /**
     * Muestra el Kardex
     */
    showKardex() {
        const modalContainer = document.getElementById('modalContainer');

        // Obtener movimientos de inventario
        const ventas = db.find('ventas') || [];
        const compras = db.find('compras') || [];

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-dialog" style="max-width: 1200px;">
                    <div class="modal-header">
                        <h3>Kardex - Movimientos de Inventario</h3>
                        <button class="btn-close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Seleccionar Producto</label>
                            <select class="form-select" id="kardexProducto">
                                <option value="">Todos los productos</option>
                                ${this.productos.map(p =>
            `<option value="${p.id}">${p.codigo} - ${p.nombre}</option>`
        ).join('')}
                            </select>
                        </div>
                        
                        <div id="kardexContent">
                            ${this.renderKardexGeneral(ventas, compras)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="btnExportarKardex">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                <polyline points="7 10 12 15 17 10" stroke-width="2"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke-width="2"/>
                            </svg>
                            Exportar
                        </button>
                        <button class="btn btn-secondary btn-close-modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const closeButtons = modalContainer.querySelectorAll('.btn-close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modalContainer.innerHTML = '';
            });
        });

        const selectProducto = modalContainer.querySelector('#kardexProducto');
        selectProducto.addEventListener('change', (e) => {
            const productoId = parseInt(e.target.value);
            const content = modalContainer.querySelector('#kardexContent');

            if (productoId) {
                content.innerHTML = this.renderKardexProducto(productoId, ventas, compras);
            } else {
                content.innerHTML = this.renderKardexGeneral(ventas, compras);
            }
        });

        const btnExportar = modalContainer.querySelector('#btnExportarKardex');
        btnExportar.addEventListener('click', () => {
            const productoId = parseInt(selectProducto.value);
            this.exportarKardex(productoId, ventas, compras);
        });
    }

    /**
     * Renderiza el kardex general
     */
    renderKardexGeneral(ventas, compras) {
        // Crear resumen por producto
        const resumen = this.productos.map(producto => {
            const movimientos = this.getMovimientosProducto(producto.id, ventas, compras);
            const totalEntradas = movimientos
                .filter(m => m.tipo === 'Entrada')
                .reduce((sum, m) => sum + m.cantidad, 0);
            const totalSalidas = movimientos
                .filter(m => m.tipo === 'Salida')
                .reduce((sum, m) => sum + m.cantidad, 0);

            return {
                producto,
                totalMovimientos: movimientos.length,
                totalEntradas,
                totalSalidas,
                stockActual: producto.stock || 0
            };
        });

        return `
            <div class="table-container" style="margin-top: 20px;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Movimientos</th>
                            <th>Entradas</th>
                            <th>Salidas</th>
                            <th>Stock Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resumen.map(r => `
                            <tr>
                                <td><strong>${r.producto.codigo}</strong></td>
                                <td>${r.producto.nombre}</td>
                                <td>${r.totalMovimientos}</td>
                                <td class="text-success"><strong>${r.totalEntradas}</strong></td>
                                <td class="text-danger"><strong>${r.totalSalidas}</strong></td>
                                <td><strong>${r.stockActual}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza el kardex de un producto específico
     */
    renderKardexProducto(productoId, ventas, compras) {
        const producto = db.findById('productos', productoId);
        if (!producto) return '<p>Producto no encontrado</p>';

        const movimientos = this.getMovimientosProducto(productoId, ventas, compras);

        if (movimientos.length === 0) {
            return `
                <div class="empty-state">
                    <h3>Sin Movimientos</h3>
                    <p>No hay movimientos registrados para este producto</p>
                </div>
            `;
        }

        // Calcular saldos acumulados
        let saldo = 0;
        const movimientosConSaldo = movimientos.map(m => {
            if (m.tipo === 'Entrada') {
                saldo += m.cantidad;
            } else {
                saldo -= m.cantidad;
            }
            return { ...m, saldo };
        });

        return `
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h4>${producto.codigo} - ${producto.nombre}</h4>
                <p style="margin: 8px 0 0 0; color: var(--text-secondary);">
                    Stock Actual: <strong>${producto.stock || 0}</strong> ${producto.unidadMedida || 'unidades'}
                </p>
            </div>

            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Documento</th>
                            <th>Detalle</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Saldo</th>
                            <th>Costo Unit.</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movimientosConSaldo.map(m => `
                            <tr>
                                <td>${Utils.formatDate(m.fecha)}</td>
                                <td>
                                    <span class="status-badge ${m.tipo === 'Entrada' ? 'status-badge-active' : 'status-badge-pending'}">
                                        ${m.tipo}
                                    </span>
                                </td>
                                <td><strong>${m.documento}</strong></td>
                                <td>${m.detalle}</td>
                                <td class="text-success">${m.tipo === 'Entrada' ? m.cantidad : '-'}</td>
                                <td class="text-danger">${m.tipo === 'Salida' ? m.cantidad : '-'}</td>
                                <td><strong>${m.saldo}</strong></td>
                                <td>${Utils.formatCurrency(m.costoUnitario)}</td>
                                <td><strong>${Utils.formatCurrency(m.cantidad * m.costoUnitario)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: var(--bg-secondary); font-weight: bold;">
                            <td colspan="4">TOTALES</td>
                            <td class="text-success">
                                ${movimientosConSaldo.filter(m => m.tipo === 'Entrada').reduce((sum, m) => sum + m.cantidad, 0)}
                            </td>
                            <td class="text-danger">
                                ${movimientosConSaldo.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0)}
                            </td>
                            <td>${saldo}</td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    /**
     * Obtiene los movimientos de un producto
     */
    getMovimientosProducto(productoId, ventas, compras) {
        const movimientos = [];

        // Movimientos de compras (entradas)
        compras.forEach(compra => {
            const detalles = compra.detalles || [];
            detalles.forEach(detalle => {
                if (detalle.productoId === productoId) {
                    movimientos.push({
                        fecha: compra.fecha,
                        tipo: 'Entrada',
                        documento: compra.numeroComprobante,
                        detalle: `Compra a ${compra.proveedorNombre}`,
                        cantidad: detalle.cantidad,
                        costoUnitario: detalle.precioUnitario
                    });
                }
            });
        });

        // Movimientos de ventas (salidas)
        ventas.forEach(venta => {
            const detalles = venta.detalles || [];
            detalles.forEach(detalle => {
                if (detalle.productoId === productoId) {
                    movimientos.push({
                        fecha: venta.fecha,
                        tipo: 'Salida',
                        documento: venta.numeroComprobante,
                        detalle: `Venta a ${venta.clienteNombre}`,
                        cantidad: detalle.cantidad,
                        costoUnitario: detalle.precioUnitario
                    });
                }
            });
        });

        // Ordenar por fecha
        movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        return movimientos;
    }

    /**
     * Exporta el kardex a CSV
     */
    exportarKardex(productoId, ventas, compras) {
        if (productoId) {
            // Exportar kardex de un producto
            const producto = db.findById('productos', productoId);
            const movimientos = this.getMovimientosProducto(productoId, ventas, compras);

            let saldo = 0;
            const data = [
                ['KARDEX DE INVENTARIO'],
                [`Producto: ${producto.codigo} - ${producto.nombre}`],
                [`Fecha de Generación: ${new Date().toLocaleDateString('es-EC')}`],
                [''],
                ['Fecha', 'Tipo', 'Documento', 'Detalle', 'Entrada', 'Salida', 'Saldo', 'Costo Unit.', 'Valor Total']
            ];

            movimientos.forEach(m => {
                if (m.tipo === 'Entrada') {
                    saldo += m.cantidad;
                } else {
                    saldo -= m.cantidad;
                }

                data.push([
                    Utils.formatDate(m.fecha),
                    m.tipo,
                    m.documento,
                    m.detalle,
                    m.tipo === 'Entrada' ? m.cantidad : '',
                    m.tipo === 'Salida' ? m.cantidad : '',
                    saldo,
                    m.costoUnitario,
                    m.cantidad * m.costoUnitario
                ]);
            });

            Utils.exportToCSV(data, `Kardex_${producto.codigo}_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
            // Exportar resumen general
            const data = [
                ['KARDEX GENERAL DE INVENTARIO'],
                [`Fecha de Generación: ${new Date().toLocaleDateString('es-EC')}`],
                [''],
                ['Código', 'Producto', 'Total Movimientos', 'Entradas', 'Salidas', 'Stock Actual']
            ];

            this.productos.forEach(producto => {
                const movimientos = this.getMovimientosProducto(producto.id, ventas, compras);
                const totalEntradas = movimientos.filter(m => m.tipo === 'Entrada').reduce((sum, m) => sum + m.cantidad, 0);
                const totalSalidas = movimientos.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);

                data.push([
                    producto.codigo,
                    producto.nombre,
                    movimientos.length,
                    totalEntradas,
                    totalSalidas,
                    producto.stock || 0
                ]);
            });

            Utils.exportToCSV(data, `Kardex_General_${new Date().toISOString().split('T')[0]}.csv`);
        }

        Utils.showToast('Kardex exportado correctamente', 'success');
    }
}

// Instancia global
window.inventarioModule = new InventarioModule();
