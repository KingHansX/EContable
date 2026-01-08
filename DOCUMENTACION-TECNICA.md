# 👨‍💻 Documentación Técnica - Sistema Contable Mónica

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño
- **Arquitectura**: Modular SPA (Single Page Application)
- **Patrón**: MVC simplificado
- **Almacenamiento**: LocalStorage (preparado para migración a SQL)
- **Frontend**: Vanilla JavaScript (sin frameworks)

### Componentes Principales

```
┌─────────────────────────────────────────┐
│           index.html (View)             │
│  ┌───────────────────────────────────┐  │
│  │        Dashboard UI               │  │
│  │  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │   KPIs      │  │  Alertas IA │ │  │
│  │  └─────────────┘  └─────────────┘ │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│         app.js (Controller)             │
│  ┌───────────────────────────────────┐  │
│  │  Navigation & Module Loading      │  │
│  │  Event Handling                   │  │
│  │  State Management                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│       Core Modules (Model)              │
│  ┌──────────┐  ┌──────────┐            │
│  │ database │  │  utils   │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │   auth   │  │    IA    │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      LocalStorage (Persistence)         │
└─────────────────────────────────────────┘
```

---

## 📦 Estructura de Módulos

### Core (js/core/)

#### database.js
**Responsabilidad**: Gestión de datos con LocalStorage

**Métodos principales**:
```javascript
db.insert(table, data)      // Inserta un registro
db.update(table, id, data)  // Actualiza un registro
db.remove(table, id)        // Elimina un registro
db.find(table, query)       // Busca registros
db.findById(table, id)      // Busca por ID
db.export()                 // Exporta toda la BD
db.import(data)             // Importa datos
```

**Estructura de datos**:
```javascript
{
  empresas: [],
  clientes: [],
  proveedores: [],
  productos: [],
  ventas: [],
  compras: [],
  asientos: [],
  cuentas: [],
  usuarios: [],
  configuracion: {}
}
```

#### utils.js
**Responsabilidad**: Funciones utilitarias

**Categorías**:
- **Formateo**: `formatCurrency()`, `formatDate()`, `formatNumber()`
- **Validación**: `validateRUC()`, `validateCedula()`, `validateEmail()`
- **Cálculos**: `calculateIVA()`, `calculateRetencionFuente()`
- **UI**: `showToast()`, `confirm()`
- **Exportación**: `exportToCSV()`, `exportToJSON()`

#### auth.js
**Responsabilidad**: Autenticación y autorización (futuro)

---

### IA (js/ia/)

#### asistente.js
**Responsabilidad**: Motor de inteligencia artificial

**Funcionalidades**:
1. **Generación de Alertas**:
   ```javascript
   aiAssistant.generateAlerts()
   ```
   - Analiza IVA pendiente
   - Detecta stock bajo
   - Identifica facturas vencidas
   - Analiza flujo de caja
   - Detecta errores comunes

2. **Procesamiento de Preguntas**:
   ```javascript
   aiAssistant.processQuestion(question)
   ```
   - Interpreta lenguaje natural
   - Genera respuestas contextuales
   - Mantiene historial de conversación

3. **Sugerencias Inteligentes**:
   ```javascript
   aiAssistant.suggestAccount(description)
   ```
   - Sugiere cuentas contables
   - Basado en palabras clave
   - Aprende del historial

**Algoritmos de Análisis**:

```javascript
// Ejemplo: Análisis de IVA
analyzeIVA() {
  // 1. Filtrar transacciones del mes
  const ventasMes = ventas.filter(v => 
    esDelMesActual(v.fecha)
  );
  
  // 2. Calcular IVA
  const ivaVentas = sum(ventasMes, 'iva');
  const ivaCompras = sum(comprasMes, 'iva');
  const ivaPorPagar = ivaVentas - ivaCompras;
  
  // 3. Calcular días restantes
  const fechaVencimiento = calcularVencimiento();
  const diasRestantes = diasEntre(hoy, fechaVencimiento);
  
  // 4. Generar alerta según urgencia
  if (ivaPorPagar > 0) {
    return {
      type: diasRestantes <= 5 ? 'danger' : 'warning',
      message: `IVA: ${formatCurrency(ivaPorPagar)}`,
      // ...
    };
  }
}
```

---

## 🗄️ Modelo de Datos

### Empresa
```javascript
{
  id: Number,
  ruc: String(13),           // Validado
  razonSocial: String,
  nombreComercial: String,
  actividadEconomica: String,
  regimenTributario: String, // 'General' | 'RISE' | 'Especial'
  direccion: String,
  telefono: String,
  email: String,
  representanteLegal: String,
  activo: Boolean,
  createdAt: ISOString,
  updatedAt: ISOString
}
```

