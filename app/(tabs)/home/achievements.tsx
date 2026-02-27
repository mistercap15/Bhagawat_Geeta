import React, { useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { ChevronLeft, Trophy, Flame, BookOpen, Heart } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useAchievements } from "@/context/AchievementContext";
import { useTranslation } from "@/utils/translations";
import {
  ALL_ACHIEVEMENTS,
  RANK_LEVELS,
  getUserRank,
  getNextRank,
  getRankProgress,
  AchievementCategory,
} from "@/utils/achievements";

const CATEGORY_META: Record<AchievementCategory, { label: string; labelHi: string; icon: string }> = {
  reading: { label: "Reading Milestones", labelHi: "पठन उपलब्धियां", icon: "📖" },
  chapters: { label: "Chapter Mastery", labelHi: "अध्याय महारत", icon: "📜" },
  streak: { label: "Streak & Consistency", labelHi: "निरंतरता", icon: "🔥" },
  special: { label: "Special Badges", labelHi: "विशेष बैज", icon: "⭐" },
};

const CATEGORY_ORDER: AchievementCategory[] = ["reading", "chapters", "streak", "special"];

function StatCard({
  icon,
  value,
  label,
  color,
  isDarkMode,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  isDarkMode: boolean;
}) {
  const c = {
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
  };
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: color + "22" }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.sub }]}>{label}</Text>
    </View>
  );
}

