/**
 * EContable - Router System
 * Sistema de enrutamiento básico para navegación SPA
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }

    /**
     * Registra una ruta
     */
    register(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Navega a una ruta
     */
    navigate(path) {
        if (this.routes[path]) {
            this.currentRoute = path;
            this.routes[path]();
        } else {
            console.warn(`Ruta no encontrada: ${path}`);
        }
    }

    /**
     * Obtiene la ruta actual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Instancia global
window.router = new Router();
