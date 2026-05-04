// ============================================
// Color Palette Generator & Color Wheel App
// ============================================

// Configuration
const CONFIG = {
    PALETTE_SIZE: 5,
    STORAGE_KEY: 'colorPaletteData',
    STATS_KEY: 'colorPaletteStats',
    ANIMATION_DURATION: 500,
};

// State Management
const appState = {
    colors: [],
    lockedIndices: new Set(),
    paletteCount: 0,
    colorPicker: null,
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
            '#F1FAEE', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94',
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
     * Convert RGB to Hex
     */
    rgbToHex: (r, g, b) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
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
            // Fallback for older browsers
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

        // Add click to copy for hex in color wheel
        hexElement.addEventListener('click', (e) => {
            e.stopPropagation();
            Utils.copyToClipboard(color);
        }, { once: false });
    },

    /**
     * Update statistics display
     */
    updateStats: () => {
        document.getElementById('totalColorsCount').textContent = appState.colors.length;
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
        UI.updateStats();
    },

    /**
     * Generate new color palette
     */
    generatePalette: () => {
        appState.colors = [];
        for (let i = 0; i < CONFIG.PALETTE_SIZE; i++) {
            if (appState.lockedIndices.has(i)) {
                // Keep locked color
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

        // Update display when color changes
        appState.colorPicker.on('color:change', (color) => {
            UI.updateColorWheelDisplay(color.hexString);
        });

        // Initial display
        UI.updateColorWheelDisplay(appState.colorPicker.color.hexString);
    },

    /**
     * Add color from wheel to palette
     */
    addColorFromWheel: () => {
        const selectedColor = appState.colorPicker.color.hexString;
        
        // Find first unlocked slot or add new
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