function BadgeTile({
  achievement,
  unlocked,
  unlockedAt,
  isDarkMode,
  language,
}: {
  achievement: (typeof ALL_ACHIEVEMENTS)[0];
  unlocked: boolean;
  unlockedAt: string | null;
  isDarkMode: boolean;
  language: "en" | "hi";
}) {
  const card = isDarkMode ? "#2B2930" : "#FFFDF9";
  const border = isDarkMode ? "#4A4458" : "#E8D5C4";
  const text = isDarkMode ? "#E8DEF8" : "#3E2723";
  const sub = isDarkMode ? "#CAC4D0" : "#625B71";
  const title = language === "hi" ? achievement.titleHi : achievement.title;
  const desc = language === "hi" ? achievement.descriptionHi : achievement.description;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: unlocked ? card : isDarkMode ? "#1E1C22" : "#F5F0EC",
          borderColor: unlocked ? "#D97706" : border,
          borderWidth: unlocked ? 1.5 : 1,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
    >
      {/* Golden glow ring when unlocked */}
      {unlocked && (
        <LinearGradient
          colors={["#F59E0B22", "#D9770622", "#F59E0B00"]}
          style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
        />
      )}
      <Text style={[styles.badgeEmoji, { opacity: unlocked ? 1 : 0.4 }]}>
        {achievement.emoji}
      </Text>
      <Text
        style={[styles.badgeTitle, { color: unlocked ? (isDarkMode ? "#F59E0B" : "#8A4D24") : sub }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text style={[styles.badgeDesc, { color: sub }]} numberOfLines={2}>
        {desc}
      </Text>
      {unlocked && unlockedAt && (
        <View style={styles.unlockedDateRow}>
          <Text style={styles.unlockedCheck}>✓</Text>
        </View>
      )}
      {!unlocked && (
        <View style={styles.lockIndicator}>
          <Text style={{ fontSize: 10, color: sub }}>🔒</Text>
        </View>
      )}
    </View>
  );
}

export default function AchievementsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const t = useTranslation();
  const { userStats, unlockedAchievements, checkAndUpdate } = useAchievements();
  const language = t.meaningKey === "en" ? "en" : "hi";

  // Refresh stats when screen focused
  useFocusEffect(
    useCallback(() => {
      checkAndUpdate();
    }, [])
  );

  const { totalVersesRead, chaptersCompleted, currentStreak, favoritesCount } = userStats;
  const unlockedIds = unlockedAchievements.map((a) => a.id);
  const unlockedCount = unlockedIds.length;

  const currentRank = getUserRank(totalVersesRead);
  const nextRank = getNextRank(totalVersesRead);
  const rankProgress = getRankProgress(totalVersesRead);

  const c = {
    bg: isDarkMode ? "#1C1B1F" : "#FFF8F1",
    card: isDarkMode ? "#2B2930" : "#FFFDF9",
    text: isDarkMode ? "#E8DEF8" : "#3E2723",
    sub: isDarkMode ? "#CAC4D0" : "#625B71",
    border: isDarkMode ? "#4A4458" : "#E8D5C4",
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#1C1B1F", "#2B2930"] : ["#FFF8F1", "#FFEAD7"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color={c.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.pageTitle, { color: c.text }]}>
              {language === "hi" ? "उपलब्धियां" : "My Journey"}
            </Text>
            <Text style={[styles.pageSub, { color: c.sub }]}>
              {unlockedCount}/{ALL_ACHIEVEMENTS.length}{" "}
              {language === "hi" ? "बैज अर्जित" : "badges earned"}
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </Animated.View>

        {/* ── Rank Card ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <LinearGradient
            colors={isDarkMode ? ["#3A2E1E", "#2B2930"] : ["#FFF1E6", "#FFFDF9"]}
            style={[styles.rankCard, { borderColor: "#D97706" + "55" }]}
          >
            <LinearGradient
              colors={["#8A4D24", "#D97706", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rankTopBar}
            />
            <View style={styles.rankBody}>
              {/* Rank info */}
              <View style={styles.rankLeft}>
                <Text style={styles.rankEmojiLarge}>{currentRank.emoji}</Text>
                <View>
                  <Text style={[styles.rankLabelSmall, { color: c.sub }]}>
                    {language === "hi" ? "वर्तमान स्तर" : "Current Rank"}
                  </Text>
                  <Text style={[styles.rankTitle, { color: currentRank.color }]}>
                    {language === "hi" ? currentRank.titleHi : currentRank.title}
                  </Text>
                  <Text style={[styles.rankVerses, { color: c.sub }]}>
                    {totalVersesRead}{" "}
                    {language === "hi" ? "श्लोक पढ़े" : "verses read"}
                  </Text>
                </View>
              </View>

              {/* All rank dots */}
              <View style={styles.rankDotsCol}>
                {RANK_LEVELS.map((r, i) => {
                  const achieved = totalVersesRead >= r.minVerses;
                  return (
                    <View key={i} style={styles.rankDot}>
                      <Text style={{ fontSize: 12, opacity: achieved ? 1 : 0.25 }}>
                        {r.emoji}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Progress to next rank */}
            {nextRank && (
              <View style={styles.rankProgressWrap}>
                <View style={styles.rankProgressRow}>
                  <Text style={[styles.rankProgressLabel, { color: c.sub }]}>
                    {language === "hi" ? "अगला:" : "Next:"}{" "}
                    <Text style={{ color: nextRank.color, fontWeight: "700" }}>
                      {nextRank.emoji} {language === "hi" ? nextRank.titleHi : nextRank.title}
                    </Text>
                  </Text>
                  <Text style={[styles.rankProgressLabel, { color: c.sub }]}>
                    {nextRank.minVerses - totalVersesRead}{" "}
                    {language === "hi" ? "और श्लोक" : "verses to go"}
                  </Text>
                </View>
                <View style={[styles.rankTrack, { backgroundColor: isDarkMode ? "#3A3444" : "#F0E8E0" }]}>
                  <LinearGradient
                    colors={["#8A4D24", "#D97706", "#F59E0B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.rankFill, { width: `${Math.round(rankProgress * 100)}%` }]}
                  />
                </View>
              </View>
            )}

            {!nextRank && (
              <View style={styles.rankProgressWrap}>
                <Text style={[styles.rankProgressLabel, { color: "#F59E0B", fontWeight: "700" }]}>
                  ✨ {language === "hi" ? "आपने सर्वोच्च स्तर प्राप्त किया!" : "Maximum rank achieved!"}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Grid ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)} style={styles.statsGrid}>
          <StatCard
            icon={<BookOpen size={18} color="#E8913A" />}
            value={totalVersesRead}
            label={language === "hi" ? "श्लोक पढ़े" : "Verses Read"}
            color="#E8913A"
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={<Trophy size={18} color="#22C55E" />}
            value={chaptersCompleted}
            label={language === "hi" ? "अध्याय पूर्ण" : "Chapters Done"}
            color="#22C55E"
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={<Flame size={18} color="#EF4444" />}
            value={currentStreak}
            label={language === "hi" ? "दिन की श्रृंखला" : "Day Streak"}
            color="#EF4444"
            isDarkMode={isDarkMode}
          />
          <StatCard
            icon={<Heart size={18} color="#EC4899" />}
            value={favoritesCount}
            label={language === "hi" ? "पसंदीदा" : "Favorites"}
            color="#EC4899"
            isDarkMode={isDarkMode}
          />
        </Animated.View>

        {/* ── Achievement Categories ── */}
        {CATEGORY_ORDER.map((cat, catIdx) => {
          const meta = CATEGORY_META[cat];
          const achievements = ALL_ACHIEVEMENTS.filter((a) => a.category === cat);
          const catUnlocked = achievements.filter((a) => unlockedIds.includes(a.id)).length;

          return (
            <Animated.View
              key={cat}
              entering={FadeInDown.duration(400).delay(180 + catIdx * 60)}
              style={styles.categorySection}
            >
              {/* Category header */}
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{meta.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.categoryTitle, { color: c.text }]}>
                    {language === "hi" ? meta.labelHi : meta.label}
                  </Text>
                </View>
                <View style={[styles.categoryBadgeCount, { backgroundColor: isDarkMode ? "#3A3444" : "#FFF1E6" }]}>
                  <Text style={[styles.categoryBadgeCountText, { color: "#D97706" }]}>
                    {catUnlocked}/{achievements.length}
                  </Text>
                </View>
              </View>

              {/* Badge grid */}
              <View style={styles.badgeGrid}>
                {achievements.map((achievement) => {
                  const storedAch = unlockedAchievements.find((a) => a.id === achievement.id);
                  return (
                    <BadgeTile
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={!!storedAch}
                      unlockedAt={storedAch?.unlockedAt ?? null}
                      isDarkMode={isDarkMode}
                      language={language}
                    />
                  );
                })}
              </View>
            </Animated.View>
          );
        })}

        {/* ── Bottom note ── */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.bottomNote}>
          <Text style={[styles.bottomNoteText, { color: c.sub }]}>
            {language === "hi"
              ? "पढ़ते रहें, बैज अर्जित करते रहें 🙏"
              : "Keep reading to unlock more badges 🙏"}
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, paddingHorizontal: 20, paddingTop: 16 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  pageTitle: { fontSize: 22, fontWeight: "800" },
  pageSub: { fontSize: 12, marginTop: 2 },

  // Rank card
  rankCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  rankTopBar: { height: 4 },
  rankBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingBottom: 12,
  },
  rankLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  rankEmojiLarge: { fontSize: 44 },
  rankLabelSmall: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 2 },
  rankTitle: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  rankVerses: { fontSize: 12 },
  rankDotsCol: { flexDirection: "row", gap: 4, flexWrap: "wrap", maxWidth: 100, justifyContent: "flex-end" },
  rankDot: { width: 22, alignItems: "center" },

  rankProgressWrap: { paddingHorizontal: 18, paddingBottom: 18 },
  rankProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rankProgressLabel: { fontSize: 12 },
  rankTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  rankFill: { height: 6, borderRadius: 99 },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },

  // Category sections
  categorySection: { marginBottom: 24 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  categoryIcon: { fontSize: 20 },
  categoryTitle: { fontSize: 16, fontWeight: "800" },
  categoryBadgeCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeCountText: { fontSize: 12, fontWeight: "700" },

  // Badge grid
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badge: {
    width: "47%",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    minHeight: 130,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeEmoji: { fontSize: 34, marginBottom: 8 },
  badgeTitle: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  unlockedDateRow: {
    marginTop: 6,
    alignItems: "center",
  },
  unlockedCheck: {
    fontSize: 14,
    color: "#22C55E",
    fontWeight: "800",
  },
  lockIndicator: {
    marginTop: 6,
  },

  // Bottom
  bottomNote: { alignItems: "center", marginTop: 8 },
  bottomNoteText: { fontSize: 13, textAlign: "center" },
});
