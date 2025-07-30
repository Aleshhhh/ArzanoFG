'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

const profiles = [
  { id: 'lui', name: 'Aleh', initial: 'A' },
  { id: 'lei', name: 'Angeh', initial: 'A' },
];

export function ProfileSelector() {
  const router = useRouter();
  const { setCurrentUser, isDataLoaded } = useAppContext();

  const handleSelectProfile = (profileId: 'lui' | 'lei') => {
    setCurrentUser(profileId);
    router.push('/dashboard');
  };

  if (!isDataLoaded) {
    return <div className="h-48 flex items-center justify-center"><div className="w-16 h-16 border-4 border-t-primary border-secondary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {profiles.map((profile) => (
        <div key={profile.id} onClick={() => handleSelectProfile(profile.id as 'lui' | 'lei')} className="cursor-pointer group">
          <Card className="w-64 h-72 pt-6 bg-card/30 backdrop-blur-lg border-2 border-transparent group-hover:border-primary transition-all duration-300 transform group-hover:scale-105 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center text-center gap-4">
              <Avatar className="w-28 h-28 border-4 border-primary/50 group-hover:border-primary transition-all duration-300">
                <AvatarFallback className="bg-primary/20 text-primary text-5xl font-headline">
                  {profile.initial}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-headline text-2xl font-semibold mt-4">{profile.name}</h2>
              <p className="text-muted-foreground">Seleziona Profilo</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
