# 📘 Sistema EContable - Manual de Usuario

## Bienvenido a EContable

EContable es un sistema contable profesional diseñado específicamente para empresas ecuatorianas. Cumple con todas las normativas del SRI y automatiza procesos contables, tributarios y de nómina.

---

## 🚀 Inicio Rápido

### Primer Acceso

1. **Abrir el sistema**: Abre el archivo `index.html` en tu navegador web
2. **Usuario por defecto**: 
   - Usuario: `admin`
   - (El sistema creará este usuario automáticamente)

### Configuración Inicial

#### 1. Configurar tu Empresa

1. Ve a **Gestión Multiempresa** en el menú lateral
2. Haz clic en **Nueva Empresa**
3. Completa los datos:
   - RUC (13 dígitos)
   - Razón Social
   - Nombre Comercial
   - Dirección
   - Teléfono y Email
   - Obligado a llevar contabilidad
4. Haz clic en **Guardar**

#### 2. Configurar Plan de Cuentas

El sistema incluye un plan de cuentas predeterminado según normativa ecuatoriana. Puedes personalizarlo en el módulo de **Contabilidad**.

---

## 📋 Módulos del Sistema

### 1. Dashboard

**¿Qué hace?**
- Muestra un resumen de tu negocio
- KPIs principales (ventas, utilidad, IVA)
- Alertas inteligentes de IA
- Actividad reciente

**Cómo usar:**
- El dashboard se actualiza automáticamente
- Revisa las alertas de IA para optimizar tu negocio
- Usa los filtros para ver períodos específicos

---

### 2. Gestión Multiempresa

**¿Qué hace?**
Administra múltiples empresas desde un solo sistema.

**Cómo usar:**
1. **Crear empresa**: Botón "Nueva Empresa"
2. **Editar empresa**: Clic en el ícono de lápiz
3. **Ver detalles**: Clic en el ícono de ojo
4. **Cambiar empresa activa**: Selector en la parte superior

**Datos requeridos:**
- ✅ RUC (validado automáticamente)
- ✅ Razón Social
- ✅ Dirección
- ⚠️ Obligado a llevar contabilidad (importante para reportes)

---

### 3. Clientes y Proveedores

**¿Qué hace?**
Gestiona tu base de datos de clientes y proveedores.

**Cómo crear un cliente:**
1. Clic en **Nuevo Cliente**
2. Completa los datos:
   - Tipo de identificación (Cédula/RUC/Pasaporte)
   - Número de identificación
   - Nombre/Razón Social
   - Email y teléfono
   - Dirección
3. Guardar

**Funciones especiales:**
- 🔍 Búsqueda rápida por nombre o identificación
- 📊 Ver historial de transacciones
- 📧 Enviar estados de cuenta
- 📄 Exportar a CSV

**Proveedores:**
El proceso es idéntico, solo cambia en la pestaña "Proveedores".

---

### 4. Ventas y Facturación

**¿Qué hace?**
Registra ventas y genera facturas electrónicas.

**Cómo crear una venta:**

1. **Clic en "Nueva Venta"**

2. **Datos del comprobante:**
   - Tipo: Factura, Nota de Venta, etc.
   - Número: 001-001-000000001
   - Fecha
   - Forma de pago: Efectivo, Transferencia, Crédito

3. **Seleccionar cliente:**
   - Busca por nombre o RUC
   - O crea uno nuevo

4. **Agregar productos:**
   - Busca el producto
   - Ingresa cantidad
   - El sistema calcula automáticamente:
     - Subtotal
     - IVA (12%)
     - Total

5. **Guardar**

**¿Qué pasa automáticamente?**
- ✅ Se genera el asiento contable
- ✅ Se actualiza el inventario
- ✅ Se registra en cuentas por cobrar (si es a crédito)
- ✅ Se calcula el IVA para declaración

