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
CREATE INDEX IF NOT EXISTS idx_personas_identificacion ON personas(identificacion);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON asientos(fecha);
CREATE INDEX IF NOT EXISTS idx_asiento_detalles_cuenta ON asiento_detalles(cuenta_id);

-- 10. Cuentas Bancarias (Módulo Bancos)
CREATE TABLE IF NOT EXISTS cuentas_bancarias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    banco_nombre VARCHAR(100) NOT NULL,
    numero_cuenta VARCHAR(50) NOT NULL,
    tipo_cuenta VARCHAR(20) NOT NULL, -- 'CORRIENTE', 'AHORROS'
    moneda VARCHAR(10) DEFAULT 'USD',
    saldo_inicial DECIMAL(12, 2) DEFAULT 0,
    saldo_actual DECIMAL(12, 2) DEFAULT 0,
    fecha_apertura DATE DEFAULT CURRENT_DATE,
    titular VARCHAR(100),
    activo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Movimientos Bancarios (Cheques, Depósitos, Transferencias)
CREATE TABLE IF NOT EXISTS movimientos_bancarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_bancaria_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL, -- 'CHEQUE', 'DEPOSITO', 'TRANSFERENCIA', 'NOTA_DEBITO', 'NOTA_CREDITO'
    numero_referencia VARCHAR(50), -- Número de Cheque o Comprobante
    beneficiario VARCHAR(200),
    concepto TEXT,
    monto DECIMAL(12, 2) NOT NULL, -- Positivo para entradas, se maneja lógica en app
    tipo_accion VARCHAR(10) NOT NULL, -- 'DEBE' (Ingreso), 'HABER' (Egreso)
    estado VARCHAR(20) DEFAULT 'EMITIDO', -- 'EMITIDO', 'COBRADO', 'ANULADO', 'CONCILIADO'
    fecha_conciliacion DATE,
    asiento_id INTEGER, -- Relación con contabilidad
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_bancaria_id) REFERENCES cuentas_bancarias(id),
    FOREIGN KEY (asiento_id) REFERENCES asientos(id)
);

-- 12. Activos Fijos
CREATE TABLE IF NOT EXISTS activos_fijos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_adquisicion DATE NOT NULL,
    costo_adquisicion DECIMAL(12, 2) NOT NULL,
    valor_residual DECIMAL(12, 2) DEFAULT 0,
    vida_util_anios INTEGER NOT NULL, -- En años
    porcentaje_depreciacion DECIMAL(5, 2), -- Anual
    depreciacion_acumulada DECIMAL(12, 2) DEFAULT 0,
    valor_en_libros DECIMAL(12, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO', -- ACTIVO, VENDIDO, DE BAJA
    categoria VARCHAR(50), -- Muebles, Edificios, Vehículos...
    cuenta_activo_id INTEGER, -- Cuenta contable del activo
    cuenta_gasto_id INTEGER, -- Cuenta contable del gasto depreciación
    cuenta_depreciacion_id INTEGER, -- Cuenta contable depreciación acumulada
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historial_depreciaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    monto_depreciado DECIMAL(12, 2) NOT NULL,
    valor_libros_anterior DECIMAL(12, 2) NOT NULL,
    valor_libros_nuevo DECIMAL(12, 2) NOT NULL,
    asiento_id INTEGER,
    observacion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos_fijos(id),
    FOREIGN KEY (asiento_id) REFERENCES asientos(id)
);

-- 13. Nómina (Empleados y Roles de Pago)
CREATE TABLE IF NOT EXISTS empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula VARCHAR(13) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    fecha_ingreso DATE NOT NULL,
    sueldo_base DECIMAL(12, 2) NOT NULL,
    horas_extras_tarifa DECIMAL(12, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    email VARCHAR(100),
    telefono VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles_pago (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    dias_trabajados INTEGER DEFAULT 30,
    sueldo_ganado DECIMAL(12, 2),
    monto_horas_extras DECIMAL(12, 2) DEFAULT 0,
    bonificaciones DECIMAL(12, 2) DEFAULT 0,
    aporte_iess_personal DECIMAL(12, 2), -- 9.45%
    prestamos_anticipos DECIMAL(12, 2) DEFAULT 0,
    liquido_recibir DECIMAL(12, 2),
    estado VARCHAR(20) DEFAULT 'GENERADO', -- GENERADO, PAGADO
    asiento_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (asiento_id) REFERENCES asientos(id)
);

-- 14. Kárdex Avanzado (Lotes y Caducidad)
CREATE TABLE IF NOT EXISTS lotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_elaboracion DATE,
    fecha_caducidad DATE NOT NULL,
    cantidad_inicial DECIMAL(12, 2) NOT NULL,
    cantidad_actual DECIMAL(12, 2) NOT NULL,
    costo_unitario DECIMAL(12, 4),
    estado VARCHAR(20) DEFAULT 'ACTIVO', -- ACTIVO, AGOTADO, VENCIDO
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS kardex_movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    lote_id INTEGER, -- Opcional, si el producto maneja lotes
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) NOT NULL, -- COMPRA, VENTA, DEVOLUCION_COMPRA, DEVOLUCION_VENTA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO
    documento_referencia VARCHAR(100), -- Factura #, Nota #
    cantidad DECIMAL(12, 2) NOT NULL,
    costo_unitario DECIMAL(12, 4),
    total DECIMAL(12, 2),
    saldo_cantidad DECIMAL(12, 2), -- Snapshot del saldo tras el movimiento
    saldo_total DECIMAL(12, 2),
    usuario_id INTEGER,
    observacion TEXT,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id)
);
