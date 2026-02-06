const fs = require('fs');
const path = require('path');
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://vedicscriptures.github.io',
  timeout: 10000,
});

async function fetchAll() {
  const chaptersRes = await api.get('/chapters');
  const chapters = chaptersRes.data;
  const sloks = {};

  for (const chapter of chapters) {
    const chapterNumber = chapter.chapter_number;
    const versesCount = chapter.verses_count;

    for (let verse = 1; verse <= versesCount; verse += 1) {
      const slokRes = await api.get(`/slok/${chapterNumber}/${verse}`);
      sloks[`${chapterNumber}-${verse}`] = slokRes.data;
      if (verse % 25 === 0) {
        console.log(`Fetched chapter ${chapterNumber}, verse ${verse}/${versesCount}`);
      }
    }
  }

  return { chapters, sloks };
}

async function main() {
  const data = await fetchAll();
  const outputPath = path.join(__dirname, '..', 'data', 'gita.json');
  fs.writeFileSync(outputPath, JSON.stringify(data));
  console.log(`Saved data to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
