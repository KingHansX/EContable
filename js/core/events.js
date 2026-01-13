/**
 * EContable - Event System
 * Sistema de eventos personalizado para comunicación entre módulos
 */

class EventSystem {
    constructor() {
        this.events = {};
    }

    /**
     * Suscribe un handler a un evento
     */
    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    /**
     * Desuscribe un handler de un evento
     */
    off(event, handler) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(h => h !== handler);
    }

    /**
     * Emite un evento
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error en handler de evento ${event}:`, error);
                }
            });
        }
    }

    /**
     * Suscribe un handler que se ejecuta solo una vez
     */
    once(event, handler) {
        const onceHandler = (data) => {
            handler(data);
            this.off(event, onceHandler);
        };
        this.on(event, onceHandler);
    }
}

// Instancia global
window.events = new EventSystem();
