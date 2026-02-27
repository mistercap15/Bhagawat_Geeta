import AsyncStorage from "@react-native-async-storage/async-storage";

export type AchievementCategory = "reading" | "chapters" | "streak" | "special";

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: AchievementCategory;
}

export interface StoredAchievement {
  id: string;
  unlockedAt: string; // ISO date string
}

export interface UserStats {
  totalVersesRead: number;
  chaptersCompleted: number;
  completedChapterNumbers: number[];
  currentStreak: number;
  favoritesCount: number;
}

export const CHAPTER_VERSE_COUNT: Record<number, number> = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28,
  9: 34, 10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20,
  16: 24, 17: 28, 18: 78,
};

export const RANK_LEVELS = [
  { minVerses: 0,   title: "Novice",         titleHi: "नवदीक्षित",  emoji: "🌱", color: "#78A84D" },
  { minVerses: 11,  title: "Curious Seeker", titleHi: "जिज्ञासु",   emoji: "📖", color: "#4D8BA8" },
  { minVerses: 51,  title: "Seeker",         titleHi: "साधक",       emoji: "🔍", color: "#8B4DA8" },
  { minVerses: 101, title: "Devotee",        titleHi: "भक्त",       emoji: "🙏", color: "#D97706" },
  { minVerses: 201, title: "Yogi",           titleHi: "योगी",       emoji: "🧘", color: "#E91E63" },
  { minVerses: 351, title: "Wisdom Seeker",  titleHi: "ज्ञानी",     emoji: "💡", color: "#3B82F6" },
  { minVerses: 501, title: "Enlightened",    titleHi: "महात्मा",    emoji: "✨", color: "#F59E0B" },
];

export function getUserRank(totalVerses: number) {
  let rank = RANK_LEVELS[0];
  for (const level of RANK_LEVELS) {
    if (totalVerses >= level.minVerses) rank = level;
  }
  return rank;
}

export function getNextRank(totalVerses: number) {
  for (let i = 0; i < RANK_LEVELS.length; i++) {
    if (totalVerses < RANK_LEVELS[i].minVerses) return RANK_LEVELS[i];
  }
  return null; // maxed out
}

