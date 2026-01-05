// Core types for RxFast

export type Gender = 'M' | 'F' | 'O';

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  registrationNumber: string;
  clinicName?: string;
  clinicAddress?: string;
  phone?: string;
  email?: string;
  signatureBase64?: string;
  logoBase64?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: Gender;
  phone?: string;
  lastVisit: number;
  visitCount: number;
  createdAt: number;
}

export interface Medicine {
  id: string;
  genericName: string;
  brandName?: string;
  strength?: string;
  form: MedicineForm;
  defaultDose?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstruction?: string;
  useCount: number;
  isCustom: boolean;
}

export type MedicineForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'cream'
  | 'ointment'
  | 'drops'
  | 'inhaler'
  | 'powder'
  | 'sachet'
  | 'other';

export interface PrescriptionItem {
  id: string;
  prescriptionId?: string;
  medicineId?: string;
  medicineName: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  durationUnit: 'days' | 'weeks' | 'months';
  instruction?: string;
  sortOrder: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string;
  advice?: string;
  followUpDays?: number;
  pdfPath?: string;
  createdAt: number;
  // Denormalized for display
  patient?: Patient;
  items?: PrescriptionItem[];
}

export interface Template {
  id: string;
  name: string;
  diagnosis?: string;
  medicinesJson: string;
  advice?: string;
  useCount: number;
  createdAt: number;
}

// Form types for UI
export interface PatientForm {
  name: string;
  age: string;
  gender: Gender | '';
  phone: string;
}

export interface MedicineItemForm {
  id: string;
  medicineName: string;
  dose: string;
  frequency: string;
  duration: string;
  durationUnit: 'days' | 'weeks' | 'months';
  instruction: string;
}

export interface PrescriptionForm {
  patient: PatientForm;
  diagnosis: string;
  medicines: MedicineItemForm[];
  advice: string;
  followUpDays: string;
}

// Frequency presets
export const FREQUENCY_OPTIONS = [
  { label: '1-0-0', value: '1-0-0', description: 'Morning only' },
  { label: '0-1-0', value: '0-1-0', description: 'Afternoon only' },
  { label: '0-0-1', value: '0-0-1', description: 'Night only' },
  { label: '1-0-1', value: '1-0-1', description: 'Morning & Night' },
  { label: '1-1-0', value: '1-1-0', description: 'Morning & Afternoon' },
  { label: '0-1-1', value: '0-1-1', description: 'Afternoon & Night' },
  { label: '1-1-1', value: '1-1-1', description: 'Thrice daily' },
  { label: '1-1-1-1', value: '1-1-1-1', description: 'Four times daily' },
  { label: 'SOS', value: 'SOS', description: 'As needed' },
  { label: 'BD', value: 'BD', description: 'Twice daily' },
  { label: 'TDS', value: 'TDS', description: 'Thrice daily' },
  { label: 'QID', value: 'QID', description: 'Four times daily' },
  { label: 'HS', value: 'HS', description: 'At bedtime' },
  { label: 'STAT', value: 'STAT', description: 'Immediately' },
];

export const DURATION_OPTIONS = [
  { label: '3 days', value: '3', unit: 'days' },
  { label: '5 days', value: '5', unit: 'days' },
  { label: '7 days', value: '7', unit: 'days' },
  { label: '10 days', value: '10', unit: 'days' },
  { label: '14 days', value: '14', unit: 'days' },
  { label: '1 month', value: '1', unit: 'months' },
  { label: '2 months', value: '2', unit: 'months' },
  { label: '3 months', value: '3', unit: 'months' },
];

export const INSTRUCTION_OPTIONS = [
  { label: 'Before food', value: 'Before food', short: 'BF' },
  { label: 'After food', value: 'After food', short: 'AF' },
  { label: 'With food', value: 'With food', short: 'WF' },
  { label: 'Empty stomach', value: 'Empty stomach', short: 'ES' },
  { label: 'At bedtime', value: 'At bedtime', short: 'HS' },
  { label: 'As needed', value: 'As needed', short: 'SOS' },
];

export const COMMON_DIAGNOSES = [
  'Viral Fever',
  'Common Cold',
  'Cough',
  'Throat Infection',
  'URTI',
  'Gastritis',
  'Acidity',
  'Headache',
  'Body Pain',
  'Allergic Rhinitis',
  'Skin Allergy',
  'UTI',
  'Diarrhea',
  'Constipation',
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Arthritis',
];

export const COMMON_ADVICE = [
  'Take rest',
  'Drink plenty of fluids',
  'Avoid spicy food',
  'Avoid oily food',
  'Steam inhalation',
  'Gargle with warm salt water',
  'Regular exercise',
  'Avoid smoking',
  'Avoid alcohol',
  'Follow diabetic diet',
  'Low salt diet',
  'High fiber diet',
];
