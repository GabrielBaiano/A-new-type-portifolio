export default async function handler(req, res) {
  try {
    const boardUrl = "https://br.pinterest.com/gabrielngama/portif%C3%B3lio_photos.rss";
    
    // Fetch the RSS feed
    const response = await fetch(boardUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pinterest RSS: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse XML using regex to avoid external dependencies
    // Pinterest RSS items look like: <item><title>...</title><description>...</description><link>...</link>...</item>
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      // Extract Title
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : 'No Title';

      // Extract Description (often contains the image html)
      const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const description = descMatch ? descMatch[1] : '';

      // Extract Image URL from description (Pinterest puts it in src attribute)
      // Example: <img src="https://i.pinimg.com/236x/..." />
      const imgMatch = description.match(/src="([^"]+)"/);
      // Convert 236x (thumbnail) to originals or 736x for better quality if possible, 
      // but usually the RSS gives 236x. We can try to replace '236x' with '736x' for better quality.
      let imageUrl = imgMatch ? imgMatch[1] : null;
      
      if (imageUrl) {
         imageUrl = imageUrl.replace('/236x/', '/736x/');
      }

      // Extract Link
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1] : '';

      if (imageUrl) {
        items.push({
          title,
          image: imageUrl,
          link,
          description: title // Use title as description for now
        });
      }
    }

    // Set Cache-Control to avoid hitting Pinterest too often (1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: items
    });

  } catch (error) {
    console.error('Pinterest Proxy Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch Pinterest data',
      details: error.message
    });
  }
}
