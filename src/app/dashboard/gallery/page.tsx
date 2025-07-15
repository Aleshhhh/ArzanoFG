
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { Photo } from '@/lib/types';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { FileInput } from '@/components/ui/file-input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GalleryPage() {
  const { photos, addPhoto } = useAppContext();
  const [newPhoto, setNewPhoto] = useState<{ description: string; file: File | null }>({ description: '', file: null });
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(prev => ({ ...prev, file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetForm = () => {
      setNewPhoto({ description: '', file: null });
      setPreview(null);
  }

  const handleAddPhoto = () => {
    if (!newPhoto.file || !preview) {
        toast({
            title: "Errore",
            description: "Per favore seleziona una foto da caricare.",
            variant: "destructive"
        })
        return
    };

    const photo: Photo = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      imageDataUrl: preview,
      description: newPhoto.description,
    };
    addPhoto(photo);

    toast({
        title: "Foto Aggiunta!",
        description: "Il tuo nuovo ricordo è stato aggiunto alla galleria."
    });
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  const sortedPhotos = useMemo(() => {
    return [...photos]
      .filter(p => p.imageDataUrl) 
      .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [photos]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl">La Nostra Galleria</h1>
          <p className="text-muted-foreground mt-1">Una collezione dei nostri momenti più preziosi.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm()}} modal={false}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Aggiungi una nuova foto</DialogTitle>
            </DialogHeader>
            <ScrollArea className="-mx-6 px-6 max-h-[70vh]">
                <div className="space-y-6 py-4 px-4">
                    <div className="space-y-2">
                      <Label htmlFor="photo-file">Foto</Label>
                      <FileInput
                        id="photo-file"
                        accept="image/*"
                        onFileChange={handleFileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrizione</Label>
                      <Textarea id="description" value={newPhoto.description} onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })} />
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annulla</Button>
              </DialogClose>
              <Button type="submit" onClick={handleAddPhoto}>Salva Foto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden bg-card/50 backdrop-blur-lg group">
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <Image src={photo.imageDataUrl} alt={photo.description} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint="couple romantic" />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start p-4">
                 <p className="font-semibold text-sm">{photo.description}</p>
                 <p className="text-xs text-muted-foreground capitalize">{format(parseISO(photo.date), "MMMM d, yyyy", { locale: it })}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-card/30">
          <ImageIcon className="w-16 h-16 mb-4" />
          <h3 className="font-headline text-2xl">La tua galleria è vuota</h3>
          <p>Inizia aggiungendo la vostra prima foto insieme!</p>
        </div>
      )}
    </div>
  );
}