**Filtros disponibles:**
- Por estado (Pagada, Pendiente, Anulada)
- Por cliente
- Por fecha
- Por forma de pago

---

### 5. Compras

**¿Qué hace?**
Registra compras a proveedores y controla cuentas por pagar.

**Cómo registrar una compra:**

1. **Opción 1: Manual**
   - Clic en "Nueva Compra"
   - Similar al proceso de ventas

2. **Opción 2: Carga Masiva** ⭐
   - Clic en "Carga Masiva"
   - Selecciona archivo:
     - **XML**: Facturas electrónicas del SRI
     - **TXT**: Formato delimitado (FECHA|RUC|NOMBRE|FACTURA|SUBTOTAL|IVA)
     - **CSV**: Archivo Excel exportado
   - Vista previa
   - Procesar

**Ventajas de la carga masiva:**
- ⚡ Ahorra tiempo
- ✅ Reduce errores
- 📊 Procesa cientos de facturas en segundos
- 🤖 Genera asientos automáticamente

---

### 6. Inventario

**¿Qué hace?**
Control de stock con método FIFO (First In, First Out).

**Cómo crear un producto:**
1. Clic en "Nuevo Producto"
2. Datos básicos:
   - Código (único)
   - Nombre
   - Categoría
   - Precio de venta
   - Precio de compra
   - Stock actual
   - Stock mínimo
3. Guardar

**Kardex:**
- Ver movimientos de cada producto
- Entrada/Salida
- Saldo valorizado
- Método FIFO automático

**Alertas:**
- 🔴 Stock bajo: Cuando llega al mínimo
- 📊 Productos más vendidos
- 💰 Valor total del inventario

---

### 7. Contabilidad

**¿Qué hace?**
Gestión completa del sistema contable.

#### Plan de Cuentas

**Estructura:**
```
1. ACTIVO
   1.1 ACTIVO CORRIENTE
       1.1.01 Caja
       1.1.02 Bancos
       1.1.03 Cuentas por Cobrar
   1.2 ACTIVO NO CORRIENTE
       1.2.01 Propiedad, Planta y Equipo

2. PASIVO
   2.1 PASIVO CORRIENTE
   2.2 PASIVO NO CORRIENTE

3. PATRIMONIO
   3.1 Capital
   3.2 Resultados

4. INGRESOS
   4.1 Ingresos Operacionales

5. GASTOS
   5.1 Gastos Operacionales
```

#### Asientos Contables

**Crear asiento manual:**
1. Clic en "Nuevo Asiento"
2. Datos:
   - Fecha
   - Número (automático)
   - Concepto
   - Tipo: Manual/Automático
3. Agregar cuentas:
   - Selecciona cuenta
   - Debe o Haber
   - Monto
4. **Importante**: Debe = Haber (partida doble)
5. Guardar

**Asientos automáticos:**
El sistema genera automáticamente asientos para:
- ✅ Ventas
- ✅ Compras
- ✅ Pagos
- ✅ Cobros

#### Libro Diario

Muestra todos los asientos en orden cronológico.

**Filtros:**
- Por fecha
- Por tipo
- Por cuenta

**Exportar:**
- CSV para Excel
- JSON para respaldo

---

### 8. Reportes Financieros

#### Balance de Comprobación

**¿Qué muestra?**
- Todas las cuentas con movimientos
- Saldos iniciales
- Debe y Haber del período
- Saldos finales

**Cómo generar:**
1. Selecciona fecha inicial y final
2. Clic en "Generar"
3. Exportar si necesitas

#### Balance General

**¿Qué muestra?**
Estado de situación financiera:
- Activos
- Pasivos
- Patrimonio

**Ecuación contable:**
```
ACTIVO = PASIVO + PATRIMONIO
```

#### Estado de Resultados

**¿Qué muestra?**
- Ingresos
- Gastos
- Utilidad o Pérdida del período

**Fórmula:**
```
UTILIDAD = INGRESOS - GASTOS
```

