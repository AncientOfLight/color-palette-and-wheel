// ============================================
// Color Palette Generator & Color Wheel App
// ============================================

// Configuration
const CONFIG = {
    PALETTE_SIZE: 5,
    STORAGE_KEY: 'colorPaletteData',
    ANIMATION_DURATION: 500,
};

// Color Database
const COLOR_DATABASE = {
    red: ['#FF0000', '#FF6B6B', '#FF8888', '#E63946', '#D62828', '#A4161A', '#7A0A0A', '#C1121F', '#FF3333', '#FF4444'],
    blue: ['#0000FF', '#3B82F6', '#60A5FA', '#0EA5E9', '#0284C7', '#0369A1', '#0C4A6E', '#082F49', '#1E40AF', '#1E3A8A'],
    green: ['#00FF00', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857', '#065F46', '#22C55E', '#84CC16'],
    orange: ['#FFA500', '#FB923C', '#F97316', '#EA580C', '#DC2626', '#B45309', '#92400E', '#FDBA74', '#FED7AA', '#FFB347'],
    yellow: ['#FFFF00', '#FBBF24', '#FCD34D', '#FDE047', '#FACC15', '#CA8A04', '#A16207', '#713F12', '#EAB308', '#F59E0B'],
    purple: ['#A020F0', '#8B5CF6', '#A78BFA', '#D8B4FE', '#E9D5FF', '#7C3AED', '#6D28D9', '#5B21B6', '#C084FC', '#B794F6'],
    pink: ['#FF1493', '#EC4899', '#F472B6', '#F9A8D4', '#FBE7F3', '#BE185D', '#9D174D', '#E91E63', '#F06292', '#F48FB1'],
    gray: ['#808080', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#4B5563', '#374151', '#1F2937', '#111827', '#F3F4F6'],
};

const SPECIAL_COLORS = {
    pastel: {
        name: 'Pastels',
        colors: ['#FFB3BA', '#FFCCCB', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4', '#F8B4D6', '#FFEEF8', '#D4F1F4']
    },
    metallic: {
        name: 'Metallics',
        colors: ['#C0C0C0', '#E8E8E8', '#FFD700', '#FFF8DC', '#CD7F32', '#D4AF37', '#98FB98', '#87CEEB', '#DDA0DD', '#FFC0CB']
    },
    neon: {
        name: 'Neon',
        colors: ['#39FF14', '#FF006E', '#FFBE0B', '#00D9FF', '#FB5607', '#8338EC', '#FF7EB3', '#FF00FF', '#00FFF0', '#FF0080']
    }
};

// State Management
const appState = {
    colors: [],
    lockedIndices: new Set(),
    paletteCount: 0,
    colorPicker: null,
    currentStyle: 'pastel',
};

// Utility Functions
const Utils = {
    /**
     * Generate a random hex color
     */
    generateRandomColor: () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    /**
     * Generate a random color from a palette of vibrant colors
     */
    generateVibrantColor: () => {
        const vibrantColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#B19CD9',
            '#FF8C94', '#A8DADC', '#457B9D', '#1D3557', '#E63946',
        ];
        return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
    },

    /**
     * Convert hex color to RGB
     */
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    },

    /**
     * Convert Hex to HSL
     */
    hexToHsl: (hex) => {
        let r, g, b;
        [r, g, b] = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    },

    /**
     * Copy text to clipboard
     */
    copyToClipboard: (text) => {
        navigator.clipboard.writeText(text).then(() => {
            UI.showToast('Copied to clipboard!');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            UI.showToast('Copied to clipboard!');
        });
    },

    /**
     * Download JSON file
     */
    downloadJSON: (data, filename) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },
};

