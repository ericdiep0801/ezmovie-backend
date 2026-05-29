const https = require('https');

async function searchNguonC() {
  const url = `https://api.nguonc.com/api/films/search?keyword=doraemon`;
  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    console.log("NguonC data:", data);
  } catch (e) {
    console.error("NguonC error:", e);
  }
}

searchNguonC();
