const fs = require('fs');
const path = require('path');
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://vedicscriptures.github.io',
  timeout: 15000,
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await api.get(url);
    } catch (err) {
      const status = err.response?.status;

      if (attempt === retries) {
        console.error(`❌ Failed ${url} after ${retries} attempts`);
        return null;
      }

      // 503 / 429 / network → wait more
      const delay = 2000 * attempt;
      console.warn(
        `⚠️ ${url} failed (status ${status}), retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }
}

async function fetchAll() {
  const chaptersRes = await fetchWithRetry('/chapters');
  if (!chaptersRes) throw new Error('Failed to fetch chapters');

  const chapters = chaptersRes.data;
  const sloks = {};

  for (const chapter of chapters) {
    const chapterNumber = chapter.chapter_number;
    const versesCount = chapter.verses_count;

    console.log(`📘 Chapter ${chapterNumber} (${versesCount} verses)`);

    for (let verse = 1; verse <= versesCount; verse++) {
      const res = await fetchWithRetry(`/slok/${chapterNumber}/${verse}`);

      if (res) {
        sloks[`${chapterNumber}-${verse}`] = res.data;
      }

      if (verse % 25 === 0 || verse === versesCount) {
        console.log(
          `Fetched chapter ${chapterNumber}, verse ${verse}/${versesCount}`
        );
      }

      // IMPORTANT: slow down
      await sleep(500);
    }

    // Extra pause between chapters
    await sleep(3000);
  }

  return { chapters, sloks };
}

async function main() {
  const data = await fetchAll();

  const outputPath = path.join(__dirname, '..', 'data', 'gita.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Saved data to ${outputPath}`);
}

main().catch((err) => {
  console.error('🔥 Script failed:', err.message);
  process.exit(1);
});
