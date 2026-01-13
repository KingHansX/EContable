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
const multer = require('multer');
const crypto = require('crypto');

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

// Configuración de Multer para subida de firmas electrónicas
const firmasDir = path.join(__dirname, 'uploads', 'firmas');
if (!fs.existsSync(firmasDir)) {
    fs.mkdirSync(firmasDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, firmasDir);
    },
    filename: (req, file, cb) => {
        const empresaId = req.params.id;
        const ext = path.extname(file.originalname);
        cb(null, `firma_empresa_${empresaId}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.p12' && ext !== '.pfx') {
            return cb(new Error('Solo se permiten archivos .p12 o .pfx'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Funciones de encriptación
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'econtable-secret-key-32-chars!!'; // En producción usar variable de entorno
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Subir firma electrónica
app.post('/api/empresas/:id/firma', upload.single('firma'), (req, res) => {
    const empresaId = req.params.id;
    const { password, titular, validaDesde, validaHasta } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo de firma' });
    }

    if (!password) {
        // Eliminar archivo subido
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Se requiere la contraseña de la firma' });
    }

    try {
        // Encriptar contraseña
        const passwordEncrypted = encrypt(password);

        // Actualizar empresa
        const sql = `UPDATE empresas SET 
            firma_electronica_path = ?,
            firma_password_encrypted = ?,
            firma_titular = ?,
            firma_valida_desde = ?,
            firma_valida_hasta = ?,
            firma_activa = 1,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`;

        db.run(sql, [
            req.file.path,
            passwordEncrypted,
            titular,
            validaDesde,
            validaHasta,
            empresaId
        ], function (err) {
            if (err) {
                // Eliminar archivo si hay error
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: 'Firma electrónica cargada exitosamente',
                firma: {
                    titular,
                    validaDesde,
                    validaHasta,
                    activa: true
                }
            });
        });
    } catch (error) {
        // Eliminar archivo si hay error
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

// Obtener información de firma
app.get('/api/empresas/:id/firma/info', (req, res) => {
    const empresaId = req.params.id;

    db.get(`SELECT firma_titular, firma_valida_desde, firma_valida_hasta, firma_activa 
            FROM empresas WHERE id = ?`, [empresaId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row || !row.firma_activa) {
            return res.json({ configurada: false });
        }

        // Verificar si está vencida
        const hoy = new Date().toISOString().split('T')[0];
        const vencida = row.firma_valida_hasta && row.firma_valida_hasta < hoy;

        res.json({
            configurada: true,
            titular: row.firma_titular,
            validaDesde: row.firma_valida_desde,
            validaHasta: row.firma_valida_hasta,
            activa: row.firma_activa && !vencida,
            vencida: vencida
        });
    });
});

// Eliminar firma electrónica
app.delete('/api/empresas/:id/firma', (req, res) => {
    const empresaId = req.params.id;

    // Obtener path de la firma
    db.get(`SELECT firma_electronica_path FROM empresas WHERE id = ?`, [empresaId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        // Eliminar archivo si existe
        if (row && row.firma_electronica_path && fs.existsSync(row.firma_electronica_path)) {
            try {
                fs.unlinkSync(row.firma_electronica_path);
            } catch (e) {
                console.error('Error eliminando archivo de firma:', e);
            }
        }

        // Limpiar datos de firma en BD
        const sql = `UPDATE empresas SET 
            firma_electronica_path = NULL,
            firma_password_encrypted = NULL,
            firma_titular = NULL,
            firma_valida_desde = NULL,
            firma_valida_hasta = NULL,
            firma_activa = 0,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`;

        db.run(sql, [empresaId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Firma electrónica eliminada exitosamente' });
        });
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

// --- PERSONAS (CLIENTES Y PROVEEDORES) ---
app.get('/api/personas', (req, res) => {
    const { tipo } = req.query;
    let sql = "SELECT * FROM personas";
    let params = [];

    if (tipo) {
        sql += " WHERE tipo_persona = ?";
        params.push(tipo);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
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

// --- BANCOS ---
app.get('/api/bancos', (req, res) => {
    db.all("SELECT * FROM cuentas_bancarias WHERE activo = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/bancos', (req, res) => {
    const { banco_nombre, numero_cuenta, tipo_cuenta, saldo_inicial, titular } = req.body;
    const sql = `INSERT INTO cuentas_bancarias (banco_nombre, numero_cuenta, tipo_cuenta, saldo_inicial, saldo_actual, titular) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [banco_nombre, numero_cuenta, tipo_cuenta, saldo_inicial, saldo_inicial, titular], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...req.body });
    });
});

