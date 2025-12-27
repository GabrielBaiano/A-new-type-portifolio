/**
 * Balloon System - Floating notification cards with track-based positioning
 * Features: Independent tracks, dynamic height calculation, anti-repetition
 */

class BalloonSystem {
    constructor() {
        this.container = null;
        this.isRunning = false;

        // Independent tracks for left and right sides
        this.tracks = {
            left: { lastY: window.innerHeight + 100 },
            right: { lastY: window.innerHeight + 100 }
        };

        // Anti-repetition system
        this.recent = [];
        this.maxRecent = 5;

        // Page context for filtering (future use)
        this.currentContext = 'home';

        // Flag to ensure ad is shown first
        this.hasShownInitialAd = false;

        this.init();
    }

    init() {
        // Don't initialize on mobile or if space is too tight
        if (!this.hasEnoughSpace()) {
            return;
        }

        this.container = document.createElement("div");
        this.container.id = "balloon-container";
        this.container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 999;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);

        // Handle window resize
        window.addEventListener('resize', () => {
             // Check if we have enough space for balloons
            const safe = this.hasEnoughSpace();
            
            if (!safe && this.container) {
                this.stop();
                this.container.style.display = 'none';
            } else if (safe && this.container) {
                this.container.style.display = 'block';
                if (!this.isRunning) {
                    this.start();
                }
            }
        });

