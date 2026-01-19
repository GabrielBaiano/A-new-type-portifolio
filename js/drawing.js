/**
 * Wiggly Drawing System
 * Inspired by wigglypaint.com
 */

class DrawingSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.strokes = []; // Array of { points: [], color, size }
        this.currentStroke = null;
        
        this.color = '#3b82f6';
        this.size = 4;
        this.wiggleSpeed = 0.005;
        this.wiggleAmount = 2;

        this.init();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Toolbar Controls
        const colorInput = document.getElementById('draw-color');
        const sizeInput = document.getElementById('draw-size');
        const clearBtn = document.getElementById('draw-clear');
        const wiggleBtn = document.getElementById('draw-wiggle-toggle');

        if (colorInput) colorInput.addEventListener('input', (e) => this.color = e.target.value);
        if (sizeInput) sizeInput.addEventListener('input', (e) => this.size = parseInt(e.target.value));
        if (clearBtn) clearBtn.addEventListener('click', () => this.clear());
        if (wiggleBtn) wiggleBtn.addEventListener('click', () => {
            wiggleBtn.classList.toggle('active');
            this.wiggleAmount = wiggleBtn.classList.contains('active') ? 2 : 0;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.currentStroke = {
            points: [],
            color: this.color,
            size: this.size,
            startTime: Date.now()
        };
        this.addPoint(e);
        this.strokes.push(this.currentStroke);
    }

    draw(e) {
        if (!this.isDrawing) return;
        this.addPoint(e);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.currentStroke = null;
    }

    addPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.currentStroke.points.push({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            offset: Math.random() * Math.PI * 2 // Random starting phase for wiggle
        });
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now();
        const pixelSize = Math.max(2, this.size / 2); // Dynamic pixel size based on brush

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 1) return;

            this.ctx.fillStyle = stroke.color;

            for (let i = 0; i < stroke.points.length; i++) {
                const pt = stroke.points[i];
                
                // Apply wiggle distortion
                const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;

                // Pixelate coordinates
                const px = Math.floor((pt.x + wiggleX) / pixelSize) * pixelSize;
                const py = Math.floor((pt.y + wiggleY) / pixelSize) * pixelSize;

                // Draw a square instead of a line segment for that 'pixel' look
                // If it's the first point, just draw a square. 
                // To fill gaps between points, we can draw a 'pixelated' line
                if (i > 0) {
                    const prevPt = stroke.points[i - 1];
                    const prevWiggleX = Math.sin(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;
                    const prevWiggleY = Math.cos(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;
                    const ppx = Math.floor((prevPt.x + prevWiggleX) / pixelSize) * pixelSize;
                    const ppy = Math.floor((prevPt.y + prevWiggleY) / pixelSize) * pixelSize;
                    
                    this.drawPixelLine(ppx, ppy, px, py, pixelSize, stroke.size);
                } else {
                    this.ctx.fillRect(px - stroke.size/2, py - stroke.size/2, stroke.size, stroke.size);
                }
            }
        });
    }

    // Bresenham-like pixel line drawing
    drawPixelLine(x1, y1, x2, y2, pixelSize, brushSize) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? pixelSize : -pixelSize;
        const sy = (y1 < y2) ? pixelSize : -pixelSize;
        let err = dx - dy;

        while (true) {
            this.ctx.fillRect(x1 - brushSize/2, y1 - brushSize/2, brushSize, brushSize);

            if (Math.abs(x1 - x2) < pixelSize && Math.abs(y1 - y2) < pixelSize) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
    }

    clear() {
        this.strokes = [];
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.drawingSystem = new DrawingSystem('bg-drawing-canvas');
});
