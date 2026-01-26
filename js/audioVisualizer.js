class AudioVisualizer {
    constructor(canvas, youtubePlaylistId) {
        this.canvas = canvas;
        this.youtubePlaylistId = youtubePlaylistId;
        this.isPlaying = false;
        this.isInitialized = false;

        // Visualizer settings
        this.pointCount = 100;
        this.points = [];
        this.baseRadius = 60;
        this.strokes = 3;
        this.jitter = 2;

        // State
        this.drawingProgress = 0;
        this.drawingSpeed = 0.02;
        this.isAnimating = false;

        this.initBlob();
        this.initYoutube();
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

    initYoutube() {
        console.log("AudioVisualizer: Initializing YouTube API Check...");
        const setup = () => { if (!this.player) this.createPlayer(); };
        if (window.YT && window.YT.Player) {
            setup();
        } else {
            const check = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(check);
                    setup();
                }
            }, 500);
        }
    }

    createPlayer() {
        if (this.player) return;
        console.log("AudioVisualizer: Creating YT Player for ID:", this.youtubePlaylistId);

        const isPlaylist = this.youtubePlaylistId.length > 12;
        const playerConfig = {
            height: '1', width: '1',
            playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                origin: window.location.origin,
                enablejsapi: 1
            },
            events: {
                'onReady': (e) => {
                    console.log("AudioVisualizer: Player Ready");
                    this.isInitialized = true;
                    this.player = e.target;

                    // Crucial for some browsers to allow playback later
                    this.player.mute();

                    if (isPlaylist) {
                        this.player.setShuffle(true);
                        this.player.setLoop(true);
                    }

                    if (document.documentElement.getAttribute('data-theme') !== 'light') {
                        console.log("AudioVisualizer: Theme is dark, attempting to play...");
                        this.play();
                    }
                },
                'onStateChange': (e) => {
                    console.log("AudioVisualizer: YT State Change:", e.data);
                    if (e.data === YT.PlayerState.PLAYING) {
                        this.isPlaying = true;
                        this.isAnimating = true;
                    } else if (e.data === YT.PlayerState.ENDED) {
                        if (isPlaylist) this.player.nextVideo();
                    } else {
                        this.isPlaying = false;
                    }
                },
                'onError': (e) => {
                    console.error("AudioVisualizer: YT Player Error:", e.data);
                }
            }
        };

        if (isPlaylist) {
            playerConfig.playerVars.listType = 'playlist';
            playerConfig.playerVars.list = this.youtubePlaylistId;
        } else {
            playerConfig.videoId = this.youtubePlaylistId;
        }

        this.player = new YT.Player('youtube-player', playerConfig);
    }

    toggle(forceState) {
        if (forceState === true || (forceState === undefined && !this.isPlaying)) {
            return this.play();
        } else {
            this.pause();
            return false;
        }
    }

    play() {
        console.log("AudioVisualizer: Play requested");
        if (this.player && this.player.playVideo) {
            try {
                this.player.unMute();
                this.player.setVolume(100);
                this.player.playVideo();
                console.log("AudioVisualizer: playVideo() called");
            } catch (e) {
                console.warn("AudioVisualizer: playVideo() failed", e);
            }
        }
        this.isAnimating = true;
        // Don't reset drawingProgress if it's already complete
        if (this.drawingProgress >= 1) this.drawingProgress = 0.99;
        else this.drawingProgress = 0;

        return true;
    }

    pause() {
        console.log("AudioVisualizer: Pause requested");
        if (this.player && this.player.pauseVideo) this.player.pauseVideo();
        this.isPlaying = false;
        this.isAnimating = false;
    }

    update() {
        if (!this.isAnimating) return;

        const time = Date.now() * 0.001;
        // Audio reaction is simulated for now because YouTube doesn't expose raw audio data (CORS)
        const bass = this.isPlaying ? (Math.sin(time * 12) * 40 + 40) : 0;

        if (this.drawingProgress < 1) {
            this.drawingProgress += this.drawingSpeed;
        }

        const deformationScale = Math.max(0, this.drawingProgress - 0.3) * 1.5;

        for (let i = 0; i < this.pointCount; i++) {
            const p = this.points[i];
            const noise = Math.sin(p.angle * 5 + time * 3) * 8 * deformationScale;
            // The blob only "dances" if isPlaying is true
            const reactive = (this.isPlaying && Math.sin(p.angle * 8 + time * 6) > 0.6) ? bass * deformationScale : 0;

            p.targetRadius = this.baseRadius + noise + reactive;
            const force = (p.targetRadius - p.radius) * 0.1;
            p.velocity = (p.velocity + force) * 0.8;
            p.radius += p.velocity;
        }
    }

    draw(ctx) {
        if (!this.isAnimating) return;

        this.update();

        const pixelSize = 2;
        const centerX = this.canvas.width * 0.75;
        const centerY = this.canvas.height * 0.5;

        for (let s = 0; s < this.strokes; s++) {
            this.drawBlob(ctx, s, centerX, centerY, pixelSize);
        }
    }

    drawBlob(ctx, strokeIndex, centerX, centerY, pixelSize) {
        const visiblePointCount = Math.ceil(this.pointCount * Math.min(1, this.drawingProgress));
        if (visiblePointCount < 2) return;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - strokeIndex * 0.2})`;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const time = Date.now();
        const offsetInner = strokeIndex * 2;

        for (let i = 0; i <= visiblePointCount; i++) {
            const point = this.points[i % this.pointCount];
            const r = point.radius + offsetInner;

            const wiggleX = Math.sin(time * 0.005 + i * 0.1) * 2;
            const wiggleY = Math.cos(time * 0.005 + i * 0.1) * 2;

            const x = centerX + Math.cos(point.angle) * r + wiggleX;
            const y = centerY + Math.sin(point.angle) * r + wiggleY;

            const px = Math.floor(x / pixelSize) * pixelSize;
            const py = Math.floor(y / pixelSize) * pixelSize;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}
