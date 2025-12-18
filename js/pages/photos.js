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
        const container = document.getElementById('photos-container');
        if (!container) return;

        try {
            // Using a public CORS proxy to fetch RSS directly from client-side
            // This works locally without needing to run a backend server
            const feedUrl = "https://br.pinterest.com/gabrielngama/portif%C3%B3lio_photos.rss";
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (!data.contents) throw new Error('No content received from proxy');

            // Parse XML in the browser
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xmlDoc.querySelectorAll("item"));

            if (items.length > 0) {
                const parsedItems = items.map(item => {
                    const title = item.querySelector("title")?.textContent || "No Title";
                    const description = item.querySelector("description")?.textContent || "";
                    const link = item.querySelector("link")?.textContent || "#";
                    
                    // Extract image from description
                    const imgMatch = description.match(/src="([^"]+)"/);
                    let imageUrl = imgMatch ? imgMatch[1] : null;
                    
                    // Try to get higher quality image
                    if (imageUrl) {
                        // Pinterest image URLs often follow a pattern like:
                        // https://i.pinimg.com/236x/path/to/image.jpg
                        // We want to replace '236x' with 'originals' or '736x'
                        
                        // First try to replace the size segment with 'originals' (highest quality)
                        // Note: Sometiomes 'originals' might be a different file type, so '736x' is safer for general use 
                        // matching the feed's original file type.
                        imageUrl = imageUrl.replace(/\/236x\//, '/736x/');
                    }

                    return { title, image: imageUrl, link };
                }).filter(i => i.image); // Only keep items with images

                this.renderPhotos(container, parsedItems);
            } else {
                container.innerHTML = `
                    <div class="error-state">
                        <i class="fa-regular fa-image"></i>
                        <p>No photos found at the moment.</p>
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
            
            // Layout: Image only, pure waterfall
            photoEl.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            `;
            
            container.appendChild(photoEl);
        });
    },

    onUnmount() {
        // Cleanup if necessary
    }
};
