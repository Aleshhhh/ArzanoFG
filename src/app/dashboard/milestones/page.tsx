'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CalendarHeart, CheckCircle2 } from 'lucide-react';
import { differenceInYears, differenceInMonths, getDaysInMonth, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const START_DATE = new Date('2024-08-25T00:00:00');

export default function MilestonesPage() {
  const { checkedDays, perfectMonthsCount, incrementPerfectMonths } = useAppContext();
  const [timeTogether, setTimeTogether] = useState({ years: 0, months: 0 });
  const [showCongrats, setShowCongrats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const now = new Date();
    
    const years = differenceInYears(now, START_DATE);
    
    let totalMonths = differenceInMonths(now, START_DATE);
    if(now.getDate() < START_DATE.getDate()) {
        totalMonths--;
    }
    
    setTimeTogether({ years, months: totalMonths });
  }, []);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const daysInCurrentMonth = getDaysInMonth(today);
  const checkedDaysForCurrentMonth = checkedDays[currentYear]?.[currentMonth] || [];

  useEffect(() => {
    const isMonthCompleted = checkedDaysForCurrentMonth.length >= daysInCurrentMonth;
    const completedMonthId = `${currentYear}-${currentMonth}`;
    const hasBeenCongratulated = localStorage.getItem(completedMonthId) === 'true';

    if (isMonthCompleted && !hasBeenCongratulated) {
      setShowCongrats(true);
      incrementPerfectMonths();
      localStorage.setItem(completedMonthId, 'true');
      toast({
        title: "Congratulazioni!",
        description: "Avete completato un altro mese insieme!"
      });
    }
  }, [checkedDaysForCurrentMonth.length, daysInCurrentMonth, incrementPerfectMonths, toast, currentYear, currentMonth]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">I Nostri Traguardi</h1>
        <p className="text-muted-foreground mt-1">Celebrando ogni passo del nostro viaggio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Insieme</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold font-headline">{timeTogether.years} <span className="text-2xl text-muted-foreground">Anni</span></div>
            <div className="text-4xl font-bold font-headline">{timeTogether.months} <span className="text-2xl text-muted-foreground">Mesi</span></div>
            <p className="text-xs text-muted-foreground">dal 25 Agosto 2024</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mesi Perfetti</CardTitle>
            <CalendarHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold font-headline">{perfectMonthsCount}</div>
            <p className="text-xs text-muted-foreground">Mesi con ogni giorno 'Insieme' segnato!</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Giorni 'Insieme' Questo Mese</CardTitle>
          <p className="text-muted-foreground text-sm capitalize">Una checklist dei nostri giorni insieme a {format(today, 'MMMM yyyy', { locale: it })}.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-11 gap-2">
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((day) => {
              const isChecked = checkedDaysForCurrentMonth.includes(day);
              return (
                <div
                  key={day}
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300
                    ${isChecked ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'bg-secondary'}`}
                >
                  {isChecked ? <CheckCircle2 /> : day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showCongrats} onOpenChange={setShowCongrats}>
        <AlertDialogContent className="bg-card/80 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-center text-3xl">Congratulazioni!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-4 capitalize">
              Avete segnato ogni giorno di {format(today, 'MMMM', { locale: it })} come un giorno 'Insieme'!
              Un altro bellissimo mese aggiunto alla vostra storia d'amore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full">Continuate ad amarvi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
