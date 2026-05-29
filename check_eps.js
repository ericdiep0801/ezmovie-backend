const https = require('https');

async function getDetails(slug) {
  const url = `https://phimapi.com/phim/${slug}`;
  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    if (data && data.episodes && data.episodes[0]) {
      console.log(`Slug: ${slug} - Episodes: ${data.episodes[0].server_data.length}`);
    } else {
      console.log(`Slug: ${slug} - No episodes found.`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  const slugs = [
    "doraemon-tuyen-tap-moi-nhat",
    "doraemon-doi-ban-than",
    "doraemon-nobita-va-truyen-thuyet-vua-mat-troi"
  ];
  for (const s of slugs) {
    await getDetails(s);
  }
}

run();