### Cliente/Proveedor
```javascript
{
  id: Number,
  tipoIdentificacion: String, // 'RUC' | 'Cédula' | 'Pasaporte'
  identificacion: String,     // Validado según tipo
  razonSocial: String,
  nombreComercial: String,
  tipoContribuyente: String,  // 'Especial' | 'General' | 'RISE' | 'Persona Natural'
  email: String,
  telefono: String,
  direccion: String,
  activo: Boolean,
  createdAt: ISOString,
  updatedAt: ISOString
}
```

### Producto
```javascript
{
  id: Number,
  codigo: String,            // Único
  nombre: String,
  descripcion: String,
  categoria: String,
  unidadMedida: String,
  precioCompra: Number,
  precioVenta: Number,
  stock: Number,
  stockMinimo: Number,
  tarifaIVA: Number,        // 0 | 12
  activo: Boolean,
  createdAt: ISOString,
  updatedAt: ISOString
}
```

### Venta
```javascript
{
  id: Number,
  fecha: ISOString,
  numeroComprobante: String,  // 001-001-000000001
  tipoComprobante: String,    // 'Factura' | 'Nota de Crédito' | 'Nota de Débito'
  clienteId: Number,
  clienteNombre: String,
  clienteIdentificacion: String,
  detalles: [{
    productoId: Number,
    cantidad: Number,
    precioUnitario: Number,
    descuento: Number,
    subtotal: Number
  }],
  subtotal: Number,
  descuento: Number,
  subtotalNeto: Number,
  tarifaIVA: Number,
  iva: Number,
  total: Number,
  estado: String,            // 'pendiente' | 'pagada' | 'anulada'
  formaPago: String,         // 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Crédito'
  fechaVencimiento: ISOString,
  observaciones: String,
  createdAt: ISOString,
  updatedAt: ISOString
}
```

### Asiento Contable
```javascript
{
  id: Number,
  fecha: ISOString,
  numero: Number,
  tipo: String,              // 'Manual' | 'Automático'
  concepto: String,
  detalles: [{
    cuentaId: Number,
    cuentaCodigo: String,
    cuentaNombre: String,
    debe: Number,
    haber: Number
  }],
  totalDebe: Number,
  totalHaber: Number,
  estado: String,            // 'Borrador' | 'Publicado' | 'Anulado'
  referenciaId: Number,      // ID de venta/compra que generó el asiento
  referenciaModulo: String,  // 'ventas' | 'compras' | 'bancos'
  createdAt: ISOString,
  updatedAt: ISOString
}
```

---

## 🎨 Sistema de Estilos

### Variables CSS (css/main.css)
```css
:root {
  /* Colores */
  --color-primary: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-ai: #8b5cf6;
  
  /* Espaciado */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Tipografía */
  --font-family: 'Inter', sans-serif;
  --font-size-base: 1rem;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Clases Utilitarias
```css
/* Texto */
.text-primary { color: var(--color-primary); }
.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }

/* Espaciado */
.mt-1 { margin-top: var(--spacing-sm); }
.mb-2 { margin-bottom: var(--spacing-md); }

/* Flexbox */
.d-flex { display: flex; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
```

---

## 🔌 API Interna

### Database API
```javascript
// Crear
const cliente = db.insert('clientes', {
  razonSocial: 'EMPRESA XYZ',
  ruc: '1791234567001'
});

// Leer
const clientes = db.find('clientes', { activo: true });
const cliente = db.findById('clientes', 1);

// Actualizar
db.update('clientes', 1, { telefono: '0987654321' });

// Eliminar
db.remove('clientes', 1);

// Consultas avanzadas
const clientesVIP = db.find('clientes', {
  tipoContribuyente: 'Especial',
  activo: true
});
```

### Utils API
```javascript
// Formateo
Utils.formatCurrency(1234.56);  // "$1,234.56"
Utils.formatDate(new Date());   // "05/01/2026"

// Validación
Utils.validateRUC('1791234567001');  // true/false
Utils.validateCedula('1712345678');  // true/false

// Cálculos
Utils.calculateIVA(100, 12);    // 12
Utils.calculateRetencionFuente(1000, 1);  // 10

// UI
Utils.showToast('Guardado exitoso', 'success');
Utils.confirm('¿Eliminar?', () => { /* ... */ });

// Exportación
Utils.exportToCSV(data, 'clientes.csv');
Utils.exportToJSON(data, 'backup.json');
```

### AI Assistant API
```javascript
// Generar alertas
const alertas = aiAssistant.generateAlerts();

// Procesar pregunta
const respuesta = await aiAssistant.processQuestion(
  '¿Cuánto IVA debo declarar?'
);

// Sugerir cuenta
const cuentas = aiAssistant.suggestAccount('pago de sueldo');
```

---

## 🧪 Testing

### Pruebas Manuales
```javascript
// En la consola del navegador

// 1. Verificar base de datos
console.log(db.getStats());

// 2. Probar validaciones
console.log(Utils.validateRUC('1791234567001'));

// 3. Probar IA
console.log(aiAssistant.generateAlerts());

// 4. Exportar datos
console.log(JSON.stringify(db.export(), null, 2));
```

### Casos de Prueba Recomendados

1. **Validación de RUC**:
   - ✅ RUC válido: `1791234567001`
   - ❌ RUC inválido: `1234567890123`

2. **Cálculo de IVA**:
   - Subtotal: 100, IVA 12% = 12
   - Subtotal: 100, IVA 0% = 0

3. **Alertas IA**:
   - Crear venta con IVA
   - Verificar alerta de IVA por declarar

4. **Navegación**:
   - Cambiar entre módulos
   - Verificar que el estado se mantiene

---

## 🚀 Optimización

### Performance
- **Lazy Loading**: Los módulos se cargan bajo demanda
- **Debouncing**: En búsquedas y filtros
- **LocalStorage**: Acceso rápido a datos

### Mejores Prácticas
```javascript
// ✅ Bueno: Usar debounce en búsquedas
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', 
  Utils.debounce((e) => {
    buscarClientes(e.target.value);
  }, 300)
);

