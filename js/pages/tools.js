// Tools Page - Debug page for Balloons and System components
const ToolsPage = {
    async render() {
        // Fetch all possible balloons
        const allBalloons = await window.balloonSystem.getAllData();
        
        return `
            <div class="card tools-card">
                <h2 class="section-title">Debug: All Possible Balloons</h2>
                <p class="section-subtitle">A static view of all balloons currently in the system pool.</p>
                
                <div class="balloons-preview-grid">
                    ${allBalloons.map(data => `
                        <div class="balloon-preview-wrapper">
                            <div class="balloon-meta">
                                <strong>ID:</strong> ${data.id} | 
                                <strong>Type:</strong> ${data.type || 'standard'} |
                                <strong>Color:</strong> ${data.color || 'auto'}
                            </div>
                            <div class="balloon-container-preview">
                                ${window.balloonSystem.buildBalloonHTML(data)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="tools-actions" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                    <h3>System Actions</h3>
                    <div class="actions-group" style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="social-btn" onclick="balloonSystem.spawnRandom()">Spawn Random Balloon</button>
                        <button class="social-btn" onclick="balloonSystem.clearBalloons()">Clear All Balloons</button>
                        <button class="social-btn" onclick="location.reload()">Reset System</button>
                    </div>
                </div>
            </div>

            <style>
                .balloons-preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 30px;
                    margin-top: 25px;
                }
                .balloon-preview-wrapper {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    overflow: visible;
                }
                .balloon-meta {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-family: var(--font-mono);
                }
                .balloon-container-preview {
                    position: relative;
                    min-height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                /* Reset balloon absolute positioning for preview */
                .balloon-container-preview .floating-balloon {
                    position: relative !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                    transform: none !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important;
                    animation: none !important;
                }
                .balloon-container-preview .balloon-card {
                    margin: 0 !important;
                }
            </style>
        `;
    },

    onMount() {
        console.log('Tools Debug Page mounted');
        document.body.classList.add('wide-layout');
    },

    onUnmount() {
        document.body.classList.remove('wide-layout');
    }
};