// UI Management
const UI = {
    /**
     * Show toast notification
     */
    showToast: (message) => {
        const toast = document.getElementById('toast');
        toast.querySelector('span').textContent = '✓ ' + message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    },

    /**
     * Render color palette cards
     */
    renderPalette: () => {
        const container = document.getElementById('paletteContainer');
        container.innerHTML = '';

        appState.colors.forEach((color, index) => {
            const card = document.createElement('div');
            card.className = 'color-card animate-slide-in';
            card.style.height = '200px';

            const rgb = Utils.hexToRgb(color);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            const textColor = brightness > 128 ? '#000000' : '#FFFFFF';

            card.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;

            const content = document.createElement('div');
            content.className = 'color-card-content';
            content.style.color = textColor;

            const hexElement = document.createElement('div');
            hexElement.className = 'color-hex';
            hexElement.innerHTML = `
                ${color}
                <span class="color-hex-copy text-xs opacity-50">📋</span>
            `;
            hexElement.addEventListener('click', (e) => {
                e.stopPropagation();
                Utils.copyToClipboard(color);
            });

            const rgbElement = document.createElement('div');
            rgbElement.className = 'color-rgb';
            rgbElement.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

            const lockBtn = document.createElement('button');
            lockBtn.className = 'lock-btn';
            lockBtn.innerHTML = appState.lockedIndices.has(index) ? '🔒' : '🔓';
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                AppFunctions.toggleColorLock(index);
            });

            if (appState.lockedIndices.has(index)) {
                lockBtn.classList.add('locked');
            }

            content.appendChild(hexElement);
            content.appendChild(rgbElement);
            card.appendChild(content);
            card.appendChild(lockBtn);

            container.appendChild(card);
        });
    },

    /**
     * Render basic colors grid
     */
    renderBasicColors: () => {
        const container = document.getElementById('basicColorsContainer');
        container.innerHTML = '';

        Object.keys(COLOR_DATABASE).forEach(colorName => {
            const card = document.createElement('div');
            card.className = 'basic-color-card animate-slide-in';
            card.style.backgroundColor = COLOR_DATABASE[colorName][0];

            const rgb = Utils.hexToRgb(COLOR_DATABASE[colorName][0]);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
            card.style.color = textColor;

            const nameElement = document.createElement('div');
            nameElement.className = 'color-name';
            nameElement.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1);

            const countElement = document.createElement('div');
            countElement.className = 'color-count';
            countElement.textContent = '10 shades';

            card.appendChild(nameElement);
            card.appendChild(countElement);

            card.addEventListener('click', () => {
                AppFunctions.openShadesModal(colorName);
            });

            container.appendChild(card);
        });
    },

    /**
     * Render special styles colors
     */
    renderSpecialStyles: () => {
        const container = document.getElementById('specialStylesContainer');
        container.innerHTML = '';

        const styleData = SPECIAL_COLORS[appState.currentStyle];
        styleData.colors.forEach(color => {
            const card = document.createElement('div');
            card.className = 'shade-card animate-slide-in';

            let cardClass = '';
            if (appState.currentStyle === 'metallic') {
                if (color.toLowerCase() === '#ffd700' || color.toLowerCase() === '#fff8dc' || color.toLowerCase() === '#daa520') {
                    cardClass = 'metallic-card gold';
                } else if (color.toLowerCase() === '#cd7f32' || color.toLowerCase() === '#d4af37' || color.toLowerCase() === '#8b4513') {
                    cardClass = 'metallic-card bronze';
                } else {
                    cardClass = 'metallic-card silver';
                }
            } else if (appState.currentStyle === 'neon') {
                cardClass = 'neon-card';
                card.style.borderColor = color;
                card.style.color = color;
            } else {
                card.style.backgroundColor = color;
                const rgb = Utils.hexToRgb(color);
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                card.style.color = brightness > 128 ? '#000000' : '#FFFFFF';
            }

            if (cardClass) {
                card.classList.add(...cardClass.split(' '));
            }

            const hexElement = document.createElement('div');
            hexElement.className = 'shade-hex';
            hexElement.textContent = color;
            hexElement.addEventListener('click', (e) => {
                e.stopPropagation();
                Utils.copyToClipboard(color);
            });

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-hex-btn';
            copyBtn.textContent = 'Copy HEX';
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                Utils.copyToClipboard(color);
            });

            card.appendChild(hexElement);
            card.appendChild(copyBtn);

            container.appendChild(card);
        });
    },

    /**
     * Update color wheel display
     */
    updateColorWheelDisplay: (color) => {
        const display = document.getElementById('selectedColorDisplay');
        const hexElement = document.getElementById('hexValue');
        const rgbElement = document.getElementById('rgbValue');
        const hslElement = document.getElementById('hslValue');

        display.style.backgroundColor = color;

        const rgb = Utils.hexToRgb(color);
        const hsl = Utils.hexToHsl(color);

        hexElement.textContent = color;
        rgbElement.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslElement.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        hexElement.addEventListener('click', (e) => {
            e.stopPropagation();
            Utils.copyToClipboard(color);
        });
    },

    /**
     * Update statistics display
     */
    updateStats: () => {
        document.getElementById('totalColorsCount').textContent = appState.paletteCount * CONFIG.PALETTE_SIZE;
        document.getElementById('lockedColorsCount').textContent = appState.lockedIndices.size;
        document.getElementById('paletteGeneratedCount').textContent = appState.paletteCount;
    },
};