---

### 9. Reportes Tributarios SRI

#### Declaración de IVA

**¿Qué hace?**
Calcula el IVA a pagar o crédito tributario.

**Cómo usar:**
1. Selecciona mes y año
2. El sistema calcula automáticamente:
   - IVA Cobrado (ventas)
   - IVA Pagado (compras)
   - IVA a Pagar o Crédito Tributario

**Exportar:**
- CSV para tu contador
- Listo para declarar en DIMM

#### ATS (Anexo Transaccional Simplificado)

**¿Qué es?**
Reporte mensual obligatorio para el SRI con todas las transacciones.

**Cómo generar:**
1. Selecciona mes y año
2. Clic en "ATS"
3. Se descarga archivo XML
4. Cargar en DIMM Formularios

**Incluye:**
- ✅ Todas las ventas
- ✅ Todas las compras
- ✅ Formato oficial SRI
- ✅ Listo para enviar

#### Anexo de Gastos Personales

**¿Para quién?**
Personas naturales que quieren deducir gastos del Impuesto a la Renta.

**Cómo generar:**
1. Registra tus gastos en el módulo "Gastos Personales"
2. En Reportes, clic en "Anexos"
3. Selecciona año
4. Se descarga archivo TXT
5. Cargar en DIMM

---

### 10. Gastos Personales

**¿Qué hace?**
Registra gastos deducibles del Impuesto a la Renta.

**Categorías permitidas:**
1. 🏠 Vivienda (arriendo, servicios básicos)
2. 📚 Educación (matrículas, útiles)
3. 🏥 Salud (medicina, consultas)
4. 🍔 Alimentación (supermercado)
5. 👔 Vestimenta (ropa, calzado)
6. ✈️ Turismo (hoteles, tours)

**Cómo registrar un gasto:**
1. Clic en "Nuevo Gasto"
2. Datos:
   - Fecha
   - Categoría
   - Descripción
   - RUC del proveedor
   - Número de factura
   - Monto
3. Guardar

**Límites:**
- Máximo deducible: 7 canastas básicas familiares
- Por categoría: 32.5% del límite total
- El sistema calcula automáticamente

**Beneficios:**
- 📊 Proyección de ahorro en IR
- 📈 Seguimiento por categoría
- 📄 Genera anexo automáticamente

---

### 11. Nómina

**¿Qué hace?**
Gestión completa de empleados, roles de pago y provisiones.

#### Empleados

**Cómo registrar un empleado:**
1. Clic en "Nuevo Empleado"
2. Datos:
   - Nombre completo
   - Cédula (validada)
   - Cargo
   - Sueldo mensual
   - Fecha de ingreso
   - Email y teléfono
3. Guardar

#### Rol de Pagos

**Cómo generar:**
1. Clic en "Generar Rol de Pagos"
2. El sistema calcula automáticamente:
   - Sueldo
   - IESS Personal (9.45%)
   - Anticipos
   - Neto a recibir

**Incluye:**
- 📊 Detalle por empleado
- 💰 Totales
- 📄 Exportable a CSV

#### Provisiones

**Cálculo automático:**
- **Décimo Tercero**: Sueldo ÷ 12
- **Décimo Cuarto**: SBU ÷ 12
- **Vacaciones**: Sueldo ÷ 24
- **Fondos de Reserva**: Sueldo × 8.33% (después del primer año)

**Vista mensual:**
Muestra provisiones que debes registrar contablemente.

#### Liquidación

**Cómo calcular:**
1. Selecciona empleado
2. Clic en ícono de calculadora
3. El sistema calcula:
   - Décimos proporcionales
   - Vacaciones
   - Fondos de reserva
   - Desahucio (si aplica)
   - Total a pagar

---

### 12. Usuarios del Sistema

**¿Qué hace?**
Gestiona usuarios y permisos.

**Roles disponibles:**