app.get('/api/movimientos_bancarios', (req, res) => {
    const { cuenta_id } = req.query;
    let sql = "SELECT * FROM movimientos_bancarios";
    let params = [];
    if (cuenta_id) {
        sql += " WHERE cuenta_bancaria_id = ? ORDER BY fecha DESC";
        params.push(cuenta_id);
    } else {
        sql += " ORDER BY fecha DESC";
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/movimientos_bancarios', (req, res) => {
    const mov = req.body;
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Insertar Movimiento
        const sqlMov = `INSERT INTO movimientos_bancarios (cuenta_bancaria_id, fecha, tipo_movimiento, numero_referencia, beneficiario, concepto, monto, tipo_accion, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'EMITIDO')`;
        db.run(sqlMov, [mov.cuenta_bancaria_id, mov.fecha, mov.tipo_movimiento, mov.numero_referencia, mov.beneficiario, mov.concepto, mov.monto, mov.tipo_accion], function (err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
            }

            // 2. Actualizar Saldo Cuenta Bancaria
            let operador = mov.tipo_accion === 'DEBE' ? '+' : '-'; // Debe = Ingreso (Deposito), Haber = Egreso (Cheque)
            // Nota: En contabilidad bancaria, DEBE es ingreso a bancos, HABER es salida.

            const sqlUpdate = `UPDATE cuentas_bancarias SET saldo_actual = saldo_actual ${operador} ? WHERE id = ?`;
            db.run(sqlUpdate, [mov.monto, mov.cuenta_bancaria_id], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }
                db.run("COMMIT");
                res.json({ message: "Movimiento registrado con éxito" });
            });
        });
    });
});

// --- VENTAS Y FACTURACIÓN ELECTRÓNICA ---
app.post('/api/ventas', (req, res) => {
    const venta = req.body; // { cliente_id, total, detalles: [...], forma_pago }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Generar Secuencial (Simulado)
        // En producción esto debe buscar el último secuencial de la base
        const numeroComprobante = `001-001-${Date.now().toString().slice(-9)}`;

        // 2. Insertar Factura
        const sqlFactura = `INSERT INTO facturas (tipo, numero_comprobante, persona_id, fecha_emision, subtotal, iva, total, estado, forma_pago) VALUES ('VENTA', ?, ?, ?, ?, ?, ?, 'PAGADA', ?)`;
        // Recalcular totales backend por seguridad
        let subtotal = 0;
        let iva = 0;

        // Validar detalles y stock antes de procesar
        // (Simplificado: confiamos en los cálculos del frontend por ahora, pero idealmente se recalcula aquí)
        // Usaremos los valores del request para rapidez en este prototipo, excepto validación básica.
        subtotal = venta.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio), 0);
        iva = venta.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio * (d.iva_tarifa / 100)), 0);
        const total = subtotal + iva;

        const fechaEmision = new Date().toISOString().split('T')[0];

        db.run(sqlFactura, [numeroComprobante, venta.cliente_id, fechaEmision, subtotal, iva, total, venta.forma_pago || 'EFECTIVO'], function (err) {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
            }
            const facturaId = this.lastID;

            // 3. Insertar Detalles y Actualizar Stock
            const stmtDetalle = db.prepare(`INSERT INTO factura_detalles (factura_id, producto_id, descripcion, cantidad, precio_unitario, subtotal, tarifa_iva, descuento) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`);
            const stmtStock = db.prepare(`UPDATE productos SET stock = stock - ? WHERE id = ?`);

            venta.detalles.forEach(d => {
                const subtotalLinea = d.cantidad * d.precio;
                stmtDetalle.run(facturaId, d.id, d.nombre, d.cantidad, d.precio, subtotalLinea, d.iva_tarifa);
                stmtStock.run(d.cantidad, d.id);
            });
            stmtDetalle.finalize();
            stmtStock.finalize();

            // 4. Generar Asiento Contable (Ventas)
            // Lógica contable básica:
            // Debe: Caja/Bancos (Total)
            // Haber: Ventas (Subtotal)
            // Haber: IVA Cobrado (IVA)

            const sqlAsiento = `INSERT INTO asientos (fecha, numero, concepto, tipo, estado, factura_relacionada_id, total_debe, total_haber) VALUES (?, ?, ?, 'VENTA', 'MAYORIZADO', ?, ?, ?)`;
            const asientoConcepto = `Venta Factura ${numeroComprobante}`;
            db.run(sqlAsiento, [fechaEmision, 'AS-' + Date.now(), asientoConcepto, facturaId, total, total], function (err) {
                if (err) {
                    // Log error but assume invoice implies accounting needs manual fix if this fails? 
                    // Better to rollback.
                    console.error("Error creating asiento", err);
                }
                const asientoId = this.lastID;

                // Aquí irían los detalles del asiento (asiento_detalles).
                // Por brevedad, omitimos la inserción detallada de cuentas contables específicas en este paso,
                // asumiendo que el "Asiento" cabecera es suficiente para el registro básico.
            });


            // 5. Generar XML Factura Electrónica (SRI Template)
            const xml = generateFacturaXML(venta, numeroComprobante, fechaEmision, subtotal, iva, total);

            db.run("COMMIT");
            res.json({
                message: "Venta registrada exitosamente",
                factura_id: facturaId,
                numero_comprobante: numeroComprobante,
                xml_generado: xml
            });
        });
    });
});

