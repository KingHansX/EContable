# 🏢 Sistema EContable

> Sistema contable profesional para empresas ecuatorianas con cumplimiento total de normativas SRI

[![Estado](https://img.shields.io/badge/Estado-Producción-success)](https://github.com)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)](https://github.com)
[![Licencia](https://img.shields.io/badge/Licencia-Propietaria-red)](https://github.com)

---

## 📋 Descripción

**EContable** es un sistema contable completo diseñado específicamente para empresas ecuatorianas. Automatiza procesos contables, tributarios y de nómina, cumpliendo con todas las normativas del Servicio de Rentas Internas (SRI).

### ✨ Características Principales

- 🏢 **Multi-empresa**: Gestiona múltiples empresas desde un solo sistema
- 📊 **Contabilidad Completa**: Plan de cuentas, asientos automáticos, reportes financieros
- 💰 **Facturación**: Ventas y compras con generación automática de asientos
- 📦 **Inventario**: Control de stock con método FIFO
- 👥 **Nómina**: Roles de pago, IESS, provisiones y liquidaciones
- 📈 **Reportes SRI**: IVA, ATS, Anexo de Gastos Personales
- 🤖 **IA Integrada**: Alertas inteligentes y sugerencias de optimización
- 💾 **100% Offline**: No requiere internet, datos en tu navegador

---

## 🚀 Inicio Rápido

### Requisitos

- Navegador web moderno (Chrome, Edge, Firefox)
- No requiere instalación
- No requiere internet

### Instalación

1. **Descarga** el proyecto
2. **Abre** el archivo `index.html` en tu navegador
3. **¡Listo!** El sistema está funcionando

### Primer Uso

1. El sistema creará automáticamente un usuario administrador
2. Configura tu empresa en **Gestión Multiempresa**
3. Comienza a usar el sistema

---

## 📚 Documentación

- 📘 [Manual de Usuario](MANUAL-USUARIO.md) - Guía completa paso a paso
- 🚀 [Guía Rápida](GUIA-RAPIDA.md) - Inicio rápido y conceptos básicos
- 🔧 [Documentación Técnica](DOCUMENTACION-TECNICA.md) - Para desarrolladores
- 📊 [Progreso del Proyecto](PROGRESO.md) - Estado de implementación

---

## 🎯 Módulos del Sistema

### Módulos Core

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| 📊 **Dashboard** | KPIs, alertas IA, actividad reciente | ✅ Completo |
| 🏢 **Multiempresa** | Gestión de múltiples empresas | ✅ Completo |
| 👥 **Clientes/Proveedores** | Base de datos de contactos | ✅ Completo |
| 💰 **Ventas** | Facturación y control de cobros | ✅ Completo |
| 🛒 **Compras** | Registro y carga masiva | ✅ Completo |
| 📦 **Inventario** | Control de stock FIFO | ✅ Completo |
| 📒 **Contabilidad** | Asientos, plan de cuentas | ✅ Completo |
| 💵 **Cuentas x Cobrar/Pagar** | Control de cartera | ✅ Completo |
| 👤 **Usuarios** | Roles y permisos | ✅ Completo |
| 💼 **Nómina** | Empleados, roles, IESS | ✅ Completo |

### Reportes y Tributario

| Reporte | Descripción | Estado |
|---------|-------------|--------|
| 📊 **Balance de Comprobación** | Saldos de cuentas | ✅ Completo |
| 📈 **Balance General** | Estado de situación financiera | ✅ Completo |
| 💹 **Estado de Resultados** | Utilidad o pérdida | ✅ Completo |
| 🧾 **Declaración IVA** | Cálculo automático | ✅ Completo |
| 📄 **ATS** | Anexo Transaccional (XML) | ✅ Completo |
| 💳 **Gastos Personales** | Anexo para IR (TXT) | ✅ Completo |

---

## 💡 Características Destacadas

### 🤖 Automatización Inteligente

```javascript
// Asientos contables automáticos
Venta → Asiento Contable + Actualización Inventario
Compra → Asiento Contable + Actualización Inventario
Pago → Asiento Contable + Actualización Cuentas
```

### 📊 Reportes SRI

- **ATS (XML)**: Listo para cargar en DIMM
- **Declaración IVA**: Cálculo automático mensual
- **Anexo Gastos Personales**: Formato TXT oficial

### 💼 Nómina Completa

- Cálculo automático de IESS (9.45% personal, 12.15% patronal)
- Provisiones mensuales (décimos, vacaciones, fondos)
- Liquidaciones con desahucio
- Exportación de roles de pago

### 📦 Carga Masiva

Importa compras desde:
- ✅ XML (facturas electrónicas SRI)
- ✅ TXT (formato delimitado)
- ✅ CSV (Excel)

---

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Almacenamiento**: localStorage (navegador)
- **Arquitectura**: Modular, orientada a objetos
- **Sin dependencias**: Vanilla JavaScript puro

---

## 📁 Estructura del Proyecto

```
SISTEMA MONICA/
├── index.html                 # Página principal
├── css/
│   └── styles.css            # Estilos globales
├── js/
│   ├── core/
│   │   ├── db.js            # Capa de datos
│   │   └── utils.js         # Utilidades
│   ├── modules/
│   │   ├── clientes.js      # Módulo clientes
│   │   ├── ventas.js        # Módulo ventas
│   │   ├── compras.js       # Módulo compras
│   │   ├── inventario.js    # Módulo inventario
│   │   ├── contabilidad.js  # Módulo contabilidad
│   │   ├── reportes.js      # Módulo reportes
│   │   ├── usuarios.js      # Módulo usuarios
│   │   ├── nomina.js        # Módulo nómina
│   │   └── ...
│   ├── ia/
│   │   ├── asistente.js     # Asistente IA
│   │   └── sugerencias.js   # Sugerencias IA
│   └── app.js               # Aplicación principal
├── datos-demo.js             # Datos de demostración
└── docs/
    ├── MANUAL-USUARIO.md     # Manual completo
    ├── GUIA-RAPIDA.md        # Guía rápida
    └── DOCUMENTACION-TECNICA.md
```

---

## 🎓 Casos de Uso

### Para Pequeñas Empresas

✅ Facturación simple
✅ Control de inventario
✅ Declaraciones SRI
✅ Reportes básicos

### Para Medianas Empresas

✅ Multi-empresa
✅ Nómina completa
✅ Carga masiva de datos
✅ Reportes financieros avanzados

### Para Contadores

✅ Asientos automáticos
✅ Plan de cuentas personalizable
✅ ATS y reportes SRI
✅ Estados financieros

### Para Personas Naturales

✅ Gastos personales deducibles
✅ Proyección de ahorro en IR
✅ Anexo de gastos personales

---

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~25,000+
- **Módulos**: 12
- **Funcionalidades**: 14
- **Completitud**: 100%
- **Archivos**: 22+

---

## 🔒 Seguridad y Privacidad

- ✅ Datos almacenados localmente en tu navegador
- ✅ No se envía información a servidores externos
- ✅ Sistema de roles y permisos
- ✅ Validaciones de datos
- ✅ Sanitización de entradas

**⚠️ Importante**: Haz respaldos periódicos exportando tus datos.

---

## 🤝 Contribuciones

Este es un proyecto propietario. Para consultas sobre licencias o colaboraciones, contacta al equipo de desarrollo.

---

## 📞 Soporte

- 📧 **Email**: soporte@econtable.ec
- 📱 **WhatsApp**: +593 99 999 9999
- 🌐 **Web**: www.econtable.ec
- 📚 **Documentación**: Ver carpeta `docs/`

---

## 📝 Licencia

Copyright © 2024 EContable
Todos los derechos reservados.

Este software es propietario y confidencial. El uso no autorizado está prohibido.

---

## 🎉 Agradecimientos

Desarrollado con ❤️ para empresas ecuatorianas.

Cumple con normativas:
- ✅ SRI (Servicio de Rentas Internas)
- ✅ Código Tributario Ecuador
- ✅ Código de Trabajo Ecuador
- ✅ IESS (Instituto Ecuatoriano de Seguridad Social)

---

## 🗺️ Roadmap

### Versión 1.0 ✅ (Actual)
- [x] Todos los módulos core
- [x] Reportes SRI
- [x] Nómina completa
- [x] Carga masiva

### Versión 1.1 (Próxima)
- [ ] Facturación electrónica
- [ ] Integración con bancos
- [ ] App móvil
- [ ] Sincronización en la nube

### Versión 2.0 (Futuro)
- [ ] Inteligencia artificial avanzada
- [ ] Predicciones financieras
- [ ] Análisis de rentabilidad
- [ ] Dashboard ejecutivo

---

## 📸 Capturas de Pantalla

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Contabilidad
![Contabilidad](docs/screenshots/contabilidad.png)

### Reportes
![Reportes](docs/screenshots/reportes.png)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026  
**Estado**: ✅ Producción Ready

---

<div align="center">

**[⬆ Volver arriba](#-sistema-econtable)**

Hecho con ❤️ en Ecuador 🇪🇨

</div>
