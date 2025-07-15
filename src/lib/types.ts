export type UserProfile = 'lui' | 'lei';

export interface UserPreferences {
  theme: 'light' | 'dark';
}

export interface AppEvent {
  id: string;
  date: string; // ISO string
  title: string;
  description: string;
  tags: string[];
}

export interface Photo {
  id:string;
  date: string; // ISO string
  imageDataUrl: string; // Data URL
  description: string;
}

export interface CheckedDays {
  [year: number]: {
    [month: number]: number[];
  };
}
