/**
 * ============================================
 * Advanced Color Wheel Component
 * ============================================
 * 
 * A modular, interactive Color Wheel using HTML5 Canvas
 * Features: Click/Drag interaction, HSV color space, callback outputs
 * 
 * Usage:
 * const wheel = new ColorWheel({
 *     container: '#color-wheel-container',
 *     size: 300,
 *     onColorChange: (color) => {
 *         console.log(color.hex, color.rgb, color.hsl);
 *     }
 * });
 */

class ColorWheel {
    /**
     * Constructor - Initialize the Color Wheel component
     * @param {Object} options - Configuration options
     * @param {String} options.container - CSS selector for container element
     * @param {Number} options.size - Diameter of the wheel in pixels (default: 300)
     * @param {String} options.initialColor - Initial HEX color (default: '#FF0000')
     * @param {Function} options.onColorChange - Callback function for color changes
     * @param {Function} options.onColorSelect - Callback function when color is selected (click)
     * @param {Boolean} options.showSaturationRadius - Show saturation ring (default: true)
     * @param {Boolean} options.enableTouch - Enable touch support (default: true)
     */
    constructor(options = {}) {
        // Configuration
        this.container = document.querySelector(options.container || '#color-wheel');
        this.wheelSize = options.size || 300;
        this.radius = this.wheelSize / 2;
        this.initialColor = options.initialColor || '#FF0000';
        this.onColorChange = options.onColorChange || (() => {});
        this.onColorSelect = options.onColorSelect || (() => {});
        this.showSaturationRadius = options.showSaturationRadius !== false;
        this.enableTouch = options.enableTouch !== false;

        // State
        this.isDragging = false;
        this.currentHue = 0;
        this.currentSaturation = 100;
        this.currentBrightness = 100;
        this.selectedColor = { hex: this.initialColor, rgb: {}, hsl: {} };

        // Canvas setup
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.wheelSize;
        this.canvas.height = this.wheelSize;
        this.canvas.className = 'color-wheel-canvas';
        this.ctx = this.canvas.getContext('2d');

        // Initialize
        this.initialize();
    }

    /**
     * Initialize the component
     * @private
     */
    initialize() {
        if (!this.container) {
            console.error('ColorWheel: Container element not found');
            return;
        }

        // Append canvas to container
        this.container.appendChild(this.canvas);

        // Setup event listeners
        this.setupEventListeners();

        // Draw initial wheel
        this.draw();

        // Set initial color
        this.setColor(this.initialColor);
    }

    /**
     * Setup event listeners for interaction
     * @private
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());
        this.canvas.addEventListener('mouseleave', () => this.handlePointerUp());

        // Touch events
        if (this.enableTouch) {
            this.canvas.addEventListener('touchstart', (e) => this.handlePointerDown(e));
            this.canvas.addEventListener('touchmove', (e) => this.handlePointerMove(e));
            this.canvas.addEventListener('touchend', () => this.handlePointerUp());
            this.canvas.addEventListener('touchcancel', () => this.handlePointerUp());
        }

        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle pointer down event (mouse or touch)
     * @private
     */
    handlePointerDown(event) {
        event.preventDefault();
        this.isDragging = true;
        this.updateColorFromEvent(event);
    }

    /**
     * Handle pointer move event
     * @private
     */
    handlePointerMove(event) {
        if (!this.isDragging) return;
        event.preventDefault();
        this.updateColorFromEvent(event);
    }

