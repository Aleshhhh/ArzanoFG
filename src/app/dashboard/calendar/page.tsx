'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, Image as ImageIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppContext } from '@/context/AppContext';
import { AppEvent, Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const initialEventState = {
  id: null,
  date: new Date(),
  title: '',
  description: '',
  tags: '',
  photoId: null,
};

export default function CalendarPage() {
  const { events, photos, addEvent, addPhoto, updateEvent, updateCheckedDays } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const selectedDayEvents = selectedDate
    ? events.filter((event) => isSameDay(parseISO(event.date), selectedDate))
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddSheet = () => {
    setEditingEvent({ ...initialEventState, date: selectedDate || new Date() });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsSheetOpen(true);
  };
  
  const handleOpenEditSheet = (event: AppEvent) => {
    const eventPhoto = event.photoId ? photos.find(p => p.id === event.photoId) : null;
    setEditingEvent({
        ...event,
        date: parseISO(event.date),
        tags: event.tags.join(', ')
    });
    setPhotoFile(null);
    setPhotoPreview(eventPhoto?.imageDataUrl || null);
    setIsSheetOpen(true);
  }

  const handleFormChange = (field: string, value: any) => {
    setEditingEvent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = () => {
    if (!editingEvent?.title || !editingEvent?.date) return;

    let photoId: string | undefined = editingEvent.photoId;

    if (photoFile && photoPreview) {
      const newPhoto: Photo = {
        id: new Date().toISOString() + '-photo',
        date: editingEvent.date.toISOString(),
        imageDataUrl: photoPreview,
        description: editingEvent.title,
      };
      addPhoto(newPhoto);
      photoId = newPhoto.id;
    }

    const tagsArray = editingEvent.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);

    const eventToSave: AppEvent = {
      id: editingEvent.id || new Date().toISOString(),
      date: editingEvent.date.toISOString(),
      title: editingEvent.title,
      description: editingEvent.description,
      tags: tagsArray,
      photoId: photoId,
    };

    if (editingEvent.id) { // Editing existing event
        updateEvent(eventToSave);
        toast({ title: "Ricordo aggiornato!", description: "Le modifiche sono state salvate." });
    } else { // Adding new event
        addEvent(eventToSave);
        if (tagsArray.includes('Insieme')) {
            updateCheckedDays(editingEvent.date.getFullYear(), editingEvent.date.getMonth() + 1, editingEvent.date.getDate());
            toast({ title: "Giorno 'Insieme' segnato!", description: "Questo giorno è stato spuntato sulla tua lista." });
        } else {
            toast({ title: "Ricordo aggiunto!", description: "Il nuovo ricordo è stato salvato." });
        }
    }
    
    setIsSheetOpen(false);
  };
  
  const eventDays = events.map(e => parseISO(e.date));

  return (
    <>
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
                selected={selectedDate}
                onSelect={setSelectedDate}
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
                {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: it }) : 'Seleziona una data'}
              </CardTitle>
              <CardDescription>Eventi di questo giorno</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => {
                  const eventPhoto = event.photoId ? photos.find(p => p.id === event.photoId) : null;
                  return (
                      <div key={event.id} onClick={() => handleOpenEditSheet(event)} className="p-3 bg-secondary rounded-lg space-y-2 cursor-pointer hover:bg-muted transition-colors">
                          {eventPhoto && (
                              <div className="relative aspect-video w-full rounded-md overflow-hidden">
                                  <Image src={eventPhoto.imageDataUrl} alt={event.title} layout="fill" objectFit="cover" />
                              </div>
                          )}
                          <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                              {event.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">
                                  {event.tags.map(tag => <span key={tag} className="text-xs bg-primary/50 text-primary-foreground px-2 py-0.5 rounded-full">{tag}</span>)}
                              </div>}
                          </div>
                      </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground italic">Nessun ricordo per questo giorno.</p>
              )}

              <Button className="w-full mt-4" onClick={handleOpenAddSheet}>
                <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Ricordo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md bg-card/80 backdrop-blur-lg overflow-y-auto">
            <SheetHeader>
                <SheetTitle className="font-headline text-2xl">{editingEvent?.id ? 'Modifica ricordo' : 'Aggiungi un nuovo ricordo'}</SheetTitle>
            </SheetHeader>
            {editingEvent && (
                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titolo</Label>
                        <Input id="title" value={editingEvent.title} onChange={(e) => handleFormChange('title', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !editingEvent.date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingEvent.date ? format(editingEvent.date, "PPP", { locale: it }) : <span>Scegli una data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={editingEvent.date}
                                    onSelect={(date) => handleFormChange('date', date)}
                                    initialFocus
                                    locale={it}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea id="description" value={editingEvent.description} onChange={(e) => handleFormChange('description', e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" value={editingEvent.tags} onChange={(e) => handleFormChange('tags', e.target.value)} placeholder="Insieme, Speciale, Divertente" />
                        <p className="text-xs text-muted-foreground">Usa 'Insieme' per segnare i giorni sul tracciatore.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="photo-file">Allega una foto</Label>
                        <Input id="photo-file" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    {photoPreview && (
                        <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden border">
                            <Image src={photoPreview} alt="Anteprima" layout="fill" objectFit="contain" />
                        </div>
                    )}
                </div>
            )}
            <SheetFooter>
                <SheetClose asChild>
                    <Button variant="outline">Annulla</Button>
                </SheetClose>
                <Button onClick={handleSaveEvent}>Salva ricordo</Button>
            </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}