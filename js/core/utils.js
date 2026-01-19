/**
 * Sistema Contable Mónica - Utilidades
 * Funciones auxiliares y helpers
 */

const Utils = {
    /**
     * Formatea un número como moneda ecuatoriana
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    },

    /**
     * Formatea una fecha
     */
    formatDate(date, format = 'short') {
        if (!date) return '';
        const d = new Date(date);

        if (format === 'short') {
            return d.toLocaleDateString('es-EC');
        } else if (format === 'long') {
            return d.toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (format === 'datetime') {
            return d.toLocaleString('es-EC');
        }
        return d.toLocaleDateString('es-EC');
    },

    /**
     * Formatea un número con separadores de miles
     */
    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('es-EC', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number || 0);
    },

    /**
     * Valida un RUC ecuatoriano
     */
    validateRUC(ruc) {
        if (!ruc || ruc.length !== 13) return false;

        const tipo = parseInt(ruc.substring(2, 3));
        if (tipo < 0 || tipo > 9) return false;

        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;

        for (let i = 0; i < 9; i++) {
            let valor = parseInt(ruc.charAt(i)) * coeficientes[i];
            if (valor >= 10) valor -= 9;
            suma += valor;
        }

        const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
        return digitoVerificador === parseInt(ruc.charAt(9));
    },

    /**
     * Valida una cédula ecuatoriana
     */
    validateCedula(cedula) {
        if (!cedula || cedula.length !== 10) return false;

        const provincia = parseInt(cedula.substring(0, 2));
        if (provincia < 1 || provincia > 24) return false;

        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;

        for (let i = 0; i < 9; i++) {
            let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
            if (valor >= 10) valor -= 9;
            suma += valor;
        }

        const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
        return digitoVerificador === parseInt(cedula.charAt(9));
    },

    /**
     * Calcula el IVA
     */
    calculateIVA(subtotal, tarifa = 12) {
        return subtotal * (tarifa / 100);
    },

    /**
     * Calcula retención en la fuente
     */
    calculateRetencionFuente(base, porcentaje) {
        return base * (porcentaje / 100);
    },

    /**
     * Calcula retención de IVA
     */
    calculateRetencionIVA(iva, porcentaje) {
        return iva * (porcentaje / 100);
    },

    /**
     * Genera un número de comprobante
     */
    generateComprobanteNumber(establecimiento = '001', puntoEmision = '001', secuencial) {
        const sec = String(secuencial).padStart(9, '0');
        return `${establecimiento}-${puntoEmision}-${sec}`;
    },

    /**
     * Parsea un número de comprobante
     */
    parseComprobanteNumber(numero) {
        const parts = numero.split('-');
        return {
            establecimiento: parts[0],
            puntoEmision: parts[1],
            secuencial: parseInt(parts[2])
        };
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Genera un ID único
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Calcula el tiempo relativo
     */
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' años';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' meses';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' días';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' horas';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutos';

        return 'Hace un momento';
    },

    /**
     * Exporta datos a CSV
     */
    exportToCSV(data, filename) {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    /**
     * Exporta datos a JSON
     */
    exportToJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    /**
     * Muestra una notificación toast
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getToastIcon(type)}
            </div>
            <div class="toast-message">${message}</div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Obtiene el icono para el toast
     */
    getToastIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/><polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="13" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/></svg>'
        };
        return icons[type] || icons.info;
    },

    /**
     * Muestra un modal de confirmación
     */
    confirm(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Confirmación</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btnCancel">Cancelar</button>
                    <button class="btn btn-primary" id="btnConfirm">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#btnConfirm').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });

        modal.querySelector('#btnCancel').addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        });
    },

    /**
     * Sanitiza HTML para prevenir XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Valida un email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Calcula el dígito verificador para el módulo 11
     */
    calculateModulo11(numero) {
        const coeficientes = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
        let suma = 0;

        for (let i = 0; i < numero.length; i++) {
            suma += parseInt(numero.charAt(i)) * coeficientes[i];
        }

        const residuo = suma % 11;
        const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;
        return digitoVerificador;
    },

    /**
     * Obtiene el mes actual en español
     */
    getCurrentMonth() {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[new Date().getMonth()];
    },

    /**
     * Obtiene el año actual
     */
    getCurrentYear() {
        return new Date().getFullYear();
    },

    /**
     * Calcula la fecha de vencimiento del IVA
     */
    getIVADueDate(mes, anio) {
        // En Ecuador, el IVA se declara el mes siguiente
        // La fecha varía según el noveno dígito del RUC
        const siguienteMes = mes === 12 ? 1 : mes + 1;
        const siguienteAnio = mes === 12 ? anio + 1 : anio;

        // Por defecto, retornamos el día 15 del mes siguiente
        return new Date(siguienteAnio, siguienteMes - 1, 15);
    },

    /**
     * Genera asiento contable automático desde una venta
     */
    generarAsientoVenta(venta) {
        const asiento = {
            fecha: venta.fecha,
            numero: `ASI-V-${venta.numeroComprobante}`,
            concepto: `Venta según factura ${venta.numeroComprobante} a ${venta.clienteNombre}`,
            tipo: 'Automático',
            origen: 'Venta',
            origenId: venta.id,
            estado: 'Publicado',
            detalles: [],
            totalDebe: 0,
            totalHaber: 0
        };

        // DEBE: Cuentas por Cobrar o Caja (según forma de pago)
        if (venta.formaPago === 'Crédito') {
            asiento.detalles.push({
                cuentaCodigo: '1.1.03',
                cuentaNombre: 'Cuentas por Cobrar Clientes',
                debe: venta.total,
                haber: 0
            });
        } else {
            asiento.detalles.push({
                cuentaCodigo: '1.1.01',
                cuentaNombre: 'Caja',
                debe: venta.total,
                haber: 0
            });
        }

        // HABER: Ventas
        asiento.detalles.push({
            cuentaCodigo: '4.1.01',
            cuentaNombre: 'Ventas Tarifa 15%',
            debe: 0,
            haber: venta.subtotal
        });

        // HABER: IVA Cobrado
        if (venta.iva > 0) {
            asiento.detalles.push({
                cuentaCodigo: '2.1.02',
                cuentaNombre: 'IVA Cobrado',
                debe: 0,
                haber: venta.iva
            });
        }

        // Calcular totales
        asiento.totalDebe = asiento.detalles.reduce((sum, d) => sum + d.debe, 0);
        asiento.totalHaber = asiento.detalles.reduce((sum, d) => sum + d.haber, 0);

        // Guardar asiento
        db.insert('asientos', asiento);

        return asiento;
    },

    /**
     * Genera asiento contable automático desde una compra
     */
    generarAsientoCompra(compra) {
        const asiento = {
            fecha: compra.fecha,
            numero: `ASI-C-${compra.numeroComprobante}`,
            concepto: `Compra según ${compra.tipoComprobante} ${compra.numeroComprobante} a ${compra.proveedorNombre}`,
            tipo: 'Automático',
            origen: 'Compra',
            origenId: compra.id,
            estado: 'Publicado',
            detalles: [],
            totalDebe: 0,
            totalHaber: 0
        };

        // DEBE: Inventario
        asiento.detalles.push({
            cuentaCodigo: '1.1.05',
            cuentaNombre: 'Inventario de Mercaderías',
            debe: compra.subtotal,
            haber: 0
        });

        // DEBE: IVA Pagado
        if (compra.iva > 0) {
            asiento.detalles.push({
                cuentaCodigo: '1.1.04',
                cuentaNombre: 'IVA Pagado',
                debe: compra.iva,
                haber: 0
            });
        }

        // HABER: Cuentas por Pagar o Bancos
        if (compra.formaPago === 'Crédito') {
            asiento.detalles.push({
                cuentaCodigo: '2.1.01',
                cuentaNombre: 'Cuentas por Pagar Proveedores',
                debe: 0,
                haber: compra.total
            });
        } else {
            asiento.detalles.push({
                cuentaCodigo: '1.1.02',
                cuentaNombre: 'Bancos',
                debe: 0,
                haber: compra.total
            });
        }

        // Calcular totales
        asiento.totalDebe = asiento.detalles.reduce((sum, d) => sum + d.debe, 0);
        asiento.totalHaber = asiento.detalles.reduce((sum, d) => sum + d.haber, 0);

        // Guardar asiento
        db.insert('asientos', asiento);

        return asiento;
    },

    /**
     * Genera asiento de pago de cuenta por cobrar
     */
    generarAsientoPagoCobro(venta) {
        const asiento = {
            fecha: new Date().toISOString(),
            numero: `ASI-PC-${venta.numeroComprobante}`,
            concepto: `Cobro de factura ${venta.numeroComprobante} de ${venta.clienteNombre}`,
            tipo: 'Automático',
            origen: 'Pago',
            origenId: venta.id,
            estado: 'Publicado',
            detalles: [
                {
                    cuentaCodigo: '1.1.01',
                    cuentaNombre: 'Caja',
                    debe: venta.total,
                    haber: 0
                },
                {
                    cuentaCodigo: '1.1.03',
                    cuentaNombre: 'Cuentas por Cobrar Clientes',
                    debe: 0,
                    haber: venta.total
                }
            ],
            totalDebe: venta.total,
            totalHaber: venta.total
        };

        db.insert('asientos', asiento);
        return asiento;
    },

    /**
     * Genera asiento de pago de cuenta por pagar
     */
    generarAsientoPagoPagar(compra) {
        const asiento = {
            fecha: new Date().toISOString(),
            numero: `ASI-PP-${compra.numeroComprobante}`,
            concepto: `Pago de compra ${compra.numeroComprobante} a ${compra.proveedorNombre}`,
            tipo: 'Automático',
            origen: 'Pago',
            origenId: compra.id,
            estado: 'Publicado',
            detalles: [
                {
                    cuentaCodigo: '2.1.01',
                    cuentaNombre: 'Cuentas por Pagar Proveedores',
                    debe: compra.total,
                    haber: 0
                },
                {
                    cuentaCodigo: '1.1.02',
                    cuentaNombre: 'Bancos',
                    debe: 0,
                    haber: compra.total
                }
            ],
            totalDebe: compra.total,
            totalHaber: compra.total
        };

        db.insert('asientos', asiento);
        return asiento;
    }
};