        // Handle URL changes to update context
        window.addEventListener('hashchange', () => this.updateContext());
        window.addEventListener('load', () => this.updateContext());
    }

    hasEnoughSpace() {
        if (window.innerWidth <= 1000) return false; // Hard limit for mobile/tablet

        const mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return true; // Default to safe if no container logic found
        
        // Calculate margin on ONE side
        const margin = (window.innerWidth - mainContainer.offsetWidth) / 2;
        
        // Balloon width (320px default, 380px ads) + minimal padding (20px)
        // Relaxed constraint to allow balloons on 720px detail pages (laptop screens)
        return margin > 280;
    }

    chooseSide() {
        return Math.random() < 0.5 ? "left" : "right";
    }

    createBalloon(data) {
        // Create temporary element to measure height
        const temp = document.createElement("div");
        temp.className = "balloon-temp";
        temp.style.cssText = `
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: ${data.type === 'ad' ? '380px' : '320px'}; /* Fix width for measurement */
        `;
        temp.innerHTML = this.buildBalloonHTML(data);

        this.container.appendChild(temp);
        const height = temp.clientHeight;
        temp.remove();

        const side = this.chooseSide();
        const track = this.tracks[side];

        // Spacing between balloons
        const spacing = data.type === "ad" ? 220 : 120;

        // Calculate Y position based on track's last balloon
        const startY = track.lastY;
        
        // Update track for next balloon
        track.lastY = startY + height + spacing;

        // Random horizontal position within the available margin (safer logic)
        // We want them centered in the margin space if possible
        const mainContainer = document.querySelector('.main-container');
        const margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 200;
        
        // Limit max offset to ensure it doesn't overlap content
        const balloonWidth = data.type === 'ad' ? 380 : 320;
        
        // Safer margin: Minimum 40px from edge
        // Max offset: Margin - balloonWidth - 20px safety buffer
        const minOffset = 40;
        const maxOffset = Math.max(minOffset, margin - balloonWidth - 20);
        
        // Random between min and max
        const horizontalOffset = minOffset + Math.random() * (maxOffset - minOffset);

        // Create actual balloon
        const balloon = document.createElement("div");
        balloon.className = "floating-balloon";
        if (data.type === 'ad') balloon.classList.add('twitter-balloon');
        
        balloon.innerHTML = this.buildBalloonHTML(data);

        const speed = 60; // pixels per second
        const travel = startY + height + 300;
        const duration = travel / speed;

        balloon.style.cssText = `
            position: absolute;
            ${side}: ${horizontalOffset}px;
            top: ${startY}px;
            animation: balloon-move-up ${duration}s linear forwards;
            z-index: ${data.type === 'ad' ? 100 : 90};
        `;

        this.container.appendChild(balloon);

        // Remove balloon after animation
        setTimeout(() => {
            balloon.remove();
        }, duration * 1000);

        // Reset track after balloon has moved up enough
        const resetTime = (500 / speed) * 1000;
        setTimeout(() => {
            track.lastY = window.innerHeight + 100;
        }, resetTime);
    }

    buildBalloonHTML(data) {
        if (data.type === "ad") {
            const linkStart = data.link ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="twitter-link-overlay"></a>` : '';
            
            // Interaction links (using Web Intents for realism, or just the tweet link)
            // For now, let's point everything to the tweet as requested
            const actionLink = (type) => data.link ? `onclick="window.open('${data.link}', '_blank')"` : '';

            return `
                <div class="balloon-card balloon-twitter">
                    ${linkStart}
                    <div class="twitter-body">
                        <img src="${data.userImage}" alt="${data.user}" class="twitter-avatar">
                        <div class="twitter-right-col">
                            <div class="twitter-header-row">
                                <span class="twitter-name">${data.user}</span>
                                <div class="twitter-verified-badge">
                                    <i class="fa-solid fa-certificate"></i>
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                <span class="twitter-handle">${data.handle} &middot; ${data.time}</span>
                            </div>
                            
                            <div class="twitter-content">
                                ${data.content}
                            </div>

                            ${data.adImage ? `
                            <div class="twitter-image-container">
                                <img src="${data.adImage}" alt="Post Image" class="twitter-post-image">
                            </div>
                            ` : ''}

                            <div class="twitter-footer">
                                <div class="tweet-action action-reply" ${actionLink('reply')} title="Reply"><i class="fa-regular fa-comment"></i> <span>2</span></div>
                                <div class="tweet-action action-retweet" ${actionLink('retweet')} title="Retweet"><i class="fa-solid fa-retweet"></i> <span>5</span></div>
                                <div class="tweet-action action-like" ${actionLink('like')} title="Like"><i class="fa-regular fa-heart"></i> <span>18</span></div>
                                <div class="tweet-action action-view" ${actionLink('view')} title="Views"><i class="fa-solid fa-chart-simple"></i> <span>1.2k</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="balloon-card">
                <img src="${data.image}" alt="${data.name}" class="balloon-avatar">
                <div class="balloon-content">
                    <div class="balloon-header">
                        <span class="balloon-name">${data.name}</span>
                        ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ""}
                    </div>
                    <div class="balloon-message">${data.message}</div>
                </div>
            </div>
        `;
    }

    async start() {
        if (this.isRunning || !this.hasEnoughSpace()) return;
        this.isRunning = true;

        const spawn = async () => {
            if (!this.isRunning) return;

            const data = await this.getBalloonData();
            this.createBalloon(data);

            // Increased interval: 1.5-3.5 seconds (slower spawn rate)
            const next = 1500 + Math.random() * 2000;
            setTimeout(spawn, next);
        };

        spawn();
    }

    stop() {
        this.isRunning = false;
    }

    async getBalloonData() {
        // Always show YellowHood ad first, then 7% chance for subsequent ads
        if (!this.hasShownInitialAd || Math.random() < 0.07) {
            this.hasShownInitialAd = true;
            return {
                id: "ad-yellowhood-" + Date.now(),
                type: "ad",
                user: "Gabriel Baiano",
                handle: "@uMagicalJake",
                userImage: "assets/images/icon.jpg",
                time: "2h",
                content: "Discovering how to create unique digital experiences at <span style='color: #1d9bf0'>#AgenciaYellowHood</span>. Transform your online presence with strategy, design, and technology. <a href='https://yellowhood.com.br' style='color: #1d9bf0; text-decoration: none;'>https://yellowhood.com.br</a>",
                adImage: "assets/images/banner.png",
                link: "https://x.com/uMagicalJake/status/2004784426199466295"
            };
        }

        let list = await this.getAllData();
        
        // Filter by context
        list = list.filter(item => {
            if (!item.contexts) return true;
            return item.contexts.includes(this.currentContext);
        });
        
        // Remove recently shown
        list = list.filter(i => !this.recent.includes(i.id));

        if (list.length === 0) {
            this.recent = [];
            list = (await this.getAllData()).filter(item => {
                if (!item.contexts) return true;
                return item.contexts.includes(this.currentContext);
            });
        }

        // All notifications now (no ads)
        if (list.length > 0) {
            const item = list[Math.floor(Math.random() * list.length)];
            this.recent.push(item.id);
            if (this.recent.length > this.maxRecent) this.recent.shift();
            return item;
        }

        // Return a safe default if absolutely nothing matches (prevents crash)
        return {
            id: "fallback-" + Date.now(),
            type: "notification",
            name: "Portfolio",
            message: "Welcome to my portfolio!",
            badge: "👋",
            image: "assets/images/icon.jpg",
            contexts: ['home', 'projects', 'shii-app']
        };
    }

    async getAllData() {
        // Try to fetch from API first
        try {
            const context = this.currentContext;
            let url;

            if (context === 'home') {
                url = '/api/get-balloon-data?context=home';
            } else if (context === 'projects') {
                url = '/api/get-balloon-data?context=projects';
            } else {
                // Specific project context
                url = `/api/get-balloon-data?project=${context}`;
            }
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`Loaded ${result.data.length} balloons from API`);
                return result.data;
            }
        } catch (error) {
            console.error('Error fetching from API, using fallback:', error);
        }

        // Fallback to static data if API fails
        return this.getFallbackData();
    }

    getFallbackData() {
        const baseData = [
            // Notifications only
            {
                id: "notif-1",
                type: "notification",
                name: "typelnvictvs",
                message: "I joined on Oct 3, 2025 and i received 1 star this week!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
                contexts: ['home']
            },
            {
                id: "notif-2",
                type: "notification",
                name: "Pedro Menghini",
                message: "Eu entrei aqui 14/10/2025",
                badge: "",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
                contexts: ['home']
            },
            {
                id: "notif-3",
                type: "notification",
                name: "New Contributor",
                message: "Thanks for contributing to the project! 🎉",
                badge: "💻",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
                contexts: ['home', 'shii-app', 'projects']
            },
            {
                id: "notif-4",
                type: "notification",
                name: "GitHub Star",
                message: "Someone starred your repository!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
                contexts: ['home', 'shii-app', 'projects']
            },
            {
                id: "notif-5",
                type: "notification",
                name: "New Follower",
                message: "Started following you on GitHub",
                badge: "👥",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
                contexts: ['home', 'projects']
            },
            {
                id: "notif-6",
                type: "notification",
                name: "Issue Resolved",
                message: "Bug fix merged successfully",
                badge: "🔧",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
                contexts: ['shii-app', 'projects']
            },
            {
                id: "notif-7",
                type: "notification",
                name: "Pull Request",
                message: "New PR submitted for review",
                badge: "📝",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7",
                contexts: ['shii-app', 'projects']
            }
        ];

        // Combine with realistic mock data for immediate feedback
        const mockData = [
            {
                id: "notif-real-1",
                type: "notification",
                name: "uMagicalJake",
                message: "Starred Agência Yellow Hood",
                badge: "⭐",
                image: "assets/images/icon.jpg",
                contexts: ['projects']
            },
            {
                id: "notif-real-2",
                type: "notification",
                name: "Contributor",
                message: "Opened issue: 'Fix responsive layout' in Shii! app",
                badge: "🐛",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev1",
                contexts: ['projects', 'shii-app']
            },
            {
                id: "notif-real-3",
                type: "notification",
                name: "Dependabot",
                message: "Opened PR: 'Bump version' in Auto Commiter",
                badge: "📝",
                image: "https://avatars.githubusercontent.com/in/29110?s=64&v=4",
                contexts: ['projects']
            }
        ];
        
        return [...baseData, ...mockData];
    }

    // Method to change context
    async updateContext() {
        const hash = window.location.hash;
        
        // Context: Projects Page (all projects)
        if (hash === '#/projects') {
            this.currentContext = 'projects';
            console.log('🎈 Balloon Context: Projects (Aggregated)');
        }
        // Context: Specific Project Detail
        else if (hash.startsWith('#/detail/projects/')) {
            const projectId = hash.split('/').pop();
            try {
                // Get repo slug from project ID (e.g., 'shii-app' -> 'shii-study-assistant')
                const repoSlug = await DataService.getProjectRepoSlug(projectId);
                
                if (repoSlug) {
                    this.currentContext = repoSlug;
                    console.log(`🎈 Balloon Context: Project (${repoSlug})`);
                } else {
                    this.currentContext = 'home';
                }
            } catch (e) {
                console.error('Error setting balloon context:', e);
                this.currentContext = 'home';
            }
        }
        // Default: Home
        else {
            this.currentContext = 'home';
            console.log('🎈 Balloon Context: Home');
        }
        
        // Reset recent list to ensure new context data is shown immediately
        this.recent = [];
    }
}

// Initialize balloon system
const balloonSystem = new BalloonSystem();

// Auto-start after page load
window.addEventListener("load", () => {
    if (balloonSystem.hasEnoughSpace()) {
        setTimeout(() => {
            balloonSystem.start();
        }, 3000);
    }
});
