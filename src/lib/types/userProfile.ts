export enum SportType {
  TENNIS = 'TENNIS',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  BADMINTON = 'BADMINTON',
  // Add more sports as needed
}

export enum TimeSlot {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface AvailabilityPreferences {
  preferredDays: DayOfWeek[];
  preferredTimeSlots: TimeSlot[];
}

export interface UserProfile {
  // Basic Information
  displayName: string;
  email: string;
  photoURL: string | null;
  phoneNumber: string | null;
  dateOfBirth: Date;

  // Account Settings
  createdAt: Date;
  lastActiveAt: Date;
  emailVerified: boolean;

  // Sports & Preferences
  primarySport: SportType;
  secondarySports: SportType[];
  availabilityPreferences: AvailabilityPreferences;
} 