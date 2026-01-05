# RxFast - Next-Generation Prescription Generator for Indian Doctors

## A. PRODUCT ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RxFast ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        PRESENTATION LAYER                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Quick Start  │  │  Rx Writer   │  │   History & Templates    │   │    │
│  │  │   Screen     │  │   (Main)     │  │                          │   │    │
│  │  │              │  │              │  │  • Past Prescriptions    │   │    │
│  │  │ • New Rx     │  │ • Patient    │  │  • Favorite Templates    │   │    │
│  │  │ • Repeat Rx  │  │ • Diagnosis  │  │  • Common Rx Patterns    │   │    │
│  │  │ • Recent     │  │ • Medicines  │  │                          │   │    │
│  │  │              │  │ • Advice     │  │                          │   │    │
│  │  └──────────────┘  │ • Generate   │  └──────────────────────────┘   │    │
│  │                    └──────────────┘                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         BUSINESS LOGIC LAYER                         │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐    │    │
│  │  │  Rx Generator  │  │  Smart Suggest │  │   PDF Generator    │    │    │
│  │  │                │  │                │  │                    │    │    │
│  │  │ • Validate     │  │ • Medicine DB  │  │ • Clean Layout     │    │    │
│  │  │ • Format       │  │ • History      │  │ • Print Ready      │    │    │
│  │  │ • Store        │  │ • Patterns     │  │ • WhatsApp Share   │    │    │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          DATA LAYER (OFFLINE-FIRST)                  │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │                     SQLite / AsyncStorage                       │ │    │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │    │
│  │  │  │ Doctors  │  │ Patients │  │  Rx List │  │ Medicine DB  │   │ │    │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  │                              │                                       │    │
│  │                              ▼                                       │    │
│  │  ┌────────────────────────────────────────────────────────────────┐ │    │
│  │  │          Optional Cloud Sync (Supabase/Firebase)                │ │    │
│  │  │              • Backup • Multi-device • Analytics                │ │    │
│  │  └────────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## B. USER FLOW (Doctor's Point of View)

### Primary Flow: New Prescription (Target: <15 seconds)

```
STEP 1: Launch App (0 sec)
    └── App opens directly to Quick Actions
    └── Shows: [+ New Rx] [↻ Repeat Last] [Recent Patients]

STEP 2: Patient Entry (3 sec)
    └── Option A: Type name → Auto-suggest existing patient
    └── Option B: Tap recent patient from list
    └── Option C: Quick entry: "Name, Age, Gender" in one field
    └── Age/Gender auto-detected from history

STEP 3: Write Prescription (8 sec) - SINGLE SCREEN
    └── Diagnosis: Optional quick-tap from common list
    └── Medicines:
        │   ├── Type 2-3 letters → See suggestions
        │   ├── Tap medicine → Auto-fill common dose
        │   ├── Swipe to adjust frequency/duration
        │   └── [+] Add more medicines
    └── Instructions: One-tap chips (Before food, After food, etc.)
    └── Advice: Optional quick-tap common advice

STEP 4: Generate & Share (3 sec)
    └── Tap [✓ Done]
    └── Preview appears
    └── Share options: [Print] [WhatsApp] [Save PDF]
```

### Secondary Flow: Repeat Previous Prescription (Target: <5 seconds)

```
STEP 1: Launch App → Tap [↻ Repeat Last]
STEP 2: Select patient (or use last patient)
STEP 3: Review → Modify if needed → Done
STEP 4: Share
```

## C. UX WIREFRAME DESCRIPTION

