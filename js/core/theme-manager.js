/**
 * EContable - Theme Manager
 * Gestión de temas y personalización de colores
 */

class ThemeManager {
    constructor() {
        this.themes = {
            'ocean-blue': {
                name: 'Ocean Blue',
                icon: '🌊',
                description: 'Azul profesional estilo Slack'
            },
            'purple-haze': {
                name: 'Purple Haze',
                icon: '💜',
                description: 'Púrpura moderno estilo Notion'
            },
            'emerald-forest': {
                name: 'Emerald Forest',
                icon: '🌲',
                description: 'Verde natural estilo Spotify'
            },
            'sunset-orange': {
                name: 'Sunset Orange',
                icon: '🌅',
                description: 'Naranja vibrante estilo SoundCloud'
            },
            'rose-pink': {
                name: 'Rose Pink',
                icon: '🌸',
                description: 'Rosa creativo estilo Dribbble'
            },
            'cyber-teal': {
                name: 'Cyber Teal',
                icon: '🔮',
                description: 'Teal tech estilo GitHub'
            }
        };

        // Cargar tema guardado o usar por defecto
        this.currentTheme = localStorage.getItem('econtable_theme') || 'ocean-blue';
        this.init();
    }

    /**
     * Inicializa el gestor de temas
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.setupUI();
    }

    /**
     * Aplica un tema
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Tema "${themeName}" no encontrado, usando ocean-blue`);
            themeName = 'ocean-blue';
        }

        // Aplicar atributo data-theme al documento
        document.documentElement.setAttribute('data-theme', themeName);

        // Guardar preferencia
        localStorage.setItem('econtable_theme', themeName);
        this.currentTheme = themeName;

        // Emitir evento de cambio de tema
        if (window.events) {
            window.events.emit('theme-changed', { theme: themeName });
        }

        console.log(`✨ Tema aplicado: ${this.themes[themeName].name}`);
    }

    /**
     * Obtiene el tema actual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Obtiene todos los temas disponibles
     */
    getAvailableThemes() {
        return this.themes;
    }

    /**
     * Configura la UI del selector de temas
     */
    setupUI() {
        // Crear botón de temas en el header
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        // Verificar si ya existe
        if (document.getElementById('btnTheme')) return;

        const themeButton = document.createElement('button');
        themeButton.id = 'btnTheme';
        themeButton.className = 'btn-icon';
        themeButton.title = 'Cambiar Tema';
        themeButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5" stroke-width="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke-width="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke-width="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke-width="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke-width="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2"/>
            </svg>
        `;

        // Insertar antes del botón de notificaciones
        const notifButton = document.getElementById('btnNotifications');
        if (notifButton) {
            headerRight.insertBefore(themeButton, notifButton);
        } else {
            headerRight.appendChild(themeButton);
        }

        // Crear dropdown
        this.createThemeDropdown(themeButton);

        // Event listener para el botón
        themeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleThemeDropdown();
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('themeDropdown');
            if (dropdown && !dropdown.contains(e.target) && e.target !== themeButton) {
                dropdown.classList.remove('active');
            }
        });
    }

    /**
     * Crea el dropdown de selección de temas
     */
    createThemeDropdown(button) {
        const dropdown = document.createElement('div');
        dropdown.id = 'themeDropdown';
        dropdown.className = 'theme-dropdown';

        let html = '<div class="theme-dropdown-header">Seleccionar Tema</div>';

        Object.entries(this.themes).forEach(([key, theme]) => {
            const isActive = key === this.currentTheme;
            html += `
                <div class="theme-option ${isActive ? 'active' : ''}" data-theme="${key}">
                    <span class="theme-icon">${theme.icon}</span>
                    <div class="theme-info">
                        <div class="theme-name">${theme.name}</div>
                        <div class="theme-description">${theme.description}</div>
                    </div>
                    ${isActive ? '<span class="theme-check">✓</span>' : ''}
                </div>
            `;
        });

        dropdown.innerHTML = html;

        // Insertar después del botón
        button.parentNode.insertBefore(dropdown, button.nextSibling);

        // Event listeners para las opciones
        dropdown.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const themeName = option.dataset.theme;
                this.applyTheme(themeName);
                this.updateDropdownUI();
                this.toggleThemeDropdown();

                if (window.Utils) {
                    Utils.showToast(`Tema cambiado a ${this.themes[themeName].name}`, 'success');
                }
            });
        });
    }

    /**
     * Alterna la visibilidad del dropdown
     */
    toggleThemeDropdown() {
        const dropdown = document.getElementById('themeDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    /**
     * Actualiza la UI del dropdown
     */
    updateDropdownUI() {
        const dropdown = document.getElementById('themeDropdown');
        if (!dropdown) return;

        dropdown.querySelectorAll('.theme-option').forEach(option => {
            const themeName = option.dataset.theme;
            const isActive = themeName === this.currentTheme;

            option.classList.toggle('active', isActive);

            const checkmark = option.querySelector('.theme-check');
            if (isActive && !checkmark) {
                option.innerHTML += '<span class="theme-check">✓</span>';
            } else if (!isActive && checkmark) {
                checkmark.remove();
            }
        });
    }
}

// Instancia global
window.themeManager = new ThemeManager();
