import * as FileSystem from "expo-file-system";
import api from "@/utils/api";

const CACHE_DIR = `${FileSystem.documentDirectory}gita-cache/`;

const ensureCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
};

const readCache = async <T>(key: string): Promise<T | null> => {
  await ensureCacheDir();
  const path = `${CACHE_DIR}${key}.json`;
  const fileInfo = await FileSystem.getInfoAsync(path);
  if (!fileInfo.exists) return null;
  const raw = await FileSystem.readAsStringAsync(path);
  return JSON.parse(raw) as T;
};

const writeCache = async (key: string, data: unknown) => {
  await ensureCacheDir();
  const path = `${CACHE_DIR}${key}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
};

export const getChapters = async () => {
  const cached = await readCache<any[]>("chapters");
  if (cached) return cached;
  const response = await api.get("/chapters");
  await writeCache("chapters", response.data);
  return response.data;
};

export const getChapter = async (chapterId: string | number) => {
  const cacheKey = `chapter-${chapterId}`;
  const cached = await readCache<any>(cacheKey);
  if (cached) return cached;
  const response = await api.get(`/chapter/${chapterId}/`);
  await writeCache(cacheKey, response.data);
  return response.data;
};

export const getSlok = async (chapterId: string | number, verseId: string | number) => {
  const cacheKey = `slok-${chapterId}-${verseId}`;
  const cached = await readCache<any>(cacheKey);
  if (cached) return cached;
  const response = await api.get(`/slok/${chapterId}/${verseId}`);
  await writeCache(cacheKey, response.data);
  return response.data;
};
