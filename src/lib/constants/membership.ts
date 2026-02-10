export const MEMBERSHIP_RATES = {
  'walk-in': {
    student: 30,
    professional: 40,
  },
  'day-pass': {
    student: 200,
    professional: 250,
  },
  'night-pass': {
    student: 150,
    professional: 200,
  },
  '1-day': {
    student: 300,
    professional: 400,
  },
  'weekly': {
    student: 1000,
    professional: 1200,
  },
  'monthly': {
    student: 2500,
    professional: 3500,
  },
} as const;

export const PASS_TYPES = ['walk-in', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly'] as const;
export const MEMBERSHIP_TYPES = ['student', 'professional'] as const;

export const PASS_DURATION_DAYS = {
  'walk-in': 1,
  'day-pass': 1,
  'night-pass': 1,
  '1-day': 1,
  'weekly': 7,
  'monthly': 30,
} as const;