// Application Functions
const AppFunctions = {
    /**
     * Initialize application
     */
    init: () => {
        AppFunctions.loadState();
        AppFunctions.generatePalette();
        AppFunctions.setupEventListeners();
        AppFunctions.initializeColorWheel();
        UI.renderPalette();
        UI.renderBasicColors();
        UI.renderSpecialStyles();
        UI.updateStats();
    },

    /**
     * Generate new color palette
     */
    generatePalette: () => {
        appState.colors = [];
        for (let i = 0; i < CONFIG.PALETTE_SIZE; i++) {
            if (appState.lockedIndices.has(i)) {
                appState.colors.push(appState.colors[i] || Utils.generateVibrantColor());
            } else {
                appState.colors.push(Utils.generateVibrantColor());
            }
        }
        appState.paletteCount++;
        AppFunctions.saveState();
        UI.renderPalette();
        UI.updateStats();
    },

    /**
     * Toggle lock status of a color
     */
    toggleColorLock: (index) => {
        if (appState.lockedIndices.has(index)) {
            appState.lockedIndices.delete(index);
        } else {
            appState.lockedIndices.add(index);
        }
        AppFunctions.saveState();
        UI.renderPalette();
        UI.updateStats();
    },

    /**
     * Export palette as JSON
     */
    exportPalette: () => {
        const exportData = {
            palette: appState.colors,
            locked: Array.from(appState.lockedIndices),
            timestamp: new Date().toISOString(),
            totalGenerated: appState.paletteCount,
        };
        Utils.downloadJSON(exportData, `color-palette-${Date.now()}.json`);
        UI.showToast('Palette exported as JSON!');
    },

    /**
     * Initialize iro.js color wheel
     */
    initializeColorWheel: () => {
        appState.colorPicker = new iro.ColorPicker('#color-picker', {
            width: 250,
            color: '#3B82F6',
            borderWidth: 0,
            padding: 0,
            sliderMargin: 15,
            wheelLightness: true,
            layoutDirection: 'vertical',
        });

        appState.colorPicker.on('color:change', (color) => {
            UI.updateColorWheelDisplay(color.hexString);
        });

        UI.updateColorWheelDisplay(appState.colorPicker.color.hexString);
    },

    /**
     * Add color from wheel to palette
     */
    addColorFromWheel: () => {
        const selectedColor = appState.colorPicker.color.hexString;
        
        let added = false;
        for (let i = 0; i < appState.colors.length; i++) {
            if (!appState.lockedIndices.has(i)) {
                appState.colors[i] = selectedColor;
                added = true;
                break;
            }
        }

        if (!added && appState.colors.length < 10) {
            appState.colors.push(selectedColor);
        }

        AppFunctions.saveState();
        UI.renderPalette();
        UI.updateStats();
        UI.showToast('Color added to palette!');
    },

    /**
     * Open shades modal
     */
    openShadesModal: (colorName) => {
        const modal = document.getElementById('shadesModal');
        const title = document.getElementById('shadesModalTitle');
        const shadesGrid = document.getElementById('shadesGrid');

        title.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1) + ' Shades';
        shadesGrid.innerHTML = '';

        COLOR_DATABASE[colorName].forEach(color => {
            const card = document.createElement('div');
            card.className = 'shade-card animate-slide-in';
            card.style.backgroundColor = color;

            const rgb = Utils.hexToRgb(color);
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            card.style.color = brightness > 128 ? '#000000' : '#FFFFFF';

            const hexElement = document.createElement('div');
            hexElement.className = 'shade-hex';
            hexElement.textContent = color;
            hexElement.addEventListener('click', () => {
                Utils.copyToClipboard(color);
            });

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-hex-btn';
            copyBtn.textContent = 'Copy HEX';
            copyBtn.addEventListener('click', () => {
                Utils.copyToClipboard(color);
            });

            card.appendChild(hexElement);
            card.appendChild(copyBtn);
            shadesGrid.appendChild(card);
        });

        modal.classList.remove('hidden');
        modal.classList.add('show');
    },

    /**
     * Close shades modal
     */
    closeShadesModal: () => {
        const modal = document.getElementById('shadesModal');
        modal.classList.add('hidden');
        modal.classList.remove('show');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: () => {
        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            AppFunctions.generatePalette();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            AppFunctions.exportPalette();
        });

        // Add to palette button
        document.getElementById('addToWheelBtn').addEventListener('click', () => {
            AppFunctions.addColorFromWheel();
        });

        // Close modal button
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            AppFunctions.closeShadesModal();
        });

        // Modal background click
        document.getElementById('shadesModal').addEventListener('click', (e) => {
            if (e.target.id === 'shadesModal') {
                AppFunctions.closeShadesModal();
            }
        });

        // Style tabs
        document.querySelectorAll('.style-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.style-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                appState.currentStyle = tab.dataset.style;
                UI.renderSpecialStyles();
            });
        });

        // Spacebar to generate
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                AppFunctions.generatePalette();
            }
        });
    },

    /**
     * Save state to localStorage
     */
    saveState: () => {
        const stateData = {
            colors: appState.colors,
            lockedIndices: Array.from(appState.lockedIndices),
            paletteCount: appState.paletteCount,
            currentStyle: appState.currentStyle,
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateData));
    },

    /**
     * Load state from localStorage
     */
    loadState: () => {
        const savedState = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (savedState) {
            try {
                const data = JSON.parse(savedState);
                appState.colors = data.colors || [];
                appState.lockedIndices = new Set(data.lockedIndices || []);
                appState.paletteCount = data.paletteCount || 0;
                appState.currentStyle = data.currentStyle || 'pastel';
            } catch (error) {
                console.error('Error loading saved state:', error);
                AppFunctions.generatePalette();
            }
        } else {
            AppFunctions.generatePalette();
        }
    },
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AppFunctions.init();
    });
} else {
    AppFunctions.init();
}