// ✅ Bueno: Cachear consultas frecuentes
let cachedClientes = null;
function getClientes() {
  if (!cachedClientes) {
    cachedClientes = db.find('clientes');
  }
  return cachedClientes;
}

// ❌ Malo: Consultar en cada render
function render() {
  const clientes = db.find('clientes'); // Evitar
  // ...
}
```

---

## 🔧 Extensibilidad

### Agregar un Nuevo Módulo

1. **Crear archivo JS**:
```javascript
// js/modules/nuevo-modulo.js
class NuevoModulo {
  constructor() {
    this.init();
  }
  
  init() {
    // Inicialización
  }
  
  render() {
    // Renderizado
  }
}
```

2. **Registrar en app.js**:
```javascript
loadNuevoModulo() {
  const container = document.getElementById('module-nuevo');
  const modulo = new NuevoModulo();
  modulo.render(container);
}
```

3. **Agregar navegación**:
```html
<a href="#" class="nav-item" data-module="nuevo">
  <span>Nuevo Módulo</span>
</a>
```

### Agregar Funcionalidad IA

```javascript
// En js/ia/asistente.js

// 1. Agregar análisis
analyzeNuevoIndicador() {
  // Lógica de análisis
  return {
    type: 'info',
    title: 'Nuevo Indicador',
    message: 'Descripción',
    data: { /* ... */ }
  };
}

// 2. Registrar en generateAlerts()
generateAlerts() {
  // ...
  const nuevoAlert = this.analyzeNuevoIndicador();
  if (nuevoAlert) this.alerts.push(nuevoAlert);
  // ...
}

// 3. Agregar respuesta
generateResponse(question) {
  if (question.includes('nuevo')) {
    return this.getNuevoResponse();
  }
  // ...
}
```

---

## 📊 Migración a Backend

### Preparación para SQL
El sistema está diseñado para migración fácil:

```javascript
// Actual (LocalStorage)
db.insert('clientes', data);

// Futuro (API REST)
await api.post('/clientes', data);
```

### Estructura SQL Recomendada
```sql
-- Empresas
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  ruc VARCHAR(13) UNIQUE NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  -- ...
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id),
  tipo_identificacion VARCHAR(20),
  identificacion VARCHAR(20) NOT NULL,
  -- ...
);

-- Ventas
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id),
  cliente_id INTEGER REFERENCES clientes(id),
  fecha DATE NOT NULL,
  -- ...
);
```

---

## 🔐 Seguridad

### Validación de Entrada
```javascript
// Sanitización
const input = Utils.sanitizeHTML(userInput);

// Validación
if (!Utils.validateRUC(ruc)) {
  throw new Error('RUC inválido');
}
```

### Prevención XSS
```javascript
// ❌ Peligroso
element.innerHTML = userInput;

// ✅ Seguro
element.textContent = userInput;
// o
element.innerHTML = Utils.sanitizeHTML(userInput);
```

---

## 📚 Referencias

### Normativa Ecuatoriana
- [SRI - Servicio de Rentas Internas](https://www.sri.gob.ec)
- [Facturación Electrónica](https://www.sri.gob.ec/facturacion-electronica)
- [Tabla de Retenciones](https://www.sri.gob.ec/retenciones)

### Tecnologías
- [MDN Web Docs](https://developer.mozilla.org)
- [LocalStorage API](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [CSS Variables](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)

---

**Sistema Contable Mónica v2.0** - Documentación Técnica

*Última actualización: Enero 2026*
