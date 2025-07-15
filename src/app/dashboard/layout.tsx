
'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Image as ImageIcon, Trophy, Sparkles, LogOut, User, Power, Settings } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Sidebar, SidebarBody, SidebarLink, Logo, LogoIcon } from '@/components/ui/sidebar';
import Link from 'next/link';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: <Heart className="h-5 w-5 shrink-0" /> },
    { href: '/dashboard/calendar', label: 'Calendario', icon: <Calendar className="h-5 w-5 shrink-0" /> },
    { href: '/dashboard/gallery', label: 'Galleria', icon: <ImageIcon className="h-5 w-5 shrink-0" /> },
    { href: '/dashboard/milestones', label: 'Traguardi', icon: <Trophy className="h-5 w-5 shrink-0" /> },
    { href: '/dashboard/recap', label: 'Riepilogo', icon: <Sparkles className="h-5 w-5 shrink-0" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, users, setCurrentUser, isDataLoaded, setTheme } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isDataLoaded) { // Only check user when data is loaded
      if (!currentUser) {
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [currentUser, isDataLoaded, router]);
  
  useEffect(() => {
    if (currentUser) {
      document.documentElement.classList.toggle('dark', users[currentUser].theme === 'dark');
    }
  }, [currentUser, users]);


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-20 h-20 border-8 border-t-primary border-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  const profileName = currentUser === 'lui' ? 'Aleh' : 'Angeh';
  const profileInitial = 'A';

  return (
    <div
      className="mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row h-screen"
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navItems.map((item, idx) => (
                <SidebarLink key={idx} link={{...item, href: item.href}} className={pathname === item.href ? "bg-secondary" : ""}/>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
                <ThemeSwitcher />
                {open && <span className="text-sm">{users[currentUser!].theme === 'dark' ? 'Tema Scuro' : 'Tema Chiaro'}</span>}
             </div>
             <SidebarLink
                link={{
                    label: "Logout",
                    href: "#",
                    icon: <LogOut className="h-5 w-5 shrink-0" />,
                }}
                onClick={handleLogout}
              />
            <SidebarLink
              link={{
                label: profileName,
                href: "#",
                icon: (
                  open ? (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                          {profileInitial}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5 shrink-0" />
                  )
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex flex-1 h-full">
         <div className="flex h-full w-full flex-1 flex-col gap-2 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl h-full">
                {children}
            </div>
         </div>
      </main>
    </div>
  );
}
