/**
 * Sistema Contable Mónica - Base de Datos con Firebase
 * Gestión de datos con Firebase Firestore
 */

// Importar Firebase DB (se cargará dinámicamente)
let firebaseDB = null;

class Database {
    constructor() {
        this.prefix = 'econtable_';
        this.useFirebase = true; // Usar Firebase por defecto
        this.fallbackToLocalStorage = true; // Fallback a localStorage si Firebase falla
    }

    /**
     * Inicializa la base de datos
     */
    async init() {
        // Esperar a que Firebase esté disponible
        if (this.useFirebase && window.firebaseDB) {
            firebaseDB = window.firebaseDB;
            console.log('✅ Firebase Firestore conectado');
        } else {
            console.warn('⚠️ Firebase no disponible, usando localStorage');
            this.useFirebase = false;
        }

        // Crear estructura inicial si no existe
        const initialized = await this.get('initialized');
        if (!initialized) {
            await this.createInitialStructure();
            await this.set('initialized', true);
        }

        // Reparación de datos legacy
        await this.repairAdminUser();
    }

    /**
     * Obtener datos
     */
    async get(key) {
        // Lista de colecciones que deben ser arrays
        const collections = ['ventas', 'compras', 'productos', 'clientes', 'proveedores',
            'asientos', 'bancos', 'usuarios', 'empresas', 'planCuentas'];

        if (this.useFirebase && firebaseDB) {
            try {
                // Si es una colección, obtener todos los documentos
                const data = await firebaseDB.get(key);

                // Si es una colección conocida y no hay datos, devolver array vacío
                if (collections.includes(key)) {
                    return Array.isArray(data) ? data : [];
                }

                return data;
            } catch (error) {
                console.error(`Error getting ${key} from Firebase:`, error);
                if (this.fallbackToLocalStorage) {
                    const localData = this.getFromLocalStorage(key);
                    // Si es una colección y no hay datos locales, devolver array vacío
                    if (collections.includes(key)) {
                        return Array.isArray(localData) ? localData : [];
                    }
                    return localData;
                }
                // Si es una colección, devolver array vacío en caso de error
                return collections.includes(key) ? [] : null;
            }
        } else {
            const localData = this.getFromLocalStorage(key);
            // Si es una colección y no hay datos locales, devolver array vacío
            if (collections.includes(key)) {
                return Array.isArray(localData) ? localData : [];
            }
            return localData;
        }
    }

    /**
     * Guardar datos
     */
    async set(key, value) {
        if (this.useFirebase && firebaseDB) {
            try {
                await firebaseDB.set(key, value);
            } catch (error) {
                console.error(`Error setting ${key} in Firebase:`, error);
                if (this.fallbackToLocalStorage) {
                    this.setToLocalStorage(key, value);
                }
            }
        } else {
            this.setToLocalStorage(key, value);
        }
    }

    /**
     * Insertar documento
     */
    async insert(collection, data) {
        if (this.useFirebase && firebaseDB) {
            try {
                return await firebaseDB.insert(collection, data);
            } catch (error) {
                console.error(`Error inserting into ${collection}:`, error);
                if (this.fallbackToLocalStorage) {
                    return this.insertToLocalStorage(collection, data);
                }
                throw error;
            }
        } else {
            return this.insertToLocalStorage(collection, data);
        }
    }

    /**
     * Insertar múltiples documentos (batch)
     */
    async batchInsert(collection, items) {
        if (this.useFirebase && firebaseDB) {
            try {
                return await firebaseDB.batchInsert(collection, items);
            } catch (error) {
                console.error(`Error batch inserting into ${collection}:`, error);
                if (this.fallbackToLocalStorage) {
                    return items.map(item => this.insertToLocalStorage(collection, item));
                }
                throw error;
            }
        } else {
            return items.map(item => this.insertToLocalStorage(collection, item));
        }
    }

    /**
     * Actualizar documento
     */
    async update(collection, id, data) {
        if (this.useFirebase && firebaseDB) {
            try {
                return await firebaseDB.update(collection, id, data);
            } catch (error) {
                console.error(`Error updating ${collection}/${id}:`, error);
                if (this.fallbackToLocalStorage) {
                    return this.updateInLocalStorage(collection, id, data);
                }
                throw error;
            }
        } else {
            return this.updateInLocalStorage(collection, id, data);
        }
    }

    /**
     * Eliminar documento
     */
    async delete(collection, id) {
        if (this.useFirebase && firebaseDB) {
            try {
                return await firebaseDB.delete(collection, id);
            } catch (error) {
                console.error(`Error deleting ${collection}/${id}:`, error);
                if (this.fallbackToLocalStorage) {
                    return this.deleteFromLocalStorage(collection, id);
                }
                throw error;
            }
        } else {
            return this.deleteFromLocalStorage(collection, id);
        }
    }

    /**
     * Buscar por ID
     */
    async findById(collection, id) {
        if (this.useFirebase && firebaseDB) {
            try {
                return await firebaseDB.findById(collection, id);
            } catch (error) {
                console.error(`Error finding ${collection}/${id}:`, error);
                if (this.fallbackToLocalStorage) {
                    return this.findByIdInLocalStorage(collection, id);
                }
                return null;
            }
        } else {
            return this.findByIdInLocalStorage(collection, id);
        }
    }

