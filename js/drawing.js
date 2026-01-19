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
        this.tool = 'pencil'; // 'pencil' or 'spray'
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
        const pencilTool = document.getElementById('tool-pencil');
        const sprayTool = document.getElementById('tool-spray');

        if (colorInput) colorInput.addEventListener('input', (e) => this.color = e.target.value);
        if (sizeInput) sizeInput.addEventListener('input', (e) => this.size = parseInt(e.target.value));
        if (clearBtn) clearBtn.addEventListener('click', () => this.clear());
        if (wiggleBtn) wiggleBtn.addEventListener('click', () => {
            wiggleBtn.classList.toggle('active');
            this.wiggleAmount = wiggleBtn.classList.contains('active') ? 2 : 0;
        });

        if (pencilTool) pencilTool.addEventListener('click', () => {
            this.tool = 'pencil';
            pencilTool.classList.add('active');
            if (sprayTool) sprayTool.classList.remove('active');
        });
        if (sprayTool) sprayTool.addEventListener('click', () => {
            this.tool = 'spray';
            sprayTool.classList.add('active');
            if (pencilTool) pencilTool.classList.remove('active');
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
            tool: this.tool, // Store tool at start of stroke
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
        
        if (this.currentStroke.tool === 'spray') {
            const points = [];
            const radius = this.currentStroke.size * 1.5;
            const density = Math.max(1, Math.floor(this.currentStroke.size * 0.8));

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
        } else {
            this.currentStroke.points.push({
                x, y,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now();
        const pixelSize = 2; // Fixed retro pixel size

        this.strokes.forEach(stroke => {
            if (stroke.points.length < 1) return;
            this.ctx.fillStyle = stroke.color;

            if (stroke.tool === 'spray') {
                stroke.points.forEach(pt => {
                    const mainWiggleX = Math.sin(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;
                    const mainWiggleY = Math.cos(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;

                    pt.cluster.forEach(dot => {
                        const dotWiggleX = Math.sin(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);
                        const dotWiggleY = Math.cos(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);
                        const finalX = pt.x + dot.dx + mainWiggleX + dotWiggleX;
                        const finalY = pt.y + dot.dy + mainWiggleY + dotWiggleY;
                        const px = Math.floor(finalX / pixelSize) * pixelSize;
                        const py = Math.floor(finalY / pixelSize) * pixelSize;
                        this.ctx.fillRect(px, py, pixelSize, pixelSize);
                    });
                });
            } else {
                for (let i = 0; i < stroke.points.length; i++) {
                    const pt = stroke.points[i];
                    const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                    const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                    const px = Math.floor((pt.x + wiggleX) / pixelSize) * pixelSize;
                    const py = Math.floor((pt.y + wiggleY) / pixelSize) * pixelSize;

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
            }
        });
    }

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
