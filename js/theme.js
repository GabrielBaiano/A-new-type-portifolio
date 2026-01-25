// Theme Management Script
(function () {
    'use strict';

    const themeToggle = document.getElementById('theme-toggle');
    const themeStatus = document.getElementById('theme-status');
    const modeIcon = themeStatus ? themeStatus.querySelector('.mode-icon') : null;
    const html = document.documentElement;

    const modes = {
        dark: {
            icon: 'fa-palette'
        },
        light: {
            icon: 'fa-briefcase'
        }
    };

    // Get theme from localStorage or default to light (Professional)
    function getPreferredTheme() {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }

        // Default to light (Professional) as requested
        return 'light';
    }

    // Speech Bubble logic
    let speechBubble = null;

    function createSpeechBubble() {
        if (speechBubble) return;

        speechBubble = document.createElement('div');
        speechBubble.className = 'theme-speech-bubble';
        speechBubble.innerHTML = `
            <div class="bubble-content">
                Toggle to enter Creative Mode
            </div>
            <div class="bubble-arrow"></div>
        `;

        // Click to pop interaction
        speechBubble.addEventListener('click', (e) => {
            e.stopPropagation();

            // Trigger Particle Explosion
            const rect = speechBubble.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            createPoppingParticles(centerX, centerY);

            speechBubble.classList.add('popped');
            setTimeout(() => {
                if (speechBubble && speechBubble.parentNode) {
                    speechBubble.parentNode.removeChild(speechBubble);
                }
                speechBubble = null;
            }, 200);
        });

        // Function to create explosion particles (lines)
        function createPoppingParticles(x, y) {
            const particleCount = 6;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('pop-particle');

                // Calculate angle for 6 directions (0, 60, 120, 180, 240, 300)
                const angle = i * (360 / particleCount);

                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.setProperty('--angle', `${angle}deg`);
                // transform is now handled by CSS animation using var(--angle)

                document.body.appendChild(particle);

                // Cleanup
                setTimeout(() => {
                    particle.remove();
                }, 600);
            }
        }

        const wrapper = document.querySelector('.theme-switch-wrapper');
        if (wrapper) {
            wrapper.appendChild(speechBubble);
            // Ensure wrapper establishes a positioning context
            if (getComputedStyle(wrapper).position === 'static') {
                wrapper.style.position = 'relative';
            }
        }
    }

    function removeSpeechBubble() {
        if (speechBubble) {
            speechBubble.classList.add('hide');
            setTimeout(() => {
                if (speechBubble && speechBubble.parentNode) {
                    speechBubble.parentNode.removeChild(speechBubble);
                }
                speechBubble = null;
            }, 300);
        }
    }

    // Flag to ensure tooltip only appears once per session
    let hasSeenTooltip = false;

    // Apply theme to the document
    function applyTheme(theme) {
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            if (themeToggle) themeToggle.checked = false; // Professional = OFF
            if (modeIcon) {
                modeIcon.innerHTML = `<i class="fa-solid ${modes.light.icon}"></i>`;
                modeIcon.style.animation = 'none';
                void modeIcon.offsetWidth; // trigger reflow
                modeIcon.style.animation = 'bounceIn 0.5s ease';
            }
            // Show bubble ONLY if it hasn't been seen yet
            if (!hasSeenTooltip) {
                setTimeout(() => {
                    if (html.getAttribute('data-theme') === 'light' && !hasSeenTooltip) {
                        createSpeechBubble();
                        hasSeenTooltip = true; // Mark as seen so it doesn't return
                    }
                }, 2000);
            }

            // Force exit Drawing Mode (HUD Hidden) if active
            if (document.body.classList.contains('hud-hidden')) {
                document.body.classList.remove('hud-hidden');
                const hudToggleBtn = document.getElementById('hud-toggle');
                if (hudToggleBtn) {
                    hudToggleBtn.classList.remove('active');
                }
            }
        } else {
            html.removeAttribute('data-theme');
            if (themeToggle) themeToggle.checked = true; // Creative = ON
            removeSpeechBubble(); // Hide bubble when entering dark mode
            hasSeenTooltip = true; // Ensure it doesn't show if they started in dark and switched
            if (modeIcon) {
                modeIcon.innerHTML = `<i class="fa-solid ${modes.dark.icon}"></i>`;
                modeIcon.style.animation = 'none';
                void modeIcon.offsetWidth; // trigger reflow
                modeIcon.style.animation = 'bounceIn 0.5s ease';
            }
        }
        localStorage.setItem('theme', theme);

        // Dispatch custom event for other systems (drawing, balloons, pages)
        const event = new CustomEvent('themeChanged', { detail: { theme } });
        document.dispatchEvent(event);
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Initialize theme on page load
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // Add change event listener for the checkbox
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Removed system theme listener to decouple preference
})();
