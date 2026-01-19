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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Generate a cluster of points (density) based on size
        const points = [];
        const radius = this.size * 1.5;
        const density = Math.max(1, Math.floor(this.size * 0.8));

        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
            points.push({
                dx: Math.cos(angle) * r,
                dy: Math.sin(angle) * r,
                offset: Math.random() * Math.PI * 2
            });
        }

        this.currentStroke.points.push({
            x, y,
            cluster: points,
            mainOffset: Math.random() * Math.PI * 2
        });
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now();
        const pixelSize = 2; // Fixed pixel size for that retro look

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 1) return;

            this.ctx.fillStyle = stroke.color;

            stroke.points.forEach(pt => {
                // Main wiggle for the whole cluster
                const mainWiggleX = Math.sin(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;
                const mainWiggleY = Math.cos(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;

                pt.cluster.forEach(dot => {
                    // Internal wiggle for each pixel in the cluster
                    const dotWiggleX = Math.sin(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);
                    const dotWiggleY = Math.cos(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);

                    const finalX = pt.x + dot.dx + mainWiggleX + dotWiggleX;
                    const finalY = pt.y + dot.dy + mainWiggleY + dotWiggleY;

                    // Pixelate
                    const px = Math.floor(finalX / pixelSize) * pixelSize;
                    const py = Math.floor(finalY / pixelSize) * pixelSize;

                    this.ctx.fillRect(px, py, pixelSize, pixelSize);
                });
            });
        });
    }

    clear() {
        this.strokes = [];
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.drawingSystem = new DrawingSystem('bg-drawing-canvas');
});
