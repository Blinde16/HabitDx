import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from '../lib/db';
import { track } from '../lib/analytics';

const ONBOARDING_STORAGE_KEY = '@habitdx_onboarding_progress';

interface ConstraintsData {
  peak_energy: 'morning' | 'afternoon' | 'evening' | 'varies' | null;
  schedule_type: string[];
  obstacles: string[];
}

interface OnboardingData {
  pastFailures: string[];
  failureDescription: string;
  constraints: ConstraintsData;
  goals: string[];
  motivation: string;
  notificationsEnabled: boolean;
}

interface OnboardingStore {
  currentScreen: number;
  data: OnboardingData;
  loading: boolean;
  error: string | null;

  // Navigation
  setScreen: (screen: number) => void;
  nextScreen: () => void;
  prevScreen: () => void;

  // Data management
  updateData: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  resetData: () => void;

  // Persistence
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  clearProgress: () => Promise<void>;

  // Submission
  submitOnboarding: (userId: string) => Promise<void>;

  // Validation
  canProceed: (screen?: number) => boolean;
}

const initialData: OnboardingData = {
  pastFailures: [],
  failureDescription: '',
  constraints: {
    peak_energy: null,
    schedule_type: [],
    obstacles: [],
  },
  goals: [],
  motivation: '',
  notificationsEnabled: true,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentScreen: 1,
  data: initialData,
  loading: false,
  error: null,

  setScreen: (screen: number) => {
    set({ currentScreen: screen });
    get().saveProgress();
  },

  nextScreen: () => {
    const { currentScreen } = get();
    if (currentScreen < 5) {
      void track('onboarding_screen_completed', {
        screenNumber: currentScreen,
      });
      set({ currentScreen: currentScreen + 1 });
      get().saveProgress();
    }
  },

  prevScreen: () => {
    const { currentScreen } = get();
    if (currentScreen > 1) {
      set({ currentScreen: currentScreen - 1 });
    }
  },

  updateData: (key, value) => {
    set((state) => ({
      data: {
        ...state.data,
        [key]: value,
      },
    }));
    get().saveProgress();
  },

  resetData: () => {
    set({ data: initialData, currentScreen: 1 });
    get().clearProgress();
  },

  saveProgress: async () => {
    try {
      const { currentScreen, data } = get();
      const progress = JSON.stringify({ currentScreen, data });
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, progress);
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  },

  loadProgress: async () => {
    try {
      const progress = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (progress) {
        const { currentScreen, data } = JSON.parse(progress);
        set({ currentScreen, data });
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  },

  clearProgress: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing onboarding progress:', error);
    }
  },

  submitOnboarding: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data } = get();

      // Prepare data for database
      const profileUpdate = {
        past_failures: data.pastFailures,
        constraints: {
          ...data.constraints,
          failure_description: data.failureDescription,
        },
        goals: data.goals,
        onboarding_completed: true,
        notification_enabled: data.notificationsEnabled,
      };

      // Save to database
      const { data: updatedProfile, error } = await updateProfile(userId, profileUpdate);

      if (error) {
        throw new Error(error.message);
      }
      if (!updatedProfile) {
        throw new Error('Profile update failed: no profile was returned.');
      }

      // Clear progress after successful submission
      await get().clearProgress();
      await track('onboarding_completed', {
        pastFailureCount: data.pastFailures.length,
        goalCount: data.goals.length,
        notificationsEnabled: data.notificationsEnabled,
      });

      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit onboarding';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  canProceed: (screen) => {
    const { currentScreen, data } = get();
    const activeScreen = screen ?? currentScreen;

    switch (activeScreen) {
      case 1: // Welcome screen
        return true;
      case 2: // Past failures
        return (
          data.pastFailures.length > 0 &&
          data.failureDescription.length >= 20 &&
          data.failureDescription.length <= 500
        );
      case 3: // Constraints
        return (
          data.constraints.peak_energy !== null &&
          data.constraints.schedule_type.length > 0 &&
          data.constraints.obstacles.length > 0
        );
      case 4: // Goals
        return (
          data.goals.length >= 1 &&
          data.goals.length <= 3 &&
          data.motivation.length >= 20 &&
          data.motivation.length <= 300
        );
      case 5: // Confirmation
        return true;
      default:
        return false;
    }
  },
}));
