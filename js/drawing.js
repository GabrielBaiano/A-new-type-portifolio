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
        this.strokes = [];
        this.currentStroke = null;
        
        this.color = '#0000FE'; // Default blue (matches card)
        this.size = 4;
        this.tool = 'pencil';
        this.wiggleSpeed = 0.005;
        this.wiggleAmount = 2;

        this.init();
        this.initDragging();
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

        // Tools & Pop-out Panel
        const tools = ['pencil', 'spray', 'eraser', 'bucket', 'rect', 'circle'];
        const optionsPanel = document.getElementById('tool-options-panel');
        const toolLabel = document.getElementById('active-tool-name');

        tools.forEach(t => {
            const btn = document.getElementById(`tool-${t}`);
            if (btn) btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // If clicking the same active tool, toggle panel
                const wasActive = btn.classList.contains('active');
                
                this.tool = t;
                tools.forEach(other => document.getElementById(`tool-${other}`)?.classList.remove('active'));
                btn.classList.add('active');

                if (toolLabel) toolLabel.textContent = t.charAt(0).toUpperCase() + t.slice(1);
                
                if (optionsPanel) {
                    if (wasActive) {
                        optionsPanel.classList.toggle('active');
                    } else {
                        optionsPanel.classList.add('active');
                    }
                    
                    // Hide wiggle for bucket
                    const wiggleOpt = document.getElementById('wiggle-option');
                    if (wiggleOpt) wiggleOpt.style.display = (t === 'bucket') ? 'none' : 'flex';
                }
            });
        });

        // Close panel when clicking outside sidebar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#drawing-sidebar') && optionsPanel) {
                optionsPanel.classList.remove('active');
            }
        });

        // Palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.color = swatch.dataset.color;
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                // Update custom input value to match
                const customInput = document.getElementById('draw-color');
                if (customInput) customInput.value = this.color;
            });
        });

        const colorInput = document.getElementById('draw-color');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.color = e.target.value;
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            });
        }

        const sizeInput = document.getElementById('draw-size');
        const sizeVal = document.getElementById('size-val');
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.size = parseInt(e.target.value);
                if (sizeVal) sizeVal.textContent = this.size;
            });
        }

        const clearBtn = document.getElementById('draw-clear');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clear());

        const wiggleBtn = document.getElementById('draw-wiggle-toggle');
        if (wiggleBtn) wiggleBtn.addEventListener('click', () => {
            wiggleBtn.classList.toggle('active');
            this.wiggleAmount = wiggleBtn.classList.contains('active') ? 2 : 0;
        });
    }

    initDragging() {
        const sidebar = document.getElementById('drawing-sidebar');
        const handle = document.getElementById('sidebar-handle');
        if (!sidebar || !handle) return;

        let isDragging = false;
        let startX, startY, initialX, initialY;

        handle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            sidebar.style.transition = 'none';
            // Also disable panel transition for smoother movement
            const optionsPanel = document.getElementById('tool-options-panel');
            if (optionsPanel) optionsPanel.style.transition = 'none';

            startX = e.clientX;
            startY = e.clientY;
            initialX = sidebar.offsetLeft;
            initialY = sidebar.offsetTop;
            document.body.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            sidebar.style.left = `${initialX + dx}px`;
            sidebar.style.top = `${initialY + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            sidebar.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s, background 0.3s'; 
            
            const optionsPanel = document.getElementById('tool-options-panel');
            if (optionsPanel) optionsPanel.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            document.body.style.cursor = 'default';
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startDrawing(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.tool === 'bucket') {
            this.handleBucket(x, y);
            return;
        }

        this.isDrawing = true;
        this.currentStroke = {
            points: [],
            color: this.color,
            size: this.size,
            tool: this.tool,
            startTime: Date.now(),
            startPos: { x, y },
            endPos: { x, y }
        };
        
        if (this.tool !== 'rect' && this.tool !== 'circle') {
            this.addPoint(e);
        }
        
        this.strokes.push(this.currentStroke);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.tool === 'rect' || this.tool === 'circle') {
            this.currentStroke.endPos = { x, y };
        } else {
            this.addPoint(e);
        }
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
                points.push({ dx: Math.cos(angle) * r, dy: Math.sin(angle) * r, offset: Math.random() * Math.PI * 2 });
            }

            this.currentStroke.points.push({ x, y, cluster: points, mainOffset: Math.random() * Math.PI * 2 });
        } else {
            this.currentStroke.points.push({ x, y, offset: Math.random() * Math.PI * 2 });
        }
    }

    handleBucket(x, y) {
        // Find stroke closest to the click point
        let closestStroke = null;
        let minDistance = 30; // Threshold

        this.strokes.forEach(stroke => {
            if (stroke.tool === 'rect' || stroke.tool === 'circle') {
                // Check if inside or near border? For now simple distance to start/end points
                const dStart = Math.hypot(stroke.startPos.x - x, stroke.startPos.y - y);
                const dEnd = Math.hypot(stroke.endPos.x - x, stroke.endPos.y - y);
                if (dStart < minDistance || dEnd < minDistance) {
                    closestStroke = stroke;
                    minDistance = Math.min(dStart, dEnd);
                }
            } else {
                stroke.points.forEach(pt => {
                    const dist = Math.hypot(pt.x - x, pt.y - y);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestStroke = stroke;
                    }
                });
            }
        });

        if (closestStroke) {
            closestStroke.color = this.color;
        }
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now();
        const pixelSize = 2;

        this.strokes.forEach(stroke => {
            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.fillStyle = stroke.color;
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;

            if (stroke.tool === 'rect' || stroke.tool === 'circle') {
                const wiggleX = Math.sin(time * 0.005) * this.wiggleAmount;
                const wiggleY = Math.cos(time * 0.005) * this.wiggleAmount;
                const x = Math.floor((stroke.startPos.x + wiggleX) / pixelSize) * pixelSize;
                const y = Math.floor((stroke.startPos.y + wiggleY) / pixelSize) * pixelSize;
                const w = Math.floor((stroke.endPos.x - stroke.startPos.x) / pixelSize) * pixelSize;
                const h = Math.floor((stroke.endPos.y - stroke.startPos.y) / pixelSize) * pixelSize;

                if (stroke.tool === 'rect') {
                    this.drawPixelRect(x, y, w, h, pixelSize, stroke.size);
                } else {
                    this.drawPixelCircle(x + w / 2, y + h / 2, Math.abs(w / 2), pixelSize, stroke.size);
                }
            } else if (stroke.tool === 'spray') {
                stroke.points.forEach(pt => {
                    const mainWiggleX = Math.sin(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;
                    const mainWiggleY = Math.cos(time * this.wiggleSpeed + pt.mainOffset) * this.wiggleAmount;
                    pt.cluster.forEach(dot => {
                        const dotWiggleX = Math.sin(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);
                        const dotWiggleY = Math.cos(time * this.wiggleSpeed * 2 + dot.offset) * (this.wiggleAmount * 0.5);
                        const px = Math.floor((pt.x + dot.dx + mainWiggleX + dotWiggleX) / pixelSize) * pixelSize;
                        const py = Math.floor((pt.y + dot.dy + mainWiggleY + dotWiggleY) / pixelSize) * pixelSize;
                        this.ctx.fillRect(px, py, pixelSize, pixelSize);
                    });
                });
            } else if (stroke.points.length > 0) {
                // Pencil or Eraser
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
                        this.ctx.fillRect(px - stroke.size / 2, py - stroke.size / 2, stroke.size, stroke.size);
                    }
                }
            }
        });
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawPixelLine(x1, y1, x2, y2, pixelSize, brushSize) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? pixelSize : -pixelSize;
        const sy = (y1 < y2) ? pixelSize : -pixelSize;
        let err = dx - dy;
        while (true) {
            this.ctx.fillRect(x1 - brushSize / 2, y1 - brushSize / 2, brushSize, brushSize);
            if (Math.abs(x1 - x2) < pixelSize && Math.abs(y1 - y2) < pixelSize) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
    }

    drawPixelRect(x, y, w, h, pixelSize, brushSize) {
        this.drawPixelLine(x, y, x + w, y, pixelSize, brushSize);
        this.drawPixelLine(x + w, y, x + w, y + h, pixelSize, brushSize);
        this.drawPixelLine(x + w, y + h, x, y + h, pixelSize, brushSize);
        this.drawPixelLine(x, y + h, x, y, pixelSize, brushSize);
    }

    drawPixelCircle(xc, yc, r, pixelSize, brushSize) {
        let x = 0;
        let y = r;
        let d = 3 - 2 * r;
        this.drawCirclePoints(xc, yc, x, y, brushSize);
        while (y >= x) {
            x += pixelSize;
            if (d > 0) {
                y -= pixelSize;
                d = d + 4 * (x - y) + 10;
            } else {
                d = d + 4 * x + 6;
            }
            this.drawCirclePoints(xc, yc, x, y, brushSize);
        }
    }

    drawCirclePoints(xc, yc, x, y, brushSize) {
        this.ctx.fillRect(xc + x, yc + y, brushSize, brushSize);
        this.ctx.fillRect(xc - x, yc + y, brushSize, brushSize);
        this.ctx.fillRect(xc + x, yc - y, brushSize, brushSize);
        this.ctx.fillRect(xc - x, yc - y, brushSize, brushSize);
        this.ctx.fillRect(xc + y, yc + x, brushSize, brushSize);
        this.ctx.fillRect(xc - y, yc + x, brushSize, brushSize);
        this.ctx.fillRect(xc + y, yc - x, brushSize, brushSize);
        this.ctx.fillRect(xc - y, yc - x, brushSize, brushSize);
    }

    clear() {
        if (window.confirm("Você quer mesmo apagar todo o desenho?")) {
            this.strokes = [];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.drawingSystem = new DrawingSystem('bg-drawing-canvas');
});
