// Theme Management Script
(function() {
    'use strict';

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const html = document.documentElement;

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
            // Show sun icon when in light theme
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            html.removeAttribute('data-theme');
            // Show moon icon when in dark theme
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
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

    // Add click event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();