### Screen 1: Home / Quick Start
```
┌─────────────────────────────────────┐
│  RxFast              [⚙️] [👤]      │
├─────────────────────────────────────┤
│                                     │
│  Good Morning, Dr. Sharma           │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     [+]  NEW PRESCRIPTION   │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌────────────┐  ┌────────────┐     │
│  │ ↻ REPEAT   │  │ 📋 HISTORY │     │
│  │   LAST     │  │            │     │
│  └────────────┘  └────────────┘     │
│                                     │
│  ─── RECENT PATIENTS ───────────    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Rajesh Kumar, M, 45         │ →  │
│  │ Last: 2 hours ago           │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Priya Patel, F, 32          │ →  │
│  │ Last: Yesterday             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Amit Singh, M, 28           │ →  │
│  │ Last: 2 days ago            │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Screen 2: Prescription Writer (THE MAIN SCREEN)
```
┌─────────────────────────────────────┐
│  ← New Prescription    [✓ DONE]     │
├─────────────────────────────────────┤
│                                     │
│  PATIENT ────────────────────────   │
│  ┌─────────────────────────────┐    │
│  │ 🔍 Name, Age, Gender        │    │
│  └─────────────────────────────┘    │
│  Suggestions: [Rajesh] [Priya]      │
│                                     │
│  DIAGNOSIS (optional) ───────────   │
│  [Fever] [Cold] [Cough] [+Add]      │
│                                     │
│  MEDICINES ──────────────────────   │
│  ┌─────────────────────────────┐    │
│  │ 1. Paracetamol 500mg        │ ✕  │
│  │    1-0-1 × 3 days │ After food   │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 2. Azithromycin 500mg       │ ✕  │
│  │    1-0-0 × 3 days │ After food   │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  + ADD MEDICINE             │    │
│  │  🔍 Type medicine name...   │    │
│  └─────────────────────────────┘    │
│  Suggestions based on diagnosis:    │
│  [Cetirizine] [Montelukast] [+]     │
│                                     │
│  INSTRUCTIONS ───────────────────   │
│  [Rest] [Fluids] [Follow-up 3d]     │
│                                     │
│  ─────────────────────────────────  │
│  │        [✓ GENERATE Rx]        │  │
│  ─────────────────────────────────  │
└─────────────────────────────────────┘
```

### Screen 3: Medicine Quick-Add Modal
```
┌─────────────────────────────────────┐
│  Add Medicine                    ✕  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔍 para...                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⭐ Paracetamol 500mg        │    │
│  │    Your most used           │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Paracetamol 650mg           │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Paracetamol + Caffeine      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─── DOSE ───────────────────────   │
│  [250mg] [500mg✓] [650mg] [Custom]  │
│                                     │
│  ─── FREQUENCY ──────────────────   │
│  [1-0-0] [1-0-1✓] [1-1-1] [SOS]     │
│                                     │
│  ─── DURATION ───────────────────   │
│  [3 days✓] [5 days] [7 days] [...]  │
│                                     │
│  ─── TIMING ─────────────────────   │
│  [Before food] [After food✓] [Any]  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        [+ ADD TO Rx]        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Screen 4: Preview & Share
```
┌─────────────────────────────────────┐
│  ← Preview                [EDIT]    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │  Dr. Amit Sharma            │    │
│  │  MBBS, MD                   │    │
│  │  Reg: MH/12345              │    │
│  │  ─────────────────────────  │    │
│  │  Patient: Rajesh Kumar      │    │
│  │  Age/Sex: 45/M              │    │
│  │  Date: 05-Jan-2026          │    │
│  │  ─────────────────────────  │    │
│  │  Dx: Viral Fever            │    │
│  │  ─────────────────────────  │    │
│  │  ℞                          │    │
│  │  1. Paracetamol 500mg       │    │
│  │     1-0-1 × 3 days (AF)     │    │
│  │  2. Azithromycin 500mg      │    │
│  │     1-0-0 × 3 days (AF)     │    │
│  │  ─────────────────────────  │    │
│  │  Advice: Rest, fluids       │    │
│  │  Follow-up: 3 days          │    │
│  │  ─────────────────────────  │    │
│  │       [Signature]           │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌───────┐  │
│  │ 🖨 Print│ │📱WhatsApp│ │💾 Save│  │
│  └─────────┘ └─────────┘ └───────┘  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    [✓ DONE - NEXT PATIENT]  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## D. DATABASE SCHEMA

See `src/database/schema.ts` for complete TypeScript implementation.

```sql
-- Lightweight, Rx-focused schema

-- Doctor Profile (single user, offline-first)
CREATE TABLE doctor (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qualification TEXT,
  registration_number TEXT NOT NULL,
  clinic_name TEXT,
  clinic_address TEXT,
  phone TEXT,
  email TEXT,
  signature_base64 TEXT,
  logo_base64 TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Patients (minimal data for speed)
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK(gender IN ('M', 'F', 'O')),
  phone TEXT,
  last_visit INTEGER,
  visit_count INTEGER DEFAULT 1,
  created_at INTEGER
);

-- Medicine Master List (pre-populated + custom)
CREATE TABLE medicines (
  id TEXT PRIMARY KEY,
  generic_name TEXT NOT NULL,
  brand_name TEXT,
  strength TEXT,
  form TEXT, -- tablet, syrup, injection, etc.
  default_dose TEXT,
  default_frequency TEXT,
  default_duration TEXT,
  default_instruction TEXT,
  use_count INTEGER DEFAULT 0, -- for smart suggestions
  is_custom INTEGER DEFAULT 0
);

-- Prescriptions
CREATE TABLE prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id),
  doctor_id TEXT REFERENCES doctor(id),
  diagnosis TEXT,
  advice TEXT,
  follow_up_days INTEGER,
  pdf_path TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctor(id)
);

