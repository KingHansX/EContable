-- SISTEMA ECONTABLE - ESQUEMA DE BASE DE DATOS
-- Compatible con SQLite / MySQL / PostgreSQL

-- 1. Tabla de Empresas (Multiempresa)
CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruc VARCHAR(13) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    logo_url TEXT,
    obligado_contabilidad BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    rol VARCHAR(20) DEFAULT 'contador', -- admin, contador, asistente
    activo BOOLEAN DEFAULT 1,
    empresa_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- 3. Tabla de Clientes y Proveedores (Personas)
CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_persona VARCHAR(20) NOT NULL, -- 'cliente', 'proveedor'
    tipo_identificacion VARCHAR(10) NOT NULL, -- 'RUC', 'CEDULA', 'PASAPORTE'
    identificacion VARCHAR(13) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Plan de Cuentas
CREATE TABLE IF NOT EXISTS cuentas_contables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto'
    nivel INTEGER NOT NULL, -- 1, 2, 3, 4, 5
    es_grupo BOOLEAN DEFAULT 0, -- Si es grupo no recibe asientos
    padre_id INTEGER,
    naturaleza VARCHAR(10), -- 'deudora', 'acreedora'
    FOREIGN KEY (padre_id) REFERENCES cuentas_contables(id)
);

-- 5. Inventario / Productos
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    unidad_medida VARCHAR(20), -- Unidad, Kilo, Litro, etc.
    precio_compra DECIMAL(10, 4) DEFAULT 0,
    precio_venta DECIMAL(10, 4) DEFAULT 0,
    tarifa_iva INTEGER DEFAULT 12, -- 0, 12, 15
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    activo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Encabezado de Facturas (Compras y Ventas)
CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(10) NOT NULL, -- 'COMPRA', 'VENTA'
    numero_comprobante VARCHAR(50) NOT NULL, -- 001-001-000000001
    persona_id INTEGER NOT NULL, -- Cliente o Proveedor
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    descuento DECIMAL(10, 2) DEFAULT 0,
    iva DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADA, ANULADA
    forma_pago VARCHAR(50),
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id)
);

-- 7. Detalle de Facturas
CREATE TABLE IF NOT EXISTS factura_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id INTEGER NOT NULL,
    producto_id INTEGER,
    descripcion TEXT NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    precio_unitario DECIMAL(10, 4) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    tarifa_iva INTEGER DEFAULT 12,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- 8. Asientos Contables (Libro Diario)
CREATE TABLE IF NOT EXISTS asientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    periodo_fiscal VARCHAR(10), -- '2026-01'
    fecha DATE NOT NULL,
    numero VARCHAR(20) NOT NULL, -- Generado automáticamente
    concepto TEXT NOT NULL,
    tipo VARCHAR(20), -- 'DIARIO', 'INGRESO', 'EGRESO', 'COMPRA', 'VENTA'
    estado VARCHAR(20) DEFAULT 'BORRADOR', -- BORRADOR, MAYORIZADO, ANULADO
    factura_relacionada_id INTEGER, -- Opcional, si viene de una factura
    total_debe DECIMAL(12, 2) DEFAULT 0,
    total_haber DECIMAL(12, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (factura_relacionada_id) REFERENCES facturas(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- 9. Detalles de Asiento (Libro Mayor)
CREATE TABLE IF NOT EXISTS asiento_detalles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asiento_id INTEGER NOT NULL,
    cuenta_id INTEGER NOT NULL,
    debe DECIMAL(12, 2) DEFAULT 0,
    haber DECIMAL(12, 2) DEFAULT 0,
    referencia VARCHAR(50), -- Cheque #, Factura #
    FOREIGN KEY (asiento_id) REFERENCES asientos(id),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas_contables(id)
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_personas_identificacion ON personas(identificacion);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX idx_asientos_fecha ON asientos(fecha);
CREATE INDEX idx_asiento_detalles_cuenta ON asiento_detalles(cuenta_id);
