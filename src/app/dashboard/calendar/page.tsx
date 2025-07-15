'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
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
            title: "Day 'Insieme' marked!",
            description: "This day has been checked off on your monthly milestone list."
        });
    }

    setNewEvent({ title: '', description: '', tags: '' });
  };
  
  const eventDays = events.map(e => parseISO(e.date));

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Our Calendar</CardTitle>
          <CardDescription>Select a day to see your memories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
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

      <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
          <CardDescription>Events on this day</CardDescription>
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
            <p className="text-muted-foreground italic">No memories on this day yet.</p>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg">
              <DialogHeader>
                <DialogTitle className="font-headline">Add a new memory</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <Input id="tags" value={newEvent.tags} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} className="col-span-3" placeholder="Insieme, Special, Funny" />
                </div>
                 <p className="text-xs text-muted-foreground text-center col-span-4 px-4">Use the 'Insieme' tag to mark days on the monthly milestone tracker.</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleAddEvent}>Save memory</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
