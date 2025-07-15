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
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Image as ImageIcon, Trophy, Sparkles, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Heart },
    { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    { href: '/dashboard/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/dashboard/milestones', label: 'Milestones', icon: Trophy },
    { href: '/dashboard/recap', label: 'Monthly Recap', icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isDataLoaded, setCurrentUser } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isDataLoaded && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, isDataLoaded, router]);

  if (!isDataLoaded || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="font-headline text-2xl">Loading your love story...</div>
      </div>
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  const profileName = currentUser === 'lui' ? 'Sayan' : 'La Sua Anima Gemella';
  const profileInitial = currentUser === 'lui' ? 'S' : 'A';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Heart className="text-primary" />
              <h1 className="font-headline text-xl font-semibold">Amore Eterno</h1>
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
            <main className="p-4 sm:p-6 lg:p-8 h-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
