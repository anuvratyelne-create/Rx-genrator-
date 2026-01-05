import { create } from 'zustand';
import type { Doctor } from '../types';
import { getDoctor, saveDoctor as saveDoctorDb } from '../database/repositories';

interface DoctorState {
  doctor: Doctor | null;
  isLoading: boolean;
  loadDoctor: () => Promise<void>;
  saveDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isOnboarded: () => boolean;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctor: null,
  isLoading: true,

  loadDoctor: async () => {
    try {
      const doctor = await getDoctor();
      set({ doctor, isLoading: false });
    } catch (error) {
      console.error('Failed to load doctor:', error);
      set({ isLoading: false });
    }
  },

  saveDoctor: async (doctorData) => {
    try {
      const doctor = await saveDoctorDb(doctorData);
      set({ doctor });
    } catch (error) {
      console.error('Failed to save doctor:', error);
      throw error;
    }
  },

  isOnboarded: () => {
    return get().doctor !== null;
  },
}));
