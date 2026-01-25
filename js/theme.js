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

    // Get theme from localStorage or system preference
    function getPreferredTheme() {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }

        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to the document
    function applyTheme(theme) {
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            if (themeToggle) themeToggle.checked = true;
            if (modeIcon) {
                modeIcon.innerHTML = `<i class="fa-solid ${modes.light.icon}"></i>`;
                modeIcon.style.animation = 'none';
                void modeIcon.offsetWidth; // trigger reflow
                modeIcon.style.animation = 'bounceIn 0.5s ease';
            }
        } else {
            html.removeAttribute('data-theme');
            if (themeToggle) themeToggle.checked = false;
            if (modeIcon) {
                modeIcon.innerHTML = `<i class="fa-solid ${modes.dark.icon}"></i>`;
                modeIcon.style.animation = 'none';
                void modeIcon.offsetWidth; // trigger reflow
                modeIcon.style.animation = 'bounceIn 0.5s ease';
            }
        }
        localStorage.setItem('theme', theme);
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

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
