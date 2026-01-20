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
        
        this.color = '#ffffff'; 
        this.size = 6;
        this.tool = 'pencil';
        this.brushType = 'standard';
        this.tipShape = 'square';
        this.wiggleSpeed = 0.005;
        this.wiggleAmount = 2;
        
        this.brushCache = {}; // Cache for pre-rendered brush stamps

        this.currentSketchIndex = 0;
        this.sketchKeys = Object.keys(SKETCH_GALLERY);
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
        const tools = ['pencil', 'spray', 'eraser', 'bucket', 'rect', 'circle', 'eyedropper'];
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
                    
                    // Hide wiggle for bucket/eyedropper
                    const wiggleOpt = document.getElementById('wiggle-option');
                    if (wiggleOpt) wiggleOpt.style.display = (t === 'bucket' || t === 'eyedropper') ? 'none' : 'flex';
                    
                    // Show brush types & tip shape only for brush/pencil
                    const brushTypeOpt = document.getElementById('brush-type-option');
                    const tipShapeOpt = document.getElementById('tip-shape-option');
                    if (t === 'pencil') {
                        if (brushTypeOpt) brushTypeOpt.style.display = 'block';
                        if (tipShapeOpt) tipShapeOpt.style.display = 'block';
                    } else if (t === 'eraser' || t === 'spray') {
                        if (brushTypeOpt) brushTypeOpt.style.display = 'none';
                        if (tipShapeOpt) tipShapeOpt.style.display = 'block';
                    } else {
                        if (brushTypeOpt) brushTypeOpt.style.display = 'none';
                        if (tipShapeOpt) tipShapeOpt.style.display = 'none';
                    }

                    const toolNameMap = {
                        'pencil': 'Brush',
                        'spray': 'Spray Can',
                        'eraser': 'Eraser',
                        'bucket': 'Bucket Fill',
                        'rect': 'Rectangle',
                        'circle': 'Circle',
                        'eyedropper': 'Eyedropper'
                    };
                    const nameEl = document.getElementById('active-tool-name');
                    if (nameEl) nameEl.textContent = toolNameMap[t] || t.charAt(0).toUpperCase() + t.slice(1);
                }
            });
        });

        // Initialize panel state for the default tool
        if (optionsPanel && this.tool) {
            optionsPanel.classList.add('active');
            const toolLabel = document.getElementById('active-tool-name');
            const toolNameMap = {
                'pencil': 'Brush',
                'spray': 'Spray Can',
                'eraser': 'Eraser',
                'bucket': 'Bucket Fill',
                'rect': 'Rectangle',
                'circle': 'Circle',
                'eyedropper': 'Eyedropper'
            };
            if (toolLabel) toolLabel.textContent = toolNameMap[this.tool] || this.tool.charAt(0).toUpperCase() + this.tool.slice(1);
        }

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
                document.getElementById('custom-color-trigger')?.classList.remove('active');
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
                document.getElementById('custom-color-trigger')?.classList.add('active');
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

        const undoBtn = document.getElementById('draw-undo');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

        const wiggleBtn = document.getElementById('draw-wiggle-toggle');
        if (wiggleBtn) wiggleBtn.addEventListener('click', () => {
            wiggleBtn.classList.toggle('active');
            this.wiggleAmount = wiggleBtn.classList.contains('active') ? 2 : 0;
        });

        // Trigger Auto-Write Animation after a delay
        setTimeout(() => this.autoWriteTryDrawing(), 1500);

        // Initialize custom color trigger as active since default is white
        document.getElementById('custom-color-trigger')?.classList.add('active');

        // Brush Types
        const brushTypes = ['standard', 'fountain'];
        brushTypes.forEach(bt => {
            const btn = document.getElementById(`brush-${bt}`);
            if (btn) btn.addEventListener('click', () => {
                this.brushType = bt;
                brushTypes.forEach(other => document.getElementById(`brush-${other}`)?.classList.remove('active'));
                btn.classList.add('active');

                // Correct icons as requested (match the selection buttons)
                const newIconClass = bt === 'fountain' ? 'fa-solid fa-pen-fancy' : 'fa-solid fa-pen-clip';

                // Update main tool icon in sidebar (match selection button)
                const toolPencil = document.getElementById('tool-pencil');
                if (toolPencil) {
                    const icon = toolPencil.querySelector('i');
                    if (icon) icon.className = newIconClass;
                }
            });
        });

        // Tip Shapes
        const tipShapes = ['square', 'round'];
        tipShapes.forEach(ts => {
            const btn = document.getElementById(`tip-${ts}`);
            if (btn) btn.addEventListener('click', () => {
                this.tipShape = ts;
                tipShapes.forEach(other => document.getElementById(`tip-${other}`)?.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    undo() {
        this.strokes.pop();
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
            this.isDraggingSidebar = true; // Set flag to block drawing
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
            this.isDraggingSidebar = false; // Reset flag
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

    getDocCoords(e) {
        if (!e) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        // Anchor horizontal X to the center of the viewport
        // This ensures drawings stay in sync with centered cards when zooming/resizing
        return {
            x: (clientX - rect.left) - (window.innerWidth / 2) + window.scrollX,
            y: (clientY - rect.top) + window.scrollY
        };
    }

    startDrawing(e) {
        if (this.isDraggingSidebar) return;
        if (this.isAutoWriting) return; // Block user input during animation
        
        const coords = this.getDocCoords(e);
        const x = coords.x;
        const y = coords.y;

        if (this.tool === 'bucket' || this.tool === 'eyedropper') {
            this.handlePickOrRecolor(x, y, this.tool);
            return;
        }

        this.isDrawing = true;
        this.currentStroke = {
            points: [],
            color: this.color,
            size: this.size,
            tool: this.tool,
            tipShape: this.tipShape,
            brushType: this.tool === 'pencil' ? this.brushType : 'standard',
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
        const { x, y } = this.getDocCoords(e);

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
        const { x, y } = this.getDocCoords(e);
        
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
            let pointSize = this.currentStroke.size;
            let time = Date.now();

            if (this.currentStroke.brushType === 'fountain') {
                let speed = 0;
                if (this.currentStroke.points.length > 0) {
                    const last = this.currentStroke.points[this.currentStroke.points.length - 1];
                    const dist = Math.hypot(x - last.x, y - last.y);
                    const dt = time - (last.time || time);
                    speed = dist / Math.max(1, dt);
                }
                // Inversely proportional: fast = thin (min 20% size), slow = thick (100% size)
                const factor = Math.max(0.2, Math.min(1.0, 1.2 - speed * 0.4));
                pointSize = this.currentStroke.size * factor;
            }

            this.currentStroke.points.push({ 
                x, y, 
                size: pointSize, 
                time: time,
                offset: Math.random() * Math.PI * 2 
            });
        }
    }

    handlePickOrRecolor(x, y, mode) {
        // Find stroke closest to the click point
        let closestStroke = null;
        let minDistance = 30; // Threshold

        this.strokes.forEach(stroke => {
            if (stroke.tool === 'rect' || stroke.tool === 'circle') {
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
            if (mode === 'bucket') {
                closestStroke.color = this.color;
            } else if (mode === 'eyedropper') {
                this.color = closestStroke.color;
                
                // Update UI visually
                const colorInput = document.getElementById('draw-color');
                if (colorInput) colorInput.value = this.color;
                
                // Remove active from other swatches
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                document.getElementById('custom-color-trigger')?.classList.add('active');
            }
        }
    }

    async autoWriteTryDrawing() {
        // Cycle to next sketch if we were already writing (Auto-Pilot mode)
        const key = this.sketchKeys[this.currentSketchIndex];
        this.currentSketchIndex = (this.currentSketchIndex + 1) % this.sketchKeys.length;
        
        await this.autoWrite(key);
    }

    async autoWrite(sketchKey) {
        if (this.isDrawing) return; 
        const sketch = SKETCH_GALLERY[sketchKey];
        if (!sketch) return;

        this.isAutoWriting = true;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cardWidth = 640; 
        
        const gutterWidth = (vw - cardWidth) / 2;
        
        // Safety check for mobile
        if (gutterWidth < 60 && vw < 500) {
            this.isAutoWriting = false;
            return;
        }

        // Configuration
        let isStacked = sketch.isStacked;
        let scale = sketch.scale;
        let targetVisualCenterX, centerY;
        let word2OffsetX = 0; 
        let word2OffsetY = sketch.wordSpacingY; 

        if (gutterWidth > 200) {
            // Wide screens: place in the larger gutter
            scale *= Math.min(1.0, gutterWidth / 350);
            targetVisualCenterX = vw/2 + cardWidth/2 + gutterWidth/2;
            centerY = 200;
        } else {
            // Mobile/Tablet: Centered at the top
            scale *= vw < 500 ? 0.45 : 0.6;
            targetVisualCenterX = vw / 2;
            centerY = 100;
        }

        // Logical center adjustment
        const centerX = (targetVisualCenterX - vw/2);
        const baseScrollX = window.scrollX;
        const baseScrollY = window.scrollY;

        let wordIndex = 0;
        for (const word of sketch.strokes) {
            if (word === null) {
                wordIndex++;
                await new Promise(r => setTimeout(r, 200));
                continue;
            }

            for (const path of word.paths) {
                this.animatingStroke = {
                    points: [],
                    color: word.color,
                    size: (word.size || 8) * scale, 
                    tool: 'pencil',
                    tipShape: 'round',
                    brushType: word.brushType || 'fountain',
                    startTime: Date.now()
                };
                this.strokes.push(this.animatingStroke);

                const offX = (wordIndex > 0) ? word2OffsetX : 0;
                const offY = (wordIndex > 0) ? word2OffsetY : 0;

                for (let i = 0; i < path.length; i++) {
                    const p = path[i];
                    const targetX = centerX + (p.dx + offX) * scale + baseScrollX;
                    const targetY = centerY + (p.dy + offY) * scale + baseScrollY;

                    if (i > 0) {
                        const prev = path[i - 1];
                        const prevX = centerX + (prev.dx + offX) * scale + baseScrollX;
                        const prevY = centerY + (prev.dy + offY) * scale + baseScrollY;
                        const steps = Math.max(2, Math.floor(6 * scale));
                        for (let s = 1; s <= steps; s++) {
                            const interX = prevX + (targetX - prevX) * (s / steps);
                            const interY = prevY + (targetY - prevY) * (s / steps);
                            this.addPointToStroke(this.animatingStroke, interX, interY);
                            await new Promise(r => setTimeout(r, 10));
                        }
                    } else {
                        this.addPointToStroke(this.animatingStroke, targetX, targetY);
                    }
                }
                this.animatingStroke = null;
                await new Promise(r => setTimeout(r, 100));
            }
        }
        this.isAutoWriting = false;
    }

    addPointToStroke(stroke, x, y) {
        if (!stroke) return;
        const time = Date.now();
        let pointSize = stroke.size;

        if (stroke.brushType === 'fountain') {
            let speed = 0;
            if (stroke.points.length > 0) {
                const last = stroke.points[stroke.points.length - 1];
                const dist = Math.hypot(x - last.x, y - last.y);
                const dt = time - (last.time || time);
                speed = dist / Math.max(1, dt);
            }
            const factor = Math.max(0.4, Math.min(1.0, 1.0 - speed * 0.15));
            pointSize = stroke.size * factor;
        }

        stroke.points.push({
            x, y,
            size: pointSize,
            time: time,
            offset: Math.random() * Math.PI * 2
        });
    }


    clear() {
        if (window.confirm("Você quer mesmo apagar todo o desenho?")) {
            this.strokes = [];
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

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const midX = this.canvas.width / 2;

        this.strokes.forEach(stroke => {
            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.fillStyle = stroke.color;
            this.ctx.strokeStyle = stroke.color;
            this.ctx.lineWidth = stroke.size;

            if (stroke.tool === 'rect' || stroke.tool === 'circle') {
                const wiggleX = Math.sin(time * 0.005) * this.wiggleAmount;
                const wiggleY = Math.cos(time * 0.005) * this.wiggleAmount;
                const x = Math.floor(((stroke.startPos.x + midX - scrollX) + wiggleX) / pixelSize) * pixelSize;
                const y = Math.floor(((stroke.startPos.y - scrollY) + wiggleY) / pixelSize) * pixelSize;
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
                        const px = Math.floor(((pt.x + midX - scrollX) + dot.dx + mainWiggleX + dotWiggleX) / pixelSize) * pixelSize;
                        const py = Math.floor(((pt.y - scrollY) + dot.dy + mainWiggleY + dotWiggleY) / pixelSize) * pixelSize;
                        this.ctx.fillRect(px, py, pixelSize, pixelSize);
                    });
                });
            } else if (stroke.points.length > 0) {
                // Pencil or Eraser
                for (let i = 0; i < stroke.points.length; i++) {
                    const pt = stroke.points[i];
                    const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                    const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                    const px = Math.floor(((pt.x + midX - scrollX) + wiggleX) / pixelSize) * pixelSize;
                    const py = Math.floor(((pt.y - scrollY) + wiggleY) / pixelSize) * pixelSize;

                    if (i > 0) {
                        const prevPt = stroke.points[i - 1];
                        const prevWiggleX = Math.sin(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;
                        const prevWiggleY = Math.cos(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;
                        const ppx = Math.floor(((prevPt.x + midX - scrollX) + prevWiggleX) / pixelSize) * pixelSize;
                        const ppy = Math.floor(((prevPt.y - scrollY) + prevWiggleY) / pixelSize) * pixelSize;
                        
                        // Use point specific size if available
                        const currentSize = pt.size || stroke.size;
                        const previousSize = prevPt.size || stroke.size;
                        const avgSize = (currentSize + previousSize) / 2;

                        this.drawPixelLine(ppx, ppy, px, py, pixelSize, avgSize, stroke.tipShape);
                    } else {
                        const currentSize = pt.size || stroke.size;
                        this.drawBrushTip(px, py, currentSize, stroke.tipShape);
                    }
                }
            }
        });
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawPixelLine(x1, y1, x2, y2, pixelSize, brushSize, tipShape) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? pixelSize : -pixelSize;
        const sy = (y1 < y2) ? pixelSize : -pixelSize;
        let err = dx - dy;
        while (true) {
            this.drawBrushTip(x1, y1, brushSize, tipShape);
            if (Math.abs(x1 - x2) < pixelSize && Math.abs(y1 - y2) < pixelSize) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
    }

    drawBrushTip(x, y, size, shape) {
        const pixelSize = 2;
        // Quantize size to avoid excessive cache entries from fountain pen
        const qSize = Math.max(pixelSize, Math.round(size / pixelSize) * pixelSize);
        const cacheKey = `${qSize}_${this.ctx.fillStyle}_${shape}`;

        if (!this.brushCache[cacheKey]) {
            this.createBrushStamp(qSize, this.ctx.fillStyle, shape, cacheKey);
        }

        const stamp = this.brushCache[cacheKey];
        this.ctx.drawImage(stamp, x - qSize / 2, y - qSize / 2);
    }

    createBrushStamp(size, color, shape, key) {
        const stamp = document.createElement('canvas');
        const pixelSize = 2;
        stamp.width = size + pixelSize * 2;
        stamp.height = size + pixelSize * 2;
        const sctx = stamp.getContext('2d');
        sctx.fillStyle = color;

        const center = stamp.width / 2;

        if (shape === 'round') {
            const radius = size / 2;
            for (let dy = -radius; dy <= radius; dy += pixelSize) {
                for (let dx = -radius; dx <= radius; dx += pixelSize) {
                    if (dx * dx + dy * dy <= radius * radius) {
                        sctx.fillRect(
                            Math.floor((center + dx) / pixelSize) * pixelSize, 
                            Math.floor((center + dy) / pixelSize) * pixelSize, 
                            pixelSize, 
                            pixelSize
                        );
                    }
                }
            }
        } else {
            sctx.fillRect(center - size / 2, center - size / 2, size, size);
        }

        this.brushCache[key] = stamp;
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
