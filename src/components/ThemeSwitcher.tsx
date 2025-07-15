'use client';

import { useAppContext } from '@/context/AppContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { users, currentUser } = useAppContext();
  const currentTheme = currentUser ? users[currentUser].theme : 'light';

  return (
    <div
      aria-label="Toggle theme"
      className="relative flex h-5 w-5 items-center justify-center"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}
