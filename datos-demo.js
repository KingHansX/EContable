/**
 * Sistema Contable Mónica - Datos de Demostración
 * Ejecuta este script en la consola del navegador para cargar datos de ejemplo
 */

// Función para cargar datos de demostración
function cargarDatosDemo() {
    console.log('🚀 Cargando datos de demostración...');

    // 1. Crear empresa de ejemplo
    const empresa = {
        ruc: '1792146739001',
        razonSocial: 'COMERCIAL EJEMPLO S.A.',
        nombreComercial: 'Comercial Ejemplo',
        actividadEconomica: 'Venta al por menor',
        regimenTributario: 'General',
        direccion: 'Av. Amazonas y Naciones Unidas, Quito',
        telefono: '02-2345678',
        email: 'info@ejemplo.ec',
        representanteLegal: 'Juan Pérez',
        activo: true
    };

    db.insert('empresas', empresa);

    // 2. Crear clientes de ejemplo
    const clientes = [
        {
            tipoIdentificacion: 'RUC',
            identificacion: '1791234567001',
            razonSocial: 'DISTRIBUIDORA XYZ CIA. LTDA.',
            nombreComercial: 'Distribuidora XYZ',
            tipoContribuyente: 'Especial',
            email: 'ventas@xyz.ec',
            telefono: '02-3456789',
            direccion: 'Av. 6 de Diciembre, Quito',
            activo: true
        },
        {
            tipoIdentificacion: 'Cédula',
            identificacion: '1712345678',
            razonSocial: 'María González',
            nombreComercial: 'María González',
            tipoContribuyente: 'Persona Natural',
            email: 'maria.gonzalez@email.com',
            telefono: '0987654321',
            direccion: 'Calle Los Pinos 123, Quito',
            activo: true
        },
        {
            tipoIdentificacion: 'RUC',
            identificacion: '1790123456001',
            razonSocial: 'SUPERMERCADO LA ECONOMÍA S.A.',
            nombreComercial: 'La Economía',
            tipoContribuyente: 'Especial',
            email: 'compras@laeconomia.ec',
            telefono: '02-2987654',
            direccion: 'Av. Occidental, Quito',
            activo: true
        }
    ];

    clientes.forEach(cliente => db.insert('clientes', cliente));

    // 3. Crear proveedores de ejemplo
    const proveedores = [
        {
            tipoIdentificacion: 'RUC',
            identificacion: '1791987654001',
            razonSocial: 'IMPORTADORA ANDINA S.A.',
            nombreComercial: 'Importadora Andina',
            tipoContribuyente: 'Especial',
            email: 'ventas@andina.ec',
            telefono: '02-2111222',
            direccion: 'Parque Industrial, Quito',
            activo: true
        },
        {
            tipoIdentificacion: 'RUC',
            identificacion: '1790987654001',
            razonSocial: 'DISTRIBUCIONES DEL NORTE CIA. LTDA.',
            nombreComercial: 'Del Norte',
            tipoContribuyente: 'General',
            email: 'info@delnorte.ec',
            telefono: '02-3222333',
            direccion: 'Av. Eloy Alfaro, Quito',
            activo: true
        }
    ];

    proveedores.forEach(proveedor => db.insert('proveedores', proveedor));

    // 4. Crear productos de ejemplo
    const productos = [
        {
            codigo: 'PROD001',
            nombre: 'Laptop HP 15-DY2021LA',
            descripcion: 'Laptop HP Core i5, 8GB RAM, 256GB SSD',
            categoria: 'Electrónica',
            unidadMedida: 'Unidad',
            precioCompra: 650.00,
            precioVenta: 899.00,
            stock: 15,
            stockMinimo: 5,
            tarifaIVA: 15,
            activo: true
        },
        {
            codigo: 'PROD002',
            nombre: 'Mouse Logitech M185',
            descripcion: 'Mouse inalámbrico Logitech',
            categoria: 'Accesorios',
            unidadMedida: 'Unidad',
            precioCompra: 8.50,
            precioVenta: 15.00,
            stock: 45,
            stockMinimo: 20,
            tarifaIVA: 15,
            activo: true
        },
        {
            codigo: 'PROD003',
            nombre: 'Teclado Genius KB-110',
            descripcion: 'Teclado USB estándar',
            categoria: 'Accesorios',
            unidadMedida: 'Unidad',
            precioCompra: 6.00,
            precioVenta: 12.00,
            stock: 30,
            stockMinimo: 15,
            tarifaIVA: 15,
            activo: true
        },
        {
            codigo: 'PROD004',
            nombre: 'Monitor LG 24" Full HD',
            descripcion: 'Monitor LG 24 pulgadas 1920x1080',
            categoria: 'Electrónica',
            unidadMedida: 'Unidad',
            precioCompra: 145.00,
            precioVenta: 229.00,
            stock: 8,
            stockMinimo: 5,
            tarifaIVA: 15,
            activo: true
        },
        {
            codigo: 'PROD005',
            nombre: 'Cable HDMI 2m',
            descripcion: 'Cable HDMI 2 metros',
            categoria: 'Accesorios',
            unidadMedida: 'Unidad',
            precioCompra: 3.50,
            precioVenta: 8.00,
            stock: 3,
            stockMinimo: 10,
            tarifaIVA: 15,
            activo: true
        },
        {
            codigo: 'SERV001',
            nombre: 'Servicio de Instalación',
            descripcion: 'Servicio de instalación de equipos',
            categoria: 'Servicios',
            unidadMedida: 'Servicio',
            precioCompra: 0,
            precioVenta: 25.00,
            stock: 0,
            stockMinimo: 0,
            tarifaIVA: 15,
            activo: true
        }
    ];

    productos.forEach(producto => db.insert('productos', producto));

    // 5. Crear ventas de ejemplo
    const hoy = new Date();
    const ventas = [
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString(),
            numeroComprobante: '001-001-000000001',
            tipoComprobante: 'Factura',
            clienteId: 1,
            clienteNombre: 'DISTRIBUIDORA XYZ CIA. LTDA.',
            clienteIdentificacion: '1791234567001',
            subtotal: 1798.00,
            descuento: 0,
            subtotalNeto: 1798.00,
            tarifaIVA: 15,
            iva: 215.76,
            total: 2013.76,
            estado: 'pagada',
            formaPago: 'Transferencia',
            observaciones: 'Venta de 2 laptops'
        },
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 5).toISOString(),
            numeroComprobante: '001-001-000000002',
            tipoComprobante: 'Factura',
            clienteId: 2,
            clienteNombre: 'María González',
            clienteIdentificacion: '1712345678',
            subtotal: 899.00,
            descuento: 0,
            subtotalNeto: 899.00,
            tarifaIVA: 15,
            iva: 107.88,
            total: 1006.88,
            estado: 'pendiente',
            formaPago: 'Crédito',
            fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), 20).toISOString(),
            observaciones: 'Venta de 1 laptop'
        },
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 10).toISOString(),
            numeroComprobante: '001-001-000000003',
            tipoComprobante: 'Factura',
            clienteId: 3,
            clienteNombre: 'SUPERMERCADO LA ECONOMÍA S.A.',
            clienteIdentificacion: '1790123456001',
            subtotal: 458.00,
            descuento: 0,
            subtotalNeto: 458.00,
            tarifaIVA: 15,
            iva: 54.96,
            total: 512.96,
            estado: 'pagada',
            formaPago: 'Efectivo',
            observaciones: 'Venta de 2 monitores'
        },
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 15).toISOString(),
            numeroComprobante: '001-001-000000004',
            tipoComprobante: 'Factura',
            clienteId: 1,
            clienteNombre: 'DISTRIBUIDORA XYZ CIA. LTDA.',
            clienteIdentificacion: '1791234567001',
            subtotal: 150.00,
            descuento: 0,
            subtotalNeto: 150.00,
            tarifaIVA: 15,
            iva: 18.00,
            total: 168.00,
            estado: 'pagada',
            formaPago: 'Transferencia',
            observaciones: 'Venta de accesorios varios'
        },
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 20).toISOString(),
            numeroComprobante: '001-001-000000005',
            tipoComprobante: 'Factura',
            clienteId: 2,
            clienteNombre: 'María González',
            clienteIdentificacion: '1712345678',
            subtotal: 229.00,
            descuento: 0,
            subtotalNeto: 229.00,
            tarifaIVA: 15,
            iva: 27.48,
            total: 256.48,
            estado: 'pendiente',
            formaPago: 'Crédito',
            fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 5).toISOString(),
            observaciones: 'Venta de 1 monitor - VENCIDA'
        }
    ];

    ventas.forEach(venta => db.insert('ventas', venta));

    // 6. Crear compras de ejemplo
    const compras = [
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 2).toISOString(),
            numeroComprobante: '002-001-000123456',
            tipoComprobante: 'Factura',
            proveedorId: 1,
            proveedorNombre: 'IMPORTADORA ANDINA S.A.',
            proveedorIdentificacion: '1791987654001',
            subtotal: 3250.00,
            descuento: 0,
            subtotalNeto: 3250.00,
            tarifaIVA: 15,
            iva: 390.00,
            total: 3640.00,
            estado: 'pagada',
            formaPago: 'Transferencia',
            observaciones: 'Compra de 5 laptops'
        },
        {
            fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 8).toISOString(),
            numeroComprobante: '003-002-000789012',
            tipoComprobante: 'Factura',
            proveedorId: 2,
            proveedorNombre: 'DISTRIBUCIONES DEL NORTE CIA. LTDA.',
            proveedorIdentificacion: '1790987654001',
            subtotal: 580.00,
            descuento: 0,
            subtotalNeto: 580.00,
            tarifaIVA: 15,
            iva: 69.60,
            total: 649.60,
            estado: 'pendiente',
            formaPago: 'Crédito',
            fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 8).toISOString(),
            observaciones: 'Compra de 4 monitores'
        }
    ];

    compras.forEach(compra => db.insert('compras', compra));

    // 7. Actualizar configuración
    const config = db.get('configuracion') || {};
    config.empresaActual = 1;
    config.ejercicioActual = hoy.getFullYear();
    config.mesActual = hoy.getMonth() + 1;
    db.set('configuracion', config);

    console.log('✅ Datos de demostración cargados exitosamente!');
    console.log('📊 Resumen:');
    console.log('   - 1 Empresa');
    console.log('   - 3 Clientes');
    console.log('   - 2 Proveedores');
    console.log('   - 6 Productos');
    console.log('   - 5 Ventas');
    console.log('   - 2 Compras');
    console.log('');
    console.log('🔄 Recarga la página para ver los datos en el dashboard');
}

// Función para limpiar todos los datos
function limpiarDatos() {
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
        db.clear();
        console.log('🗑️ Todos los datos han sido eliminados');
        console.log('🔄 Recarga la página para reiniciar el sistema');
    }
}

// Instrucciones
console.log('═══════════════════════════════════════════════════════');
console.log('  Sistema Contable Mónica - Datos de Demostración');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('Para cargar datos de ejemplo, ejecuta:');
console.log('  cargarDatosDemo()');
console.log('');
console.log('Para limpiar todos los datos, ejecuta:');
console.log('  limpiarDatos()');
console.log('');
console.log('═══════════════════════════════════════════════════════');
