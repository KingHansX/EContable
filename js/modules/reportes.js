/**
 * EContable - Módulo Reportes Tributarios
 * Generación de reportes para el SRI (IVA, ATS, Retenciones)
 */

class ReportesModule {
    constructor() {
        this.ventas = [];
        this.compras = [];
        this.init();
    }

    async init() {
        await this.loadData();
    }

    async loadData() {
        this.ventas = await db.get('ventas') || [];
        this.compras = await db.get('compras') || [];
    }

    render(container) {
        if (!container) return;

        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();
        const reporteIVA = this.calcularReporteIVA(mesActual, anioActual);

        container.innerHTML = `
            <div class="reportes-module">
                <div class="module-header">
                    <div>
                        <h2>Reportes Tributarios SRI</h2>
                        <p class="module-description">Genera reportes para cumplimiento tributario en Ecuador</p>
                    </div>
                </div>

                <!-- Selector de Período -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Mes</label>
                                <select class="form-select" id="reporteMes">
                                    ${Array.from({ length: 12 }, (_, i) => {
            const mes = i + 1;
            const nombreMes = new Date(2000, i, 1).toLocaleDateString('es-EC', { month: 'long' });
            return `<option value="${mes}" ${mes === mesActual ? 'selected' : ''}>
                                            ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}
                                        </option>`;
        }).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label class="form-label">Año</label>
                                <select class="form-select" id="reporteAnio">
                                    ${Array.from({ length: 5 }, (_, i) => {
            const anio = anioActual - i;
            return `<option value="${anio}" ${anio === anioActual ? 'selected' : ''}>${anio}</option>`;
        }).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin: 0; display: flex; align-items: flex-end;">
                                <button class="btn btn-primary" id="btnGenerarReporte">
                                    Generar Reporte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reporte de IVA -->
                <div class="card">
                    <div class="card-header">
                        <h3>Declaración de IVA - ${this.getNombreMes(mesActual)} ${anioActual}</h3>
                        <button class="btn btn-outline" id="btnExportarIVA">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2"/>
                                <polyline points="7 10 12 15 17 10" stroke-width="2"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke-width="2"/>
                            </svg>
                            Exportar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="reporteIVAContent">
                            ${this.renderReporteIVA(reporteIVA)}
                        </div>
                    </div>
                </div>

                <!-- Otros Reportes -->
                <div class="card" style="margin-top: 24px;">
                    <div class="card-header">
                        <h3>Otros Reportes Tributarios</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                            <button class="btn btn-outline" id="btnATS" style="padding: 20px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 8px;">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                    <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                                </svg>
                                <div><strong>ATS</strong></div>
                                <small>Anexo Transaccional Simplificado</small>
                            </button>
                            <button class="btn btn-outline" id="btnRetenciones" style="padding: 20px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 8px;">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                    <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                                </svg>
                                <div><strong>Retenciones</strong></div>
                                <small>Reporte de Retenciones</small>
                            </button>
                            <button class="btn btn-outline" id="btnAnexos" style="padding: 20px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin-bottom: 8px;">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                                    <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                                </svg>
                                <div><strong>Anexos</strong></div>
                                <small>Otros Anexos SRI</small>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
    }

    getNombreMes(mes) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mes - 1];
    }

    calcularReporteIVA(mes, anio) {
        // Filtrar ventas del período
        const ventasPeriodo = this.ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
        });

        // Filtrar compras del período
        const comprasPeriodo = this.compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
        });

        // Calcular IVA en ventas
        const ventasGravadas12 = ventasPeriodo.reduce((sum, v) => sum + (v.subtotal || 0), 0);
        const ivaVentas = ventasPeriodo.reduce((sum, v) => sum + (v.iva || 0), 0);

        // Calcular IVA en compras
        const comprasGravadas12 = comprasPeriodo.reduce((sum, c) => sum + (c.subtotal || 0), 0);
        const ivaCompras = comprasPeriodo.reduce((sum, c) => sum + (c.iva || 0), 0);

        // IVA a pagar o crédito tributario
        const ivaPagar = ivaVentas - ivaCompras;

        return {
            mes,
            anio,
            // Ventas
            ventasGravadas12,
            ventasGravadas0: 0,
            ivaVentas,
            totalVentas: ventasPeriodo.length,
            // Compras
            comprasGravadas12,
            comprasGravadas0: 0,
            ivaCompras,
            totalCompras: comprasPeriodo.length,
            // Resultado
            ivaPagar,
            creditoTributario: ivaPagar < 0 ? Math.abs(ivaPagar) : 0
        };
    }

    renderReporteIVA(reporte) {
        return `
            <div style="display: grid; gap: 24px;">
                <!-- Ventas -->
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--color-success);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="vertical-align: middle;">
                            <line x1="12" y1="1" x2="12" y2="23" stroke-width="2"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-width="2"/>
                        </svg>
                        Ventas (${reporte.totalVentas} facturas)
                    </h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Base Imponible</th>
                                    <th>IVA</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Ventas Gravadas 12%</td>
                                    <td>${Utils.formatCurrency(reporte.ventasGravadas12)}</td>
                                    <td>${Utils.formatCurrency(reporte.ivaVentas)}</td>
                                </tr>
                                <tr>
                                    <td>Ventas Gravadas 0%</td>
                                    <td>${Utils.formatCurrency(reporte.ventasGravadas0)}</td>
                                    <td>$0.00</td>
                                </tr>
                                <tr style="font-weight: bold; background: var(--bg-secondary);">
                                    <td>TOTAL IVA COBRADO</td>
                                    <td>${Utils.formatCurrency(reporte.ventasGravadas12 + reporte.ventasGravadas0)}</td>
                                    <td>${Utils.formatCurrency(reporte.ivaVentas)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Compras -->
                <div>
                    <h4 style="margin-bottom: 16px; color: var(--color-danger);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="vertical-align: middle;">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke-width="2"/>
                            <line x1="3" y1="6" x2="21" y2="6" stroke-width="2"/>
                        </svg>
                        Compras (${reporte.totalCompras} compras)
                    </h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Base Imponible</th>
                                    <th>IVA</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Compras Gravadas 12%</td>
                                    <td>${Utils.formatCurrency(reporte.comprasGravadas12)}</td>
                                    <td>${Utils.formatCurrency(reporte.ivaCompras)}</td>
                                </tr>
                                <tr>
                                    <td>Compras Gravadas 0%</td>
                                    <td>${Utils.formatCurrency(reporte.comprasGravadas0)}</td>
                                    <td>$0.00</td>
                                </tr>
                                <tr style="font-weight: bold; background: var(--bg-secondary);">
                                    <td>TOTAL IVA PAGADO</td>
                                    <td>${Utils.formatCurrency(reporte.comprasGravadas12 + reporte.comprasGravadas0)}</td>
                                    <td>${Utils.formatCurrency(reporte.ivaCompras)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Resumen -->
                <!-- Resumen -->
                <div style="background: var(--bg-tertiary); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <h4 style="margin-bottom: 16px; color: var(--color-primary);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="vertical-align: middle;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
                            <polyline points="14 2 14 8 20 8" stroke-width="2"/>
                        </svg>
                        Resumen de Declaración
                    </h4>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                            <span>IVA Cobrado (Ventas):</span>
                            <strong>${Utils.formatCurrency(reporte.ivaVentas)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                            <span>IVA Pagado (Compras):</span>
                            <strong>${Utils.formatCurrency(reporte.ivaCompras)}</strong>
                        </div>
                        <hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; padding: 16px; background: var(--bg-primary); border-radius: 8px; font-size: 1.25rem;">
                            <strong>${reporte.ivaPagar >= 0 ? 'IVA A PAGAR:' : 'CRÉDITO TRIBUTARIO:'}</strong>
                            <strong style="color: ${reporte.ivaPagar >= 0 ? 'var(--color-danger)' : 'var(--color-success)'};">
                                ${Utils.formatCurrency(Math.abs(reporte.ivaPagar))}
                            </strong>
                        </div>
                    </div>
                </div>

                ${reporte.ivaPagar > 0 ? `
                    <div class="info-box info-box-warning">
                        <h4>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                            </svg>
                            Recordatorio de Declaración
                            <span class="badge badge-ai">IA</span>
                        </h4>
                        <p>Debes declarar y pagar ${Utils.formatCurrency(reporte.ivaPagar)} de IVA antes del día 15 del mes siguiente.</p>
                    </div>
                ` : reporte.ivaPagar < 0 ? `
                    <div class="info-box info-box-success">
                        <h4>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"/>
                                <polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/>
                            </svg>
                            Crédito Tributario Disponible
                        </h4>
                        <p>Tienes un crédito tributario de ${Utils.formatCurrency(Math.abs(reporte.ivaPagar))} que puedes usar en futuras declaraciones.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupEventListeners(container) {
        const btnGenerar = container.querySelector('#btnGenerarReporte');
        if (btnGenerar) {
            btnGenerar.addEventListener('click', () => {
                const mes = parseInt(document.getElementById('reporteMes').value);
                const anio = parseInt(document.getElementById('reporteAnio').value);

                const reporte = this.calcularReporteIVA(mes, anio);
                const reporteContainer = document.getElementById('reporteIVAContent');
                reporteContainer.innerHTML = this.renderReporteIVA(reporte);

                // Actualizar título
                container.querySelector('.card-header h3').textContent =
                    `Declaración de IVA - ${this.getNombreMes(mes)} ${anio}`;
            });
        }

        const btnExportar = container.querySelector('#btnExportarIVA');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                const mes = parseInt(document.getElementById('reporteMes').value);
                const anio = parseInt(document.getElementById('reporteAnio').value);
                this.exportarReporteIVA(mes, anio);
            });
        }

        const btnATS = container.querySelector('#btnATS');
        if (btnATS) {
            btnATS.addEventListener('click', () => {
                this.generarATS();
            });
        }

        const btnRetenciones = container.querySelector('#btnRetenciones');
        if (btnRetenciones) {
            btnRetenciones.addEventListener('click', () => {
                this.generarReporteRetenciones();
            });
        }

        const btnAnexos = container.querySelector('#btnAnexos');
        if (btnAnexos) {
            btnAnexos.addEventListener('click', () => {
                this.generarAnexoGastosPersonales();
            });
        }
    }

    /**
     * Genera el ATS (Anexo Transaccional Simplificado) en formato XML
     */
    generarATS() {
        const mes = parseInt(document.getElementById('reporteMes').value);
        const anio = parseInt(document.getElementById('reporteAnio').value);

        // Obtener datos de la empresa
        const empresas = await db.get('empresas') || [];
        if (empresas.length === 0) {
            Utils.showToast('Debes configurar los datos de tu empresa primero', 'warning');
            return;
        }

        const empresa = empresas[0];

        // Filtrar transacciones del período
        const ventasPeriodo = this.ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
        });

        const comprasPeriodo = this.compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
        });

        // Generar XML del ATS
        const xml = this.generarXMLATS(empresa, mes, anio, ventasPeriodo, comprasPeriodo);

        // Descargar archivo XML
        const blob = new Blob([xml], { type: 'text/xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ATS_${empresa.ruc}_${anio}${String(mes).padStart(2, '0')}.xml`;
        link.click();

        Utils.showToast('ATS generado correctamente', 'success');
    }

    /**
     * Genera el XML del ATS según formato SRI
     */
    generarXMLATS(empresa, mes, anio, ventas, compras) {
        const periodo = `${anio}${String(mes).padStart(2, '0')}`;

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<iva>\n';

        // Información del contribuyente
        xml += '  <TipoIDInformante>R</TipoIDInformante>\n';
        xml += `  <IdInformante>${empresa.ruc}</IdInformante>\n`;
        xml += `  <razonSocial>${this.escapeXML(empresa.razonSocial)}</razonSocial>\n`;
        xml += `  <Anio>${anio}</Anio>\n`;
        xml += `  <Mes>${String(mes).padStart(2, '0')}</Mes>\n`;

        // Compras
        xml += '  <compras>\n';
        compras.forEach(compra => {
            xml += '    <detalleCompras>\n';
            xml += '      <codSustento>01</codSustento>\n';
            xml += `      <tpIdProv>01</tpIdProv>\n`;
            xml += `      <idProv>${compra.proveedorIdentificacion}</idProv>\n`;
            xml += '      <tipoComprobante>01</tipoComprobante>\n';
            xml += `      <fechaRegistro>${this.formatFechaXML(compra.fecha)}</fechaRegistro>\n`;
            xml += `      <establecimiento>${compra.numeroComprobante.split('-')[0]}</establecimiento>\n`;
            xml += `      <puntoEmision>${compra.numeroComprobante.split('-')[1]}</puntoEmision>\n`;
            xml += `      <secuencial>${compra.numeroComprobante.split('-')[2]}</secuencial>\n`;
            xml += `      <fechaEmision>${this.formatFechaXML(compra.fecha)}</fechaEmision>\n`;
            xml += `      <baseNoGraIva>0.00</baseNoGraIva>\n`;
            xml += `      <baseImponible>${compra.subtotal.toFixed(2)}</baseImponible>\n`;
            xml += `      <baseImpGrav>${compra.subtotal.toFixed(2)}</baseImpGrav>\n`;
            xml += `      <montoIce>0.00</montoIce>\n`;
            xml += `      <montoIva>${compra.iva.toFixed(2)}</montoIva>\n`;
            xml += `      <valorRetBienes>0.00</valorRetBienes>\n`;
            xml += `      <valorRetServicios>0.00</valorRetServicios>\n`;
            xml += `      <valRetServ100>0.00</valRetServ100>\n`;
            xml += '    </detalleCompras>\n';
        });
        xml += '  </compras>\n';

        // Ventas
        xml += '  <ventas>\n';
        ventas.forEach(venta => {
            xml += '    <detalleVentas>\n';
            xml += '      <tpIdCliente>01</tpIdCliente>\n';
            xml += `      <idCliente>${venta.clienteIdentificacion}</idCliente>\n`;
            xml += '      <tipoComprobante>01</tipoComprobante>\n';
            xml += `      <numeroComprobantes>1</numeroComprobantes>\n`;
            xml += `      <baseNoGraIva>0.00</baseNoGraIva>\n`;
            xml += `      <baseImponible>${venta.subtotal.toFixed(2)}</baseImponible>\n`;
            xml += `      <baseImpGrav>${venta.subtotal.toFixed(2)}</baseImpGrav>\n`;
            xml += `      <montoIva>${venta.iva.toFixed(2)}</montoIva>\n`;
            xml += `      <valorRetIva>0.00</valorRetIva>\n`;
            xml += `      <valorRetRenta>0.00</valorRetRenta>\n`;
            xml += '    </detalleVentas>\n';
        });
        xml += '  </ventas>\n';

        xml += '</iva>';

        return xml;
    }

    /**
     * Genera el Anexo de Gastos Personales
     */
    generarAnexoGastosPersonales() {
        const anio = parseInt(document.getElementById('reporteAnio').value);
        const gastos = await db.get('gastosPersonales') || [];

        const gastosAnio = gastos.filter(g => {
            const fecha = new Date(g.fecha);
            return fecha.getFullYear() === anio;
        });

        if (gastosAnio.length === 0) {
            Utils.showToast('No hay gastos personales registrados para este año', 'warning');
            return;
        }

        // Generar archivo TXT según formato SRI
        const txt = this.generarTXTGastosPersonales(anio, gastosAnio);

        // Descargar archivo
        const blob = new Blob([txt], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `AnexoGastosPersonales_${anio}.txt`;
        link.click();

        Utils.showToast('Anexo de Gastos Personales generado correctamente', 'success');
    }

    /**
     * Genera el archivo TXT de Gastos Personales según formato SRI
     */
    generarTXTGastosPersonales(anio, gastos) {
        let txt = '';

        // Agrupar por categoría
        const categorias = {
            'vivienda': '1',
            'educacion': '2',
            'salud': '3',
            'alimentacion': '4',
            'vestimenta': '5',
            'turismo': '6'
        };

        gastos.forEach(gasto => {
            const fecha = new Date(gasto.fecha);
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');

            // Formato: TIPO|RUC|FECHA|FACTURA|MONTO
            txt += `${categorias[gasto.categoria] || '1'}|`;
            txt += `${gasto.rucProveedor}|`;
            txt += `${dia}/${mes}/${anio}|`;
            txt += `${gasto.numeroFactura}|`;
            txt += `${gasto.monto.toFixed(2)}\n`;
        });

        return txt;
    }

    /**
     * Formatea fecha para XML (dd/mm/yyyy)
     */
    formatFechaXML(fecha) {
        const d = new Date(fecha);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    /**
     * Escapa caracteres especiales para XML
     */
    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    exportarReporteIVA(mes, anio) {
        const reporte = this.calcularReporteIVA(mes, anio);

        const data = [
            ['DECLARACIÓN DE IVA'],
            [`Período: ${this.getNombreMes(mes)} ${anio}`],
            [''],
            ['VENTAS'],
            ['Concepto', 'Base Imponible', 'IVA'],
            ['Ventas Gravadas 12%', reporte.ventasGravadas12, reporte.ivaVentas],
            ['Ventas Gravadas 0%', reporte.ventasGravadas0, 0],
            ['TOTAL IVA COBRADO', reporte.ventasGravadas12 + reporte.ventasGravadas0, reporte.ivaVentas],
            [''],
            ['COMPRAS'],
            ['Concepto', 'Base Imponible', 'IVA'],
            ['Compras Gravadas 12%', reporte.comprasGravadas12, reporte.ivaCompras],
            ['Compras Gravadas 0%', reporte.comprasGravadas0, 0],
            ['TOTAL IVA PAGADO', reporte.comprasGravadas12 + reporte.comprasGravadas0, reporte.ivaCompras],
            [''],
            ['RESUMEN'],
            ['IVA Cobrado', reporte.ivaVentas],
            ['IVA Pagado', reporte.ivaCompras],
            [reporte.ivaPagar >= 0 ? 'IVA A PAGAR' : 'CRÉDITO TRIBUTARIO', Math.abs(reporte.ivaPagar)]
        ];

        Utils.exportToCSV(data, `Reporte_IVA_${mes}_${anio}.csv`);
        Utils.showToast('Reporte exportado correctamente', 'success');
    }

    /**
     * Genera el reporte detalldo de retenciones
     */
    generarReporteRetenciones() {
        const mes = parseInt(document.getElementById('reporteMes').value);
        const anio = parseInt(document.getElementById('reporteAnio').value);

        // Filtrar compras del período con retenciones
        const retenciones = this.compras
            .filter(c => {
                const fecha = new Date(c.fecha);
                const esDelMes = fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
                const tieneRetencion = (c.valRetRenta > 0) || (c.valRetIva > 0);
                return esDelMes && tieneRetencion;
            })
            .map(c => {
                // Mapear a formato plano para CSV
                return {
                    'Fecha Emisión': Utils.formatDate(c.fecha),
                    'Fecha Retención': Utils.formatDate(c.fecha), // Asumimos misma fecha
                    'Tipo Comprobante': 'Factura',
                    'No. Comprobante': c.numeroComprobante || 'S/N',
                    'Proveedor': c.proveedorNombre || 'Consumidor Final',
                    'RUC/Cédula': c.proveedorRuc || '9999999999999',
                    'Base Imponible': c.subtotal.toFixed(2),
                    'IVA': c.montoIva.toFixed(2),
                    'Total Factura': c.total.toFixed(2),
                    '% Ret. Renta': c.retencionFuente ? c.retencionFuente + '%' : '0%',
                    'Valor Ret. Renta': (c.valRetRenta || 0).toFixed(2),
                    '% Ret. IVA': c.retencionIva ? c.retencionIva + '%' : '0%',
                    'Valor Ret. IVA': (c.valRetIva || 0).toFixed(2),
                    'Total Retenido': ((c.valRetRenta || 0) + (c.valRetIva || 0)).toFixed(2)
                };
            });

        if (retenciones.length === 0) {
            Utils.showToast('No se encontraron retenciones emitidas en este período', 'warning');
            return;
        }

        // Calcular totales
        const totalRenta = retenciones.reduce((sum, r) => sum + parseFloat(r['Valor Ret. Renta']), 0);
        const totalIva = retenciones.reduce((sum, r) => sum + parseFloat(r['Valor Ret. IVA']), 0);
        const granTotal = totalRenta + totalIva;

        // Agregar fila de totales
        retenciones.push({
            'Fecha Emisión': '',
            'Fecha Retención': '',
            'Tipo Comprobante': '',
            'No. Comprobante': '',
            'Proveedor': 'TOTALES',
            'RUC/Cédula': '',
            'Base Imponible': '',
            'IVA': '',
            'Total Factura': '',
            '% Ret. Renta': '',
            'Valor Ret. Renta': totalRenta.toFixed(2),
            '% Ret. IVA': '',
            'Valor Ret. IVA': totalIva.toFixed(2),
            'Total Retenido': granTotal.toFixed(2)
        });

        // Exportar a CSV
        const nombreMes = this.getNombreMes(mes);
        const filename = `Reporte_Retenciones_${nombreMes}_${anio}.csv`;
        Utils.exportToCSV(retenciones, filename);

        Utils.showToast(`Reporte generado: ${filename}`, 'success');
    }
}

window.reportesModule = new ReportesModule();