    /**
     * Buscar documentos con filtro (compatibilidad)
     * @param {string} collection - Nombre de la colección
     * @param {object} filter - Filtro opcional {campo: valor}
     * @returns {Promise<Array>} Array de documentos que coinciden
     */
    async find(collection, filter = null) {
        const items = await this.get(collection);

        if (!filter || Object.keys(filter).length === 0) {
            return items;
        }

        // Filtrar por los campos especificados
        return items.filter(item => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
        });
    }

    // ============================================
    // Métodos de LocalStorage (Fallback)
    // ============================================

    getFromLocalStorage(key) {
        const data = localStorage.getItem(this.prefix + key);
        return data ? JSON.parse(data) : null;
    }

    setToLocalStorage(key, value) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    insertToLocalStorage(collection, data) {
        const items = this.getFromLocalStorage(collection) || [];
        const newItem = {
            ...data,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
        this.setToLocalStorage(collection, items);
        return newItem;
    }

    updateInLocalStorage(collection, id, data) {
        const items = this.getFromLocalStorage(collection) || [];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
            this.setToLocalStorage(collection, items);
            return true;
        }
        return false;
    }

    deleteFromLocalStorage(collection, id) {
        const items = this.getFromLocalStorage(collection) || [];
        const filtered = items.filter(item => item.id !== id);
        this.setToLocalStorage(collection, filtered);
        return true;
    }

    findByIdInLocalStorage(collection, id) {
        const items = this.getFromLocalStorage(collection) || [];
        return items.find(item => item.id === id) || null;
    }

    // ============================================
    // Métodos de Inicialización
    // ============================================

    async createInitialStructure() {
        console.log('📦 Creando estructura inicial de base de datos...');

        // Plan de cuentas inicial
        const planCuentas = [
            // ACTIVOS
            { codigo: '1', nombre: 'ACTIVO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '1.1', nombre: 'ACTIVO CORRIENTE', tipo: 'grupo', nivel: 2, padre: '1' },
            { codigo: '1.1.01', nombre: 'CAJA', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.02', nombre: 'BANCOS', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.03', nombre: 'CUENTAS POR COBRAR CLIENTES', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.04', nombre: 'IVA PAGADO', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },
            { codigo: '1.1.05', nombre: 'INVENTARIO DE MERCADERÍAS', tipo: 'detalle', nivel: 3, padre: '1.1', naturaleza: 'deudora' },

            // PASIVOS
            { codigo: '2', nombre: 'PASIVO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '2.1', nombre: 'PASIVO CORRIENTE', tipo: 'grupo', nivel: 2, padre: '2' },
            { codigo: '2.1.01', nombre: 'CUENTAS POR PAGAR PROVEEDORES', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },
            { codigo: '2.1.02', nombre: 'IVA COBRADO', tipo: 'detalle', nivel: 3, padre: '2.1', naturaleza: 'acreedora' },

            // PATRIMONIO
            { codigo: '3', nombre: 'PATRIMONIO', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '3.1', nombre: 'CAPITAL', tipo: 'detalle', nivel: 2, padre: '3', naturaleza: 'acreedora' },

            // INGRESOS
            { codigo: '4', nombre: 'INGRESOS', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '4.1', nombre: 'INGRESOS OPERACIONALES', tipo: 'grupo', nivel: 2, padre: '4' },
            { codigo: '4.1.01', nombre: 'VENTAS TARIFA 15%', tipo: 'detalle', nivel: 3, padre: '4.1', naturaleza: 'acreedora' },
            { codigo: '4.1.02', nombre: 'VENTAS TARIFA 0%', tipo: 'detalle', nivel: 3, padre: '4.1', naturaleza: 'acreedora' },
            { codigo: '4.2', nombre: 'OTROS INGRESOS', tipo: 'detalle', nivel: 2, padre: '4', naturaleza: 'acreedora' },

            // GASTOS
            { codigo: '5', nombre: 'GASTOS', tipo: 'grupo', nivel: 1, padre: null },
            { codigo: '5.1', nombre: 'COSTO DE VENTAS', tipo: 'detalle', nivel: 2, padre: '5', naturaleza: 'deudora' },
            { codigo: '5.2', nombre: 'GASTOS OPERACIONALES', tipo: 'grupo', nivel: 2, padre: '5' },
            { codigo: '5.2.01', nombre: 'SUELDOS Y SALARIOS', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.2.02', nombre: 'SERVICIOS BÁSICOS', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' },
            { codigo: '5.2.03', nombre: 'ARRIENDO', tipo: 'detalle', nivel: 3, padre: '5.2', naturaleza: 'deudora' }
        ];

        await this.set('planCuentas', planCuentas);
        await this.set('empresas', []);
        await this.set('usuarios', []);
        await this.set('clientes', []);
        await this.set('proveedores', []);
        await this.set('productos', []);
        await this.set('ventas', []);
        await this.set('compras', []);
        await this.set('asientos', []);
        await this.set('bancos', []);

        console.log('✅ Estructura inicial creada');
    }

    async repairAdminUser() {
        const usuarios = await this.get('usuarios') || [];
        const admin = usuarios.find(u => u.username === 'admin');

        if (!admin) {
            await this.insert('usuarios', {
                username: 'admin',
                password: 'admin',
                nombre: 'Administrador',
                rol: 'admin',
                activo: true
            });
            console.log('✅ Usuario admin creado');
        }
    }
}

// Crear instancia global
const db = new Database();
window.db = db;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => db.init());
} else {
    db.init();
}
