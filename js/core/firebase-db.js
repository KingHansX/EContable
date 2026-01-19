/**
 * Adaptador de Firebase Firestore
 * Proporciona una API compatible con database.js pero usando Firebase
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    onSnapshot,
    query,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { firebaseConfig } from './firebase-config.js';

class FirebaseDB {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.prefix = 'econtable_';
        this.cache = {};
        this.listeners = {};
    }

    /**
     * Obtener todos los documentos de una colección
     */
    async get(collectionName) {
        try {
            const col = collection(this.db, this.prefix + collectionName);
            const snapshot = await getDocs(col);
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
            const docRef = doc(this.db, this.prefix + 'config', key);
            await setDoc(docRef, { value: value }, { merge: true });
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
            const col = collection(this.db, this.prefix + collectionName);
            const newId = this.generateId();
            const docRef = doc(col, newId);

            const docData = {
                ...data,
                id: newId,
                createdAt: new Date().toISOString()
            };

            await setDoc(docRef, docData);

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
            const batch = writeBatch(this.db);
            const col = collection(this.db, this.prefix + collectionName);
            const insertedItems = [];

            for (const item of items) {
                const newId = this.generateId();
                const docRef = doc(col, newId);
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
            const docRef = doc(this.db, this.prefix + collectionName, id.toString());
            await updateDoc(docRef, {
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
            const docRef = doc(this.db, this.prefix + collectionName, id.toString());
            await deleteDoc(docRef);

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
            const docRef = doc(this.db, this.prefix + collectionName, id.toString());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
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
        const col = collection(this.db, this.prefix + collectionName);
        const unsubscribe = onSnapshot(col, (snapshot) => {
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
export const firebaseDB = new FirebaseDB();
window.firebaseDB = firebaseDB;
