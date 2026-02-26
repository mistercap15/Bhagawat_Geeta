import { useLanguage } from '@/context/LanguageContext';

const translations = {
  en: {
    // Tab names
    tabHome: 'Home',
    tabExplore: 'Explore',

    // Home screen
    greetingMorning: 'GOOD MORNING',
    greetingAfternoon: 'GOOD AFTERNOON',
    greetingEvening: 'GOOD EVENING',
    appTitle: 'Bhagavad Gita',
    appTagline: 'Sacred wisdom, beautifully presented',
    shlokaOfTheDay: 'Shloka of the Day',
    shareVerse: 'Share Verse',
    beginJourney: 'Begin Your Journey',
    pullToRefresh: 'Pull down to refresh and load a verse.',
    chapter: 'Chapter',
    verse: 'Verse',

    // Nav items
    readChapters: 'Read Chapters',
    readChaptersSub: 'Explore all 18 chapters',
    favorites: 'Favorites',
    favoritesSub: 'Your saved verses',
    continueReading: 'Continue Reading',
    continueReadingSub: 'Resume where you left',
    dailyPractice: 'Daily Practice',
    dailyPracticeSub: 'Build your streak',

    // Chapters screen
    allChapters: 'All Chapters',
    loadingChapters: 'Loading chapters…',
    versesCount: 'verses',
    chaptersSubHeader: (total: number) => `18 chapters · ${total} verses read`,

    // Shlokas screen
    loading: 'Loading…',
    couldNotLoad: 'Could not load chapter.',
    completed: 'Completed',
    tapToRead: 'Tap to read',

    // Verse details
    sanskritHeader: 'SANSKRIT VERSE',
    hindiMeaning: 'ॐ हिंदी भावार्थ ॐ',
    englishTranslation: 'ॐ English Translation ॐ',
    favourite: 'Favourite',
    favourited: 'Favourited',
    markAsRead: 'Mark as Read',

    // Favorites screen
    noFavoritesTitle: 'No Favorites Yet',
    noFavoritesSub: 'Tap the Favourite button while reading a verse to save it here 🙏',
    savedVerses: 'Saved Verses',
    loadingFavorites: 'Loading favorites…',
    favoriteCount: (n: number) => `${n} favorite${n !== 1 ? 's' : ''}`,

    // Continue Reading
    continueReadingTitle: 'Continue Reading',
    noReadingHistory: 'No Reading History',
    noReadingHistorySub: 'Open any verse to start tracking your progress here 🙏',
    browseChapters: 'Browse Chapters',
    resumeFrom: 'Resume from',
    swipeHint: 'Swipe left or right on any verse to navigate between them',

    // Daily Practice
    dailyPracticeTitle: 'Daily Practice',
    dailyPracticeSubtitle: 'Set your goal and build a streak',
    todaysProgress: "Today's Progress",
    dayStreak: 'day streak',
    versesLabel: 'verses',
    thisWeek: 'This Week',
    dailyTarget: 'Daily Target',
    slideToSetGoal: 'Slide or tap to set your goal',
    dailyMissionComplete: 'Daily mission complete — beautiful consistency!',
    motivationalQuote: '"Small daily improvements lead to stunning long-term results."',
    versePerDay: (v: number) => `verse${v !== 1 ? 's' : ''} / day`,
    daysMetLabel: (count: number) => `${count}/7 days met`,

    // Explore screen
    exploreTitle: 'Explore',
    exploreSubtitle: 'Preferences & app information',
    appearance: 'APPEARANCE',
    darkMode: 'Dark Mode',
    darkModeSub: 'Switch between light & dark',
    languageSection: 'LANGUAGE',
    languageSectionSub: 'Change app language',
    legal: 'LEGAL',
    support: 'SUPPORT',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    rateApp: 'Rate the App',
    contactSupport: 'Contact Support',
    about: 'About',
    dangerZone: 'DANGER ZONE',
    clearAllData: 'Clear All Data',
    clearAllDataSub: 'Removes progress & favorites',
    clearAllDataConfirmTitle: 'Clear All Data',
    clearAllDataConfirmMsg:
      'This will erase all reading progress, favorites, and settings. This cannot be undone.',
    cancel: 'Cancel',
    clearAll: 'Clear All',
    cleared: 'Cleared',
    dataRemoved: 'All data has been removed.',

    // Language labels
    englishLabel: 'English',
    hindiLabel: 'हिंदी',

    // Locale for date formatting
    dateLocale: 'en-US',

    // Meaning key
    meaningKey: 'en' as 'en' | 'hi',
  },

  hi: {
    // Tab names
    tabHome: 'होम',
    tabExplore: 'एक्सप्लोर',

    // Home screen
    greetingMorning: 'शुभ प्रभात',
    greetingAfternoon: 'शुभ अपराह्न',
    greetingEvening: 'शुभ संध्या',
    appTitle: 'भगवद् गीता',
    appTagline: 'पवित्र ज्ञान, सुंदर प्रस्तुति',
    shlokaOfTheDay: 'आज का श्लोक',
    shareVerse: 'श्लोक शेयर करें',
    beginJourney: 'यात्रा शुरू करें',
    pullToRefresh: 'ताज़ा करने के लिए नीचे खींचें।',
    chapter: 'अध्याय',
    verse: 'श्लोक',

    // Nav items
    readChapters: 'अध्याय पढ़ें',
    readChaptersSub: 'सभी 18 अध्याय देखें',
    favorites: 'पसंदीदा',
    favoritesSub: 'आपके सहेजे गए श्लोक',
    continueReading: 'पढ़ना जारी रखें',
    continueReadingSub: 'जहाँ छोड़ा वहाँ से जारी रखें',
    dailyPractice: 'दैनिक अभ्यास',
    dailyPracticeSub: 'अपनी श्रृंखला बनाएं',

    // Chapters screen
    allChapters: 'सभी अध्याय',
    loadingChapters: 'अध्याय लोड हो रहे हैं…',
    versesCount: 'श्लोक',
    chaptersSubHeader: (total: number) => `18 अध्याय · ${total} श्लोक पढ़े`,

    // Shlokas screen
    loading: 'लोड हो रहा है…',
    couldNotLoad: 'अध्याय लोड नहीं हो सका।',
    completed: 'पूर्ण',
    tapToRead: 'पढ़ने के लिए टैप करें',

    // Verse details
    sanskritHeader: 'संस्कृत श्लोक',
    hindiMeaning: 'ॐ हिंदी भावार्थ ॐ',
    englishTranslation: 'ॐ English Translation ॐ',
    favourite: 'पसंदीदा',
    favourited: 'पसंद किया',
    markAsRead: 'पढ़ा हुआ चिह्नित करें',

    // Favorites screen
    noFavoritesTitle: 'कोई पसंदीदा नहीं',
    noFavoritesSub: 'श्लोक पढ़ते समय पसंदीदा बटन दबाएं 🙏',
    savedVerses: 'सहेजे गए श्लोक',
    loadingFavorites: 'पसंदीदा लोड हो रहे हैं…',
    favoriteCount: (n: number) => `${n} पसंदीदा`,

    // Continue Reading
    continueReadingTitle: 'पढ़ना जारी रखें',
    noReadingHistory: 'कोई पढ़ाई इतिहास नहीं',
    noReadingHistorySub: 'अपनी प्रगति यहाँ देखने के लिए कोई भी श्लोक खोलें 🙏',
    browseChapters: 'अध्याय देखें',
    resumeFrom: 'यहाँ से जारी रखें',
    swipeHint: 'अगले/पिछले श्लोक के लिए बाएं या दाएं स्वाइप करें',

    // Daily Practice
    dailyPracticeTitle: 'दैनिक अभ्यास',
    dailyPracticeSubtitle: 'अपना लक्ष्य निर्धारित करें और श्रृंखला बनाएं',
    todaysProgress: 'आज की प्रगति',
    dayStreak: 'दिन की श्रृंखला',
    versesLabel: 'श्लोक',
    thisWeek: 'इस सप्ताह',
    dailyTarget: 'दैनिक लक्ष्य',
    slideToSetGoal: 'अपना लक्ष्य स्लाइड या टैप करके सेट करें',
    dailyMissionComplete: 'दैनिक अभ्यास पूर्ण — शानदार निरंतरता!',
    motivationalQuote: '"छोटे-छोटे दैनिक सुधार दीर्घकालिक परिणाम देते हैं।"',
    versePerDay: (_v: number) => `श्लोक / दिन`,
    daysMetLabel: (count: number) => `${count}/7 दिन पूरे`,

    // Explore screen
    exploreTitle: 'एक्सप्लोर',
    exploreSubtitle: 'प्राथमिकताएं और ऐप जानकारी',
    appearance: 'रूप-रंग',
    darkMode: 'डार्क मोड',
    darkModeSub: 'लाइट और डार्क के बीच स्विच करें',
    languageSection: 'भाषा',
    languageSectionSub: 'ऐप की भाषा बदलें',
    legal: 'कानूनी',
    support: 'सहायता',
    termsConditions: 'नियम और शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    rateApp: 'ऐप रेट करें',
    contactSupport: 'सहायता से संपर्क करें',
    about: 'हमारे बारे में',
    dangerZone: 'खतरनाक क्षेत्र',
    clearAllData: 'सभी डेटा हटाएं',
    clearAllDataSub: 'प्रगति और पसंदीदा हटाए',
    clearAllDataConfirmTitle: 'सभी डेटा हटाएं',
    clearAllDataConfirmMsg:
      'इससे सभी पढ़ाई की प्रगति, पसंदीदा और सेटिंग्स मिट जाएंगी। यह पूर्ववत नहीं किया जा सकता।',
    cancel: 'रद्द करें',
    clearAll: 'सभी हटाएं',
    cleared: 'हटाया गया',
    dataRemoved: 'सभी डेटा हटा दिया गया है।',

    // Language labels
    englishLabel: 'English',
    hindiLabel: 'हिंदी',

    // Locale for date formatting
    dateLocale: 'hi-IN',

    // Meaning key
    meaningKey: 'hi' as 'en' | 'hi',
  },
};

export type TranslationKeys = typeof translations.en;

export function useTranslation(): TranslationKeys {
  const { language } = useLanguage();
  return translations[language] as unknown as TranslationKeys;
}
