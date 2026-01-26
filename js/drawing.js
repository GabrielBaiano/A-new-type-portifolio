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

        // Initialize Audio Visualizer integrated into this canvas
        const playlistId = 'PLAhU1Mlzmttg7ugon0-vps5ELvH12EK7V';
        this.audioVisualizer = new AudioVisualizer(this.canvas, playlistId);

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
        this.borderAnimationId = 0; // Token for cancelling old border animations
        this.sketchAnimationId = 0; // Token for cancelling old sketch animations
        this.isPaused = false; // Flag for Professional Mode
        this.lastVH = window.innerHeight; // Track height for background anchoring

        // Background Universal Scaling References
        this.bgReferenceScale = null;
        this.bgReferenceCenterX = null;
        this.bgReferenceCenterY = null;

        this.init();
        this.initDragging();
        this.animate();

        // Start the auto-drawing demo only if not in professional mode
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.isPaused = (initialTheme === 'light');
        if (!this.isPaused) {
            this.setOrnamentalBorder(true);
            setTimeout(() => this.autoWriteTryDrawing(), 500);
        } else {
            if (this.canvas) this.canvas.style.display = 'none';
        }
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Mouse Events - Window level to capture background clicks (even if canvas is behind)
        window.addEventListener('mousedown', (e) => this.startDrawing(e));
        window.addEventListener('mousemove', (e) => this.draw(e));
        window.addEventListener('mouseup', () => this.stopDrawing());

        // Touch Events - Window level
        window.addEventListener('touchstart', (e) => {
            // 1. Only allow manual drawing if the HUD is hidden (Drawing Mode active)
            // This prevents accidental drawing while navigating the site.
            if (!document.body.classList.contains('hud-hidden')) return;

            // 2. Comprehensive check for interactive elements
            const target = e.target;
            const isInteractive =
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('.card') ||
                target.closest('.color-swatch') ||
                target.closest('.color-custom-btn') ||
                target.closest('#drawing-sidebar') ||
                target.closest('.bottom-nav');

            if (isInteractive) return;

            // If we are here, we are drawing on the background
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDrawing) {
                e.preventDefault();
                this.draw(e.touches[0]);
            }
        }, { passive: false });
        window.addEventListener('touchend', () => this.stopDrawing());

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

        // Theme Change Interaction
        document.addEventListener('themeChanged', (e) => {
            const theme = e.detail.theme;
            if (theme === 'light') {
                // Professional Mode: Pause and hide
                this.isPaused = true;
                if (this.canvas) this.canvas.style.display = 'none';
            } else {
                // Creative Mode: Resume and show
                this.isPaused = false;
                if (window.innerWidth >= 600) {
                    if (this.canvas) this.canvas.style.display = 'block';
                    // If no animation is running, start one
                    if (!this.isAutoWriting && !this.strokes.some(s => s.isBackground)) {
                        this.autoWriteTryDrawing();
                    }
                    if (!this.strokes.some(s => s.isBorder)) {
                        this.setOrnamentalBorder(true);
                    }
                }
            }
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
        let startTime;
        let totalDist = 0;

        // On mobile, start collapsed
        if (window.innerWidth < 600) {
            sidebar.classList.add('collapsed');
        }

        const start = (e) => {
            // If the user clicked a tool button inside, don't start dragging
            if (e.target.closest('button') || e.target.closest('.color-swatch') || e.target.closest('input')) return;

            isDragging = true;
            this.isDraggingSidebar = true;
            sidebar.style.transition = 'none';
            const optionsPanel = document.getElementById('tool-options-panel');
            if (optionsPanel) optionsPanel.style.transition = 'none';

            const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
            const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

            startX = clientX;
            startY = clientY;
            initialX = sidebar.offsetLeft;
            initialY = sidebar.offsetTop;
            startTime = Date.now();
            totalDist = 0;
            document.body.style.cursor = 'grabbing';
        };

        const move = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
            const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

            const dx = clientX - startX;
            const dy = clientY - startY;
            totalDist += Math.hypot(dx, dy);

            if (window.innerWidth < 600) {
                sidebar.style.left = '0px';
                sidebar.style.top = `${Math.min(0, initialY + dy)}px`;
            } else {
                sidebar.style.left = `${initialX + dx}px`;
                sidebar.style.top = `${initialY + dy}px`;
            }

            initialX = sidebar.offsetLeft;
            initialY = sidebar.offsetTop;
            startX = clientX;
            startY = clientY;
        };

        const end = () => {
            if (!isDragging) return;
            isDragging = false;
            this.isDraggingSidebar = false;
            sidebar.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s, background 0.3s, height 0.3s';

            const optionsPanel = document.getElementById('tool-options-panel');
            if (optionsPanel) optionsPanel.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            document.body.style.cursor = 'default';

            const clickDuration = Date.now() - startTime;
            if (clickDuration < 500 && totalDist < 25) {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.toggle('expanded');
            } else if (window.innerWidth < 600) {
                const currentTop = parseInt(sidebar.style.top) || 0;
                if (currentTop < -20) {
                    sidebar.classList.add('collapsed');
                    sidebar.classList.remove('expanded');
                } else {
                    sidebar.classList.remove('collapsed');
                    sidebar.classList.add('expanded');
                }
                sidebar.style.top = '';
            }
        };

        handle.addEventListener('mousedown', start);
        handle.addEventListener('touchstart', (e) => {
            // No stopPropagation here to let standard clicks work if needed
            start(e);
        }, { passive: false });

        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault(); // Stop scrolling while dragging the menu
                move(e);
            }
        }, { passive: false });

        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
    }
    /**
     * Centralized logic for background drawing position and scale.
     * Ensures consistency between autoWrite and resize.
     */
    calculateBGPose(vw, vh) {
        const baseWidth = 1000;

        // 1. Calculate scale based on Width (Original logic)
        // This ensures the drawing maintains the size the user liked.
        const targetWidth = Math.max(900, Math.min(vw * 0.9, 1400));
        const scale = targetWidth / baseWidth;
        const scaledHalfWidth = (baseWidth / 2) * scale;

        // STABLE ANCHORING: Bottom-Left peeking
        const centerX = scaledHalfWidth - (vw < 600 ? 200 : 250);

        // 2. Refined Vertical Adjustment: 
        // We want to keep it anchored to bottom, but enforce a "Minimum distance from Top".
        // Base centerY:
        let centerY = vh - (scaledHalfWidth * 0.75) + 80;

        // Estimated top of the anime girl sketch is roughly centerY - (400 * scale).
        // Let's ensure the top is at least 40px from the screen edge.
        const minCenterYForTopVisibility = (400 * scale) + 40;

        if (centerY < minCenterYForTopVisibility) {
            // Only shift down if really necessary, and just enough.
            centerY = minCenterYForTopVisibility;

            // Safety Check: If shifting down makes it too big for the height, 
            // THEN we slightly scale down, but only as a last resort.
            const totalBottom = centerY + (200 * scale); // rough bottom estimate
            if (totalBottom > vh + 100) {
                // If it's overflowing bottom too much, we could slightly reduce scale here
                // but user asked NOT to shrink too much. Let's prioritize visibility.
            }
        }

        return { scale, centerX, centerY };
    }

    resize() {
        const oldVH = this.lastVH;
        const newVH = window.innerHeight;
        const oldVW = this.canvas.width;
        const newVW = window.innerWidth;

        this.canvas.width = newVW;
        this.canvas.height = newVH;

        const isMobile = newVW < 600;

        // 1. Mobile restriction: Clear background sketches on small screens
        if (isMobile) {
            if (this.isAutoWriting) this.stopAutoDraw();
            this.strokes = this.strokes.filter(s => !s.isBackground);
            // Additionally hide elements if somehow they are not covered by CSS
            if (this.canvas) this.canvas.style.display = 'none';
        } else {
            if (this.canvas) this.canvas.style.display = 'block';
        }

        // UNIVERSAL SCALING & ANCHORING:
        if (this.bgReferenceScale !== null && !isMobile) {
            // Calculate what the "Ideal" new pose should be
            const newPose = this.calculateBGPose(newVW, newVH);

            // Remap Points using the reference state to avoid cumulative drift
            this.strokes.forEach(s => {
                if (s.isBackground) {
                    s.points.forEach(pt => {
                        // Math: Convert current point back to "Local Space" using reference info
                        // Then project it into the "New Space"
                        const localX = (pt.x - this.bgReferenceCenterX) / this.bgReferenceScale;
                        const localY = (pt.y - this.bgReferenceCenterY) / this.bgReferenceScale;

                        pt.x = localX * newPose.scale + newPose.centerX;
                        pt.y = localY * newPose.scale + newPose.centerY;
                    });

                    // Update stroke size based on relative scale change
                    const relScale = newPose.scale / this.bgReferenceScale;
                    s.size *= relScale;
                    s.cachedPath = null; // Invalidate for redraw
                }
            });

            // If we are currently animating a background stroke, update its points too
            if (this.animatingStroke && this.animatingStroke.isBackground) {
                // (Already covered by strokes.forEach if it's pushed, but safer to update reference values)
            }

            // Update Global Reference for next frame/resize
            this.bgReferenceScale = newPose.scale;
            this.bgReferenceCenterX = newPose.centerX;
            this.bgReferenceCenterY = newPose.centerY;

        } else if (oldVH > 0 && oldVH !== newVH) {
            // Fallback for simple height shift
            const dy = newVH - oldVH;
            this.strokes.forEach(s => {
                if (s.isBackground) {
                    s.points.forEach(pt => pt.y += dy);
                    s.cachedPath = null;
                }
            });
        }

        this.lastVH = newVH;

        // If border is active, we need to redraw it to fit new size
        if (this.isBorderActive) {
            this.animateBorder();
        }
    }

    getDocCoords(e) {
        if (!e) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        // Return pure viewport coordinates (relative to window top-left)
        // We do NOT add window.scrollX/Y because we want "Fixed" (sticker on glass) behavior.
        // We subtract the canvas offset (rect.left/top) just in case, though usually 0/0 for fixed canvas.
        return {
            x: (clientX - rect.left), // Relative to canvas top-left
            y: (clientY - rect.top)   // Relative to canvas top-left
        };
    }

    startDrawing(e) {
        if (this.isDraggingSidebar) return;

        // 0. Only allow manual drawing if the HUD is hidden
        if (!document.body.classList.contains('hud-hidden')) return;
        // Ensure we are NOT clicking on content if we only want to draw on background.
        const target = e.target;
        if (target) {
            const isContent = target.closest('.card') || target.closest('button') || target.closest('a') || target.closest('input') || target.closest('#drawing-sidebar');
            if (isContent) return;
        }

        // Simultaneous Drawing:
        // We no longer call stopAutoDraw() here. This allows the user to draw 
        // while the background animation is still running.


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
            // Input Interpolation for smooth wiggle
            // If distance from last point is large, fill with intermediate points
            const points = this.currentStroke.points;
            if (points.length > 0) {
                const last = points[points.length - 1];
                const dist = Math.hypot(x - last.x, y - last.y);
                const stepSize = 5; // Fill every 5px (adjust for smoothness)

                if (dist > stepSize) {
                    let steps = Math.floor(dist / stepSize);
                    // Performance Safety: Limit interpolation steps to avoid freezing on massive jumps (e.g. tab switch)
                    // 100 steps * 5px = 500px jump. If larger, we just draw a straight line gap or interpolation stops early.
                    if (steps > 100) steps = 100;

                    for (let i = 1; i <= steps; i++) {
                        const t = i / steps; // Correctly distribute points even if clamped? 
                        // If clamped, t will go 1/100 to 100/100. 
                        // So we effectively just generate 100 points along the path.

                        // Actually regular drawing events will eventualy catch up.
                        // But for "fast" swipes, we want to fill the GAP now.
                        const lx = last.x + (x - last.x) * t;
                        const ly = last.y + (y - last.y) * t;
                        this.addSinglePointToStroke(this.currentStroke, lx, ly);
                    }
                    // Finally add the actual point? loop includes target if we go to <= steps?
                    // if t=1, lx=x. Yes.
                    return;
                }
            }
            this.addSinglePointToStroke(this.currentStroke, x, y);
        }
    }

    addSinglePointToStroke(stroke, x, y) {
        let pointSize = stroke.size;
        let time = Date.now();

        if (stroke.brushType === 'fountain') {
            let speed = 0;
            if (stroke.points.length > 0) {
                const last = stroke.points[stroke.points.length - 1];
                // Use actual time diff, handle 0
                const lastTime = last.time || time;
                const dt = Math.max(1, time - lastTime);
                const dist = Math.hypot(x - last.x, y - last.y);
                speed = dist / dt;
            }
            // Inversely proportional: fast = thin (min 20% size), slow = thick (100% size)
            const factor = Math.max(0.2, Math.min(1.0, 1.2 - speed * 0.4));
            pointSize = stroke.size * factor;
        }

        stroke.points.push({
            x, y,
            size: pointSize,
            time: time,
            offset: Math.random() * Math.PI * 2
        });
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
        if (window.innerWidth < 600) return;
        // Check theme before starting auto-draw
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (currentTheme === 'light') return;

        console.log("Loading generated sketch...");
        this.loadSketchFromJson('data/anime_sketch.json');
    }


    async autoWrite(sketchOrKey) {
        if (this.isDrawing) return;

        // Increment Sketch ID to cancel previous cycles
        this.sketchAnimationId++;
        const myId = this.sketchAnimationId;

        // Signal old loop to stop
        this.stopSignal = true;
        this.isAutoWriting = true;

        // Give a small buffer for the loop to exit
        await new Promise(r => setTimeout(r, 50));

        this.stopSignal = false; // Reset for this loop

        let sketch;
        if (typeof sketchOrKey === 'string') {
            sketch = SKETCH_GALLERY[sketchOrKey];
        } else {
            sketch = sketchOrKey;
        }

        if (!sketch) {
            this.isAutoWriting = false;
            return;
        }

        this.isAutoWriting = true;
        this.stopSignal = false; // Reset stop signal

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Safety check for mobile: Remove background sketches on small screens
        if (vw < 600) {
            this.isAutoWriting = false;
            return;
        }

        // Configuration
        // Configuration
        let isStacked = sketch.isStacked;
        // Initial Pose
        const pose = this.calculateBGPose(vw, vh);
        const baseScale = sketch.scale; // Sketch's intended relative scale

        // Set Reference for Universal Scaling
        this.bgReferenceScale = pose.scale * baseScale;
        this.bgReferenceCenterX = pose.centerX;
        this.bgReferenceCenterY = pose.centerY;


        let wordIndex = 0;
        const sessionStrokes = []; // Track strokes created in this pass for later consolidation

        for (const strokeData of sketch.strokes) {
            // Wait while paused
            while (this.isPaused && !this.stopSignal && this.sketchAnimationId === myId) {
                await new Promise(r => setTimeout(r, 100));
            }
            if (this.stopSignal || this.sketchAnimationId !== myId) break;

            if (strokeData === null) {
                wordIndex++;
                continue;
            }

            for (const path of strokeData.paths) {
                // Wait while paused
                while (this.isPaused && !this.stopSignal && this.sketchAnimationId === myId) {
                    await new Promise(r => setTimeout(r, 100));
                }
                if (this.stopSignal || this.sketchAnimationId !== myId) break;

                // BACK TO MULTI-STROKE: High-fidelity animation
                this.animatingStroke = {
                    points: [],
                    color: strokeData.color,
                    size: (strokeData.size || 8) * this.bgReferenceScale,
                    tool: 'pencil',
                    tipShape: 'round',
                    brushType: strokeData.brushType || 'fountain',
                    isBackground: true, // Flag for anchoring logic
                    startTime: Date.now()
                };

                this.strokes.push(this.animatingStroke);
                sessionStrokes.push(this.animatingStroke);

                const offX = (wordIndex > 0) ? word2OffsetX : 0;
                const offY = (wordIndex > 0) ? word2OffsetY : 0;

                for (let i = 0; i < path.length; i++) {
                    // Wait while paused
                    while (this.isPaused && !this.stopSignal && this.sketchAnimationId === myId) {
                        await new Promise(r => setTimeout(r, 100));
                    }
                    if (this.stopSignal || this.sketchAnimationId !== myId) break;

                    const p = path[i];

                    // IMPORTANT: Use this.bgReference values DYNAMICALLY 
                    // This ensures points added during a resize use the NEW center/scale.
                    const targetX = this.bgReferenceCenterX + (p.dx + offX) * this.bgReferenceScale;
                    const targetY = this.bgReferenceCenterY + (p.dy + offY) * this.bgReferenceScale;

                    if (i > 0) {
                        const prev = path[i - 1];
                        const prevX = this.bgReferenceCenterX + (prev.dx + offX) * this.bgReferenceScale;
                        const prevY = this.bgReferenceCenterY + (prev.dy + offY) * this.bgReferenceScale;
                        const steps = 1;
                        for (let s = 1; s <= steps; s++) {
                            const interX = prevX + (targetX - prevX) * (s / steps);
                            const interY = prevY + (targetY - prevY) * (s / steps);
                            this.addPointToStroke(this.animatingStroke, interX, interY, false);
                        }
                    } else {
                        this.addPointToStroke(this.animatingStroke, targetX, targetY, false);
                    }

                    // Forming animation: yield per point segment
                    if (i % 3 === 0) await new Promise(r => setTimeout(r, 1));
                }

                // No longer clearing animatingStroke here to allow wiggle during sequence
            }
        }

        // CONSOLIDATION STEP: Post-draw optimization
        if (!this.stopSignal && this.sketchAnimationId === myId && sessionStrokes.length > 1) {
            this.consolidateSession(sessionStrokes);
        } else if (sessionStrokes.length === 1 && this.sketchAnimationId === myId) {
            this.animatingStroke = sessionStrokes[0];
        }

        if (this.sketchAnimationId === myId) {
            this.isAutoWriting = false;
        }
    }

    /**
     * Merge multiple strokes into a single unified stroke using isMove flags.
     * Drastically improves rendering performance after drawing is complete.
     */
    consolidateSession(strokeList) {
        if (!strokeList || strokeList.length <= 1) return;

        // Create the unified replacement
        const base = strokeList[0];
        const unified = {
            points: [],
            color: base.color,
            size: base.size,
            tool: base.tool,
            tipShape: base.tipShape,
            brushType: 'standard',
            static: false, // Keep it false so it wiggles! One big stroke is fast enough.
            isBorder: false,
            isBackground: base.isBackground, // Propagate flag
            startTime: base.startTime
        };

        const sessionSet = new Set(strokeList);

        for (const s of strokeList) {
            if (!s.points || s.points.length === 0) continue;

            // Mark the first point of each segment as a MoveTo
            s.points[0].isMove = true;

            // Append points
            unified.points.push(...s.points);
        }

        // Efficiently remove the individual strokes and add the consolidated one
        this.strokes = this.strokes.filter(s => !sessionSet.has(s));
        this.strokes.push(unified);

        // Ensure it wiggles
        this.animatingStroke = unified;

        console.log(`Consolidated ${strokeList.length} strokes into 1. Total points: ${unified.points.length}`);
        this.render();
    }

    stopAutoDraw() {
        this.stopSignal = true;
        this.isAutoWriting = false;
        this.animatingStroke = null;
        this.sketchAnimationId++; // Cancel active sketch loop
        this.borderAnimationId++; // Cancel active border loop
    }

    async loadSketchFromJson(url) {
        try {
            console.log("Attempting to load sketch from:", url);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Sketch loaded successfully, strokes:", data.strokes.length);
            this.autoWrite(data);
        } catch (e) {
            console.error("Failed to load sketch:", e);
        }
    }

    addPointToStroke(stroke, x, y, isMove = false) {
        if (!stroke) return;
        const time = Date.now();
        let pointSize = stroke.size;

        if (stroke.brushType === 'fountain') {
            let speed = 0;
            // Only calculate speed if it's a continuous line
            if (stroke.points.length > 0 && !isMove) {
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
            isMove: isMove, // Jumps to this point without drawing a line
            offset: Math.random() * Math.PI * 2
        });
    }


    clear(force = false) {
        if (force || window.confirm("Você quer mesmo apagar todo o desenho?")) {
            this.strokes = [];
        }
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    setOrnamentalBorder(active) {
        if (this.isBorderActive === active) return;
        this.isBorderActive = active;

        if (active) {
            this.animateBorder();
        } else {
            // Remove border strokes
            this.strokes = this.strokes.filter(s => !s.isBorder);
        }
    }

    async animateBorder() {
        // Cancel previous animation
        this.borderAnimationId++;
        const myId = this.borderAnimationId;

        // Clear existing border strokes first to avoid duplicates
        this.strokes = this.strokes.filter(s => !s.isBorder);

        const w = this.canvas.width;
        const h = this.canvas.height;
        const color = '#ff2d55'; // LeetCode Pink (User Request)

        const isMobile = w < 600;
        const padding = isMobile ? 6 : 20;
        const cornerSize = isMobile ? 32 : 48;
        const lineW = isMobile ? 2.5 : 4;
        const loopGap = isMobile ? 7 : 12;

        // Coordinates System:
        // X: 0 is center. Range: -w/2 to w/2
        // Y: 0 is top. Range: 0 to h
        const left = -w / 2 + padding;
        const right = w / 2 - padding;
        const top = padding;
        const bottom = h - padding;

        const strokeConfig = {
            color: color,
            size: lineW,
            tool: 'pencil',
            tipShape: 'square',
            brushType: 'standard',
            isBorder: true
        };

        // Helper to create a straight line path
        const createLine = (x1, y1, x2, y2) => {
            const points = [];
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.ceil(dist / 12); // 12px density (Performance Optimization)
            if (steps <= 0) {
                points.push({ x: x1, y: y1, offset: Math.random() * Math.PI * 2 });
                return points;
            }
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                points.push({
                    x: x1 + (x2 - x1) * t,
                    y: y1 + (y2 - y1) * t,
                    offset: Math.random() * Math.PI * 2 // Fix: Add offset for wiggle
                });
            }
            return points;
        };

        // Helper to generate DETAILED Meander Corner path (Greek Key)
        // This generates a "Square Knot" pattern that connects P1 (Edge) to P3 (Edge)
        // visually traversing the corner.
        const createCornerPath = (cornerX, cornerY, rotation) => {
            const s = cornerSize; // 48
            const u = s / 4; // 12

            // Path Sequence:
            // 1. Enter from Right of box (s, 0)
            // 2. Go Left to (s/2, 0) -> (u*2, 0)
            // 3. Go Down to (u*2, u)
            // 4. Go Right to (s-u, u)
            // 5. Go Down to (s-u, s-u)
            // 6. Go Left to (u, s-u)
            // 7. Go Up to (u, 0)
            // 8. Go Left to (0, 0)
            // 9. Go Down to (0, s) -> Exit Bottom

            const pts = [
                { x: s, y: 0 },       // Start (Right)
                { x: u * 2, y: 0 },     // Left to u*2
                { x: u * 2, y: u },     // Down
                { x: s - u, y: u },     // Right
                { x: s - u, y: s - u },   // Down
                { x: u, y: s - u },     // Left
                { x: u, y: 0 },       // Up to Top Edge
                { x: 0, y: 0 },       // Left to Top-Left Corner
                { x: 0, y: s }        // Down to Bottom (Exit)
            ];

            // Transform
            return pts.map(pt => {
                let rx = pt.x, ry = pt.y;
                if (rotation === 1) { rx = -rx; } // TR
                if (rotation === 2) { rx = -rx; ry = -ry; } // BR
                if (rotation === 3) { ry = -ry; } // BL
                return {
                    x: cornerX + rx,
                    y: cornerY + ry,
                    offset: Math.random() * Math.PI * 2 // Fix: Add offset for wiggle
                };
            });
        };

        const borderStrokes = [];

        // Wrapper to generate a complete border loop for a given padding
        const generateLoop = (p) => {
            const left = -w / 2 + p;
            const right = w / 2 - p;
            const top = p;
            const bottom = h - p;

            // Top Line
            borderStrokes.push({ ...strokeConfig, points: createLine(left + cornerSize, top, right - cornerSize, top) });
            // TR Corner
            borderStrokes.push({ ...strokeConfig, points: createCornerPath(right, top, 1) });
            // Right Line
            borderStrokes.push({ ...strokeConfig, points: createLine(right, top + cornerSize, right, bottom - cornerSize) });
            // BR Corner
            borderStrokes.push({ ...strokeConfig, points: [...createCornerPath(right, bottom, 2)].reverse() });
            // Bottom Line
            borderStrokes.push({ ...strokeConfig, points: createLine(right - cornerSize, bottom, left + cornerSize, bottom) });
            // BL Corner
            borderStrokes.push({ ...strokeConfig, points: createCornerPath(left, bottom, 3) });
            // Left Line
            borderStrokes.push({ ...strokeConfig, points: createLine(left, bottom - cornerSize, left, top + cornerSize) });
            // TL Corner
            borderStrokes.push({ ...strokeConfig, points: [...createCornerPath(left, top, 0)].reverse() });
        };

        // Inner and Outer loops for "Parallel Lines" effect
        generateLoop(padding);
        generateLoop(padding + loopGap);


        // Animate them
        await this.animateStrokesSequence(borderStrokes, myId);
    }


    async animateStrokesSequence(strokesData, executionId) {
        // This is like autoWrite but for 'pencil' strokes
        // We add them to this.strokes but incrementally add points
        for (const sData of strokesData) {
            while (this.isPaused && !this.stopSignal && this.borderAnimationId === executionId) {
                await new Promise(r => setTimeout(r, 100));
            }
            if (!this.isBorderActive || this.borderAnimationId !== executionId) break;

            const newStroke = {
                points: [],
                color: sData.color,
                size: sData.size,
                tool: sData.tool,
                tipShape: sData.tipShape,
                brushType: sData.brushType,
                startPos: sData.points[0], // needed?
                endPos: sData.points[sData.points.length - 1],
                isBorder: true,
                startTime: Date.now()
            };

            this.strokes.push(newStroke);

            const points = sData.points;
            // Trace the points
            for (let i = 0; i < points.length; i++) {
                while (this.isPaused && !this.stopSignal && this.borderAnimationId === executionId) {
                    await new Promise(r => setTimeout(r, 100));
                }
                if (!this.isBorderActive || this.borderAnimationId !== executionId) break;

                // Add the key point
                const p = points[i];
                this.addPointToStroke(newStroke, p.x, p.y);

                // Yield for dense paths (like straight lines)
                if (i % 5 === 0) {
                    if (this.borderAnimationId !== executionId) break;
                    await new Promise(r => setTimeout(r, 1));
                }

                // Lerp to next point
                if (i < points.length - 1) {
                    const next = points[i + 1];
                    const dist = Math.hypot(next.x - p.x, next.y - p.y);
                    const steps = Math.floor(dist / 2); // Smoother (2px steps)

                    for (let j = 1; j <= steps; j++) {
                        const t = j / steps;
                        const lx = p.x + (next.x - p.x) * t;
                        const ly = p.y + (next.y - p.y) * t;
                        this.addPointToStroke(newStroke, lx, ly);

                        // Update screen more frequently but smoother
                        // Yield every 7 steps (approx 14px)
                        if (j % 7 === 0) {
                            if (this.borderAnimationId !== executionId) return;
                            await new Promise(r => setTimeout(r, 1));
                        }
                    }
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Audio Visualizer as a background element
        // Since it's drawn first, subsequent eraser strokes (destination-out) will erase it.
        if (this.audioVisualizer) {
            this.audioVisualizer.draw(this.ctx);
        }

        const time = Date.now();
        const pixelSize = 2; // Pixel art grid size
        const midX = this.canvas.width / 2;

        strokeLoop: for (const stroke of this.strokes) {
            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.fillStyle = stroke.color;
            this.ctx.strokeStyle = stroke.color;

            // Optimization: If using standard brush (constant size), use a single Path for maximum performance.
            // This is crucial for the "Greek Key" border which has hundreds of points.
            const useSinglePath = stroke.brushType === 'standard' || stroke.brushType === 'marker';

            if (stroke.tool === 'rect' || stroke.tool === 'circle') {
                this.ctx.lineWidth = stroke.size;
                const wiggleX = Math.sin(time * 0.005) * this.wiggleAmount;
                const wiggleY = Math.cos(time * 0.005) * this.wiggleAmount;
                // Shapes use startPos/endPos which are captured as Viewport Coords
                const x = Math.floor((stroke.startPos.x + wiggleX) / pixelSize) * pixelSize;
                const y = Math.floor((stroke.startPos.y + wiggleY) / pixelSize) * pixelSize;
                const w = Math.floor((stroke.endPos.x - stroke.startPos.x) / pixelSize) * pixelSize;
                const h = Math.floor((stroke.endPos.y - stroke.startPos.y) / pixelSize) * pixelSize;

                if (stroke.tool === 'rect') {
                    this.drawPixelRect(x, y, w, h, pixelSize, stroke.size);
                } else {
                    this.drawPixelEllipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), pixelSize, stroke.size);
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
                const isBorder = stroke.isBorder;

                if (useSinglePath) {
                    // CACHING OPTIMIZATION: Static Paths
                    // If stroke is flagged as static (background sketch), use cached Path2D
                    if (stroke.static) {
                        if (!stroke.cachedPath) {
                            const p = new Path2D();
                            let first = true;
                            for (const pt of stroke.points) {
                                let rawX = pt.x, rawY = pt.y;
                                if (isBorder) rawX += midX;
                                if (first || pt.isMove) {
                                    p.moveTo(rawX, rawY);
                                    first = false;
                                } else {
                                    p.lineTo(rawX, rawY);
                                }
                            }
                            stroke.cachedPath = p;
                        }
                        this.ctx.lineWidth = stroke.size;
                        this.ctx.lineCap = stroke.tipShape === 'round' ? 'round' : 'square';
                        this.ctx.lineJoin = 'round';
                        this.ctx.stroke(stroke.cachedPath);
                        continue; // Skip the wobbly loop below
                    }

                    // FAST PATH: Single Path Stroke (100x faster than pixel-by-pixel)
                    this.ctx.lineWidth = stroke.size;
                    this.ctx.lineCap = stroke.tipShape === 'round' ? 'round' : 'square';
                    this.ctx.lineJoin = 'round';
                    this.ctx.beginPath();

                    let hasPoints = false;

                    for (let i = 0; i < stroke.points.length; i++) {
                        const pt = stroke.points[i];

                        // Calculate wiggled position once
                        const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                        const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;

                        let rawX = pt.x, rawY = pt.y;
                        if (isBorder) rawX += midX;

                        const px = Math.floor((rawX + wiggleX) / pixelSize) * pixelSize;
                        const py = Math.floor((rawY + wiggleY) / pixelSize) * pixelSize;

                        if (i === 0 || pt.isMove) {
                            this.ctx.moveTo(px, py);
                            hasPoints = true;
                        } else {
                            this.ctx.lineTo(px, py);
                        }
                    }
                    if (hasPoints) this.ctx.stroke();

                    // Handle single point dot
                    if (stroke.points.length === 1) {
                        const pt = stroke.points[0];
                        // Recalculate just for dot to ensure it renders
                        const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                        const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                        let rawX = pt.x, rawY = pt.y;
                        if (isBorder) rawX += midX;
                        const px = Math.floor((rawX + wiggleX) / pixelSize) * pixelSize;
                        const py = Math.floor((rawY + wiggleY) / pixelSize) * pixelSize;

                        const s = stroke.size;
                        if (stroke.tipShape === 'round') {
                            this.ctx.beginPath();
                            this.ctx.arc(px, py, s / 2, 0, Math.PI * 2);
                            this.ctx.fill();
                        } else {
                            this.ctx.fillRect(px - s / 2, py - s / 2, s, s);
                        }
                    }

                } else {
                    // SLOW PATH: Variable Width (Pressure/Speed sensitivity) - Segmented Stroke
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin = 'round';

                    for (let i = 1; i < stroke.points.length; i++) {
                        const pt = stroke.points[i];
                        const prevPt = stroke.points[i - 1];

                        const wiggleX = Math.sin(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;
                        const wiggleY = Math.cos(time * this.wiggleSpeed + pt.offset) * this.wiggleAmount;

                        const prevWiggleX = Math.sin(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;
                        const prevWiggleY = Math.cos(time * this.wiggleSpeed + prevPt.offset) * this.wiggleAmount;

                        let rawX = pt.x, rawY = pt.y;
                        let prevRawX = prevPt.x, prevRawY = prevPt.y;

                        if (isBorder) {
                            rawX += midX;
                            prevRawX += midX;
                        }

                        const px = Math.floor((rawX + wiggleX) / pixelSize) * pixelSize;
                        const py = Math.floor((rawY + wiggleY) / pixelSize) * pixelSize;
                        const ppx = Math.floor((prevRawX + prevWiggleX) / pixelSize) * pixelSize;
                        const ppy = Math.floor((prevRawY + prevWiggleY) / pixelSize) * pixelSize;

                        const avgSize = (pt.size + prevPt.size) / 2;

                        this.ctx.beginPath();
                        this.ctx.lineWidth = avgSize;
                        this.ctx.moveTo(ppx, ppy);
                        this.ctx.lineTo(px, py);
                        this.ctx.stroke();
                    }

                    // Single point in variable mode
                    if (stroke.points.length === 1) {
                        // Similar dot logic if needed...
                        const pt = stroke.points[0];
                        // ... (render dot)
                    }
                }
            }
        } // end strokeLoop

        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawPixelLine(x1, y1, x2, y2, pixelSize, brushSize, tipShape) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? pixelSize : -pixelSize;
        const sy = (y1 < y2) ? pixelSize : -pixelSize;
        let err = dx - dy;
        let loopCount = 0;
        while (true) {
            this.drawBrushTip(x1, y1, brushSize, tipShape);
            if (Math.abs(x1 - x2) < pixelSize && Math.abs(y1 - y2) < pixelSize) break;

            // Safety break for infinite loops (e.g. NaN coords)
            loopCount++;
            if (loopCount > 2000) break;

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
        const ctx = stamp.getContext('2d');

        ctx.fillStyle = color;
        // Draw centered
        const cx = stamp.width / 2;
        const cy = stamp.height / 2;

        if (shape === 'round') {
            // Pixel art circle approximation
            const r = size / 2;
            for (let y = -r; y <= r; y += pixelSize) {
                for (let x = -r; x <= r; x += pixelSize) {
                    if (x * x + y * y <= r * r) {
                        ctx.fillRect(cx + x - pixelSize / 2, cy + y - pixelSize / 2, pixelSize, pixelSize);
                    }
                }
            }
        } else {
            // Square
            ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        }

        this.brushCache[key] = stamp;
    }

    drawPixelRect(x, y, w, h, pixelSize, size) {
        // Draw hollow rect
        // Top
        this.drawPixelLine(x, y, x + w, y, pixelSize, size, 'square');
        // Bottom
        this.drawPixelLine(x, y + h, x + w, y + h, pixelSize, size, 'square');
        // Left
        this.drawPixelLine(x, y, x, y + h, pixelSize, size, 'square');
        // Right
        this.drawPixelLine(x + w, y, x + w, y + h, pixelSize, size, 'square');
    }

    drawPixelCircle(cx, cy, radius, pixelSize, brushSize) {
        this.drawPixelEllipse(cx, cy, radius, radius, pixelSize, brushSize);
    }

    drawPixelEllipse(cx, cy, rx, ry, pixelSize, brushSize) {
        // Parametric or Midpoint Ellipse Algorithm
        // For simplicity and matching the "pixel art" feel:
        for (let y = -ry; y <= ry; y += pixelSize) {
            for (let x = -rx; x <= rx; x += pixelSize) {
                // Ellipse equation: (x/rx)^2 + (y/ry)^2 <= 1
                // Optimized: (x*ry)^2 + (y*rx)^2 <= (rx*ry)^2
                if ((x * ry) ** 2 + (y * rx) ** 2 <= (rx * ry) ** 2) {
                    this.drawBrushTip(cx + x, cy + y, brushSize, 'square');
                }
            }
        }
    }
}

// Instantiate the system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only if canvas exists
    if (document.getElementById('bg-drawing-canvas')) {
        window.drawingSystem = new DrawingSystem('bg-drawing-canvas');
        console.log("DrawingSystem started");
    }
});
