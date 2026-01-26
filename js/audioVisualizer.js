class AudioVisualizer {
    constructor(canvas, audioSrc) {
        this.canvas = canvas;
        this.audioSrc = audioSrc;
        this.isPlaying = false;
        this.isInitialized = false;

        // Visualizer settings
        this.pointCount = 120;
        this.points = [];
        this.baseRadius = 160;
        this.strokes = 4;

        // Audio Engine
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.audioElement = null;

        // State
        this.drawingProgress = 0;
        this.drawingSpeed = 0.02;
        this.isAnimating = false;

        this.initBlob();
        this.initAudio();
    }

    initBlob() {
        this.points = [];
        for (let i = 0; i < this.pointCount; i++) {
            const angle = (i / this.pointCount) * Math.PI * 2;
            this.points.push({
                angle,
                radius: this.baseRadius,
                targetRadius: this.baseRadius,
                velocity: 0
            });
        }
    }

    initAudio() {
        console.log("AudioVisualizer: Initializing Web Audio API...");

        this.audioElement = new Audio();
        this.audioElement.src = this.audioSrc;
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.loop = true;

        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.isAnimating = true;
            if (this.drawingProgress >= 1) this.drawingProgress = 0.99;
            else this.drawingProgress = 0;
        });

        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
        });
    }

    setupAudioContext() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256; // Smaller FFT for smoother, larger spikes

        this.source = this.audioContext.createMediaElementSource(this.audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.isInitialized = true;
        console.log("AudioVisualizer: Audio Context initialized.");
    }

    toggle(forceState) {
        if (forceState === true || (forceState === undefined && !this.isPlaying)) {
            return this.play();
        } else {
            this.pause();
            return false;
        }
    }

    async play() {
        console.log("AudioVisualizer: Play requested");

        // Resume context on user interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        if (!this.isInitialized) {
            this.setupAudioContext();
        }

        try {
            await this.audioElement.play();
            console.log("AudioVisualizer: audio.play() success");
            return true;
        } catch (e) {
            console.warn("AudioVisualizer: audio.play() failed", e);
            return false;
        }
    }

    pause() {
        console.log("AudioVisualizer: Pause requested");
        if (this.audioElement) this.audioElement.pause();
        this.isPlaying = false;
    }

    update() {
        if (!this.isAnimating) return;

        const time = Date.now() * 0.001;

        let freqData = [];
        if (this.isInitialized && this.isPlaying) {
            this.analyser.getByteFrequencyData(this.dataArray);
            freqData = Array.from(this.dataArray);
        }

        if (this.drawingProgress < 1) {
            this.drawingProgress += this.drawingSpeed;
        }

        const deformationScale = Math.max(0, this.drawingProgress - 0.3) * 1.5;

        for (let i = 0; i < this.pointCount; i++) {
            const p = this.points[i];

            // Background noise (constant organic wiggle)
            const noise = Math.sin(p.angle * 6 + time * 2) * 4;

            // REAL Spikes Logic
            let spike = 0;
            if (this.isPlaying && freqData.length > 0) {
                // Linear mapping around the circle (no mirroring)
                const normalizedAngle = p.angle / (Math.PI * 2);
                const binIndex = Math.floor(normalizedAngle * (freqData.length - 1));
                const rawFreq = freqData[binIndex] / 255; // 0 to 1

                // Frequency bands
                const isBass = binIndex < freqData.length * 0.2;
                const isMid = binIndex >= freqData.length * 0.2 && binIndex < freqData.length * 0.6;

                // Enhance sharpness but keep visibility for lower volumes
                if (isBass) {
                    spike += Math.pow(rawFreq, 2) * 150;   // Powerful bass
                } else if (isMid) {
                    spike += Math.pow(rawFreq, 1.5) * 100; // Visible mids
                } else {
                    spike += Math.pow(rawFreq, 1.2) * 80;  // Active highs
                }
            } else if (!this.isPlaying && this.isAnimating) {
                // Subtle idle movement
                spike = Math.sin(p.angle * 8 + time * 1.5) * 3;
            }

            p.targetRadius = this.baseRadius + (noise + spike) * deformationScale;

            // Inertia/Smoothness
            const force = (p.targetRadius - p.radius) * 0.15;
            p.velocity = (p.velocity + force) * 0.75;
            p.radius += p.velocity;
        }
    }

    draw(ctx) {
        if (!this.isAnimating) return;

        this.update();

        const pixelSize = 2;
        const centerX = this.canvas.width * 0.75;
        const centerY = this.canvas.height * 0.5;

        // 1. Draw Inner Core Line
        this.drawCore(ctx, centerX, centerY, pixelSize);

        // 2. Draw Spectrum Bars (Multiple layers for Glitch/Depth effect)
        // Red Shift
        this.drawBars(ctx, centerX + 2, centerY, pixelSize, 'rgba(255, 0, 80, 0.4)');
        // Cyan Shift
        this.drawBars(ctx, centerX - 2, centerY, pixelSize, 'rgba(0, 255, 255, 0.4)');
        // Main White Bars
        this.drawBars(ctx, centerX, centerY, pixelSize, 'rgba(255, 255, 255, 0.9)');
    }

    drawCore(ctx, centerX, centerY, pixelSize) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';

        for (let i = 0; i <= this.pointCount; i++) {
            const p = this.points[i % this.pointCount];
            // Core is smaller and smoother
            const r = this.baseRadius + (p.radius - this.baseRadius) * 0.3;
            const x = centerX + Math.cos(p.angle) * r;
            const y = centerY + Math.sin(p.angle) * r;

            const px = Math.floor(x / pixelSize) * pixelSize;
            const py = Math.floor(y / pixelSize) * pixelSize;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    drawBars(ctx, centerX, centerY, pixelSize, color) {
        ctx.fillStyle = color;

        const time = Date.now();

        for (let i = 0; i < this.pointCount; i++) {
            const p = this.points[i];

            // Bar thickness
            const thickness = 3;

            // Calculate start (circle edge) and end (spike tip)
            const rStart = this.baseRadius - 5;
            const rEnd = p.radius;

            // Wiggle for organic "drawing" feel
            const wiggleX = Math.sin(time * 0.005 + i * 0.5) * 1.5;
            const wiggleY = Math.cos(time * 0.005 + i * 0.5) * 1.5;

            const xStart = centerX + Math.cos(p.angle) * rStart + wiggleX;
            const yStart = centerY + Math.sin(p.angle) * rStart + wiggleY;
            const xEnd = centerX + Math.cos(p.angle) * rEnd + wiggleX;
            const yEnd = centerY + Math.sin(p.angle) * rEnd + wiggleY;

            // Draw as a quantized "pixel" line
            this.drawPixelLine(ctx, xStart, yStart, xEnd, yEnd, pixelSize, thickness);
        }
    }

    drawPixelLine(ctx, x1, y1, x2, y2, pixelSize, thickness) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.ceil(dist / pixelSize);

        for (let i = 0; i <= steps; i++) {
            const t = i / Math.max(1, steps);
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;

            const px = Math.floor(x / pixelSize) * pixelSize;
            const py = Math.floor(y / pixelSize) * pixelSize;

            ctx.fillRect(px - thickness / 2, py - thickness / 2, thickness, thickness);
        }
    }
}