function generateFacturaXML(venta, numero, fecha, subtotal, iva, total) {
    // Plantilla básica XML Formato SRI
    return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
    <infoTributaria>
        <ambiente>1</ambiente>
        <tipoEmision>1</tipoEmision>
        <razonSocial>EMPRESA DEMO</razonSocial>
        <ruc>1790011223001</ruc>
        <claveAcceso>0000000000000000000000000000000000000000000000000</claveAcceso>
        <codDoc>01</codDoc>
        <estab>001</estab>
        <ptoEmi>001</ptoEmi>
        <secuencial>${numero.split('-')[2]}</secuencial>
        <dirMatriz>Quito, Ecuador</dirMatriz>
    </infoTributaria>
    <infoFactura>
        <fechaEmision>${fecha}</fechaEmision>
        <dirEstablecimiento>Quito, Ecuador</dirEstablecimiento>
        <obligadoContabilidad>SI</obligadoContabilidad>
        <tipoIdentificacionComprador>05</tipoIdentificacionComprador>
        <razonSocialComprador>CLIENTE ID ${venta.cliente_id}</razonSocialComprador>
        <identificacionComprador>9999999999</identificacionComprador>
        <totalSinImpuestos>${subtotal.toFixed(2)}</totalSinImpuestos>
        <totalDescuento>0.00</totalDescuento>
        <totalConImpuestos>
            <totalImpuesto>
                <codigo>2</codigo>
                <codigoPorcentaje>2</codigoPorcentaje>
                <baseImponible>${subtotal.toFixed(2)}</baseImponible>
                <valor>${iva.toFixed(2)}</valor>
            </totalImpuesto>
        </totalConImpuestos>
        <propina>0.00</propina>
        <importeTotal>${total.toFixed(2)}</importeTotal>
        <moneda>DOLAR</moneda>
    </infoFactura>
    <detalles>
        ${venta.detalles.map(d => `
        <detalle>
            <codigoPrincipal>${d.id}</codigoPrincipal>
            <descripcion>${d.nombre}</descripcion>
            <cantidad>${d.cantidad}</cantidad>
            <precioUnitario>${d.precio.toFixed(2)}</precioUnitario>
            <descuento>0.00</descuento>
            <precioTotalSinImpuesto>${(d.cantidad * d.precio).toFixed(2)}</precioTotalSinImpuesto>
            <impuestos>
                <impuesto>
                    <codigo>2</codigo>
                    <codigoPorcentaje>2</codigoPorcentaje>
                    <tarifa>12</tarifa>
                    <baseImponible>${(d.cantidad * d.precio).toFixed(2)}</baseImponible>
                    <valor>${(d.cantidad * d.precio * 0.12).toFixed(2)}</valor>
                </impuesto>
            </impuestos>
        </detalle>`).join('')}
    </detalles>
</factura>`;
}

app.put('/api/movimientos_bancarios/:id', (req, res) => {
    const { id } = req.params;
    const { estado, fecha_conciliacion } = req.body;

    db.run("UPDATE movimientos_bancarios SET estado = ?, fecha_conciliacion = ? WHERE id = ?", [estado, fecha_conciliacion, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Estado actualizado correctly" });
    });
});


// --- ACTIVOS FIJOS ---
app.get('/api/activos_fijos', (req, res) => {
    db.all("SELECT * FROM activos_fijos WHERE estado = 'ACTIVO'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/activos_fijos', (req, res) => {
    const asset = req.body;
    // Calcular valor en libros inicial
    const valorEnLibros = asset.costo_adquisicion;

    const sql = `INSERT INTO activos_fijos (codigo, nombre, descripcion, fecha_adquisicion, costo_adquisicion, valor_residual, vida_util_anios, porcentaje_depreciacion, valor_en_libros, categoria, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`;

    db.run(sql, [asset.codigo, asset.nombre, asset.descripcion, asset.fecha_adquisicion, asset.costo_adquisicion, asset.valor_residual, asset.vida_util_anios, asset.porcentaje_depreciacion, valorEnLibros, asset.categoria], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...asset });
    });
});

// Endpoint para ejecutar depreciación
app.post('/api/activos_fijos/depreciar', (req, res) => {
    // Lógica simplificada: Depreciación Lineal Mensual para todos los activos
    // En un sistema real, esto es más complejo y selectivo.
    const fecha = new Date().toISOString().split('T')[0];

    db.all("SELECT * FROM activos_fijos WHERE estado = 'ACTIVO' AND valor_en_libros > valor_residual", [], (err, activos) => {
        if (err) return res.status(500).json({ error: err.message });

        let procesados = 0;
        let totalDepreciado = 0;

        // Iniciar transacción manualmente si es posible, o secuencial
        // SQLite handle transaction:
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const stmtUpdate = db.prepare("UPDATE activos_fijos SET depreciacion_acumulada = depreciacion_acumulada + ?, valor_en_libros = valor_en_libros - ? WHERE id = ?");
            const stmtHist = db.prepare("INSERT INTO historial_depreciaciones (activo_id, fecha, monto_depreciado, valor_libros_anterior, valor_libros_nuevo, observacion) VALUES (?, ?, ?, ?, ?, 'Depreciación Mensual Automática')");

            activos.forEach(activo => {
                // Cálculo depreciación mensual: (Costo - Residual) / (Años * 12)
                const montoDepreciable = activo.costo_adquisicion - (activo.valor_residual || 0);
                const mesesVida = activo.vida_util_anios * 12;
                let depreciacionMensual = montoDepreciable / mesesVida;

                // Ajuste si el valor en libros es menor a la depreciación calculada (último mes)
                if (activo.valor_en_libros - depreciacionMensual < (activo.valor_residual || 0)) {
                    depreciacionMensual = activo.valor_en_libros - (activo.valor_residual || 0);
                }

                if (depreciacionMensual > 0) {
                    const nuevoValor = activo.valor_en_libros - depreciacionMensual;

                    stmtUpdate.run(depreciacionMensual, depreciacionMensual, activo.id);
                    stmtHist.run(activo.id, fecha, depreciacionMensual, activo.valor_en_libros, nuevoValor);

                    totalDepreciado += depreciacionMensual;
                    procesados++;
                }
            });

            stmtUpdate.finalize();
            stmtHist.finalize();

            // Generar Asiento Global de Depreciación (Opcional)
            if (totalDepreciado > 0) {
                const sqlAsiento = `INSERT INTO asientos (fecha, numero, concepto, tipo, estado, total_debe, total_haber) VALUES (?, ?, ?, 'EGRESO', 'MAYORIZADO', ?, ?)`;
                db.run(sqlAsiento, [fecha, 'DEP-' + Date.now(), 'Depreciación Mensual Activos Fijos', totalDepreciado, totalDepreciado]);
            }

            db.run("COMMIT");
            res.json({ message: "Depreciación procesada", activos_procesados: procesados, total_depreciado: totalDepreciado });
        });
    });
});


// --- NÓMINA ---
app.get('/api/empleados', (req, res) => {
    db.all("SELECT * FROM empleados WHERE activo = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/empleados', (req, res) => {
    const emp = req.body;
    const sql = `INSERT INTO empleados (cedula, nombres, apellidos, cargo, fecha_ingreso, sueldo_base, email, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [emp.cedula, emp.nombres, emp.apellidos, emp.cargo, emp.fecha_ingreso, emp.sueldo_base, emp.email, emp.telefono], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...emp });
    });
});

