# SkillSprout Mobile

The native SkillSprout client is built with Expo 57, React Native 0.86, TypeScript, Redux Toolkit, and AsyncStorage. It talks to the same Express API as the web client; it is not a WebView.

## Run locally

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go, or use `npm run android` / `npm run ios`. The production API is used by default. To use a local backend:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:8787 npm start
```

`localhost` from a physical phone points to the phone itself, so use the computer's LAN IP for device testing.

## Quality checks

```bash
npm run typecheck
npm test
npx expo-doctor
npm run export:android
```

## Android APK

The `preview` profile in `eas.json` produces an installable APK:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The production profile creates an Android App Bundle for Play Store submission. EAS cloud builds require an Expo account.

## Architecture

```text
App
├── session restoration
├── AuthScreen
│   └── personalized onboarding
└── DashboardScreen
    ├── learning path
    ├── lesson modal
    ├── progress and XP
    └── milestone celebration

Redux Toolkit → AsyncStorage persistence
API service → shared Express/Vercel backend
```

The mobile app includes native haptic feedback, responsive phone/tablet layouts, accessible loading states, Android/iOS identifiers, and Hermes-compatible Android export.
