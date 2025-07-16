'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { AppData } from './types';

const dataFilePath = path.join(process.cwd(), 'data', 'db.json');

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

export async function loadData(): Promise<AppData> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    let parsedData = JSON.parse(fileContent);

    // --- Data Migration for old structures ---
    if (parsedData.events && parsedData.events.some((e: any) => 'date' in e)) {
        parsedData.events = parsedData.events.map((e: any) => {
        if ('date' in e) {
            const { date, photoId, ...rest } = e;
            return {
            ...rest,
            startDate: date,
            endDate: null,
            photoIds: photoId ? [photoId] : [],
            };
        }
        return e;
        });
    }
    
    if (parsedData.events) {
        parsedData.events = parsedData.events.map((e: any) => ({
            ...e,
            photoIds: e.photoIds || []
        }));
    }
    // --- End Data Migration ---
    
    return { ...defaultState, ...parsedData };
  } catch (error) {
    // If the file doesn't exist, return default state
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultState;
    }
    console.error('Failed to load data:', error);
    // Return default state in case of other errors
    return defaultState;
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    const dataString = JSON.stringify(data, null, 2);
    await fs.writeFile(dataFilePath, dataString, 'utf-8');
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}
