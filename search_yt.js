const search = async () => {
    const r = await fetch('https://www.youtube.com/results?search_query=doraemon+M%C3%B3n+qu%C3%A0+l%C3%A0+chuy%E1%BA%BFn+du+l%E1%BB%8Bch+%E1%BB%9F+Vi%E1%BB%87t+Nam');
    const t = await r.text();
    const matches = [...t.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}/g)];
    const unique = new Map();
    matches.forEach(m => {
        if (!unique.has(m[1])) {
            unique.set(m[1], m[2]);
        }
    });
    console.log(Array.from(unique.entries()).slice(0, 5).map(e => `${e[0]} - ${e[1]}`).join('\n'));
};
search();
