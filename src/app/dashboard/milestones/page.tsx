'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CalendarHeart, CheckCircle2 } from 'lucide-react';
import { differenceInYears, differenceInMonths, getDaysInMonth, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAppContext } from '@/context/AppContext';

const START_DATE = new Date('2024-08-25T00:00:00');

export default function MilestonesPage() {
  const { checkedDays } = useAppContext();
  const [timeTogether, setTimeTogether] = useState({ years: 0, months: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    
    const years = differenceInYears(now, START_DATE);
    
    let totalMonths = differenceInMonths(now, START_DATE);
    if(now.getDate() < START_DATE.getDate()) {
        totalMonths--;
    }
    
    setTimeTogether({ years, months: totalMonths });
  }, []);

  const { totalDaysTogether, completeMonths } = useMemo(() => {
    let totalDays = 0;
    const uniqueDayNumbers = new Set<number>();

    if (checkedDays) {
      for (const year in checkedDays) {
        for (const month in checkedDays[year]) {
          const days = checkedDays[year][month];
          totalDays += days.length;
          days.forEach(day => uniqueDayNumbers.add(day));
        }
      }
    }
    
    const calculatedCompleteMonths = Math.floor(uniqueDayNumbers.size / 31);
    
    return {
      totalDaysTogether: totalDays,
      completeMonths: calculatedCompleteMonths,
    };
  }, [checkedDays]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const daysInCurrentMonth = getDaysInMonth(today);
  const checkedDaysForCurrentMonth = (isClient && checkedDays[currentYear]?.[currentMonth]) || [];
  
  if (!isClient) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-20 h-20 border-8 border-t-primary border-secondary rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">I Nostri Traguardi</h1>
        <p className="text-muted-foreground mt-1">Celebrando ogni passo del nostro viaggio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Giorni Totali Insieme</CardTitle>
            <CalendarHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold font-headline">{totalDaysTogether}</div>
            <p className="text-xs text-muted-foreground">giorni totali segnati come 'Insieme'!</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mesi Completi</CardTitle>
            <CalendarHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold font-headline">{completeMonths}</div>
            <p className="text-xs text-muted-foreground">Ogni "mese" è un set di 31 giorni unici passati insieme.</p>
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
    </div>
  );
}
