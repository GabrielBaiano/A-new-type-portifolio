/**
 * Consolidated API - Pinterest Proxy
 * GET: Fetch Pinterest RSS and parse
 */

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const boardUrl = "https://br.pinterest.com/gabrielngama/portif%C3%B3lio_photos.rss";
      const response = await fetch(boardUrl);
      if (!response.ok) throw new Error(`Pinterest fetch failed`);
      const xmlText = await response.text();
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const content = match[1];
        const title = (content.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'No Title';
        const description = (content.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
        const imgMatch = description.match(/src="([^"]+)"/);
        let imageUrl = imgMatch ? imgMatch[1] : null;
        if (imageUrl) imageUrl = imageUrl.replace('/236x/', '/736x/');
        const link = (content.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
        if (imageUrl) items.push({ title, image: imageUrl, link, description: title });
      }
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
       return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
