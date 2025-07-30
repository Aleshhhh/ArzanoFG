import { ProfileSelector } from '@/components/ProfileSelector';
import { Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
           <Heart className="text-primary w-12 h-12 mr-4" />
           <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">
            Arzano Foggia
           </h1>
           <Heart className="text-primary w-12 h-12 ml-4" />
        </div>
        <p className="font-body text-lg text-muted-foreground mb-12">
          La nostra storia condivisa, un giorno alla volta.
        </p>
        <ProfileSelector />
      </div>
    </main>
  );
}