    /**
     * Handle pointer up event
     * @private
     */
    handlePointerUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.onColorSelect(this.selectedColor);
        }
    }

    /**
     * Update color based on pointer position
     * @private
     */
    updateColorFromEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;

        // Handle both mouse and touch events
        if (event.touches) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }

        // Convert to relative coordinates
        const relX = x - this.radius;
        const relY = y - this.radius;

        // Calculate distance and angle
        const distance = Math.sqrt(relX * relX + relY * relY);
        let angle = Math.atan2(relY, relX) * (180 / Math.PI);

        // Normalize angle to 0-360
        angle = (angle + 360) % 360;

        // Clamp saturation to wheel radius
        const maxRadius = this.radius - 10; // Leave padding
        const saturation = Math.min(100, (distance / maxRadius) * 100);

        // Update color state
        this.currentHue = angle;
        this.currentSaturation = saturation;
        this.currentBrightness = 100;

        // Convert and update
        this.updateSelectedColor();
    }

    /**
     * Update the selected color and trigger callback
     * @private
     */
    updateSelectedColor() {
        const hex = this.hsvToHex(this.currentHue, this.currentSaturation, this.currentBrightness);
        const rgb = this.hsvToRgb(this.currentHue, this.currentSaturation, this.currentBrightness);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

        this.selectedColor = {
            hex: hex,
            rgb: rgb,
            hsl: hsl,
            hsv: {
                h: Math.round(this.currentHue),
                s: Math.round(this.currentSaturation),
                v: Math.round(this.currentBrightness)
            }
        };

        this.draw();
        this.onColorChange(this.selectedColor);
    }

    /**
     * Set color from HEX value
     * @public
     */
    setColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);

        this.currentHue = hsv.h;
        this.currentSaturation = hsv.s;
        this.currentBrightness = hsv.v;

        this.updateSelectedColor();
    }

    /**
     * Get current color
     * @public
     */
    getColor() {
        return this.selectedColor;
    }

    /**
     * Draw the color wheel on canvas
     * @private
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.wheelSize, this.wheelSize);

        // Draw HSV color wheel
        this.drawColorWheel();

        // Draw saturation rings (optional)
        if (this.showSaturationRadius) {
            this.drawSaturationRings();
        }

        // Draw selector marker
        this.drawSelectorMarker();
    }

    /**
     * Draw the HSV color wheel
     * @private
     */
    drawColorWheel() {
        const imageData = this.ctx.createImageData(this.wheelSize, this.wheelSize);
        const data = imageData.data;

        for (let y = 0; y < this.wheelSize; y++) {
            for (let x = 0; x < this.wheelSize; x++) {
                const relX = x - this.radius;
                const relY = y - this.radius;
                const distance = Math.sqrt(relX * relX + relY * relY);

                // Skip if outside wheel
                if (distance > this.radius - 10) {
                    continue;
                }

                // Calculate angle (hue)
                let angle = Math.atan2(relY, relX) * (180 / Math.PI);
                angle = (angle + 360) % 360;

                // Calculate saturation (distance from center)
                const maxRadius = this.radius - 10;
                const saturation = (distance / maxRadius) * 100;

                // Get RGB from HSV
                const rgb = this.hsvToRgb(angle, saturation, 100);

                const index = (y * this.wheelSize + x) * 4;
                data[index] = rgb.r;        // Red
                data[index + 1] = rgb.g;    // Green
                data[index + 2] = rgb.b;    // Blue
                data[index + 3] = 255;      // Alpha
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Draw saturation reference rings
     * @private
     */
    drawSaturationRings() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;

        const maxRadius = this.radius - 10;

        for (let i = 1; i <= 4; i++) {
            const ringRadius = (maxRadius / 4) * i;
            this.ctx.beginPath();
            this.ctx.arc(this.radius, this.radius, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    /**
     * Draw the selector marker at current position
     * @private
     */
    drawSelectorMarker() {
        const maxRadius = this.radius - 10;
        const distance = (this.currentSaturation / 100) * maxRadius;
        const angle = (this.currentHue * Math.PI) / 180;

        const markerX = this.radius + distance * Math.cos(angle);
        const markerY = this.radius + distance * Math.sin(angle);

        // Outer ring (white)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.arc(markerX, markerY, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner ring (dark)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Center dot (current color)
        this.ctx.fillStyle = this.selectedColor.hex;
        this.ctx.beginPath();
        this.ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(markerX, markerY, 12, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // ==========================================
    // Color Conversion Methods
    // ==========================================

    /**
     * Convert HSV to RGB
     * @private
     */
    hsvToRgb(h, s, v) {
        const hNorm = h / 60;
        const sNorm = s / 100;
        const vNorm = v / 100;

        const c = vNorm * sNorm;
        const x = c * (1 - Math.abs((hNorm % 2) - 1));
        const m = vNorm - c;

        let r, g, b;

        if (hNorm >= 0 && hNorm < 1) {
            [r, g, b] = [c, x, 0];
        } else if (hNorm >= 1 && hNorm < 2) {
            [r, g, b] = [x, c, 0];
        } else if (hNorm >= 2 && hNorm < 3) {
            [r, g, b] = [0, c, x];
        } else if (hNorm >= 3 && hNorm < 4) {
            [r, g, b] = [0, x, c];
        } else if (hNorm >= 4 && hNorm < 5) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    /**
     * Convert RGB to HSV
     * @private
     */
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                h = 60 * (((b - r) / delta) + 2);
            } else {
                h = 60 * (((r - g) / delta) + 4);
            }
        }

        h = (h + 360) % 360;

        const s = max === 0 ? 0 : (delta / max) * 100;
        const v = max * 100;

        return { h, s, v };
    }

    /**
     * Convert HSV to HEX
     * @private
     */
    hsvToHex(h, s, v) {
        const rgb = this.hsvToRgb(h, s, v);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    /**
     * Convert RGB to HEX
     * @private
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    /**
     * Convert HEX to RGB
     * @private
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 0, b: 0 };
    }

    /**
     * Convert RGB to HSL
     * @private
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        const lightness = (max + min) / 2;

        let hue = 0;
        let saturation = 0;

        if (diff !== 0) {
            saturation = lightness > 0.5
                ? diff / (2 - max - min)
                : diff / (max + min);

            switch (max) {
                case r:
                    hue = 60 * (((g - b) / diff) % 6);
                    break;
                case g:
                    hue = 60 * (((b - r) / diff) + 2);
                    break;
                case b:
                    hue = 60 * (((r - g) / diff) + 4);
                    break;
            }
        }

        hue = (hue + 360) % 360;

        return {
            h: Math.round(hue),
            s: Math.round(saturation * 100),
            l: Math.round(lightness * 100)
        };
    }

    /**
     * Destroy the component
     * @public
     */
    destroy() {
        this.canvas.removeEventListener('mousedown', this.handlePointerDown);
        this.canvas.removeEventListener('mousemove', this.handlePointerMove);
        this.canvas.removeEventListener('mouseup', this.handlePointerUp);
        this.canvas.removeEventListener('mouseleave', this.handlePointerUp);
        this.canvas.removeEventListener('touchstart', this.handlePointerDown);
        this.canvas.removeEventListener('touchmove', this.handlePointerMove);
        this.canvas.removeEventListener('touchend', this.handlePointerUp);
        this.canvas.removeEventListener('touchcancel', this.handlePointerUp);

        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorWheel;
}
