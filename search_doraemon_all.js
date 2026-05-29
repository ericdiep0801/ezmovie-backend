const https = require('https');

async function searchKeyword(keyword) {
  const allSlugs = new Set();
  let page = 1;
  let totalPages = 1;

  do {
    const url = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=100&page=${page}`;
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });

      if (data && data.data && data.data.items) {
        data.data.items.forEach(item => {
          const name = (item.name || '').toLowerCase();
          const originName = (item.origin_name || '').toLowerCase();
          const slug = (item.slug || '').toLowerCase();

          if (slug.includes('doraemon') || slug.includes('doremon') || slug.includes('nobita') || originName.includes('doraemon') || name.includes('doraemon')) {
            allSlugs.add(item.slug);
          }
        });
        
        totalPages = data.data.params?.pagination?.totalPages || 1;
      }
      page++;
    } catch (e) {
      console.error(e);
      break;
    }
  } while (page <= totalPages);

  return allSlugs;
}

async function run() {
  const keywords = ['doraemon', 'doremon', 'nobita', 'đê khi', 'chaien'];
  const finalSlugs = new Set();

  for (const kw of keywords) {
    const slugs = await searchKeyword(kw);
    for (const slug of slugs) {
      finalSlugs.add(slug);
    }
  }

  console.log("Total unique slugs:", finalSlugs.size);
  console.log("Slugs:");
  console.log(JSON.stringify(Array.from(finalSlugs), null, 2));
}

run();
