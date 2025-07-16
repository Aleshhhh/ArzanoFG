'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, UserPreferences, AppEvent, Photo, CheckedDays, AppData } from '@/lib/types';
import { loadData, saveData } from '@/lib/actions';

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

interface AppContextType extends AppData {
  setCurrentUser: (user: UserProfile | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addEvent: (event: AppEvent) => void;
  updateEvent: (event: AppEvent) => void;
  addPhoto: (photo: Photo) => void;
  updateCheckedDays: (year: number, month: number, day: number) => void;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(defaultState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const debouncedData = useDebounce(data, 500); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = await loadData();
        if (storedData) {
            setData(storedData);
             if (storedData.currentUser && storedData.users[storedData.currentUser]) {
                const theme = storedData.users[storedData.currentUser].theme;
                document.documentElement.classList.toggle('dark', theme === 'dark');
            }
        }
      } catch (error) {
        console.error("Failed to load data from server", error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      saveData(debouncedData);
    }
  }, [debouncedData, isDataLoaded]);
  
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
      setData(prev => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        return {
          ...prev,
          users: {
            ...prev.users,
            [prev.currentUser!]: { theme },
          },
        };
      });
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

  return (
    <AppContext.Provider value={{ ...data, setCurrentUser, setTheme, addEvent, updateEvent, addPhoto, updateCheckedDays, isDataLoaded }}>
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
