/** Shared options for onboarding intake (multi-screen + chat flow). */

export const HABIT_OPTIONS = [
  'Walking / daily movement',
  'Drinking water',
  'Morning routine',
  'Exercise',
  'Meditation',
  'Reading',
  'Journaling',
  'Healthy eating',
  'Sleep schedule',
  'Yoga',
  'Running',
  'Career development',
  'Creative practice',
  'Financial habits',
  'Networking / social',
  'Learning / studying',
] as const;

export const ENERGY_OPTIONS = [
  { value: 'morning' as const, label: 'Morning', icon: '🌅' },
  { value: 'afternoon' as const, label: 'Afternoon', icon: '☀️' },
  { value: 'evening' as const, label: 'Evening', icon: '🌙' },
  { value: 'varies' as const, label: 'Varies', icon: '🔄' },
];

export const SCHEDULE_OPTIONS = [
  '9-5 job',
  'Shift work',
  'Freelance/irregular',
  'Stay-at-home parent',
  'Student',
  'Retired',
] as const;

export const OBSTACLE_OPTIONS = [
  'Lack of time',
  'Inconsistent schedule',
  'Low energy',
  'Forgetfulness',
  'No accountability',
  'Perfectionism',
  'Overwhelm',
  'Lack of motivation',
] as const;

export const GOAL_OPTIONS = [
  { value: 'Better health', icon: '💪' },
  { value: 'More energy', icon: '⚡' },
  { value: 'Career growth', icon: '📈' },
  { value: 'Mental clarity', icon: '🧠' },
  { value: 'Better sleep', icon: '😴' },
  { value: 'Personal growth', icon: '🌱' },
  { value: 'Reduce stress', icon: '🧘' },
  { value: 'Build confidence', icon: '💎' },
] as const;
