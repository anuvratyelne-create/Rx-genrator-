# RxFast - Next-Generation Prescription Generator

A **doctor-first** prescription generator built for Indian OPD doctors who see 80-100 patients daily. Designed to be **faster, simpler, and more intuitive** than HealthPlix SPOT.

## Key Features

- **15-Second Prescriptions** - Generate clean, legally valid prescriptions in under 15 seconds
- **One-Tap Repeat Rx** - Copy your last prescription with a single tap
- **Smart Suggestions** - Medicine suggestions based on YOUR prescribing patterns
- **Offline-First** - Works without internet, syncs when available
- **Instant Share** - One tap to share PDF via WhatsApp or print
- **Mobile-First** - Designed for one-hand usage on mobile

## Tech Stack

- **Frontend**: React Native + Expo
- **Styling**: NativeWind (Tailwind for React Native)
- **State**: Zustand
- **Database**: Expo SQLite (offline-first)
- **PDF**: expo-print, expo-sharing

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator / Physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/rxfast.git
cd rxfast

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── database/        # SQLite schema and queries
├── navigation/      # React Navigation setup
├── screens/         # App screens
├── services/        # PDF generation, etc.
├── store/           # Zustand stores
└── types/           # TypeScript types
```

## Screens

1. **Home** - Quick actions, recent patients
2. **New Prescription** - Single-screen prescription writer
3. **Preview** - Preview and share prescription
4. **History** - Past prescriptions
5. **Templates** - Saved prescription patterns
6. **Settings** - Doctor profile, preferences

## Why RxFast > HealthPlix SPOT

| Feature | HealthPlix | RxFast |
|---------|------------|--------|
| Time to Rx | 30-45 sec | <15 sec |
| Medicine clicks | 5-7 | 2-3 |
| Offline | Limited | Full |
| Repeat Rx | Multiple steps | One tap |
| Learning curve | 30+ min | 5 min |

## License

MIT License - Built for Indian doctors with speed in mind.
