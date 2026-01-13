/**
 * Sistema Contable Mónica - Base de Datos
 * Gestión de datos con LocalStorage
 */

class Database {
    constructor() {
        this.prefix = 'econtable_';
        this.apiUrl = 'http://localhost:3000/api';
        this.useBackend = true; // Flag para activar sincronización
        this.init();
    }

    /**
     * Inicializa la base de datos
     */
    init() {
        // Crear estructura inicial si no existe localmente
        if (!this.get('initialized')) {
            this.createInitialStructure();
            this.set('initialized', true);
        }

        // Reparación de datos legacy
        this.repairAdminUser();

        // Sincronizar con el Backend si está activo
        if (this.useBackend) {
            this.syncFromBackend();
        }
    }

    /**
     * Sincroniza los datos locales con la base de datos SQL
     */
    async syncFromBackend() {
        try {
            console.log('🔄 Iniciando sincronización con base de datos SQL...');

            // Verificar si el backend está disponible
            const healthCheck = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                timeout: 3000
            }).catch(() => null);

            if (!healthCheck || !healthCheck.ok) {
                console.warn('⚠️ Backend no disponible, usando datos locales');
                this.useBackend = false;
                return;
            }

            // Mapeo de Tablas SQL a LocalStorage
            const endpoints = [
                { key: 'empresas', url: '/empresas' },
                { key: 'productos', url: '/productos' },
                { key: 'proveedores', url: '/proveedores' },
                { key: 'asientos', url: '/asientos' }
            ];

            for (const ep of endpoints) {
                try {
                    const response = await fetch(`${this.apiUrl}${ep.url}`, {
                        timeout: 5000
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data && Array.isArray(data)) {
                            // Actualizar caché local sin borrar lo que no venga (merge simple o reemplazo)
                            // Estrategia: Reemplazo total de la colección para consistencia
                            if (data.length > 0) {
                                console.log(`Sincronizado ${ep.key}: ${data.length} registros.`);
                                this.set(ep.key, data);
                            }
                        }
                    }
                } catch (endpointError) {
                    console.warn(`⚠️ Error sincronizando ${ep.key}:`, endpointError.message);
                }
            }

