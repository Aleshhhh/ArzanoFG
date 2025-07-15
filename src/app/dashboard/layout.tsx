
'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Image as ImageIcon, Trophy, Sparkles, LogOut, User } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Heart },
    { href: '/dashboard/calendar', label: 'Calendario', icon: Calendar },
    { href: '/dashboard/gallery', label: 'Galleria', icon: ImageIcon },
    { href: '/dashboard/milestones', label: 'Traguardi', icon: Trophy },
    { href: '/dashboard/recap', label: 'Riepilogo Mensile', icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isDataLoaded } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isDataLoaded) {
      if (!currentUser) {
        router.replace('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [currentUser, isDataLoaded, router, isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-20 h-20 border-8 border-t-primary border-muted rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    const { setCurrentUser } = useAppContext();
    setCurrentUser(null);
    router.push('/');
  };

  const profileName = currentUser === 'lui' ? 'Aleh' : 'Angeh';
  const profileInitial = 'A';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Heart className="text-primary" />
              <h1 className="font-headline text-xl font-semibold">Arzano Foggia</h1>
              <div className="ml-auto">
                <SidebarTrigger />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                            <a href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {profileInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{profileName}</p>
              </div>
              <ThemeSwitcher />
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log Out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="container mx-auto max-w-7xl">
                {children}
              </div>
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