app.post('/api/roles_pago/generar', (req, res) => {
    // Genera roles para todos los empleados activos para un mes dado
    const { mes, anio } = req.body; // 1-12, 2024

    db.all("SELECT * FROM empleados WHERE activo = 1", [], (err, empleados) => {
        if (err) return res.status(500).json({ error: err.message });

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const stmt = db.prepare(`INSERT INTO roles_pago (empleado_id, mes, anio, dias_trabajados, sueldo_ganado, monto_horas_extras, bonificaciones, aporte_iess_personal, prestamos_anticipos, liquido_recibir, estado) VALUES (?, ?, ?, 30, ?, 0, 0, ?, 0, ?, 'GENERADO')`);

            let totalSueldos = 0;
            const rolesGenerados = [];

            empleados.forEach(e => {
                const sueldoBase = e.sueldo_base;
                const aporteIess = sueldoBase * 0.0945;
                const liquido = sueldoBase - aporteIess;

                stmt.run(e.id, mes, anio, sueldoBase, aporteIess, liquido);
                totalSueldos += liquido;
                rolesGenerados.push({ empleado: `${e.nombres} ${e.apellidos}`, liquido });
            });
            stmt.finalize();

            // Asiento Contable de Nómina (Provisión)
            // Debe: Gastos Sueldos (Total Bruto)
            // Haber: IESS por Pagar (9.45% + 11.15% Patronal) - Simplificado aquí solo personal
            // Haber: Bancos (Líquido) - Si se paga inmediatamente

            // Para simplificar: Gasto Sueldos vs Bancos
            if (totalSueldos > 0) {
                const sqlAsiento = `INSERT INTO asientos (fecha, numero, concepto, tipo, estado, total_debe, total_haber) VALUES (?, ?, ?, 'EGRESO', 'MAYORIZADO', ?, ?)`;
                const concepto = `Pago Nómina Mes ${mes}/${anio}`;
                const fecha = new Date().toISOString().split('T')[0];
                db.run(sqlAsiento, [fecha, 'NOM-' + Date.now(), concepto, totalSueldos, totalSueldos]);
            }

            db.run("COMMIT");
            res.json({ message: "Roles generados correctamente", cantidad: empleados.length, total: totalSueldos });
        });
    });
});

