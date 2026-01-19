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

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            this.ctx.beginPath();
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            for (let i = 0; i < stroke.points.length; i++) {
                const pt = stroke.points[i];
                // Apply wiggle distortion
                const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;

                if (i === 0) {
                    this.ctx.moveTo(pt.x + wiggleX, pt.y + wiggleY);
                } else {
                    this.ctx.lineTo(pt.x + wiggleX, pt.y + wiggleY);
                }
            }
            this.ctx.stroke();
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