            console.log('✅ Sincronización completada');
        } catch (error) {
            console.error('❌ Error en sincronización con backend:', error);
            this.useBackend = false;
        }
    }

    /**
     * Repara el usuario admin si le falta el username (para versiones anteriores)
     */
    repairAdminUser() {
        const usuarios = this.get('usuarios') || [];
        const adminIndex = usuarios.findIndex(u => u.id === 1 || u.email === 'admin@monica.ec');

        if (adminIndex !== -1) {
            const admin = usuarios[adminIndex];
            if (!admin.username) {
                admin.username = 'admin';
                // Asegurar contraseña también por compatibilidad
                if (!admin.password) admin.password = 'admin';

                usuarios[adminIndex] = admin;
                this.set('usuarios', usuarios);
                console.log('Usuario administrador reparado: username agregado');
            }
        }
    }

    /**
     * Crea la estructura inicial de la base de datos
     */
    createInitialStructure() {
        const structure = {
            empresas: [],
            clientes: [],
            proveedores: [],
            productos: [],
            ventas: [],
            compras: [],
            asientos: [],
            cuentas: this.getPlanCuentasEcuador(),
            usuarios: [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin',
                    nombre: 'Administrador',
                    email: 'admin@monica.ec',
                    rol: 'admin', // Cambiado a 'admin' para coincidir con auth.js
                    activo: true,
                    createdAt: new Date().toISOString()
                }
            ],
            configuracion: {
                empresaActual: null,
                ejercicioActual: new Date().getFullYear(),
                mesActual: new Date().getMonth() + 1
            }
        };

        Object.keys(structure).forEach(key => {
            this.set(key, structure[key]);
        });
    }

    /**
     * Plan de cuentas básico para Ecuador
     */
    getPlanCuentasEcuador() {
        return [
            // ACTIVOS
            { codigo: '1', nombre: 'ACTIVO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '1.1', nombre: 'ACTIVO CORRIENTE', tipo: 'grupo', nivel: 2, padre: '1' },
            { codigo: '1.1.01', nombre: 'CAJA', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.02', nombre: 'BANCOS', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.03', nombre: 'CUENTAS POR COBRAR CLIENTES', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.04', nombre: 'INVENTARIO DE MERCADERÍAS', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.05', nombre: 'IVA PAGADO', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.06', nombre: 'RETENCIONES EN LA FUENTE POR COBRAR', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },

            { codigo: '1.2', nombre: 'ACTIVO NO CORRIENTE', tipo: 'grupo', nivel: 2, padre: '1' },
            { codigo: '1.2.01', nombre: 'MUEBLES Y ENSERES', tipo: 'detalle', nivel: 3, padre: '1.2', naturaleza: 'deudora' },
            { codigo: '1.2.02', nombre: 'EQUIPOS DE COMPUTACIÓN', tipo: 'detalle', nivel: 3, padre: '1.2', naturaleza: 'deudora' },
            { codigo: '1.2.03', nombre: 'DEPRECIACIÓN ACUMULADA', tipo: 'detalle', nivel: 3, padre: '1.2', naturaleza: 'acreedora' },

            // PASIVOS
            { codigo: '2', nombre: 'PASIVO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '2.1', nombre: 'PASIVO CORRIENTE', tipo: 'grupo', nivel: 2, padre: '2' },
            { codigo: '2.1.01', nombre: 'CUENTAS POR PAGAR PROVEEDORES', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },
            { codigo: '2.1.02', nombre: 'IVA COBRADO', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },
            { codigo: '2.1.03', nombre: 'RETENCIONES EN LA FUENTE POR PAGAR', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },
            { codigo: '2.1.04', nombre: 'IESS POR PAGAR', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },

            // PATRIMONIO
            { codigo: '3', nombre: 'PATRIMONIO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '3.1', nombre: 'CAPITAL', tipo: 'detalle', nivel: 2, padre: '3', naturaleza: 'acreedora' },
            { codigo: '3.2', nombre: 'UTILIDAD DEL EJERCICIO', tipo: 'detalle', nivel: 2, padre: '3', naturaleza: 'acreedora' },
            { codigo: '3.3', nombre: 'UTILIDADES RETENIDAS', tipo: 'detalle', nivel: 2, padre: '3', naturaleza: 'acreedora' },

            // INGRESOS
            { codigo: '4', nombre: 'INGRESOS', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '4.1', nombre: 'INGRESOS OPERACIONALES', tipo: 'grupo', nivel: 2, padre: '4' },
            { codigo: '4.1.01', nombre: 'VENTAS TARIFA 12%', tipo: 'detalle', nivel: 3, padre: '4.1', naturaleza: 'acreedora' },
            { codigo: '4.1.02', nombre: 'VENTAS TARIFA 0%', tipo: 'detalle', nivel: 3, padre: '4.1', naturaleza: 'acreedora' },
            { codigo: '4.2', nombre: 'OTROS INGRESOS', tipo: 'detalle', nivel: 2, padre: '4', naturaleza: 'acreedora' },

            // GASTOS
            { codigo: '5', nombre: 'GASTOS', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '5.1', nombre: 'COSTO DE VENTAS', tipo: 'detalle', nivel: 2, padre: '5', naturaleza: 'deudora' },
            { codigo: '5.2', nombre: 'GASTOS ADMINISTRATIVOS', tipo: 'grupo', nivel: 2, padre: '5' },
            { codigo: '5.2.01', nombre: 'SUELDOS Y SALARIOS', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.2.02', nombre: 'SERVICIOS BÁSICOS', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.2.03', nombre: 'ARRIENDOS', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.2.04', nombre: 'DEPRECIACIONES', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.3', nombre: 'GASTOS FINANCIEROS', tipo: 'detalle', nivel: 2, padre: '5', naturaleza: 'deudora' }
        ];
    }

    /**
     * Guarda datos en localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    }

    /**
     * Obtiene datos de localStorage
     */
    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return null;
        }
    }

    /**
     * Elimina datos de localStorage
     */
    delete(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
            return false;
        }
    }

    /**
     * Limpia toda la base de datos
     */
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
        this.init();
    }

    /**
     * Inserta un nuevo registro
     */
    insert(table, data) {
        const records = this.get(table) || [];
        const newRecord = {
            ...data,
            id: this.generateId(records),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 1. Guardar Localmente (Optimistic UI)
        records.push(newRecord);
        this.set(table, records);

        // 2. Guardar en Backend (Async)
        if (this.useBackend) {
            this.saveToBackend(table, newRecord);
        }

        return newRecord;
    }

    /**
     * Envía datos al backend según la tabla
     */
    async saveToBackend(table, data) {
        let endpoint = '';
        switch (table) {
            case 'empresas': endpoint = '/empresas'; break;
            case 'productos': endpoint = '/productos'; break;
            case 'proveedores': endpoint = '/proveedores'; break;
            case 'compras': endpoint = '/compras'; break;
            // Otros casos...
        }

        if (endpoint) {
            try {
                await fetch(`${this.apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (error) {
                console.error(`Error guardando en backend (${table}):`, error);
                // Aquí se podría implementar una cola de reintentos (Sync Queue)
            }
        }
    }

    /**
     * Inserta un nuevo registro
     */
    insert(table, data) {
        const records = this.get(table) || [];

        // Generar ID si no existe
        if (!data.id) {
            const maxId = records.length > 0
                ? Math.max(...records.map(r => r.id || 0))
                : 0;
            data.id = maxId + 1;
        }

        // Agregar timestamps
        data.createdAt = data.createdAt || new Date().toISOString();
        data.updatedAt = new Date().toISOString();

        // Agregar a la lista
        records.push(data);
        this.set(table, records);

        // Sincronizar con backend si está activo
        if (this.useBackend) {
            this.syncToBackend(table, data);
        }

        return data;
    }

    /**
     * Actualiza un registro
     */
    update(table, id, data) {
        const records = this.get(table) || [];
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.set(table, records);
            return records[index];
        }
        return null;
    }

    /**
     * Elimina un registro
     */
    remove(table, id) {
        const records = this.get(table) || [];
        const filtered = records.filter(r => r.id !== id);
        this.set(table, filtered);
        return filtered.length < records.length;
    }

    /**
     * Busca registros
     */
    find(table, query = {}) {
        const records = this.get(table) || [];
        if (Object.keys(query).length === 0) {
            return records;
        }
        return records.filter(record => {
            return Object.keys(query).every(key => {
                if (typeof query[key] === 'function') {
                    return query[key](record[key]);
                }
                return record[key] === query[key];
            });
        });
    }

    /**
     * Busca un registro por ID
     */
    findById(table, id) {
        const records = this.get(table) || [];
        return records.find(r => r.id === id);
    }

    /**
     * Genera un ID único
     */
    generateId(records) {
        if (records.length === 0) return 1;
        return Math.max(...records.map(r => r.id || 0)) + 1;
    }

    /**
     * Exporta la base de datos completa
     */
    export() {
        const data = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const cleanKey = key.replace(this.prefix, '');
                data[cleanKey] = this.get(cleanKey);
            }
        });
        return data;
    }

    /**
     * Importa una base de datos
     */
    import(data) {
        Object.keys(data).forEach(key => {
            this.set(key, data[key]);
        });
    }

    /**
     * Obtiene estadísticas de la base de datos
     */
    getStats() {
        return {
            empresas: (this.get('empresas') || []).length,
            clientes: (this.get('clientes') || []).length,
            proveedores: (this.get('proveedores') || []).length,
            productos: (this.get('productos') || []).length,
            ventas: (this.get('ventas') || []).length,
            compras: (this.get('compras') || []).length,
            asientos: (this.get('asientos') || []).length
        };
    }
}

// Crear instancia global
const db = new Database();
