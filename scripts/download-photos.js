const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const RSS_URL = "https://br.pinterest.com/gabrielngama/portif%C3%B3lio_photos.rss";
const OUTPUT_DIR = path.join(__dirname, '../assets/photos');
const DATA_FILE = path.join(__dirname, '../data/photos.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Function to download a file
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(dest));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {}); // Delete partial file
            reject(err);
        });
    });
};

// Main function
async function main() {
    console.log(`Fetching RSS feed from: ${RSS_URL}`);
    
    // 1. Fetch RSS Feed
    const rssContent = await new Promise((resolve, reject) => {
        https.get(RSS_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });

    // 2. Simple Regex Parse (to avoid heavy xml deps)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(rssContent)) !== null) {
        const itemContent = match[1];
        
        // Extract Title
        const titleMatch = itemContent.match(/<title>([^<]*)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'No Title';

        // Extract Description for Image
        const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
        if (descMatch) {
            const imgMatch = descMatch[1].match(/src="([^"]+)"/);
            if (imgMatch) {
                let imageUrl = imgMatch[1];
                // Upgrade quality
                imageUrl = imageUrl.replace(/\/236x\//, '/736x/');
                items.push({ title, imageUrl });
            }
        }
    }

    console.log(`Found ${items.length} images.`);

    // 3. Download Images
    const downloadedItems = [];
    
    for (const [index, item] of items.entries()) {
        const ext = path.extname(item.imageUrl) || '.jpg';
        const filename = `photo-${index + 1}${ext}`;
        const localPath = path.join(OUTPUT_DIR, filename);
        const relativePath = `assets/photos/${filename}`;

        console.log(`Downloading (${index + 1}/${items.length}): ${item.imageUrl}`);
        
        try {
            await downloadFile(item.imageUrl, localPath);
            downloadedItems.push({
                id: `photo-${index + 1}`,
                title: item.title,
                image: relativePath, // Verify this path relative to index.html
                originalUrl: item.imageUrl
            });
        } catch (error) {
            console.error(`Error downloading ${item.imageUrl}:`, error.message);
        }
    }

    // 4. Save JSON Data
    fs.writeFileSync(DATA_FILE, JSON.stringify(downloadedItems, null, 2));
    console.log(`\nSuccess! Saved ${downloadedItems.length} photos to local cache.`);
    console.log(`Data file created at: ${DATA_FILE}`);
}

main().catch(console.error);
