/**
 * Sistema Contable Mónica - Asistente IA
 * Motor de inteligencia artificial asistida
 */

class AIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.suggestions = [];
        this.alerts = [];
        this.init();
    }

    /**
     * Inicializa el asistente IA
     */
    async init() {
        this.loadConversationHistory();
        this.generateAlerts();
        this.setupEventListeners();
    }

    /**
     * Carga el historial de conversaciones
     */
    loadConversationHistory() {
        this.conversationHistory = db.get('ai_conversations') || [];
    }

    /**
     * Guarda el historial de conversaciones
     */
    saveConversationHistory() {
        db.set('ai_conversations', this.conversationHistory);
    }

    /**
     * Genera alertas inteligentes
     */
    generateAlerts() {
        this.alerts = [];

        // Analizar IVA pendiente
        const ivaAlert = this.analyzeIVA();
        if (ivaAlert) this.alerts.push(ivaAlert);

        // Analizar inventario
        const inventoryAlert = this.analyzeInventory();
        if (inventoryAlert) this.alerts.push(inventoryAlert);

        // Analizar cuentas por cobrar
        const receivablesAlert = this.analyzeReceivables();
        if (receivablesAlert) this.alerts.push(receivablesAlert);

        // Analizar flujo de caja
        const cashFlowAlert = this.analyzeCashFlow();
        if (cashFlowAlert) this.alerts.push(cashFlowAlert);

        // Analizar errores comunes
        const errorsAlert = this.detectCommonErrors();
        if (errorsAlert) this.alerts.push(errorsAlert);

        return this.alerts;
    }

    /**
     * Analiza el IVA pendiente
     */
    analyzeIVA() {
        const ventas = db.get('ventas') || [];
        const compras = db.get('compras') || [];
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();

        // Filtrar ventas y compras del mes actual
        const ventasMes = ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        const comprasMes = compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        // Calcular IVA
        const ivaVentas = ventasMes.reduce((sum, v) => sum + (v.iva || 0), 0);
        const ivaCompras = comprasMes.reduce((sum, c) => sum + (c.iva || 0), 0);
        const ivaPorPagar = ivaVentas - ivaCompras;

        if (ivaPorPagar > 0) {
            const fechaVencimiento = Utils.getIVADueDate(mesActual, anioActual);
            const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));

            return {
                type: diasRestantes <= 5 ? 'danger' : 'warning',
                title: 'IVA por Declarar',
                message: `Tienes ${Utils.formatCurrency(ivaPorPagar)} de IVA por declarar. Vence en ${diasRestantes} días.`,
                action: 'Ver detalle',
                time: 'Ahora',
                data: {
                    ivaVentas,
                    ivaCompras,
                    ivaPorPagar,
                    fechaVencimiento
                }
            };
        }

        return null;
    }

    /**
     * Analiza el inventario
     */
    analyzeInventory() {
        const productos = db.get('productos') || [];
        const productosStockBajo = productos.filter(p =>
            p.stock <= (p.stockMinimo || 0) && p.activo
        );

        if (productosStockBajo.length > 0) {
            return {
                type: 'warning',
                title: 'Stock Bajo Detectado',
                message: `${productosStockBajo.length} producto(s) tienen stock por debajo del mínimo.`,
                action: 'Ver productos',
                time: 'Hace 5 min',
                data: {
                    productos: productosStockBajo
                }
            };
        }

        return null;
    }

    /**
     * Analiza cuentas por cobrar vencidas
     */
    analyzeReceivables() {
        const ventas = db.get('ventas') || [];
        const hoy = new Date();

        const ventasVencidas = ventas.filter(v => {
            if (v.estado === 'pagada') return false;
            if (!v.fechaVencimiento) return false;
            return new Date(v.fechaVencimiento) < hoy;
        });

        if (ventasVencidas.length > 0) {
            const totalVencido = ventasVencidas.reduce((sum, v) => sum + (v.total || 0), 0);

            return {
                type: 'danger',
                title: 'Cuentas por Cobrar Vencidas',
                message: `${ventasVencidas.length} factura(s) vencidas por ${Utils.formatCurrency(totalVencido)}.`,
                action: 'Ver facturas',
                time: 'Hace 1 hora',
                data: {
                    facturas: ventasVencidas,
                    total: totalVencido
                }
            };
        }

        return null;
    }

    /**
     * Analiza el flujo de caja
     */
    analyzeCashFlow() {
        const ventas = db.get('ventas') || [];
        const compras = db.get('compras') || [];
        const mesActual = new Date().getMonth() + 1;
        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
        const anioActual = new Date().getFullYear();

        // Calcular ingresos del mes actual
        const ingresosActual = ventas
            .filter(v => {
                const fecha = new Date(v.fecha);
                return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
            })
            .reduce((sum, v) => sum + (v.total || 0), 0);

        // Calcular ingresos del mes anterior
        const ingresosAnterior = ventas
            .filter(v => {
                const fecha = new Date(v.fecha);
                return fecha.getMonth() + 1 === mesAnterior;
            })
            .reduce((sum, v) => sum + (v.total || 0), 0);

        // Calcular variación
        const variacion = ingresosAnterior > 0
            ? ((ingresosActual - ingresosAnterior) / ingresosAnterior) * 100
            : 0;

        if (variacion < -15) {
            return {
                type: 'warning',
                title: 'Flujo de Caja en Descenso',
                message: `Los ingresos han bajado ${Math.abs(variacion).toFixed(1)}% respecto al mes anterior.`,
                action: 'Ver análisis',
                time: 'Hace 2 horas',
                data: {
                    ingresosActual,
                    ingresosAnterior,
                    variacion
                }
            };
        }

        return null;
    }

    /**
     * Detecta errores comunes
     */
    detectCommonErrors() {
        const errores = [];

        // Verificar facturas sin IVA aplicado correctamente
        const ventas = db.get('ventas') || [];
        const ventasSinIVA = ventas.filter(v => {
            if (v.tarifaIVA === 15 && (!v.iva || v.iva === 0)) {
                return true;
            }
            return false;
        });

        if (ventasSinIVA.length > 0) {
            errores.push(`${ventasSinIVA.length} factura(s) con IVA mal aplicado`);
        }

        // Verificar comprobantes duplicados
        const numerosComprobantes = ventas.map(v => v.numeroComprobante);
        const duplicados = numerosComprobantes.filter((num, index) =>
            numerosComprobantes.indexOf(num) !== index
        );

        if (duplicados.length > 0) {
            errores.push(`${duplicados.length} comprobante(s) duplicado(s)`);
        }

        if (errores.length > 0) {
            return {
                type: 'danger',
                title: 'Errores Detectados',
                message: errores.join(', '),
                action: 'Corregir',
                time: 'Hace 30 min',
                data: {
                    errores
                }
            };
        }

        return null;
    }

    /**
     * Procesa una pregunta del usuario
     */
    async processQuestion(question) {
        // Guardar pregunta en el historial
        this.conversationHistory.push({
            type: 'user',
            message: question,
            timestamp: new Date().toISOString()
        });

        // Analizar la pregunta y generar respuesta
        const response = this.generateResponse(question);

        // Guardar respuesta en el historial
        this.conversationHistory.push({
            type: 'ai',
            message: response,
            timestamp: new Date().toISOString()
        });

        this.saveConversationHistory();

        return response;
    }

    /**
     * Genera una respuesta basada en la pregunta
     */
    generateResponse(question) {
        const lowerQuestion = question.toLowerCase();

        // Preguntas sobre IVA
        if (lowerQuestion.includes('iva') && lowerQuestion.includes('declarar')) {
            return this.getIVAResponse();
        }

        // Preguntas sobre utilidad
        if (lowerQuestion.includes('utilidad') || lowerQuestion.includes('ganancia')) {
            return this.getUtilityResponse();
        }

        // Preguntas sobre gastos
        if (lowerQuestion.includes('gasto')) {
            return this.getExpensesResponse();
        }

        // Preguntas sobre ventas
        if (lowerQuestion.includes('venta')) {
            return this.getSalesResponse();
        }

        // Preguntas sobre inventario
        if (lowerQuestion.includes('inventario') || lowerQuestion.includes('stock')) {
            return this.getInventoryResponse();
        }

        // Preguntas sobre clientes morosos
        if (lowerQuestion.includes('moroso') || lowerQuestion.includes('cobrar')) {
            return this.getReceivablesResponse();
        }

        // Respuesta por defecto
        return this.getDefaultResponse();
    }

    /**
     * Respuesta sobre IVA
     */
    getIVAResponse() {
        const alert = this.analyzeIVA();

        if (alert) {
            const { ivaVentas, ivaCompras, ivaPorPagar, fechaVencimiento } = alert.data;

            return `Según mi análisis del mes actual:

📊 **Resumen de IVA:**
- IVA en ventas: ${Utils.formatCurrency(ivaVentas)}
- IVA en compras: ${Utils.formatCurrency(ivaCompras)}
- **IVA a pagar: ${Utils.formatCurrency(ivaPorPagar)}**

📅 Fecha de vencimiento: ${Utils.formatDate(fechaVencimiento, 'long')}

⚠️ **Recomendación:** Prepara la declaración con anticipación y verifica que todos los comprobantes estén autorizados por el SRI.

¿Necesitas que revise algún detalle específico?`;
        }

        return 'No hay IVA pendiente de declaración en este momento. Todos los períodos están al día.';
    }

    /**
     * Respuesta sobre utilidad
     */
    getUtilityResponse() {
        const ventas = db.get('ventas') || [];
        const compras = db.get('compras') || [];
        const mesActual = new Date().getMonth() + 1;
        const anioActual = new Date().getFullYear();

        const ventasMes = ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        const comprasMes = compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual;
        });

        const totalVentas = ventasMes.reduce((sum, v) => sum + (v.subtotal || 0), 0);
        const totalCompras = comprasMes.reduce((sum, c) => sum + (c.subtotal || 0), 0);
        const utilidad = totalVentas - totalCompras;
        const margen = totalVentas > 0 ? (utilidad / totalVentas) * 100 : 0;

        return `📈 **Análisis de Utilidad - ${Utils.getCurrentMonth()} ${Utils.getCurrentYear()}**

- Ingresos: ${Utils.formatCurrency(totalVentas)}
- Costos: ${Utils.formatCurrency(totalCompras)}
- **Utilidad: ${Utils.formatCurrency(utilidad)}**
- Margen: ${margen.toFixed(2)}%

${margen < 20 ? '⚠️ El margen de utilidad está por debajo del 20%. Considera revisar tus costos o ajustar precios.' : '✅ El margen de utilidad es saludable.'}`;
    }

    /**
     * Respuesta sobre gastos
     */
    getExpensesResponse() {
        const compras = db.get('compras') || [];
        const mesActual = new Date().getMonth() + 1;
        const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;

        const comprasMesActual = compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mesActual;
        }).reduce((sum, c) => sum + (c.total || 0), 0);

        const comprasMesAnterior = compras.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha.getMonth() + 1 === mesAnterior;
        }).reduce((sum, c) => sum + (c.total || 0), 0);

        const variacion = comprasMesAnterior > 0
            ? ((comprasMesActual - comprasMesAnterior) / comprasMesAnterior) * 100
            : 0;

        return `💰 **Análisis de Gastos**

- Mes actual: ${Utils.formatCurrency(comprasMesActual)}
- Mes anterior: ${Utils.formatCurrency(comprasMesAnterior)}
- Variación: ${variacion >= 0 ? '+' : ''}${variacion.toFixed(1)}%

${Math.abs(variacion) > 15 ? `⚠️ Los gastos han ${variacion > 0 ? 'aumentado' : 'disminuido'} significativamente. Te recomiendo revisar las categorías de gasto para identificar la causa.` : '✅ Los gastos se mantienen estables.'}`;
    }

    /**
     * Respuesta sobre ventas
     */
    getSalesResponse() {
        const ventas = db.get('ventas') || [];
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const ventasMes = ventas.filter(v => new Date(v.fecha) >= inicioMes);
        const totalVentas = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);

        return `🛒 **Resumen de Ventas - ${Utils.getCurrentMonth()}**

- Total de ventas: ${Utils.formatCurrency(totalVentas)}
- Número de transacciones: ${ventasMes.length}
- Ticket promedio: ${Utils.formatCurrency(ventasMes.length > 0 ? totalVentas / ventasMes.length : 0)}

${ventasMes.length > 0 ? '✅ Mantén el ritmo de ventas y considera estrategias para aumentar el ticket promedio.' : '⚠️ No hay ventas registradas este mes.'}`;
    }

    /**
     * Respuesta sobre inventario
     */
    getInventoryResponse() {
        const productos = db.get('productos') || [];
        const productosActivos = productos.filter(p => p.activo);
        const productosStockBajo = productosActivos.filter(p => p.stock <= (p.stockMinimo || 0));
        const valorInventario = productosActivos.reduce((sum, p) => sum + (p.stock * p.precioCompra || 0), 0);

        return `📦 **Estado del Inventario**

- Productos activos: ${productosActivos.length}
- Valor total: ${Utils.formatCurrency(valorInventario)}
- Productos con stock bajo: ${productosStockBajo.length}

${productosStockBajo.length > 0 ? `⚠️ Productos que requieren reabastecimiento:\n${productosStockBajo.slice(0, 5).map(p => `- ${p.nombre} (Stock: ${p.stock})`).join('\n')}` : '✅ Todos los productos tienen stock adecuado.'}`;
    }

    /**
     * Respuesta sobre cuentas por cobrar
     */
    getReceivablesResponse() {
        const ventas = db.get('ventas') || [];
        const hoy = new Date();

        const ventasPendientes = ventas.filter(v => v.estado !== 'pagada');
        const ventasVencidas = ventasPendientes.filter(v =>
            v.fechaVencimiento && new Date(v.fechaVencimiento) < hoy
        );

        const totalPendiente = ventasPendientes.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalVencido = ventasVencidas.reduce((sum, v) => sum + (v.total || 0), 0);

        return `💳 **Cuentas por Cobrar**

- Total pendiente: ${Utils.formatCurrency(totalPendiente)}
- Facturas pendientes: ${ventasPendientes.length}
- **Facturas vencidas: ${ventasVencidas.length}**
- **Total vencido: ${Utils.formatCurrency(totalVencido)}**

${ventasVencidas.length > 0 ? '⚠️ **Acción requerida:** Contacta a los clientes con facturas vencidas para gestionar el cobro.' : '✅ No hay facturas vencidas en este momento.'}`;
    }

    /**
     * Respuesta por defecto
     */
    getDefaultResponse() {
        return `Puedo ayudarte con información sobre:

📊 **Consultas disponibles:**
- "¿Cuánto IVA debo declarar este mes?"
- "¿Cuál es mi utilidad actual?"
- "¿Qué gastos subieron más?"
- "¿Cómo van las ventas?"
- "¿Qué productos tienen stock bajo?"
- "¿Tengo clientes morosos?"

Por favor, reformula tu pregunta o elige una de las opciones anteriores.`;
    }

    /**
     * Sugiere cuentas contables basadas en descripción
     */
    suggestAccount(description) {
        const cuentas = db.get('cuentas') || [];
        const lowerDesc = description.toLowerCase();

        // Lógica de sugerencia basada en palabras clave
        const keywords = {
            'venta': ['4.1.01', '4.1.02'],
            'compra': ['5.1'],
            'sueldo': ['5.2.01'],
            'servicio': ['5.2.02'],
            'arriendo': ['5.2.03'],
            'banco': ['1.1.02'],
            'caja': ['1.1.01'],
            'cliente': ['1.1.03'],
            'proveedor': ['2.1.01']
        };

        for (const [keyword, codigos] of Object.entries(keywords)) {
            if (lowerDesc.includes(keyword)) {
                return cuentas.filter(c => codigos.includes(c.codigo));
            }
        }

        return [];
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listener para el botón flotante
        const fabButton = document.getElementById('aiAssistantFab');
        const chatPanel = document.getElementById('aiChatPanel');

        if (fabButton) {
            fabButton.addEventListener('click', () => {
                chatPanel.classList.toggle('active');
            });
        }

        // Event listener para cerrar el chat
        const closeButton = document.getElementById('btnCloseChat');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                chatPanel.classList.remove('active');
            });
        }

        // Event listener para enviar mensajes
        const sendButton = document.getElementById('btnSendChat');
        const chatInput = document.getElementById('aiChatInput');

        if (sendButton && chatInput) {
            sendButton.addEventListener('click', () => this.sendMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        // Event listeners para chips de sugerencias
        const suggestionChips = document.querySelectorAll('.suggestion-chip');
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                chatInput.value = chip.textContent;
                this.sendMessage();
            });
        });
    }

    /**
     * Envía un mensaje al asistente
     */
    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        const messagesContainer = document.getElementById('aiChatMessages');

        if (!input || !messagesContainer) return;

        const message = input.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessageToUI(message, 'user');
        input.value = '';

        // Procesar pregunta y obtener respuesta
        const response = await this.processQuestion(message);

        // Agregar respuesta de la IA
        setTimeout(() => {
            this.addMessageToUI(response, 'ai');
        }, 500);
    }

    /**
     * Agrega un mensaje a la interfaz
     */
    addMessageToUI(message, type) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;

        if (type === 'ai') {
            messageDiv.innerHTML = `
                <div class="ai-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke-width="2"/>
                    </svg>
                </div>
                <div class="ai-message-content">${this.formatMessage(message)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="user-message-content">${Utils.sanitizeHTML(message)}</div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Formatea el mensaje con markdown básico
     */
    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
}

// Crear instancia global
const aiAssistant = new AIAssistant();
