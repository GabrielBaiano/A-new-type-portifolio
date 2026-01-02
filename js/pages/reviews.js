/**
 * Reviews Page Component
 * Renders the "Acrylic Bookshelf" for Full Reviews
 */

const ReviewsPage = {
    allShelves: [],
    flatReviews: [],

    async render() {
        try {
            const data = await DataService.loadReviewsData();
            this.allShelves = data.shelves || [];
            this.flatReviews = data.reviews || []; // Restoring all reviews
        } catch (error) {
            console.error('[Reviews] Error loading data:', error);
            this.allShelves = [];
            this.flatReviews = [];
        }

        // Group books by category
        const categorized = this.groupReviews(this.flatReviews);
        
        // Determine what to show
        let contentHtml = '';
        
        if (Object.keys(categorized).length > 0) {
            contentHtml += Object.entries(categorized).map(([cat, books]) => `
                <div class="reviews-section-title">
                    <i class="fa-solid ${cat === 'Reading' ? 'fa-glasses' : 'fa-bookmark'}"></i> ${cat}
                </div>
                <div class="books-grid">
                    ${books.map(book => this.renderBookCard(book)).join('')}
                </div>
            `).join('');
        } else if (this.allShelves.length === 0) {
            contentHtml = `<div class="empty-state">No reviews found yet.</div>`;
        }

        // 2. Render Legacy/Manual Shelves if they exist
        if (this.allShelves.length > 0) {
            contentHtml += `
                <div class="reviews-section-title" style="margin-top: 3rem;">
                    <i class="fa-solid fa-layer-group"></i> Collections
                </div>
                <div class="shelves-container">
                    ${this.allShelves.map(shelf => this.renderShelf(shelf)).join('')}
                </div>
            `;
        }

        return `
            <div class="card detail-card reviews-card-theme">
                <a href="#/feed" class="back-button">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </a>

                <div class="detail-header">
                    <h1 class="detail-title">Full Reviews</h1>
                    <p class="detail-subtitle">In-depth analysis and categorized thoughts on my library.</p>
                </div>

                <div class="reviews-content-wrapper">
                    ${contentHtml}
                </div>
            </div>
        `;
    },

    groupReviews(reviews) {
        const categories = {};
        
        reviews.forEach(book => {
            if (book.status === 'Reading') {
                if (!categories['Reading']) categories['Reading'] = [];
                categories['Reading'].push(book);
            } else {
                // Use first tag as category, or 'Other'
                const cat = (book.tags && book.tags.length > 0) ? book.tags[0] : 'Reviews';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(book);
            }
        });

        return categories;
    },

    renderBookCard(book) {
        const isReading = book.status === 'Reading';
        return `
            <a href="${book.link}" target="_blank" class="book-grid-item" title="${book.title}">
                <div class="book-cover-container">
                    <img src="${book.image}" alt="${book.title}" class="book-cover-img" loading="lazy">
                    <div class="book-status-badge ${isReading ? 'reading' : 'finished'}">
                        ${isReading ? '<i class="fa-solid fa-glasses"></i>' : '<i class="fa-solid fa-check"></i>'}
                    </div>
                </div>
                <div class="book-info">
                    <h3 class="book-title-text">${book.title}</h3>
                    <span class="book-status-text">${book.status}</span>
                </div>
            </a>
        `;
    },

    renderShelf(shelf) {
        return `
            <div class="shelf-section">
                <div class="shelf-header">
                    <h2 class="shelf-category">${shelf.category}</h2>
                    <span class="shelf-count">${shelf.books.length} books</span>
                </div>
                
                <div class="acrylic-shelf-wrapper">
                    <div class="books-track">
                        ${shelf.books.map(book => `
                            <div class="book-item">
                                <img src="${book.image}" alt="${book.title}" class="book-cover">
                            </div>
                        `).join('')}
                    </div>
                    <div class="acrylic-barrier ${shelf.color}-tint"></div>
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