app.get('/api/roles_pago', (req, res) => {
    const { mes, anio } = req.query;
    let sql = `SELECT r.*, e.nombres, e.apellidos, e.cargo, e.cedula FROM roles_pago r JOIN empleados e ON r.empleado_id = e.id`;
    const params = [];
    if (mes && anio) {
        sql += ` WHERE r.mes = ? AND r.anio = ?`;
        params.push(mes, anio);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- KÁRDEX AVANZADO ---
app.get('/api/kardex/lotes', (req, res) => {
    const { producto_id, solo_activos } = req.query;
    let sql = "SELECT l.*, p.nombre as producto_nombre FROM lotes l JOIN productos p ON l.producto_id = p.id";
    const params = [];

    const conds = [];
    if (producto_id) { conds.push("l.producto_id = ?"); params.push(producto_id); }
    if (solo_activos === 'true') { conds.push("l.cantidad_actual > 0 AND l.estado = 'ACTIVO'"); }

    if (conds.length > 0) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY l.fecha_caducidad ASC"; // FIFO/FEFO priority usually based on expiry

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/kardex/entrada', (req, res) => {
    // Registrar Entrada (Compra, Ajuste) con Lote
    const { producto_id, cantidad, costo, tipo_movimiento, ref, lote } = req.body;
    // lote: { numero, caducidad } opcional

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Crear Lote si aplica
        let loteId = null;
        if (lote && lote.numero) {
            const sqlLote = `INSERT INTO lotes (producto_id, numero_lote, fecha_caducidad, cantidad_inicial, cantidad_actual, costo_unitario, estado) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`;
            // Nota: Si ya existe el lote, deberíamos sumar, pero simplificaremos asumiendo lotes únicos por ingreso o gestionado por UI.
            // Para robustez: Check if exists logic omitted for brevity.
            // Pero vamos a intentar insertar. Si falla por lógica futura, catch.
            db.run(sqlLote, [producto_id, lote.numero, lote.caducidad, cantidad, cantidad, costo], function (err) {
                if (!err) loteId = this.lastID;
                if (err) console.error("Error batch", err);

                continueKardex(loteId);
            });
        } else {
            continueKardex(null);
        }

        function continueKardex(createdLoteId) {
            // 2. Insertar Movimiento Kardex
            const sqlMov = `INSERT INTO kardex_movimientos (producto_id, lote_id, tipo, documento_referencia, cantidad, costo_unitario, total, usuario_id, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'Ingreso Manual/Compra')`;
            const total = cantidad * costo;
            db.run(sqlMov, [producto_id, createdLoteId, tipo_movimiento || 'COMPRA', ref, cantidad, costo, total], function (err) {
                if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }

                // 3. Actualizar Producto Stock General
                db.run("UPDATE productos SET stock = stock + ? WHERE id = ?", [cantidad, producto_id], (err) => {
                    if (err) { db.run("ROLLBACK"); return res.status(500).json({ error: err.message }); }
                    db.run("COMMIT");
                    res.json({ message: "Ingreso registrado al Kárdex" });
                });
            });
        }
    });
});

