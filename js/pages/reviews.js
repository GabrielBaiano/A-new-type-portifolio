/**
 * Reviews Page Component
 * Renders the "Acrylic Bookshelf" for Full Reviews
 */

const ReviewsPage = {
    allShelves: [],

    async render() {
        try {
            const data = await DataService.loadReviewsData();
            this.allShelves = data.shelves || [];
        } catch (error) {
            console.error('[Reviews] Error loading data:', error);
            this.allShelves = [];
        }

        return `
            <div class="card detail-card reviews-card-theme">
                <a href="#/feed" class="back-button">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </a>

                <div class="detail-header">
                    <h1 class="detail-title">Full Reviews</h1>
                    <p class="detail-subtitle">In-depth analysis and technical breakdowns of influential books and papers.</p>
                </div>

                <div class="shelves-container">
                    ${this.allShelves.map(shelf => this.renderShelf(shelf)).join('')}
                </div>
            </div>
        `;
    },

    renderShelf(shelf) {
        return `
            <div class="shelf-section">
                <div class="shelf-header">
                    <h2 class="shelf-category">${shelf.category}</h2>
                    <span class="shelf-count">${shelf.books.length} books <i class="fa-solid fa-chevron-right"></i></span>
                </div>
                
                <div class="acrylic-shelf-wrapper">
                    <!-- Books Container -->
                    <div class="books-track">
                        ${shelf.books.map(book => `
                            <div class="book-item">
                                <img src="${book.image}" alt="${book.title}" class="book-cover">
                            </div>
                        `).join('')}
                        <!-- Spacer for scrolling -->
                        <div style="min-width: 20px;"></div>
                    </div>

                    <!-- Acrylic Barrier Overlay -->
                    <div class="acrylic-barrier ${shelf.color}-tint">
                        <div class="screw-head left"></div>
                        <div class="screw-head right"></div>
                    </div>
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('[Reviews] Page mounted');
        document.body.classList.add('wide-layout');
    },

    onUnmount() {
        console.log('[Reviews] Page unmounted');
        document.body.classList.remove('wide-layout');
    }
};

window.ReviewsPage = ReviewsPage;
