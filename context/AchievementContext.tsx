import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Achievement,
  StoredAchievement,
  UserStats,
  ALL_ACHIEVEMENTS,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
  computeUserStats,
  checkAchievementsToUnlock,
} from "@/utils/achievements";

interface AchievementContextType {
  unlockedAchievements: StoredAchievement[];
  pendingUnlock: Achievement[];
  userStats: UserStats;
  checkAndUpdate: () => Promise<void>;
  unlockSpecial: (id: string) => Promise<void>;
  clearFirstPending: () => void;
  isLoaded: boolean;
}

const defaultStats: UserStats = {
  totalVersesRead: 0,
  chaptersCompleted: 0,
  completedChapterNumbers: [],
  currentStreak: 0,
  favoritesCount: 0,
};

const AchievementContext = createContext<AchievementContextType>({
  unlockedAchievements: [],
  pendingUnlock: [],
  userStats: defaultStats,
  checkAndUpdate: async () => {},
  unlockSpecial: async () => {},
  clearFirstPending: () => {},
  isLoaded: false,
});

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<StoredAchievement[]>([]);
  const [pendingUnlock, setPendingUnlock] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load on mount — no new unlocks shown, just restore state
  useEffect(() => {
    (async () => {
      const [stored, stats] = await Promise.all([
        loadUnlockedAchievements(),
        computeUserStats(),
      ]);
      setUnlockedAchievements(stored);
      setUserStats(stats);
      setIsLoaded(true);
    })();
  }, []);

  const checkAndUpdate = async () => {
    const [stats, stored] = await Promise.all([
      computeUserStats(),
      loadUnlockedAchievements(),
    ]);
    setUserStats(stats);

    const unlockedIds = stored.map((a) => a.id);
    const newlyUnlocked = checkAchievementsToUnlock(stats, unlockedIds);

    if (newlyUnlocked.length > 0) {
      const now = new Date().toISOString();
      const newStored: StoredAchievement[] = newlyUnlocked.map((a) => ({
        id: a.id,
        unlockedAt: now,
      }));
      const updated = [...stored, ...newStored];
      await saveUnlockedAchievements(updated);
      setUnlockedAchievements(updated);
      setPendingUnlock((prev) => [...prev, ...newlyUnlocked]);
    }
  };

  const unlockSpecial = async (id: string) => {
    const stored = await loadUnlockedAchievements();
    if (stored.some((a) => a.id === id)) return; // already unlocked

    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement) return;

    const now = new Date().toISOString();
    const updated = [...stored, { id, unlockedAt: now }];
    await saveUnlockedAchievements(updated);
    setUnlockedAchievements(updated);
    setPendingUnlock((prev) => [...prev, achievement]);
  };

  const clearFirstPending = () => {
    setPendingUnlock((prev) => prev.slice(1));
  };

  return (
    <AchievementContext.Provider
      value={{
        unlockedAchievements,
        pendingUnlock,
        userStats,
        checkAndUpdate,
        unlockSpecial,
        clearFirstPending,
        isLoaded,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementContext);
}
