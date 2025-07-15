'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserPreferences, AppEvent, Photo, CheckedDays } from '@/lib/types';

const APP_STORAGE_KEY = 'amoreEternoData';

// Helper hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


interface AppData {
  currentUser: UserProfile | null;
  users: Record<UserProfile, UserPreferences>;
  events: AppEvent[];
  photos: Photo[];
  checkedDays: CheckedDays;
  perfectMonthsCount: number;
}

interface AppContextType extends AppData {
  setCurrentUser: (user: UserProfile | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addEvent: (event: AppEvent) => void;
  updateEvent: (event: AppEvent) => void;
  addPhoto: (photo: Photo) => void;
  updateCheckedDays: (year: number, month: number, day: number) => void;
  incrementPerfectMonths: () => void;
  isDataLoaded: boolean;
}

const defaultState: AppData = {
  currentUser: null,
  users: {
    lui: { theme: 'light' },
    lei: { theme: 'light' },
  },
  events: [],
  photos: [],
  checkedDays: {},
  perfectMonthsCount: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(defaultState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const debouncedData = useDebounce(data, 500); // Debounce data changes

  // Effect to load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(APP_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Ensure all keys from defaultState are present
        const initialState = { ...defaultState, ...parsedData };
        if (!initialState.photos) {
            initialState.photos = [];
        }
        setData(initialState);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsDataLoaded(true);
  }, []);

  // Effect to save debounced data to localStorage
  useEffect(() => {
    if (isDataLoaded) {
      try {
        const dataToStore = {
          ...debouncedData,
          photos: debouncedData.photos.map(({ id, date, description }) => ({ id, date, description, imageDataUrl: '' })),
        };
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [debouncedData, isDataLoaded]);
  
  // Effect to handle theme changes without debouncing
  useEffect(() => {
    if(isDataLoaded && data.currentUser) {
        const theme = data.users[data.currentUser].theme;
        document.documentElement.classList.toggle('dark', theme === 'dark');
    } else if (!data.currentUser) {
        document.documentElement.classList.remove('dark');
    }
  }, [data.currentUser, data.users, isDataLoaded]);


  const setCurrentUser = (user: UserProfile | null) => {
    setData(prev => ({ ...prev, currentUser: user }));
  };

  const setTheme = (theme: 'light' | 'dark') => {
    if (data.currentUser) {
      setData(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser!]: { theme },
        },
      }));
    }
  };

  const addEvent = (event: AppEvent) => {
    setData(prev => ({ ...prev, events: [...prev.events, event] }));
  };
  
  const updateEvent = (updatedEvent: AppEvent) => {
    setData(prev => ({
        ...prev,
        events: prev.events.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    }));
  };

  const addPhoto = (photo: Photo) => {
    setData(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  };
  
  const updateCheckedDays = (year: number, month: number, day: number) => {
    setData(prev => {
      const newCheckedDays = { ...prev.checkedDays };
      if (!newCheckedDays[year]) {
        newCheckedDays[year] = {};
      }
      if (!newCheckedDays[year][month]) {
        newCheckedDays[year][month] = [];
      }
      if (!newCheckedDays[year][month].includes(day)) {
        newCheckedDays[year][month].push(day);
      }
      return { ...prev, checkedDays: newCheckedDays };
    });
  };

  const incrementPerfectMonths = () => {
    setData(prev => ({...prev, perfectMonthsCount: prev.perfectMonthsCount + 1 }));
  }

  return (
    <AppContext.Provider value={{ ...data, setCurrentUser, setTheme, addEvent, updateEvent, addPhoto, updateCheckedDays, incrementPerfectMonths, isDataLoaded }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
