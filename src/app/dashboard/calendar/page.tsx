'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { AppEvent } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const { events, addEvent, updateCheckedDays } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({ title: '', description: '', tags: '' });

  const selectedDayEvents = date
    ? events.filter(
        (event) => format(parseISO(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    : [];

  const handleAddEvent = () => {
    if (!newEvent.title || !date) return;

    const tagsArray = newEvent.tags.split(',').map((tag) => tag.trim()).filter(Boolean);

    const event: AppEvent = {
      id: new Date().toISOString(),
      date: date.toISOString(),
      title: newEvent.title,
      description: newEvent.description,
      tags: tagsArray,
    };
    addEvent(event);

    if (tagsArray.includes('Insieme')) {
        updateCheckedDays(date.getFullYear(), date.getMonth() + 1, date.getDate());
        toast({
            title: "Giorno 'Insieme' segnato!",
            description: "Questo giorno è stato spuntato sulla tua lista di traguardi mensili."
        });
    }

    setNewEvent({ title: '', description: '', tags: '' });
  };
  
  const eventDays = events.map(e => parseISO(e.date));

  return (
    <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-3">
      <div className="md:col-span-2 lg:col-span-3 xl:col-span-2 space-y-8">
        <Card className="bg-card/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Il Nostro Calendario</CardTitle>
            <CardDescription>Seleziona un giorno per vedere i tuoi ricordi.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              locale={it}
              modifiers={{ event: eventDays }}
              modifiersStyles={{
                  event: {
                      border: "2px solid hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      backgroundColor: "hsl(var(--primary) / 0.2)"
                  }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 lg:col-span-2 xl:col-span-1 space-y-8">
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl capitalize">
              {date ? format(date, 'MMMM d, yyyy', { locale: it }) : 'Seleziona una data'}
            </CardTitle>
            <CardDescription>Eventi di questo giorno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="p-3 bg-secondary rounded-lg">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  {event.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">
                      {event.tags.map(tag => <span key={tag} className="text-xs bg-primary/50 text-primary-foreground px-2 py-0.5 rounded-full">{tag}</span>)}
                  </div>}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">Nessun ricordo per questo giorno.</p>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Ricordo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline">Aggiungi un nuovo ricordo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Titolo</Label>
                    <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Descrizione</Label>
                    <Textarea id="description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">Tags</Label>
                    <Input id="tags" value={newEvent.tags} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} className="col-span-3" placeholder="Insieme, Speciale, Divertente" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center col-span-4 px-4">Usa il tag 'Insieme' per segnare i giorni sul tracciatore di traguardi mensili.</p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit" onClick={handleAddEvent}>Salva ricordo</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
