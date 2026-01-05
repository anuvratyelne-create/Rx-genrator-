import { create } from 'zustand';
import uuid from 'react-native-uuid';
import type {
  Patient,
  Prescription,
  PrescriptionItem,
  MedicineItemForm,
  PrescriptionForm,
  Gender,
} from '../types';
import {
  savePatient,
  savePrescription,
  getLastPrescription,
  getPrescriptionById,
  getPatientPrescriptions,
  searchPatients,
} from '../database/repositories';

interface PrescriptionState {
  // Current prescription being created
  currentForm: PrescriptionForm;

  // Patient selection
  selectedPatient: Patient | null;
  patientSuggestions: Patient[];

  // Submission state
  isSubmitting: boolean;
  lastPrescription: Prescription | null;

  // Actions
  resetForm: () => void;
  setPatientField: (field: keyof PrescriptionForm['patient'], value: string) => void;
  setDiagnosis: (diagnosis: string) => void;
  setAdvice: (advice: string) => void;
  setFollowUpDays: (days: string) => void;

  // Medicine actions
  addMedicine: (medicine: MedicineItemForm) => void;
  updateMedicine: (index: number, medicine: MedicineItemForm) => void;
  removeMedicine: (index: number) => void;
  reorderMedicines: (fromIndex: number, toIndex: number) => void;

  // Patient actions
  selectPatient: (patient: Patient) => void;
  clearPatient: () => void;
  searchPatientsByName: (query: string) => Promise<void>;

  // Prescription actions
  submitPrescription: (doctorId: string) => Promise<Prescription>;
  loadLastPrescription: () => Promise<void>;
  repeatLastPrescription: () => void;
  loadPatientHistory: (patientId: string) => Promise<Prescription[]>;
}

const createEmptyMedicine = (): MedicineItemForm => ({
  id: uuid.v4() as string,
  medicineName: '',
  dose: '',
  frequency: '1-0-1',
  duration: '3',
  durationUnit: 'days',
  instruction: 'After food',
});

const createEmptyForm = (): PrescriptionForm => ({
  patient: {
    name: '',
    age: '',
    gender: '',
    phone: '',
  },
  diagnosis: '',
  medicines: [],
  advice: '',
  followUpDays: '',
});

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  currentForm: createEmptyForm(),
  selectedPatient: null,
  patientSuggestions: [],
  isSubmitting: false,
  lastPrescription: null,

  resetForm: () => {
    set({
      currentForm: createEmptyForm(),
      selectedPatient: null,
      patientSuggestions: [],
    });
  },

  setPatientField: (field, value) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        patient: {
          ...state.currentForm.patient,
          [field]: value,
        },
      },
    }));
  },

  setDiagnosis: (diagnosis) => {
    set((state) => ({
      currentForm: { ...state.currentForm, diagnosis },
    }));
  },

  setAdvice: (advice) => {
    set((state) => ({
      currentForm: { ...state.currentForm, advice },
    }));
  },

  setFollowUpDays: (followUpDays) => {
    set((state) => ({
      currentForm: { ...state.currentForm, followUpDays },
    }));
  },

  addMedicine: (medicine) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        medicines: [...state.currentForm.medicines, medicine],
      },
    }));
  },

  updateMedicine: (index, medicine) => {
    set((state) => {
      const medicines = [...state.currentForm.medicines];
      medicines[index] = medicine;
      return {
        currentForm: { ...state.currentForm, medicines },
      };
    });
  },

  removeMedicine: (index) => {
    set((state) => ({
      currentForm: {
        ...state.currentForm,
        medicines: state.currentForm.medicines.filter((_, i) => i !== index),
      },
    }));
  },

  reorderMedicines: (fromIndex, toIndex) => {
    set((state) => {
      const medicines = [...state.currentForm.medicines];
      const [moved] = medicines.splice(fromIndex, 1);
      medicines.splice(toIndex, 0, moved);
      return {
        currentForm: { ...state.currentForm, medicines },
      };
    });
  },

  selectPatient: (patient) => {
    set((state) => ({
      selectedPatient: patient,
      patientSuggestions: [],
      currentForm: {
        ...state.currentForm,
        patient: {
          name: patient.name,
          age: patient.age?.toString() || '',
          gender: patient.gender || '',
          phone: patient.phone || '',
        },
      },
    }));
  },

  clearPatient: () => {
    set({
      selectedPatient: null,
      currentForm: {
        ...get().currentForm,
        patient: {
          name: '',
          age: '',
          gender: '',
          phone: '',
        },
      },
    });
  },

  searchPatientsByName: async (query) => {
    if (query.length < 2) {
      set({ patientSuggestions: [] });
      return;
    }
    try {
      const patients = await searchPatients(query, 5);
      set({ patientSuggestions: patients });
    } catch (error) {
      console.error('Failed to search patients:', error);
    }
  },

  submitPrescription: async (doctorId) => {
    const { currentForm, selectedPatient } = get();
    set({ isSubmitting: true });

    try {
      // Save or update patient
      const patient = await savePatient(
        {
          name: currentForm.patient.name.trim(),
          age: currentForm.patient.age ? parseInt(currentForm.patient.age, 10) : undefined,
          gender: (currentForm.patient.gender as Gender) || undefined,
          phone: currentForm.patient.phone || undefined,
        },
        selectedPatient?.id
      );

      // Save prescription
      const items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[] = currentForm.medicines.map(
        (med, index) => ({
          medicineId: undefined, // Could link to medicine DB
          medicineName: med.medicineName,
          dose: med.dose || undefined,
          frequency: med.frequency || undefined,
          duration: med.duration || undefined,
          durationUnit: med.durationUnit,
          instruction: med.instruction || undefined,
          sortOrder: index,
        })
      );

      const prescription = await savePrescription(
        {
          patientId: patient.id,
          doctorId,
          diagnosis: currentForm.diagnosis || undefined,
          advice: currentForm.advice || undefined,
          followUpDays: currentForm.followUpDays ? parseInt(currentForm.followUpDays, 10) : undefined,
        },
        items
      );

      prescription.patient = patient;

      set({
        lastPrescription: prescription,
        isSubmitting: false,
      });

      return prescription;
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  loadLastPrescription: async () => {
    try {
      const prescription = await getLastPrescription();
      set({ lastPrescription: prescription });
    } catch (error) {
      console.error('Failed to load last prescription:', error);
    }
  },

  repeatLastPrescription: () => {
    const { lastPrescription } = get();
    if (!lastPrescription || !lastPrescription.items) return;

    const medicines: MedicineItemForm[] = lastPrescription.items.map((item) => ({
      id: uuid.v4() as string,
      medicineName: item.medicineName,
      dose: item.dose || '',
      frequency: item.frequency || '1-0-1',
      duration: item.duration || '3',
      durationUnit: item.durationUnit || 'days',
      instruction: item.instruction || 'After food',
    }));

    set((state) => ({
      currentForm: {
        ...state.currentForm,
        diagnosis: lastPrescription.diagnosis || '',
        medicines,
        advice: lastPrescription.advice || '',
        followUpDays: lastPrescription.followUpDays?.toString() || '',
      },
    }));
  },

  loadPatientHistory: async (patientId) => {
    try {
      return await getPatientPrescriptions(patientId);
    } catch (error) {
      console.error('Failed to load patient history:', error);
      return [];
    }
  },
}));
