'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Image as ImageIcon, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser, events, photos } = useAppContext();

  const profileName = currentUser === 'lui' ? 'Sayan' : 'La Sua Anima Gemella';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Welcome, {profileName}</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here's a glimpse into your shared world.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">total memories saved</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos in Gallery</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photos.length}</div>
            <p className="text-xs text-muted-foreground">cherished moments captured</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-lg hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Our Journey</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">Just Beginning</div>
            <p className="text-xs text-muted-foreground">Check your milestones!</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center mt-12">
        <h2 className="font-headline text-3xl mb-4">What do you want to do today?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard/calendar" passHref>
             <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center gap-2">
                <Calendar className="w-5 h-5"/>
                Add a memory
             </button>
          </Link>
           <Link href="/dashboard/gallery" passHref>
             <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-accent/90 transition-all transform hover:scale-105 flex items-center gap-2">
                <ImageIcon className="w-5 h-5"/>
                Upload a photo
             </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