// --- DASHBOARD ---
app.get('/api/dashboard/stats', (req, res) => {
    const stats = {
        ventasMes: 0,
        comprasMes: 0,
        bancosSaldo: 0,
        cuentasPorCobrar: 0,
        ventasDiarias: []
    };

    // Usamos Promise.all para ejecutar consultas paralelas
    const dbAll = (query) => new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const dbGet = (query) => new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    // 1. Total Ventas Mes Actual
    const p1 = dbGet("SELECT SUM(total) as total FROM facturas WHERE strftime('%Y-%m', fecha_emision) = strftime('%Y-%m', 'now')");
    // 2. Saldo Bancos
    const p2 = dbGet("SELECT SUM(saldo_actual) as total FROM cuentas_bancarias WHERE activo = 1");
    // 3. Ventas últimos 7 días
    const p3 = dbAll("SELECT strftime('%d/%m', fecha_emision) as dia, SUM(total) as total FROM facturas WHERE fecha_emision >= date('now', '-6 days') GROUP BY dia ORDER BY fecha_emision");

    Promise.all([p1, p2, p3]).then(([kv1, kv2, kv3]) => {
        stats.ventasMes = kv1?.total || 0;
        stats.bancosSaldo = kv2?.total || 0;
        stats.ventasDiarias = kv3 || [];

        // Simulado:
        stats.comprasMes = stats.ventasMes * 0.65; // Estimar compras como 65% de ventas para demo
        stats.cuentasPorCobrar = stats.ventasMes * 0.20; // Estimar crédito

        res.json(stats);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
