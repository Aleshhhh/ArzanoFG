'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Image as ImageIcon, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser, events, photos } = useAppContext();

  const profileName = currentUser === 'lui' ? 'Aleh' : 'Angeh';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Benvenuto/a, {profileName}</h1>
        <p className="text-muted-foreground mt-2 text-lg">Ecco uno sguardo al vostro mondo condiviso.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prossimi Eventi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">ricordi totali salvati</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foto in Galleria</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photos.length}</div>
            <p className="text-xs text-muted-foreground">momenti preziosi catturati</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Il Nostro Viaggio</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">Appena Iniziato</div>
            <p className="text-xs text-muted-foreground">Controlla i tuoi traguardi!</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center py-12">
        <h2 className="font-headline text-3xl mb-4">Cosa vuoi fare oggi?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard/calendar" passHref>
             <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center gap-2">
                <Calendar className="w-5 h-5"/>
                Aggiungi un ricordo
             </button>
          </Link>
           <Link href="/dashboard/gallery" passHref>
             <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 flex items-center gap-2">
                <ImageIcon className="w-5 h-5"/>
                Carica una foto
             </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
