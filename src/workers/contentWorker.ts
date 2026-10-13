/// <reference lib="webworker" />

const parseM3U = (m3uText: string) => {
  const lines = m3uText.split('\n');
  const items = [];
  let currentItem: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentItem = { type: 'live' };
      
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);
      
      if (tvgIdMatch && tvgIdMatch[1]) currentItem.id = tvgIdMatch[1];
      if (tvgNameMatch && tvgNameMatch[1]) currentItem.title = tvgNameMatch[1];
      if (tvgLogoMatch && tvgLogoMatch[1]) currentItem.posterUrl = tvgLogoMatch[1];
      if (groupTitleMatch && groupTitleMatch[1]) currentItem.genre = [groupTitleMatch[1]];
      
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        const nameAfterComma = line.substring(commaIndex + 1).trim();
        if (nameAfterComma && !currentItem.title) {
          currentItem.title = nameAfterComma;
        }
      }
    } else if (line.startsWith('http') && currentItem) {
      currentItem.watchUrl = line;
      
      if (!currentItem.id) {
        currentItem.id = `m3u_channel_${i}_${Date.now()}`;
      }
      if (!currentItem.title) {
        currentItem.title = `Channel ${items.length + 1}`;
      }
      if (!currentItem.genre) {
        currentItem.genre = ['Live TV'];
      }
      
      items.push(currentItem);
      currentItem = null;
    }
  }
  
  return items;
};

self.onmessage = async (e: MessageEvent) => {
  const { contentUrl, maxItems } = e.data;

  try {
    let response;
    let rawData;
    
    const fetchStrategies = [
      () => fetch(contentUrl),
      () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(contentUrl)}`),
      () => fetch(`https://corsproxy.io/?${encodeURIComponent(contentUrl)}`),
      () => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(contentUrl)}`)
    ];

    let lastError: any;
    for (const strategy of fetchStrategies) {
      try {
        response = await strategy();
        if (response.ok) {
          const text = await response.text();
          try {
            rawData = JSON.parse(text);
          } catch (err) {
            if (text.trim().startsWith('#EXTM3U')) {
              rawData = parseM3U(text);
            } else {
              throw new Error("Content is neither valid JSON nor a valid M3U playlist.");
            }
          }
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!rawData) {
      throw new Error(`Failed to fetch from URL and all proxies. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    let data: any[] = [];
    if (Array.isArray(rawData)) {
      data = rawData;
    } else if (typeof rawData === 'object' && rawData !== null) {
      Object.values(rawData).forEach((val) => {
        if (Array.isArray(val)) {
          data = [...data, ...val];
        }
      });
    }

    if (maxItems > 0) {
      data = data.slice(0, maxItems);
    }

    // Send the parsed data back to the main thread
    self.postMessage({ type: 'SUCCESS', data });
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
};