-- Prescription Items (medicines in a prescription)
CREATE TABLE prescription_items (
  id TEXT PRIMARY KEY,
  prescription_id TEXT REFERENCES prescriptions(id),
  medicine_id TEXT REFERENCES medicines(id),
  medicine_name TEXT NOT NULL, -- denormalized for speed
  dose TEXT,
  frequency TEXT, -- 1-0-1, 1-1-1, etc.
  duration TEXT,
  duration_unit TEXT DEFAULT 'days',
  instruction TEXT, -- before food, after food, etc.
  sort_order INTEGER,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- Quick Templates (doctor's saved Rx patterns)
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  diagnosis TEXT,
  medicines_json TEXT, -- JSON array of medicine configs
  advice TEXT,
  use_count INTEGER DEFAULT 0,
  created_at INTEGER
);

-- Indexes for speed
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_last_visit ON patients(last_visit DESC);
CREATE INDEX idx_medicines_generic ON medicines(generic_name);
CREATE INDEX idx_medicines_use_count ON medicines(use_count DESC);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(created_at DESC);
```

## E. TECH STACK

```
┌─────────────────────────────────────────────────────────┐
│                    TECH STACK                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FRONTEND                                               │
│  ├── React Native + Expo (SDK 50+)                     │
│  ├── TypeScript (strict mode)                          │
│  ├── NativeWind (Tailwind for RN)                      │
│  └── React Navigation (stack + bottom tabs)            │
│                                                         │
│  STATE MANAGEMENT                                       │
│  ├── Zustand (lightweight, fast)                       │
│  └── React Query (for async operations)                │
│                                                         │
│  LOCAL DATABASE                                         │
│  ├── Expo SQLite (primary storage)                     │
│  └── MMKV (fast key-value for settings)                │
│                                                         │
│  PDF GENERATION                                         │
│  └── react-native-html-to-pdf                          │
│                                                         │
│  SHARING                                                │
│  ├── expo-sharing (cross-platform)                     │
│  └── expo-print (direct printing)                      │
│                                                         │
│  OPTIONAL CLOUD                                         │
│  └── Supabase (backup, multi-device sync)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## F. SAMPLE PRESCRIPTION OUTPUT

See `src/templates/prescription.html` for the actual template.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────┐   Dr. AMIT SHARMA                             │
│  │LOGO │   MBBS, MD (Medicine)                         │
│  └─────┘   Reg. No: MH/2015/12345                      │
│            ─────────────────────────────────────        │
│            Sharma Clinic, 123 MG Road                   │
│            Mumbai - 400001 │ Ph: 9876543210            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Patient: RAJESH KUMAR              Date: 05-Jan-2026  │
│  Age/Sex: 45 years / Male                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Diagnosis: Viral Fever with Upper Respiratory         │
│             Tract Infection                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ℞                                                      │
│                                                         │
│  1. Tab. Paracetamol 500mg                             │
│     1-0-1 × 3 days                    [After food]     │
│                                                         │
│  2. Tab. Azithromycin 500mg                            │
│     1-0-0 × 3 days                    [After food]     │
│                                                         │
│  3. Tab. Cetirizine 10mg                               │
│     0-0-1 × 5 days                    [At bedtime]     │
│                                                         │
│  4. Syp. Ascoril-D 100ml                               │
│     2 tsp thrice daily × 5 days       [After food]     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Advice:                                                │
│  • Take adequate rest                                   │
│  • Drink plenty of fluids                              │
│  • Steam inhalation twice daily                        │
│                                                         │
│  Follow-up: After 3 days if symptoms persist           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                              ┌───────────────────┐      │
│                              │                   │      │
│                              │    [Signature]    │      │
│                              │                   │      │
│                              └───────────────────┘      │
│                              Dr. Amit Sharma            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## G. WHY RxFast IS BETTER THAN HealthPlix SPOT

| Feature | HealthPlix SPOT | RxFast | Advantage |
|---------|-----------------|--------|-----------|
| **Time to Rx** | 30-45 seconds | <15 seconds | **2-3x faster** |
| **Clicks to add medicine** | 5-7 clicks | 2-3 taps | **60% fewer** |
| **Offline support** | Limited | Full offline | **Works anywhere** |
| **Repeat prescription** | Multiple steps | One tap | **Instant** |
| **Medicine suggestions** | Generic database | Doctor's own history | **Personalized** |
| **Screen complexity** | Multiple screens | Single screen | **Zero navigation** |
| **Learning curve** | 30+ minutes | 5 minutes | **Intuitive** |
| **PDF quality** | Template-based | Clean, minimal | **Professional** |
| **WhatsApp sharing** | Manual export | One tap | **Instant** |
| **Smart defaults** | Basic | Pattern-based AI | **Learns from you** |
| **Mobile-first** | Adapted from web | Native mobile | **Touch-optimized** |
| **EMR bloat** | Full EMR features | Rx-only focus | **Zero clutter** |

### Unique Features in RxFast:

1. **⚡ One-Tap Repeat Rx** - Copy last prescription with single tap
2. **🧠 Smart Pattern Learning** - Suggests medicines based on YOUR prescribing patterns
3. **📴 True Offline-First** - Works without internet, syncs when available
4. **📲 Instant WhatsApp Share** - One tap to send PDF to patient
5. **🎯 Diagnosis-Based Suggestions** - Type "Fever" → see your common fever medicines
6. **⌨️ Keyboard Shortcuts** - Power users can type even faster
7. **🌙 Dark Mode** - Easy on eyes during night OPD
8. **📋 Template Library** - Save and reuse common prescription patterns

---

Built with ❤️ for Indian doctors who see 80-100 patients daily.
