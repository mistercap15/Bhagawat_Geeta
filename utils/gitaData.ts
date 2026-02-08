import gitaData from "@/data/gita.json";

/* ✅ EXPORT TYPES */
export type GitaChapter = {
  chapter_number: number;
  name: string;
  transliteration: string;
  meaning: {
    en: string;
    hi: string;
  };
  summary: {
    en: string;
  };
  verses_count: number;
};

export type GitaSlok = {
  chapter: number;
  verse: number;
  slok: string;
  siva: {
    et: string;
  };
  tej: {
    ht: string;
  };
};

type GitaPayload = {
  chapters: GitaChapter[];
  sloks: Record<string, GitaSlok>;
};

const payload = gitaData as GitaPayload;

/* 📚 API FUNCTIONS */
export const getChapters = async (): Promise<GitaChapter[]> => {
  return payload.chapters;
};

export const getChapter = async (
  chapterId: string | number
): Promise<GitaChapter | null> => {
  const chapterNumber = Number(chapterId);
  return (
    payload.chapters.find(
      (chapter) => chapter.chapter_number === chapterNumber
    ) ?? null
  );
};

export const getSlok = async (
  chapterId: string | number,
  verseId: string | number
): Promise<GitaSlok | null> => {
  const key = `${chapterId}-${verseId}`;
  return payload.sloks[key] ?? null;
};
