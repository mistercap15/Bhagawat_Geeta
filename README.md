# 🕉️ Bhagavad Gita

A calm, ad‑free, offline‑first mobile app to read and reflect on the **Bhagavad Gita** — every chapter and shloka with Sanskrit, Hindi, and English, wrapped in a Material 3 reading experience with a realistic page‑turn animation.

Built with **React Native + Expo (SDK 54)** and a fully bilingual (English / हिंदी) interface.

---

## ✨ Features

- 📖 **Complete scripture** — all 18 chapters and 700 shlokas with the Sanskrit verse plus Hindi & English translations.
- 📜 **Realistic page‑turn reader** — swipe between verses with a paper‑curl animation and haptic feedback.
- 🌐 **Bilingual UI** — switch the entire interface between English and हिंदी; your choice is saved automatically.
- 🌗 **Light & Dark mode** — a Material 3 Expressive theme built on a saffron color palette.
- ❤️ **Favorites & reading progress** — mark verses as read and favorite them; chapters show a 👑 when fully read.
- 🎯 **Daily practice** — set a daily reading goal and get a reminder notification.
- 🏆 **Achievements & ranks** — 23 unlockable badges, rank levels, and stats with celebration animations.
- 🔖 **Continue reading** — jump straight back to the last verse you read.
- 🧭 **Guidance by situation** — find relevant verses for what you're going through.
- 🔊 **Audio recitation** — listen along while you read.
- 📤 **Share verses** — export a beautifully formatted verse as an image.
- 📴 **Offline‑first** — all scripture is bundled; no network required.

---

## 🛠️ Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [Expo](https://expo.dev) SDK 54, React Native 0.81, React 19 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction) 6 (file‑based routing) |
| Language | TypeScript |
| Styling | [NativeWind](https://www.nativewind.dev/) 4 (Tailwind CSS) + custom Material 3 theme |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4 + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| State & storage | React Context API + AsyncStorage |
| UX extras | expo‑notifications, expo‑haptics, expo‑linear‑gradient, lucide‑react‑native, react‑native‑view‑shot |

> Uses the React Native **New Architecture** (Fabric).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.19+**
- A package manager (`npm`)
- For Android: **Android Studio** with an emulator (or a physical device)
- For iOS: **Xcode** with a simulator (macOS only)

> This app uses native modules (Reanimated 4, notifications, etc.) and the New Architecture, so it runs in a **custom development build**, not Expo Go.

### 1. Install dependencies

```bash
npm install
```

### 2. Run on a device / emulator

```bash
# Android (builds the native app, installs, and starts Metro)
npx expo run:android

# iOS (macOS + Xcode required)
npx expo run:ios
```

Once a development build is installed, you can start the bundler on its own with:

```bash
npx expo start --dev-client
```

Use `npx expo start --clear` if you ever hit stale‑cache issues.

---

## 📁 Project Structure

```
app/                       # Screens (Expo Router, file-based routing)
  (tabs)/
    _layout.tsx            # Root layout: Theme + Language + Achievement providers, tab bar
    home/                  # Home, chapters, verse reader, favorites, achievements, daily practice…
    explore/               # Settings, language picker, about, legal, donate
components/                # Reusable UI (BottomSheet, loaders, modals…)
context/                   # ThemeContext, LanguageContext, AchievementContext
utils/                     # gitaData (data access), translations, achievements, m3Theme, notifications
data/gita.json             # Complete Bhagavad Gita dataset (bundled)
assets/                    # Icons, splash, images
```

### Architecture notes

- **Theming** — `utils/m3Theme.ts` exposes `getTheme(isDark)` returning Material 3 tokens used across every screen.
- **Localization** — `utils/translations.ts` holds all UI strings; screens read them via `useTranslation()`.
- **Data** — `utils/gitaData.ts` is the typed access layer over the bundled `data/gita.json`.
- **Persistence** — user state (favorites, read verses, streaks, achievements, language, theme) is stored in AsyncStorage.

---

## 📦 Building for Production

This project is configured for [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
# Production builds
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

Build profiles live in [`eas.json`](./eas.json). Native `android/` and `ios/` folders are committed; after changing native config or upgrading the SDK, regenerate them with:

```bash
npx expo prebuild --clean
```

---

## 🙏 Support

This app is completely **free and ad‑free**. If it helps you, you can support its development via UPI from the in‑app **About → Support** screen.

---

## 👤 Author

**Khilan Patel** — Full Stack Developer

---

## 📄 License

This project is provided for personal and devotional use.