export function getRankProgress(totalVerses: number): number {
  const current = getUserRank(totalVerses);
  const next = getNextRank(totalVerses);
  if (!next) return 1;
  const range = next.minVerses - current.minVerses;
  const done = totalVerses - current.minVerses;
  return Math.min(done / range, 1);
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ─── Reading milestones ───────────────────────────────────────────
  {
    id: "first_verse",
    emoji: "🌱",
    title: "First Step",
    titleHi: "पहला कदम",
    description: "Read your very first verse",
    descriptionHi: "पहला श्लोक पढ़ा",
    category: "reading",
  },
  {
    id: "ten_verses",
    emoji: "📖",
    title: "Devoted Reader",
    titleHi: "समर्पित पाठक",
    description: "Read 10 verses",
    descriptionHi: "10 श्लोक पढ़े",
    category: "reading",
  },
  {
    id: "fifty_verses",
    emoji: "🌿",
    title: "Growing Seeker",
    titleHi: "उभरता साधक",
    description: "Read 50 verses",
    descriptionHi: "50 श्लोक पढ़े",
    category: "reading",
  },
  {
    id: "hundred_verses",
    emoji: "🌟",
    title: "Knowledge Seeker",
    titleHi: "ज्ञान की खोज",
    description: "Read 100 verses",
    descriptionHi: "100 श्लोक पढ़े",
    category: "reading",
  },
  {
    id: "two_fifty_verses",
    emoji: "💫",
    title: "Verse Wanderer",
    titleHi: "श्लोक यात्री",
    description: "Read 250 verses",
    descriptionHi: "250 श्लोक पढ़े",
    category: "reading",
  },
  {
    id: "all_verses",
    emoji: "🏆",
    title: "Gita Scholar",
    titleHi: "गीता विद्वान",
    description: "Read all 700 verses",
    descriptionHi: "सभी 700 श्लोक पढ़े",
    category: "reading",
  },

  // ─── Chapter completions ──────────────────────────────────────────
  {
    id: "chapter_1_done",
    emoji: "⚔️",
    title: "Arjuna's Courage",
    titleHi: "अर्जुन का साहस",
    description: "Complete Chapter 1: Arjuna's Dilemma",
    descriptionHi: "अध्याय 1 पूर्ण: अर्जुन विषाद योग",
    category: "chapters",
  },
  {
    id: "chapter_3_done",
    emoji: "🔄",
    title: "Karma Yogi",
    titleHi: "कर्म योगी",
    description: "Complete Chapter 3: Karma Yoga",
    descriptionHi: "अध्याय 3 पूर्ण: कर्म योग",
    category: "chapters",
  },
  {
    id: "chapter_6_done",
    emoji: "🧘",
    title: "Meditator",
    titleHi: "ध्यानी",
    description: "Complete Chapter 6: Dhyana Yoga",
    descriptionHi: "अध्याय 6 पूर्ण: ध्यान योग",
    category: "chapters",
  },
  {
    id: "chapter_12_done",
    emoji: "🙏",
    title: "True Devotee",
    titleHi: "सच्चा भक्त",
    description: "Complete Chapter 12: Bhakti Yoga",
    descriptionHi: "अध्याय 12 पूर्ण: भक्ति योग",
    category: "chapters",
  },
  {
    id: "chapter_18_done",
    emoji: "🕉️",
    title: "Liberated",
    titleHi: "मुक्त",
    description: "Complete Chapter 18: Moksha Yoga",
    descriptionHi: "अध्याय 18 पूर्ण: मोक्ष संन्यास योग",
    category: "chapters",
  },
  {
    id: "first_chapter",
    emoji: "🎯",
    title: "Chapter Conqueror",
    titleHi: "अध्याय विजेता",
    description: "Complete your first chapter",
    descriptionHi: "पहला अध्याय पूर्ण किया",
    category: "chapters",
  },
  {
    id: "five_chapters",
    emoji: "🌺",
    title: "Path Walker",
    titleHi: "पथ यात्री",
    description: "Complete 5 chapters",
    descriptionHi: "5 अध्याय पूर्ण किए",
    category: "chapters",
  },
  {
    id: "ten_chapters",
    emoji: "👑",
    title: "Dharma Warrior",
    titleHi: "धर्म योद्धा",
    description: "Complete 10 chapters",
    descriptionHi: "10 अध्याय पूर्ण किए",
    category: "chapters",
  },
  {
    id: "all_chapters",
    emoji: "✨",
    title: "Enlightened Soul",
    titleHi: "प्रबुद्ध आत्मा",
    description: "Complete all 18 chapters",
    descriptionHi: "सभी 18 अध्याय पूर्ण किए",
    category: "chapters",
  },

  // ─── Streak achievements ──────────────────────────────────────────
  {
    id: "streak_3",
    emoji: "🔥",
    title: "Spark of Devotion",
    titleHi: "भक्ति की चिंगारी",
    description: "3-day reading streak",
    descriptionHi: "3 दिन की श्रृंखला",
    category: "streak",
  },
  {
    id: "streak_7",
    emoji: "💪",
    title: "Warrior Spirit",
    titleHi: "योद्धा भावना",
    description: "7-day reading streak",
    descriptionHi: "7 दिन की श्रृंखला",
    category: "streak",
  },
  {
    id: "streak_14",
    emoji: "🌙",
    title: "Moon Seeker",
    titleHi: "चंद्र साधक",
    description: "14-day reading streak",
    descriptionHi: "14 दिन की श्रृंखला",
    category: "streak",
  },
  {
    id: "streak_30",
    emoji: "☀️",
    title: "Sun Devotee",
    titleHi: "सूर्य भक्त",
    description: "30-day reading streak",
    descriptionHi: "30 दिन की श्रृंखला",
    category: "streak",
  },

  // ─── Special achievements ─────────────────────────────────────────
  {
    id: "five_favorites",
    emoji: "❤️",
    title: "Heart Full",
    titleHi: "दिल भरा",
    description: "Save 5 favorite verses",
    descriptionHi: "5 पसंदीदा श्लोक सहेजे",
    category: "special",
  },
  {
    id: "twenty_favorites",
    emoji: "💝",
    title: "Verse Keeper",
    titleHi: "श्लोक संग्रहक",
    description: "Save 20 favorite verses",
    descriptionHi: "20 पसंदीदा श्लोक सहेजे",
    category: "special",
  },
  {
    id: "dawn_reader",
    emoji: "🌅",
    title: "Dawn Seeker",
    titleHi: "उषा साधक",
    description: "Read a verse before 6 AM",
    descriptionHi: "सुबह 6 बजे से पहले पढ़ा",
    category: "special",
  },
  {
    id: "night_scholar",
    emoji: "🦉",
    title: "Night Scholar",
    titleHi: "रात्रि विद्वान",
    description: "Read a verse after 10 PM",
    descriptionHi: "रात 10 बजे के बाद पढ़ा",
    category: "special",
  },
];

const ACHIEVEMENTS_STORAGE_KEY = "achievements_unlocked_v1";

