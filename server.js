/**
 * SERVIDOR BACKEND - ECONTABLE
 * ---------------------------------
 * Servidor API RESTFul usando Express y SQLite.
 * Maneja la persistencia de datos real para el sistema.
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database', 'monica.db');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Límite alto para XMLs grandes
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname)));

// Conexión a Base de Datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        initDatabase();
    }
});

// Inicialización de DB
function initDatabase() {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Dividir por ; para ejecutar sentencias individuales (SQLite no soporta scripts masivos en una sola llamada a veces)
        // pero exec() de sqlite3 suele manejar scripts. Probemos directo.
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error inicializando esquema:', err);
            } else {
                console.log('Base de datos inicializada correctamente.');
            }
        });
    } catch (err) {
        console.error('No se encontró archivo schema.sql:', err);
    }
}

// ==========================================
// API ROUTES
// ==========================================

// --- EMPRESAS ---
app.get('/api/empresas', (req, res) => {
    db.all("SELECT * FROM empresas", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/empresas', (req, res) => {
    const { ruc, razon_social, nombre_comercial, direccion, email } = req.body;
    const sql = `INSERT INTO empresas (ruc, razon_social, nombre_comercial, direccion, email) VALUES (?,?,?,?,?)`;
    db.run(sql, [ruc, razon_social, nombre_comercial, direccion, email], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...req.body });
    });
});

// --- PRODUCTOS (INVENTARIO) ---
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos WHERE activo = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', (req, res) => {
    const { codigo, nombre, precio_compra, precio_venta, stock, tarifa_iva } = req.body;
    // Upsert (Insert or Update if exists) logic handling could be complex in pure SQLite SQL depending on version.
    // Usaremos lógica simple: Buscar primero.
    db.get("SELECT id FROM productos WHERE codigo = ?", [codigo], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update
            const sql = `UPDATE productos SET nombre = ?, precio_compra = ?, stock = stock + ?, precio_venta = ? WHERE id = ?`;
            // Nota: En carga masiva, si ya existe, sumamos stock.
            // Si es edición directa, esto podría necesitar flags. Asumiremos lógica de "Guardar" simple aquí, 
            // pero para la carga XML necesitamos sumar.
            // Simplificación para este endpoint: UPDATE completo (sobreescribe stock si se envía)
            // *Mejor*: Endpoint específico para movimientos o crear lógica aqui.
            // Haremos UPDATE estándar por ahora.
            const sqlUpdate = `UPDATE productos SET nombre=?, precio_compra=?, precio_venta=?, stock=?, tarifa_iva=? WHERE id=?`;
            db.run(sqlUpdate, [nombre, precio_compra, precio_venta, stock, tarifa_iva, row.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: row.id, message: "Producto actualizado" });
            });
        } else {
            // Insert
            const sql = `INSERT INTO productos (codigo, nombre, precio_compra, precio_venta, stock, tarifa_iva) VALUES (?,?,?,?,?,?)`;
            db.run(sql, [codigo, nombre, precio_compra, precio_venta, stock, tarifa_iva], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, ...req.body });
            });
        }
    });
});

// --- PROVEEDORES ---
app.get('/api/proveedores', (req, res) => {
    db.all("SELECT * FROM personas WHERE tipo_persona = 'proveedor'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/proveedores', (req, res) => {
    const { identificacion, razon_social, email, direccion } = req.body;
    db.get("SELECT id FROM personas WHERE identificacion = ?", [identificacion], (err, row) => {
        if (row) return res.json({ id: row.id, message: "Ya existe" });

        const sql = `INSERT INTO personas (tipo_persona, tipo_identificacion, identificacion, razon_social, email, direccion) VALUES ('proveedor', 'RUC', ?, ?, ?, ?)`;
        db.run(sql, [identificacion, razon_social, email, direccion], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, ...req.body });
        });
    });
});

// --- COMPRAS/FACTURAS ---
app.post('/api/compras', (req, res) => {
    // Transacción simple
    const compra = req.body;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const sqlFactura = `INSERT INTO facturas (tipo, numero_comprobante, persona_id, fecha_emision, subtotal, iva, total, estado) VALUES ('COMPRA', ?, ?, ?, ?, ?, ?, 'PAGADA')`;
        db.run(sqlFactura, [compra.numeroComprobante, compra.proveedorId, compra.fecha, compra.subtotal, compra.iva, compra.total], function (err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
            }
            const facturaId = this.lastID;

            // Detalles
            const stmt = db.prepare(`INSERT INTO factura_detalles (factura_id, producto_id, descripcion, cantidad, precio_unitario, subtotal, tarifa_iva) VALUES (?, ?, ?, ?, ?, ?, ?)`);

            compra.detalles.forEach(d => {
                stmt.run(facturaId, d.productoId, d.productoNombre, d.cantidad, d.precioUnitario, d.subtotal, d.tarifaIVA);
            });
            stmt.finalize();

            db.run("COMMIT");
            res.json({ id: facturaId, message: "Compra guardada exitosamente" });
        });
    });
});

// --- CONTABILIDAD ---
app.get('/api/asientos', (req, res) => {
    db.all("SELECT * FROM asientos ORDER BY fecha DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
