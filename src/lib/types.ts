export type UserProfile = 'lui' | 'lei';

export interface UserPreferences {
  theme: 'light' | 'dark';
}

export interface AppEvent {
  id: string;
  startDate: string; // ISO string
  endDate: string | null; // ISO string or null for single-day events
  title: string;
  description: string;
  tags: string[];
  photoIds: string[]; // Array of photo IDs from the gallery
}

export interface Photo {
  id: string;
  date: string; // ISO string
  imageDataUrl: string; // Data URL
  description: string;
}

export interface CheckedDays {
  [year: number]: {
    [month: number]: number[];
  };
}

export interface AppData {
  currentUser: UserProfile | null;
  users: Record<UserProfile, UserPreferences>;
  events: AppEvent[];
  photos: Photo[];
  checkedDays: CheckedDays;
}