export async function loadUnlockedAchievements(): Promise<StoredAchievement[]> {
  try {
    const raw = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUnlockedAchievements(
  achievements: StoredAchievement[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      ACHIEVEMENTS_STORAGE_KEY,
      JSON.stringify(achievements)
    );
  } catch {
    // silently fail
  }
}

export async function computeUserStats(): Promise<UserStats> {
  try {
    // Batch all 18 chapter reads + daily log in a single multiGet call
    const chapterKeys = Array.from({ length: 18 }, (_, i) => `read_chapter_${i + 1}`);
    const batchKeys = [...chapterKeys, "daily_read_log"];
    const results = await AsyncStorage.multiGet(batchKeys);

    let totalVersesRead = 0;
    const completedChapterNumbers: number[] = [];

    for (let i = 0; i < 18; i++) {
      const [, value] = results[i];
      const readVerses: number[] = value ? JSON.parse(value) : [];
      totalVersesRead += readVerses.length;
      if (readVerses.length >= CHAPTER_VERSE_COUNT[i + 1]) {
        completedChapterNumbers.push(i + 1);
      }
    }

    // Compute streak: consecutive days with at least 1 verse read
    const [, logStored] = results[18];
    const log: Record<string, any[]> = logStored ? JSON.parse(logStored) : {};
    let currentStreak = 0;
    const checkDate = new Date();
    // If today has no reads yet, start counting from yesterday
    const todayKey = checkDate.toISOString().split("T")[0];
    if (!log[todayKey] || log[todayKey].length === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const key = checkDate.toISOString().split("T")[0];
      if (log[key] && log[key].length > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Count favorites — batch all favorite key reads in one multiGet
    const allKeys = await AsyncStorage.getAllKeys();
    const favoriteKeys = (allKeys as string[]).filter((k) =>
      k.startsWith("favorite_verse_")
    );
    let favoritesCount = 0;
    if (favoriteKeys.length > 0) {
      const favResults = await AsyncStorage.multiGet(favoriteKeys);
      favoritesCount = favResults.filter(([, v]) => v === "true").length;
    }

    return {
      totalVersesRead,
      chaptersCompleted: completedChapterNumbers.length,
      completedChapterNumbers,
      currentStreak,
      favoritesCount,
    };
  } catch {
    return {
      totalVersesRead: 0,
      chaptersCompleted: 0,
      completedChapterNumbers: [],
      currentStreak: 0,
      favoritesCount: 0,
    };
  }
}

export function checkAchievementsToUnlock(
  stats: UserStats,
  alreadyUnlockedIds: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (alreadyUnlockedIds.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.id) {
      case "first_verse":       shouldUnlock = stats.totalVersesRead >= 1; break;
      case "ten_verses":        shouldUnlock = stats.totalVersesRead >= 10; break;
      case "fifty_verses":      shouldUnlock = stats.totalVersesRead >= 50; break;
      case "hundred_verses":    shouldUnlock = stats.totalVersesRead >= 100; break;
      case "two_fifty_verses":  shouldUnlock = stats.totalVersesRead >= 250; break;
      case "all_verses":        shouldUnlock = stats.totalVersesRead >= 700; break;

      case "first_chapter": shouldUnlock = stats.chaptersCompleted >= 1; break;
      case "five_chapters":  shouldUnlock = stats.chaptersCompleted >= 5; break;
      case "ten_chapters":   shouldUnlock = stats.chaptersCompleted >= 10; break;
      case "all_chapters":   shouldUnlock = stats.chaptersCompleted >= 18; break;

      case "chapter_1_done":  shouldUnlock = stats.completedChapterNumbers.includes(1); break;
      case "chapter_3_done":  shouldUnlock = stats.completedChapterNumbers.includes(3); break;
      case "chapter_6_done":  shouldUnlock = stats.completedChapterNumbers.includes(6); break;
      case "chapter_12_done": shouldUnlock = stats.completedChapterNumbers.includes(12); break;
      case "chapter_18_done": shouldUnlock = stats.completedChapterNumbers.includes(18); break;

      case "streak_3":  shouldUnlock = stats.currentStreak >= 3; break;
      case "streak_7":  shouldUnlock = stats.currentStreak >= 7; break;
      case "streak_14": shouldUnlock = stats.currentStreak >= 14; break;
      case "streak_30": shouldUnlock = stats.currentStreak >= 30; break;

      case "five_favorites":   shouldUnlock = stats.favoritesCount >= 5; break;
      case "twenty_favorites": shouldUnlock = stats.favoritesCount >= 20; break;
      // dawn_reader and night_scholar are triggered separately (time-based)
    }

    if (shouldUnlock) newlyUnlocked.push(achievement);
  }

  return newlyUnlocked;
}
