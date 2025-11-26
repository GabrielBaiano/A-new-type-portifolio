/**
 * Balloon System - Floating notification cards
 * Future use: Ads, announcements, GitHub followers, project contributors
 */

class BalloonSystem {
    constructor() {
        this.balloons = [];
        this.container = null;
        this.isRunning = false;
        
        // PRD (Pseudorandom Distribution) variables
        this.leftProbability = 0.5;
        this.rightProbability = 0.5;
        this.leftLastSpawn = 0;
        this.rightLastSpawn = 0;
        this.activeBalloons = [];
        
        // Anti-repetition system
        this.recentBalloons = [];  // Track recently shown balloons
        this.maxRecentTracking = 5; // Don't repeat last 5 balloons
        
        // Page-specific context (for future implementation)
        this.currentContext = 'home'; // home, project-detail, etc.
        
        this.init();
    }

    init() {
        // Don't initialize on mobile
        if (window.innerWidth <= 768) {
            return;
        }

        // Create balloon container
        this.container = document.createElement('div');
        this.container.id = 'balloon-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768 && this.container) {
                this.stop();
                this.container.style.display = 'none';
            } else if (window.innerWidth > 768 && this.container) {
                this.container.style.display = 'block';
                if (!this.isRunning) {
                    this.start();
                }
            }
        });
    }

    // PRD: Choose side based on probability that increases when not chosen
    chooseSide() {
        const now = Date.now();
        const timeSinceLeft = now - this.leftLastSpawn;
        const timeSinceRight = now - this.rightLastSpawn;
        
        // Increase probability for side that hasn't spawned recently
        if (timeSinceLeft > 3000) this.leftProbability = Math.min(0.9, this.leftProbability + 0.1);
        if (timeSinceRight > 3000) this.rightProbability = Math.min(0.9, this.rightProbability + 0.1);
        
        // Choose side with weighted probability
        const rand = Math.random();
        let side;
        
        if (rand < this.leftProbability / (this.leftProbability + this.rightProbability)) {
            side = 'left';
            this.leftLastSpawn = now;
            this.leftProbability = 0.5; // Reset after spawn
        } else {
            side = 'right';
            this.rightLastSpawn = now;
            this.rightProbability = 0.5; // Reset after spawn
        }
        
        return side;
    }

    // Check if position would overlap with existing balloons
    checkCollision(side, startY, balloonHeight) {
        const now = Date.now();
        
        // Clean up old balloons from tracking
        this.activeBalloons = this.activeBalloons.filter(b => {
            const elapsed = (now - b.spawnTime) / 1000;
            return elapsed < b.duration;
        });
        
        // Check for overlap with active balloons on the same side
        for (let balloon of this.activeBalloons) {
            if (balloon.side === side) {
                // Calculate current position of existing balloon
                const elapsed = (now - balloon.spawnTime) / 1000;
                const progress = elapsed / balloon.duration;
                const currentY = balloon.startY - (window.innerHeight * 2.2 * progress);
                
                // Check if new balloon would overlap - increased minimum distance
                const minDistance = balloonHeight + balloon.height + 80; // 80px gap (increased from 30px)
                if (Math.abs(startY - currentY) < minDistance) {
                    return true; // Collision detected
                }
            }
        }
        
        return false; // No collision
    }

    createBalloon(data) {
        if (!this.container) return null;

        const balloon = document.createElement('div');
        balloon.className = 'floating-balloon';
        
        // Use PRD to choose side
        const side = this.chooseSide();
        
        // Calculate balloon height based on type
        let balloonHeight;
        if (data.type === 'ad') {
            // For ads, estimate height: title (40px) + image (140px) + padding (32px) = ~210px
            balloonHeight = 210;
        } else {
            // Regular notifications
            balloonHeight = 100;
        }
        
        // Create balloon content based on type
        let balloonContent;
        
        if (data.type === 'ad') {
            // Ad balloon with title on top and image below
            balloonContent = `
                <div class="balloon-card balloon-ad">
                    ${data.link ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="ad-link">` : ''}
                        <div class="ad-title">${data.title}</div>
                        <img src="${data.adImage}" alt="${data.title}" class="ad-image">
                    ${data.link ? `</a>` : ''}
                </div>
            `;
        } else {
            // Regular notification balloon
            balloonContent = `
                <div class="balloon-card">
                    <img src="${data.image}" alt="${data.name}" class="balloon-avatar">
                    <div class="balloon-content">
                        <div class="balloon-header">
                            <span class="balloon-name">${data.name}</span>
                            ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ''}
                        </div>
                        <div class="balloon-message">${data.message}</div>
                    </div>
                </div>
            `;
        }
        
        // Start from bottom of screen
        const startY = window.innerHeight + 50;
        
        // Check for collision and adjust if needed
        let finalStartY = startY;
        if (this.checkCollision(side, startY, balloonHeight)) {
            finalStartY = startY + balloonHeight + 50;
        }
        
        // Random horizontal position
        const horizontalOffset = 20 + Math.random() * 80;

        // UNIFORM SPEED for all balloons
        const totalDistance = window.innerHeight * 2.2;
        const speed = 120; // Fixed speed: 120 px/s
        const duration = totalDistance / speed;
        
        // Track this balloon
        this.activeBalloons.push({
            side,
            startY: finalStartY,
            height: balloonHeight,
            duration,
            spawnTime: Date.now()
        });
        
        // Set the content
        balloon.innerHTML = balloonContent;

        balloon.style.cssText = `
            position: absolute;
            ${side}: -350px;
            top: ${finalStartY}px;
            animation: float-up-${side} ${duration}s linear forwards;
            --horizontal-offset: ${horizontalOffset}px;
        `;

        this.container.appendChild(balloon);

        // Remove balloon after animation
        setTimeout(() => {
            balloon.remove();
        }, duration * 1000);

        return balloon;
    }

    start() {
        if (this.isRunning || window.innerWidth <= 768) return;
        this.isRunning = true;

        // Spawn balloons at random intervals
        const spawn = () => {
            if (!this.isRunning) return;

            const balloonData = this.getBalloonData();
            const balloon = this.createBalloon(balloonData);

            // Spawn interval: 0.8-2.5 seconds
            const nextSpawn = 800 + Math.random() * 1700;
            setTimeout(spawn, nextSpawn);
        };

        spawn();
    }

    stop() {
        this.isRunning = false;
    }

    // Get balloon data based on context and anti-repetition
    getBalloonData() {
        const allData = this.getAllBalloonData();
        
        // Filter by context (for future implementation)
        let contextFiltered = allData.filter(item => {
            if (!item.contexts) return true; // No context restriction
            return item.contexts.includes(this.currentContext);
        });
        
        // Remove recently shown balloons to avoid repetition
        let available = contextFiltered.filter(item => {
            return !this.recentBalloons.includes(item.id);
        });
        
        // If all have been shown recently, reset the recent list
        if (available.length === 0) {
            this.recentBalloons = [];
            available = contextFiltered;
        }
        
        // Weighted random: ads are rare (10% chance)
        const rand = Math.random();
        let selectedType;
        
        if (rand < 0.1) {
            // 10% chance for ads
            selectedType = 'ad';
        } else {
            // 90% chance for notifications
            selectedType = 'notification';
        }
        
        // Filter by selected type
        let typeFiltered = available.filter(item => item.type === selectedType);
        
        // If no items of selected type, fall back to any available
        if (typeFiltered.length === 0) {
            typeFiltered = available;
        }
        
        // Select random item
        const selected = typeFiltered[Math.floor(Math.random() * typeFiltered.length)];
        
        // Track as recent
        this.recentBalloons.push(selected.id);
        if (this.recentBalloons.length > this.maxRecentTracking) {
            this.recentBalloons.shift(); // Remove oldest
        }
        
        return selected;
    }

    getAllBalloonData() {
        return [
            // Regular notifications
            {
                id: 'notif-1',
                type: 'notification',
                name: "typelnvictvs",
                message: "I joined on Oct 3, 2025 and i received 1 star this week!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
                contexts: ['home'] // Only show on home page
            },
            {
                id: 'notif-2',
                type: 'notification',
                name: "Pedro Menghini",
                message: "Eu entrei aqui 14/10/2025",
                badge: "",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
                contexts: ['home']
            },
            {
                id: 'notif-3',
                type: 'notification',
                name: "New Contributor",
                message: "Thanks for contributing to the project! 🎉",
                badge: "💻",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
                contexts: ['home', 'shii-app'] // Show on home and shii project page
            },
            {
                id: 'notif-4',
                type: 'notification',
                name: "GitHub Star",
                message: "Someone starred your repository!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
                contexts: ['home', 'shii-app']
            },
            {
                id: 'notif-5',
                type: 'notification',
                name: "New Follower",
                message: "Started following you on GitHub",
                badge: "👥",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
                contexts: ['home']
            },
            {
                id: 'notif-6',
                type: 'notification',
                name: "Issue Resolved",
                message: "Bug fix merged successfully",
                badge: "🔧",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
                contexts: ['shii-app'] // Only on project pages
            },
            {
                id: 'notif-7',
                type: 'notification',
                name: "Pull Request",
                message: "New PR submitted for review",
                badge: "📝",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7",
                contexts: ['shii-app']
            },
            
            // Ads (rare - 10% chance)
            {
                id: 'ad-shii',
                type: 'ad',
                title: "Shii! app - Manage your widgets",
                adImage: "assets/images/Shii.logo.app.png",
                link: "https://github.com/yourusername/shii-app",
                contexts: ['home'] // Show everywhere except on its own page
            }
        ];
    }

    // Method to change context (for future use)
    setContext(context) {
        this.currentContext = context;
        // Don't clear existing balloons, only affects new spawns
    }
}

// Initialize balloon system
const balloonSystem = new BalloonSystem();

// Auto-start after page load
window.addEventListener('load', () => {
    if (window.innerWidth > 768) {
        setTimeout(() => {
            balloonSystem.start();
        }, 3000); // Start after 3 seconds
    }
});

