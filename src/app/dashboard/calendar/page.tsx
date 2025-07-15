
'use client';

import { useState } from 'react';
import { format, parseISO, isWithinInterval, startOfDay, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, Image as ImageIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

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

type EditingEventState = {
  id: string | null;
  dateRange: DateRange;
  title: string;
  description: string;
  tags: string;
  currentPhotoIds: string[]; 
  newPhotoFiles: File[];
  newPhotoPreviews: string[];
};

const getInitialEventState = (date: Date): EditingEventState => ({
  id: null,
  dateRange: { from: date, to: date },
  title: '',
  description: '',
  tags: '',
  currentPhotoIds: [],
  newPhotoFiles: [],
  newPhotoPreviews: [],
});

export default function CalendarPage() {
  const { events, photos, addEvent, addPhoto, updateEvent, updateCheckedDays } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EditingEventState | null>(null);
  
  const selectedDayEvents = selectedDate
    ? events.filter((event) => {
        const start = startOfDay(parseISO(event.startDate));
        const end = event.endDate ? startOfDay(parseISO(event.endDate)) : start;
        const selected = startOfDay(selectedDate);
        return isWithinInterval(selected, { start, end });
      })
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && editingEvent) {
      const files = Array.from(e.target.files);
      const newFiles = [...editingEvent.newPhotoFiles, ...files];
      
      const newPreviews: string[] = [];
      let loadedCount = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setEditingEvent(prev => prev ? ({ 
              ...prev, 
              newPhotoFiles: newFiles,
              newPhotoPreviews: [...prev.newPhotoPreviews, ...newPreviews]
            }) : null);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number, type: 'existing' | 'new') => {
    if (!editingEvent) return;
    if (type === 'existing') {
        const newPhotoIds = editingEvent.currentPhotoIds.filter((_, i) => i !== index);
        setEditingEvent(prev => prev ? ({ ...prev, currentPhotoIds: newPhotoIds }) : null);
    } else {
        const newPhotoFiles = editingEvent.newPhotoFiles.filter((_, i) => i !== index);
        const newPhotoPreviews = editingEvent.newPhotoPreviews.filter((_, i) => i !== index);
        setEditingEvent(prev => prev ? ({ ...prev, newPhotoFiles, newPhotoPreviews }) : null);
    }
  };

  const handleOpenAddDialog = () => {
    const fromDate = selectedDate || new Date();
    setEditingEvent(getInitialEventState(fromDate));
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (event: AppEvent) => {
    setEditingEvent({
        id: event.id,
        dateRange: { from: parseISO(event.startDate), to: event.endDate ? parseISO(event.endDate) : parseISO(event.startDate) },
        title: event.title,
        description: event.description,
        tags: event.tags.join(', '),
        currentPhotoIds: [...event.photoIds],
        newPhotoFiles: [],
        newPhotoPreviews: []
    });
    setIsDialogOpen(true);
  }

  const handleFormChange = (field: string, value: any) => {
    setEditingEvent((prev) => (prev ? { ...prev, [field]: value } : null));
  };
  
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range && editingEvent) {
      setEditingEvent({ ...editingEvent, dateRange: range });
    }
  };

  const handleSaveEvent = async () => {
    if (!editingEvent?.title || !editingEvent?.dateRange?.from) return;

    let finalPhotoIds = [...editingEvent.currentPhotoIds];

    if (editingEvent.newPhotoFiles.length > 0) {
      const uploadPromises = editingEvent.newPhotoFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const newPhoto: Photo = {
              id: `${new Date().toISOString()}-photo-${Math.random()}`,
              date: editingEvent.dateRange.from!.toISOString(),
              imageDataUrl: reader.result as string,
              description: editingEvent.title,
            };
            addPhoto(newPhoto);
            resolve(newPhoto.id);
          };
          reader.readAsDataURL(file);
        });
      });
      const uploadedPhotoIds = await Promise.all(uploadPromises);
      finalPhotoIds.push(...uploadedPhotoIds);
    }
    
    const tagsArray = editingEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const eventToSave: AppEvent = {
      id: editingEvent.id || new Date().toISOString(),
      startDate: editingEvent.dateRange.from.toISOString(),
      endDate: editingEvent.dateRange.to ? editingEvent.dateRange.to.toISOString() : null,
      title: editingEvent.title,
      description: editingEvent.description,
      tags: tagsArray,
      photoIds: finalPhotoIds
    };
    
    if (editingEvent.id) {
        updateEvent(eventToSave);
        toast({ title: "Ricordo aggiornato!", description: "Le modifiche sono state salvate." });
    } else {
        addEvent(eventToSave);
        toast({ title: "Ricordo aggiunto!", description: "Il nuovo ricordo è stato salvato." });
    }

    if (tagsArray.includes('Insieme') && editingEvent.dateRange.from) {
        const interval = eachDayOfInterval({
            start: editingEvent.dateRange.from,
            end: editingEvent.dateRange.to || editingEvent.dateRange.from,
        });
        interval.forEach(day => {
            updateCheckedDays(day.getFullYear(), day.getMonth() + 1, day.getDate());
        });
        if (interval.length > 0) {
            toast({ title: "Giorni 'Insieme' segnati!", description: "Questi giorni sono stati spuntati sulla tua lista." });
        }
    }
    
    setIsDialogOpen(false);
    setEditingEvent(null);
  };
  
  const eventDays = events.flatMap(e => {
    const start = parseISO(e.startDate);
    const end = e.endDate ? parseISO(e.endDate) : start;
    return eachDayOfInterval({ start, end });
  });

  const existingPhotoPreviews = editingEvent?.currentPhotoIds.map(id => photos.find(p => p.id === id)).filter(Boolean) as Photo[];

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

        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
          <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl capitalize">
                {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: it }) : 'Seleziona una data'}
              </CardTitle>
              <CardDescription>Eventi di questo giorno</CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => {
                  const eventPhoto = event.photoIds.length > 0 ? photos.find(p => p.id === event.photoIds[0]) : null;
                  const mainTag = event.tags[0];
                  const extraTagsCount = event.tags.length - 1;
                  return (
                      <Card key={event.id} onClick={() => handleOpenEditDialog(event)} className="bg-secondary hover:bg-muted/80 transition-colors cursor-pointer group flex flex-col h-full">
                          <CardHeader className="flex-row items-center justify-between pb-2">
                             <div className="text-sm font-semibold text-muted-foreground capitalize">{format(parseISO(event.startDate), 'd MMM', { locale: it })}</div>
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
                       <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{editingEvent?.id ? 'Modifica ricordo' : 'Aggiungi un nuovo ricordo'}</DialogTitle>
            </DialogHeader>
            {editingEvent && (
                <div className="py-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid gap-6 pr-4">
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
                                        !editingEvent.dateRange?.from && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingEvent.dateRange?.from ? (
                                        editingEvent.dateRange.to ? (
                                        <>
                                            {format(editingEvent.dateRange.from, "d MMMM", { locale: it })} -{' '}
                                            {format(editingEvent.dateRange.to, "d MMMM yyyy", { locale: it })}
                                        </>
                                        ) : (
                                        format(editingEvent.dateRange.from, "d MMMM yyyy", { locale: it })
                                        )
                                    ) : (
                                        <span>Scegli una data</span>
                                    )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <div className="p-2 border-b">
                                    <div className="text-sm font-medium">
                                        <span className="text-muted-foreground">Data inizio:</span> {editingEvent.dateRange.from ? format(editingEvent.dateRange.from, 'd MMM yyyy', {locale: it}) : '...'}
                                    </div>
                                    <div className="text-sm font-medium">
                                        <span className="text-muted-foreground">Data fine:</span> {editingEvent.dateRange.to ? format(editingEvent.dateRange.to, 'd MMM yyyy', {locale: it}) : '...'}
                                    </div>
                                    </div>
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={editingEvent.dateRange?.from}
                                        selected={editingEvent.dateRange}
                                        onSelect={handleDateRangeSelect}
                                        numberOfMonths={1}
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
                            <Label>Allega foto</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {existingPhotoPreviews.map((photo, index) => (
                                    <div key={photo.id} className="relative w-full h-24 rounded-md overflow-hidden border group">
                                        <Image src={photo.imageDataUrl} alt={`Foto ${index + 1}`} layout="fill" objectFit="cover" />
                                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index, 'existing')}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {editingEvent.newPhotoPreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative w-full h-24 rounded-md overflow-hidden border group">
                                        <Image src={preview} alt={`Anteprima ${index + 1}`} layout="fill" objectFit="cover" />
                                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index, 'new')}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <FileInput
                                id="photo-upload"
                                accept="image/*"
                                onFileChange={handleFileChange}
                                multiple
                            />
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => setEditingEvent(null)}>Annulla</Button>
                </DialogClose>
                <Button onClick={handleSaveEvent}>Salva ricordo</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
