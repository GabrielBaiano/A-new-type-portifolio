// Photos Page Component
const PhotosPage = {
    render() {
        return `
            <div class="card photos-card">
                <h2 class="section-title">Photos</h2>
                
                <div id="photos-container" class="photos-masonry">
                    <!-- Loading State -->
                    <div class="loading-state">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <p>Loading inspiration...</p>
                    </div>
                </div>
            </div>
        `;
    },

    async onMount() {
        console.log('Photos page mounted');
        
        // Enable wide layout for photos page
        document.body.classList.add('wide-layout');
        
        const container = document.getElementById('photos-container');
        if (!container) return;

        try {
            const photos = await DataService.loadPhotosData();
            
            if (photos && photos.length > 0) {
                this.renderPhotos(container, photos);
            } else {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                        <i class="fa-regular fa-image" style="font-size: 3rem; color: var(--text-muted); opacity: 0.3;"></i>
                        <p style="margin-top: 1rem; color: var(--text-muted);">No photos found. Add some via the admin panel!</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error loading photos:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Failed to load photos. (${error.message})</p>
                </div>
            `;
        }
    },

    renderPhotos(container, items) {
        // Clear loading state
        container.innerHTML = '';
        
        items.forEach(item => {
            if (!item.image) return;

            const photoEl = document.createElement('div');
            photoEl.className = 'photo-item fade-in';
            
            const hasLink = item.link && item.link !== '#';
            const displayHtml = `
                <div class="photo-wrapper">
                    <img src="${item.image}" alt="${item.title || item.description || 'Photo'}" loading="lazy">
                    <div class="photo-overlay">
                        ${item.title ? `<h3 class="photo-title-display">${item.title}</h3>` : ''}
                        ${item.description ? `<p class="photo-desc">${item.description}</p>` : ''}
                        ${hasLink ? `<a href="${item.link}" target="_blank" class="photo-link-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                    </div>
                </div>
            `;

            photoEl.innerHTML = displayHtml;
            
            // Interaction
            photoEl.style.cursor = 'pointer';
            photoEl.addEventListener('click', (e) => {
                // Allow clicking external link icon without initiating router navigation
                if (e.target.closest('.photo-link-icon')) return;
                
                if (item.id) {
                    router.navigate(`detail/feed/${item.id}`);
                }
            });
            
            container.appendChild(photoEl);
        });
    },

    onUnmount() {
        // Remove wide layout when leaving photos page
        document.body.classList.remove('wide-layout');
    }
};
