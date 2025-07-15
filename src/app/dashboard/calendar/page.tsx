
'use client';

import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, Image as ImageIcon, Plus, Tag, Calendar as CalendarIconComponent } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppContext } from '@/context/AppContext';
import { AppEvent, Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FileInput } from '@/components/ui/file-input';
import { Badge } from '@/components/ui/badge';

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
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

  const handleOpenAddDialog = () => {
    setEditingEvent({ ...initialEventState, date: selectedDate || new Date() });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (event: AppEvent) => {
    const eventPhoto = event.photoId ? photos.find(p => p.id === event.photoId) : null;
    setEditingEvent({
        ...event,
        date: parseISO(event.date),
        tags: event.tags.join(', ')
    });
    setPhotoFile(null);
    setPhotoPreview(eventPhoto?.imageDataUrl || null);
    setIsDialogOpen(true);
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
    
    setIsDialogOpen(false);
  };
  
  const eventDays = events.map(e => parseISO(e.date));

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[2fr_3fr]">
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

        <div className="space-y-4">
          <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl capitalize">
                {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: it }) : 'Seleziona una data'}
              </CardTitle>
              <CardDescription>Eventi di questo giorno</CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => {
                  const eventPhoto = event.photoId ? photos.find(p => p.id === event.photoId) : null;
                  const mainTag = event.tags[0];
                  const extraTagsCount = event.tags.length - 1;
                  return (
                      <Card key={event.id} onClick={() => handleOpenEditDialog(event)} className="bg-secondary hover:bg-muted/80 transition-colors cursor-pointer group flex flex-col h-full">
                          <CardHeader className="flex-row items-center justify-between pb-2">
                             <div className="text-sm font-semibold text-muted-foreground capitalize">{format(parseISO(event.date), 'd MMM', { locale: it })}</div>
                             {mainTag && (
                                <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="border-primary/50 bg-primary/20 text-primary-foreground">{mainTag}</Badge>
                                    {extraTagsCount > 0 && <Badge variant="secondary" className="px-2">+{extraTagsCount}</Badge>}
                                </div>
                             )}
                          </CardHeader>
                          <CardContent className="flex-grow flex flex-col justify-between pt-2">
                              {eventPhoto && (
                                  <div className="relative aspect-video w-full rounded-md overflow-hidden mb-3">
                                      <Image src={eventPhoto.imageDataUrl} alt={event.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform" />
                                  </div>
                              )}
                              <div className={cn(!eventPhoto && "flex-grow flex flex-col justify-center")}>
                                  <h3 className="font-headline text-lg font-semibold leading-tight">{event.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
                              </div>
                          </CardContent>
                      </Card>
                  )
                })
              ) : (
                <Card className="border-dashed border-2 bg-transparent col-span-full">
                    <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                       <CalendarIconComponent className="w-12 h-12 mb-2" />
                       <h3 className="font-headline text-xl">Nessun ricordo</h3>
                       <p className="text-sm">Aggiungi un nuovo ricordo per questo giorno.</p>
                    </CardContent>
                </Card>
              )}

             <Card onClick={handleOpenAddDialog} className="border-dashed border-2 bg-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer">
                <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground hover:text-primary">
                    <PlusCircle className="w-12 h-12" />
                    <span className="mt-2 font-semibold">Aggiungi Ricordo</span>
                </CardContent>
             </Card>
            </div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{editingEvent?.id ? 'Modifica ricordo' : 'Aggiungi un nuovo ricordo'}</DialogTitle>
            </DialogHeader>
            {editingEvent && (
                <div className="grid gap-6 py-6 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titolo</Label>
                        <Input id="title" value={editingEvent.title} onChange={(e) => handleFormChange('title', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
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
                                    onSelect={(date) => {
                                        handleFormChange('date', date)
                                        setIsDatePopoverOpen(false)
                                    }}
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
                        <Label>Allega una foto</Label>
                        {photoPreview ? (
                            <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden border">
                                <Image src={photoPreview} alt="Anteprima" layout="fill" objectFit="contain" />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setPhotoFile(null);
                                        setPhotoPreview(null);
                                        if (editingEvent?.photoId) {
                                            handleFormChange('photoId', undefined);
                                        }
                                    }}
                                >
                                    Rimuovi
                                </Button>
                            </div>
                        ) : (
                            <FileInput
                                accept="image/*"
                                onFileChange={handleFileChange}
                            />
                        )}
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={handleSaveEvent}>Salva ricordo</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
