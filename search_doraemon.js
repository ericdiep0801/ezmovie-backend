const https = require('https');

async function searchDoraemon() {
  const allSlugs = new Set();
  let page = 1;
  let totalPages = 1;

  do {
    const url = `https://phimapi.com/v1/api/tim-kiem?keyword=doraemon&limit=20&page=${page}`;
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
          if (item.slug && item.slug.includes('doraemon') || item.slug.includes('doremon')) {
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

  console.log("Found slugs:", Array.from(allSlugs));
}

searchDoraemon();
