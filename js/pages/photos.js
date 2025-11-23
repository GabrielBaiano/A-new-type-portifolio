// Photos Page Component
const PhotosPage = {
    render() {
        return `
            <div class="card photos-card">
                <h2 class="section-title">Photos</h2>
                
                <div class="photos-grid">
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 1</p>
                        </div>
                    </div>
                    
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 2</p>
                        </div>
                    </div>
                    
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 3</p>
                        </div>
                    </div>
                    
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 4</p>
                        </div>
                    </div>
                    
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 5</p>
                        </div>
                    </div>
                    
                    <div class="photo-item">
                        <div class="photo-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <p>Photo 6</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Photos page mounted');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
