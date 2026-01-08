/**
 * EContable - Sistema de Autenticación
 * Gestión de login, logout y sesiones
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.timeoutTimer = null;
        this.init();
    }

    init() {
        this.checkSession();
    }

    /**
     * Verifica si hay una sesión activa
     */
    checkSession() {
        const session = localStorage.getItem('econtable_session');

        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();

                // Verificar si la sesión no ha expirado
                if (sessionData.expiresAt > now) {
                    this.currentUser = sessionData.user;
                    this.startSessionTimer();
                    return true;
                } else {
                    this.logout();
                    return false;
                }
            } catch (error) {
                console.error('Error al verificar sesión:', error);
                this.logout();
                return false;
            }
        }

        return false;
    }

    /**
     * Inicia sesión
     */
    login(username, password) {
        // Buscar usuario en la base de datos
        const usuarios = db.find('usuarios') || [];
        const user = usuarios.find(u =>
            u.username === username && u.activo
        );

        if (!user) {
            return {
                success: false,
                message: 'Usuario no encontrado o inactivo'
            };
        }

        // Verificar contraseña (en este demo es "admin")
        if (password !== 'admin') {
            return {
                success: false,
                message: 'Contraseña incorrecta'
            };
        }

        // Crear sesión
        const sessionData = {
            user: {
                id: user.id,
                username: user.username,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            },
            loginTime: new Date().toISOString(),
            expiresAt: new Date().getTime() + this.sessionTimeout
        };

        localStorage.setItem('econtable_session', JSON.stringify(sessionData));
        this.currentUser = sessionData.user;

        // Iniciar timer de sesión
        this.startSessionTimer();

        // Registrar login en el log
        this.logActivity('login', { username });

        return {
            success: true,
            user: this.currentUser
        };
    }

    /**
     * Cierra sesión
     */
    logout() {
        if (this.currentUser) {
            this.logActivity('logout', { username: this.currentUser.username });
        }

        localStorage.removeItem('econtable_session');
        this.currentUser = null;

        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }

        // Redirigir al login
        this.redirectToLogin();
    }

    /**
     * Inicia el timer de sesión
     */
    startSessionTimer() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }

        this.timeoutTimer = setTimeout(() => {
            Utils.showToast('Tu sesión ha expirado', 'warning');
            this.logout();
        }, this.sessionTimeout);
    }

    /**
     * Reinicia el timer de sesión (al detectar actividad)
     */
    resetSessionTimer() {
        if (this.currentUser) {
            const session = JSON.parse(localStorage.getItem('econtable_session'));
            session.expiresAt = new Date().getTime() + this.sessionTimeout;
            localStorage.setItem('econtable_session', JSON.stringify(session));
            this.startSessionTimer();
        }
    }

    /**
     * Redirige al login
     */
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    /**
     * Redirige al dashboard
     */
    redirectToDashboard() {
        window.location.href = 'index.html';
    }

    /**
     * Verifica si el usuario tiene un permiso
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;

        const roles = {
            'admin': ['all'],
            'contador': ['contabilidad', 'reportes', 'ventas', 'compras', 'view'],
            'vendedor': ['ventas', 'clientes', 'view'],
            'comprador': ['compras', 'proveedores', 'inventario', 'view'],
            'consulta': ['view']
        };

        const userPermissions = roles[this.currentUser.rol] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Registra actividad del usuario
     */
    logActivity(action, data = {}) {
        const log = {
            action,
            user: this.currentUser?.username || 'anonymous',
            timestamp: new Date().toISOString(),
            data
        };

        const logs = JSON.parse(localStorage.getItem('econtable_logs') || '[]');
        logs.push(log);

        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }

        localStorage.setItem('econtable_logs', JSON.stringify(logs));
    }

    /**
     * Obtiene los logs de actividad
     */
    getActivityLogs(limit = 100) {
        const logs = JSON.parse(localStorage.getItem('econtable_logs') || '[]');
        return logs.slice(-limit).reverse();
    }
}

// Instancia global
window.authSystem = new AuthSystem();

// Detectar actividad del usuario para resetear el timer
document.addEventListener('click', () => {
    if (window.authSystem.currentUser) {
        window.authSystem.resetSessionTimer();
    }
});

document.addEventListener('keypress', () => {
    if (window.authSystem.currentUser) {
        window.authSystem.resetSessionTimer();
    }
});
