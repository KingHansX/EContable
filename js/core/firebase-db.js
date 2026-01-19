/**
 * Adaptador de Firebase Firestore (Compat version)
 * Proporciona una API compatible con database.js pero usando Firebase
 */

(function () {
    'use strict';

    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK no está cargado');
        return;
    }

    // Inicializar Firebase
    const app = firebase.initializeApp(window.firebaseConfig);
    const db = firebase.firestore();

    console.log('🔥 Firebase inicializado correctamente');

    class FirebaseDB {
        constructor() {
            this.db = db;
            this.prefix = 'econtable_';
            this.cache = {};
            this.listeners = {};
        }

        /**
         * Obtener todos los documentos de una colección
         */
        async get(collectionName) {
            try {
                const snapshot = await this.db.collection(this.prefix + collectionName).get();
                const data = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                this.cache[collectionName] = data;
                return data;
            } catch (error) {
                console.error(`Error getting ${collectionName}:`, error);
                return this.cache[collectionName] || [];
            }
        }

        /**
         * Guardar/actualizar un valor (compatible con localStorage)
         */
        async set(key, value) {
            try {
                await this.db.collection(this.prefix + 'config').doc(key).set({ value: value }, { merge: true });
                this.cache[key] = value;
            } catch (error) {
                console.error(`Error setting ${key}:`, error);
            }
        }

        /**
         * Insertar un nuevo documento
         */
        async insert(collectionName, data) {
            try {
                const newId = this.generateId();
                const docData = {
                    ...data,
                    id: newId,
                    createdAt: new Date().toISOString()
                };

                await this.db.collection(this.prefix + collectionName).doc(newId).set(docData);

                // Actualizar caché
                if (!this.cache[collectionName]) {
                    this.cache[collectionName] = [];
                }
                this.cache[collectionName].push(docData);

                return docData;
            } catch (error) {
                console.error(`Error inserting into ${collectionName}:`, error);
                throw error;
            }
        }

        /**
         * Insertar múltiples documentos (batch)
         */
        async batchInsert(collectionName, items) {
            try {
                const batch = this.db.batch();
                const insertedItems = [];

                for (const item of items) {
                    const newId = this.generateId();
                    const docRef = this.db.collection(this.prefix + collectionName).doc(newId);
                    const docData = {
                        ...item,
                        id: newId,
                        createdAt: new Date().toISOString()
                    };
                    batch.set(docRef, docData);
                    insertedItems.push(docData);
                }

                await batch.commit();

                // Actualizar caché
                if (!this.cache[collectionName]) {
                    this.cache[collectionName] = [];
                }
                this.cache[collectionName].push(...insertedItems);

                return insertedItems;
            } catch (error) {
                console.error(`Error batch inserting into ${collectionName}:`, error);
                throw error;
            }
        }

        /**
         * Actualizar un documento
         */
        async update(collectionName, id, data) {
            try {
                await this.db.collection(this.prefix + collectionName).doc(id.toString()).update({
                    ...data,
                    updatedAt: new Date().toISOString()
                });

                // Actualizar caché
                if (this.cache[collectionName]) {
                    const index = this.cache[collectionName].findIndex(item => item.id === id);
                    if (index !== -1) {
                        this.cache[collectionName][index] = { ...this.cache[collectionName][index], ...data };
                    }
                }

                return true;
            } catch (error) {
                console.error(`Error updating ${collectionName}/${id}:`, error);
                throw error;
            }
        }

        /**
         * Eliminar un documento
         */
        async delete(collectionName, id) {
            try {
                await this.db.collection(this.prefix + collectionName).doc(id.toString()).delete();

                // Actualizar caché
                if (this.cache[collectionName]) {
                    this.cache[collectionName] = this.cache[collectionName].filter(item => item.id !== id);
                }

                return true;
            } catch (error) {
                console.error(`Error deleting ${collectionName}/${id}:`, error);
                throw error;
            }
        }

        /**
         * Buscar por ID
         */
        async findById(collectionName, id) {
            try {
                const doc = await this.db.collection(this.prefix + collectionName).doc(id.toString()).get();

                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
                return null;
            } catch (error) {
                console.error(`Error finding ${collectionName}/${id}:`, error);
                return null;
            }
        }

        /**
         * Escuchar cambios en tiempo real
         */
        onSnapshot(collectionName, callback) {
            const unsubscribe = this.db.collection(this.prefix + collectionName).onSnapshot((snapshot) => {
                const data = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                this.cache[collectionName] = data;
                callback(data);
            });

            this.listeners[collectionName] = unsubscribe;
            return unsubscribe;
        }

        /**
         * Generar ID único
         */
        generateId() {
            return Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }

        /**
         * Limpiar listeners
         */
        cleanup() {
            Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
            this.listeners = {};
        }
    }

    // Exportar instancia global
    window.firebaseDB = new FirebaseDB();
    console.log('✅ Firebase Firestore conectado');
})();
