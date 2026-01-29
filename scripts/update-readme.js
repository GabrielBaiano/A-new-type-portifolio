const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SITE_URL = 'https://a-new-type-portifolio.vercel.app';
const README_PATH = path.join(__dirname, '..', 'README.md');

// Markers
const START_MARKER = '<!-- START_PORTFOLIO -->';
const END_MARKER = '<!-- END_PORTFOLIO -->';

// Helper to fetch JSON
function fetchData(endpoint) {
    return new Promise((resolve, reject) => {
        https.get(`${SITE_URL}${endpoint}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching portfolio data...');

    try {
        const [postsRes, photosRes, booksRes] = await Promise.all([
            fetchData('/api/feed'),
            fetchData('/api/photos'),
            fetchData('/api/books')
        ]);

        const posts = (postsRes.data || []).slice(0, 5);
        const photos = (photosRes.data || []).slice(0, 3);
        const reading = (booksRes.data || []).filter(b => b.status === "Reading");

        // Generate Markdown
        let content = `\n## 🚀 Latest Updates\n\n`;

        // Photos Grid
        if (photos.length > 0) {
            content += `<div align="center">\n`;
            photos.forEach(p => {
                content += `  <a href="${p.link || '#'}" title="${p.title}"><img src="${p.image_url}" width="180" height="180" style="object-fit: cover; border-radius: 12px; margin: 5px;" /></a>\n`;
            });
            content += `</div>\n\n`;
        }

        // Recent Posts
        content += `### 📝 Recent Thoughts\n`;
        if (posts.length > 0) {
            posts.forEach(p => {
                const date = new Date(p.date).toLocaleDateString('pt-BR');
                content += `- [${p.title}](${SITE_URL}/feed?id=${p.id}) - *${date}*\n`;
            });
        } else {
            content += `- *No thoughts shared yet.*\n`;
        }

        // Currently Reading
        if (reading.length > 0) {
            content += `\n### 📚 Currently Reading\n`;
            reading.forEach(b => {
                content += `- **${b.title}**\n`;
            });
        }

        content += `\nSee more at [My Portfolio](${SITE_URL})\n`;

        // Read and Update README
        let readme = fs.readFileSync(README_PATH, 'utf8');

        const startIndex = readme.indexOf(START_MARKER);
        const endIndex = readme.indexOf(END_MARKER);

        if (startIndex !== -1 && endIndex !== -1) {
            const newReadme = readme.substring(0, startIndex + START_MARKER.length) +
                content +
                readme.substring(endIndex);

            fs.writeFileSync(README_PATH, newReadme);
            console.log('README.md updated successfully!');
        } else {
            console.error('Markers not found in README.md');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error updating README:', error);
        process.exit(1);
    }
}

main();
