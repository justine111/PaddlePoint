# 🏓 Pickleball Scorer

Expo + Firebase real-time scoring app with TV cast support.

---

## Stack

| Layer | Tech |
|-------|------|
| Mobile app | Expo (React Native) |
| Backend | Firebase JS SDK v10 |
| Real-time sync | Firestore `onSnapshot` |
| Auth | Firebase Auth (email + anonymous) |
| TV cast web view | Vanilla HTML/JS hosted on Firebase Hosting |
| Analytics | Firebase Analytics |

---

## Setup

### 1. Clone & install

```bash
npx create-expo-app pickleball-scorer --template blank
cd pickleball-scorer
npx expo install expo-haptics expo-clipboard expo-sharing
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context \
  react-native-svg react-native-qrcode-svg \
  firebase date-fns
```

### 2. Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore**, **Authentication** (Email/Password + Anonymous), **Hosting**, **Analytics**
4. Copy your web config from **Project Settings → General → Your apps**
5. Paste into `src/services/firebase.js`

### 3. Environment (replace placeholders)

In `src/services/firebase.js`:
```js
const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  // ...
};
export const CAST_BASE_URL = 'https://YOUR_PROJECT_ID.web.app';
```

In `tv-cast/index.html`:
```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  // ...
};
```

### 4. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase init   # select Firestore + Hosting, use existing project
firebase deploy --only firestore:rules
```

### 5. Deploy TV cast web view

```bash
firebase deploy --only hosting
```

TV scoreboard will be live at:
```
https://YOUR_PROJECT_ID.web.app/cast/<matchId>
```

### 6. Run the app

```bash
npx expo start
```

Scan with Expo Go on your phone.

---

## Features

| Feature | Description |
|---------|-------------|
| 🏓 Singles & Doubles | Full team/player setup |
| 📊 Real-time scoring | Firestore `onSnapshot` — score updates in <1s |
| 🔄 Side-out scoring | Only serving team scores; tap "Side out" to transfer serve |
| ↩️ Undo | Undo last point with confirmation |
| 📺 TV Cast | QR code → hosted scoreboard on TV browser, auto-refreshes |
| 🏆 Tournament bracket | Auto-generated single-elimination bracket, n players |
| 📜 Match history | Full log of matches per user |
| 🔐 Auth | Email/password or guest (anonymous) |
| 📳 Haptics | Expo Haptics feedback on score |

---

## Casting to TV

Three methods supported:

1. **Smart TV browser** — scan the QR code on the TV's browser directly
2. **Chromecast** — cast your phone's Chrome browser tab to the TV
3. **AirPlay** — mirror your iPhone screen to Apple TV or AirPlay-enabled TV
4. **HDMI from laptop** — open the link on a laptop and mirror to monitor

---

## Project structure

```
pickleball-scorer/
├── App.js
├── app.json
├── firebase.json
├── firestore.rules
├── src/
│   ├── context/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   └── useMatch.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── MatchSetupScreen.js
│   │   ├── ScoringScreen.js
│   │   ├── MatchResultScreen.js
│   │   ├── TournamentScreen.js
│   │   └── HistoryScreen.js
│   ├── components/
│   │   ├── ServeIndicator.js
│   │   ├── QRModal.js
│   │   └── BracketView.js
│   └── services/
│       ├── firebase.js
│       ├── matchService.js
│       └── tournamentService.js
└── tv-cast/
    └── index.html     ← deployed to Firebase Hosting
```