1. **👑 Administrador**
   - Acceso total al sistema
   - Gestiona usuarios
   - Configura empresa

2. **📊 Contador**
   - Contabilidad completa
   - Reportes
   - Ventas y compras
   - Sin acceso a usuarios

3. **💰 Vendedor**
   - Solo ventas
   - Clientes
   - Consultas

4. **🛒 Comprador**
   - Solo compras
   - Proveedores
   - Inventario

5. **👁️ Solo Consulta**
   - Ver reportes
   - Sin modificar datos

**Cómo crear un usuario:**
1. Clic en "Nuevo Usuario"
2. Datos:
   - Nombre
   - Email
   - Identificación
   - Rol
   - Estado (Activo/Inactivo)
3. Guardar

---

## 💡 Consejos y Mejores Prácticas

### Respaldo de Datos

**Importante:** El sistema usa localStorage del navegador.

**Cómo respaldar:**
1. Ve a cualquier módulo
2. Exporta a CSV o JSON
3. Guarda en lugar seguro
4. Hazlo semanalmente

### Flujo de Trabajo Recomendado

**Diario:**
1. ✅ Registrar ventas del día
2. ✅ Registrar compras recibidas
3. ✅ Revisar alertas de IA

**Semanal:**
1. ✅ Revisar cuentas por cobrar
2. ✅ Revisar cuentas por pagar
3. ✅ Verificar inventario

**Mensual:**
1. ✅ Generar rol de pagos
2. ✅ Calcular IVA
3. ✅ Generar ATS
4. ✅ Revisar estados financieros
5. ✅ Registrar provisiones

**Anual:**
1. ✅ Generar anexo gastos personales
2. ✅ Balance General
3. ✅ Estado de Resultados
4. ✅ Declaración de Impuesto a la Renta

### Optimización

**Para mejor rendimiento:**
- 🚀 Usa Chrome o Edge
- 💾 Exporta datos antiguos
- 🔄 Limpia caché si es lento
- 📱 Usa en computadora (no móvil)

---

## ❓ Preguntas Frecuentes

### ¿Necesito internet?

No, el sistema funciona 100% offline. Solo necesitas un navegador web.

### ¿Dónde se guardan mis datos?

En el localStorage de tu navegador. **Importante**: No borres el caché del navegador o perderás los datos.

### ¿Puedo usar en varios computadores?

Sí, pero debes exportar e importar los datos manualmente entre computadores.

### ¿Es legal para el SRI?

Sí, todos los reportes cumplen con formatos oficiales del SRI Ecuador.

### ¿Cuántas empresas puedo manejar?

Ilimitadas, pero se recomienda máximo 10 para mejor rendimiento.

### ¿Qué pasa si me equivoco?

Puedes editar o eliminar la mayoría de registros. Los asientos automáticos se regeneran.

### ¿Necesito ser contador?

No necesariamente, pero conocimientos básicos de contabilidad ayudan.

---

## 🆘 Solución de Problemas

### El sistema está lento

**Solución:**
1. Exporta datos antiguos
2. Limpia caché del navegador
3. Cierra pestañas innecesarias

### No aparecen mis datos

**Solución:**
1. Verifica que estás en el mismo navegador
2. No uses modo incógnito
3. Revisa que no borraste el caché

### Error al generar reporte

**Solución:**
1. Verifica que hay datos en el período
2. Revisa la consola del navegador (F12)
3. Refresca la página

### No puedo exportar

**Solución:**
1. Permite descargas en tu navegador
2. Verifica espacio en disco
3. Intenta con otro formato

---

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@econtable.ec
- 📱 WhatsApp: +593 99 999 9999
- 🌐 Web: www.econtable.ec

---

## 📄 Licencia

Sistema EContable © 2024
Todos los derechos reservados.

---

**Versión del Manual:** 1.0
**Última actualización:** Enero 2026
**Sistema:** EContable v1.0
