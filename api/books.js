/**
 * Consolidated API - Books
 * GET: Fetch all books
 * POST: Add/Update a book
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'GabrielBaiano/personal-library';
const GITHUB_OWNER = 'GabrielBaiano';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation, resolution=merge-duplicates'
};

const githubHeaders = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Portfolio-API'
};

async function syncToGitHub(book) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not found, skipping sync');
    return;
  }

  try {
    // 1. Update README.md
    await updateREADME(GITHUB_OWNER, GITHUB_REPO, book);

    // 2. Handle Yearly Folder and Review if Finished
    if (book.status === 'Finished') {
      await updateBookFolder(GITHUB_OWNER, GITHUB_REPO, book);
    }

    // 3. Special Recommendation Sync (Archival link)
    if (book.content && book.is_special) {
       await pushReviewFile(GITHUB_OWNER, GITHUB_REPO, book, `special_recomendations/${book.id}/review.md`);
    }

  } catch (error) {
    console.error('GitHub Sync Error:', error);
  }
}

async function updateREADME(owner, repo, book, isDelete = false) {
  const path = 'README.md';
  const { content: oldContent, sha } = await getFile(owner, repo, path);
  let content = Buffer.from(oldContent, 'base64').toString('utf-8');

  const readingStartMarker = '<!-- READING_START -->';
  const readingEndMarker = '<!-- READING_END -->';
  const finishedStartMarker = '<!-- FINISHED_START -->';
  const finishedEndMarker = '<!-- FINISHED_END -->';

  const year = new Date(book.date || new Date()).getFullYear();
  const internalLink = `./${year}/${book.id}/review.md`;
  
  // Book formatting for README
  const bookRow = `<tr><td><img src="${book.image}" width="50"></td><td>${book.title}</td><td>${book.tags?.[0] || ''}</td><td>[Review](${internalLink})</td></tr>`;

  // Remove existing entry first to avoid duplicates or to handle status change/delete
  content = content.replace(new RegExp(`<tr>.*?${book.title}.*?</tr>\\s*`, 'g'), '');

  if (!isDelete) {
    if (book.status === 'Reading') {
       content = content.replace(readingStartMarker, `${readingStartMarker}\n${bookRow}`);
    } else if (book.status === 'Finished') {
       content = content.replace(finishedStartMarker, `${finishedStartMarker}\n${bookRow}`);
    }
  }

  await updateFile(owner, repo, path, `${isDelete ? 'Remove' : 'Sync'} book: ${book.title}`, Buffer.from(content).toString('base64'), sha);
}

async function updateBookFolder(owner, repo, book) {
  const year = new Date(book.date || new Date()).getFullYear();
  const path = `${year}/${book.id}/review.md`;
  
  if (book.content) {
    await pushReviewFile(owner, repo, book, path);
  }
}

async function pushReviewFile(owner, repo, book, path) {
  let sha = null;
  try {
    const existing = await getFile(owner, repo, path);
    sha = existing.sha;
  } catch (e) {}

  await updateFile(owner, repo, path, `Update review: ${book.title}`, Buffer.from(book.content || '').toString('base64'), sha);
}

async function deleteGitHubAssets(owner, repo, book) {
  const year = new Date(book.date || new Date()).getFullYear();
  
  // 1. Remove from README
  await updateREADME(owner, repo, book, true);

  // 2. Delete Book Folder and Special Recommendation Folder
  const foldersToDelete = [
    `${year}/${book.id}`,
    `special_recomendations/${book.id}`
  ];

  for (const folderPath of foldersToDelete) {
    try {
      // List all files in the folder and delete them
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, { headers: githubHeaders });
      if (res.ok) {
          const files = await res.json();
          if (Array.isArray(files)) {
              for (const file of files) {
                  await deleteFile(owner, repo, file.path, `Cleanup book assets: ${book.title}`, file.sha);
              }
          }
      }
    } catch (e) {
      console.error(`Error cleaning up folder ${folderPath}:`, e.message);
    }
  }
}

async function getFile(owner, repo, path) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers: githubHeaders });
  if (!res.ok) throw new Error(`Failed to get file ${path}`);
  return res.json();
}

async function updateFile(owner, repo, path, message, content, sha) {
  const body = { message, content };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: githubHeaders,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to update file ${path}: ${err.message}`);
  }
}

async function deleteFile(owner, repo, path, message, sha) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: githubHeaders,
    body: JSON.stringify({ message, sha })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to delete file ${path}: ${err.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*&order=date.desc`, { headers: supabaseHeaders });
      if (!response.ok) return res.status(200).json({ success: true, data: [] });
      const data = await response.json();
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { id: manualId, title, image, status, mdLink, tags, show_in_feed, secret, date: manualDate, content, is_special } = req.body;
    if (secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!title || !image || !status) return res.status(400).json({ error: 'Missing required fields' });

    try {
      const id = manualId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const payload = {
        id, title, image, status, md_link: mdLink, tags,
        show_in_feed: show_in_feed !== false ? true : false,
        content: content || null,
        is_special: is_special === true ? true : false
      };

      if (!manualId) {
        payload.date = manualDate || new Date().toISOString();
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save book');
      }
      
      const result = await response.json();
      const savedBook = result[0];

      // Sync to GitHub async
      syncToGitHub(savedBook);

      return res.status(200).json({ success: true, message: `Book saved!`, data: savedBook });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id, secret } = req.body;
    if (secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    try {
        // 1. Get book first to know the date/title for GitHub cleanup
        const getRes = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}`, { headers: supabaseHeaders });
        const books = await getRes.json();
        const book = books[0];

        if (!book) return res.status(404).json({ error: 'Book not found' });

        // 2. Delete from Supabase
        const delRes = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}`, {
            method: 'DELETE',
            headers: supabaseHeaders
        });

        if (!delRes.ok) throw new Error('Failed to delete from database');

        // 3. Sync Delete to GitHub
        deleteGitHubAssets(GITHUB_OWNER, GITHUB_REPO, book); // Async cleanup

        return res.status(200).json({ success: true, message: 'Book deleted from portfolio. GitHub cleanup started.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
