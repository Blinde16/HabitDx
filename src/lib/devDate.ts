/**
 * Dev Date Override
 *
 * In __DEV__ mode, lets you override "today" across the entire app so you can
 * simulate multiple days passing without touching the system clock.
 *
 * Usage:
 *   import { getAppDate } from '@/lib/devDate';
 *   const now = getAppDate();          // respects override in dev, real Date in prod
 *
 * The Zustand store (useDevDateStore) drives the Settings UI and triggers
 * re-renders in screens that subscribe to the override.
 */

import { create } from 'zustand';

let _dateOverride: Date | null = null;

/**
 * Returns the overridden date in dev mode, or the real current date otherwise.
 * Always returns a fresh Date instance so callers can safely mutate it.
 */
export function getAppDate(): Date {
  if (__DEV__ && _dateOverride) {
    return new Date(_dateOverride.getTime());
  }
  return new Date();
}

export function getAppDateString(): string {
  return getAppDate().toISOString().split('T')[0];
}

interface DevDateStore {
  dateOverride: Date | null;
  setDateOverride: (date: Date | null) => void;
  advanceDay: (days?: number) => void;
}

export const useDevDateStore = create<DevDateStore>((set, get) => ({
  dateOverride: null,

  setDateOverride: (date: Date | null) => {
    _dateOverride = date ? new Date(date.getTime()) : null;
    set({ dateOverride: date ? new Date(date.getTime()) : null });
  },

  advanceDay: (days = 1) => {
    const current = get().dateOverride ?? new Date();
    const next = new Date(current.getTime());
    next.setDate(next.getDate() + days);
    _dateOverride = new Date(next.getTime());
    set({ dateOverride: new Date(next.getTime()) });
  },
}));
