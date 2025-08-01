
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { generateMonthlyRecap, GenerateMonthlyRecapInput } from '@/ai/flows/generate-monthly-recap';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Counter from '@/components/ui/counter';
import { Dropdown } from 'primereact/dropdown';

const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2024, i);
    const monthName = format(d, 'MMMM', { locale: it });
    return {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        code: (i + 1).toString()
    };
});

export default function RecapPage() {
  const { photos } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recap, setRecap] = useState('');
  const [formData, setFormData] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear(),
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, month: value }));
  }

  const handleYearChange = (amount: number) => {
    setFormData(prev => ({ ...prev, year: prev.year + amount }));
  };

  const handleGenerateRecap = async () => {
    if (!formData.month || !formData.year) {
      toast({ title: 'Per favore seleziona un mese e un anno', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setRecap('');

    try {
        const targetMonth = parseInt(formData.month, 10) -1;
        const targetYear = formData.year;

        const relevantPhotos = photos
            .filter(p => {
                const photoDate = new Date(p.date);
                return photoDate.getMonth() === targetMonth && photoDate.getFullYear() === targetYear;
            })
            .map(p => p.imageDataUrl);
      
        const input: GenerateMonthlyRecapInput = {
            month: months.find(m => m.code === formData.month)?.name || '',
            year: formData.year.toString(),
            notes: formData.notes,
            photos: relevantPhotos,
        };

        const result = await generateMonthlyRecap(input);
        setRecap(result.recap);
        
    } catch (error) {
      console.error('Generazione riepilogo fallita:', error);
      toast({ title: 'Generazione riepilogo fallita', description: 'Per favore riprova più tardi.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedMonthObject = months.find(m => m.code === formData.month) || null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
         <Card className="bg-card/50 backdrop-blur-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Riepilogo Mensile</CardTitle>
                <CardDescription>Lascia che l'AI intrecci i vostri ricordi in una bellissima storia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="month">Mese</Label>
                         <Dropdown 
                            value={selectedMonthObject} 
                            onChange={(e) => handleSelectChange(e.value.code)} 
                            options={months} 
                            optionLabel="name" 
                            placeholder="Mese" 
                            className="w-full h-10 flex items-center border-2 border-input bg-background rounded-md text-sm font-bold"
                            panelClassName="bg-background text-foreground border-2 border-input rounded-md"
                            checkmark={true} 
                            highlightOnSelect={false} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="year">Anno</Label>
                        <div className="flex h-10 items-center justify-between rounded-md border-2 border-input bg-background px-3 text-sm ring-offset-background">
                            <Counter value={formData.year} fontSize={16} />
                             <div className="flex items-center">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleYearChange(-1)}>
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleYearChange(1)}>
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Le Tue Note</Label>
                    <Textarea id="notes" name="notes" placeholder="Annota momenti chiave, sentimenti o battute del mese..." value={formData.notes} onChange={handleInputChange} rows={5} />
                </div>
                <Button onClick={handleGenerateRecap} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Genera Riepilogo
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
         <Card className="bg-card/50 backdrop-blur-lg min-h-[500px]">
             <CardHeader>
                <CardTitle className="font-headline text-2xl">La Vostra Storia</CardTitle>
                <CardDescription>Il bellissimo riassunto del vostro mese insieme.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <div className="w-20 h-20 border-8 border-t-primary border-secondary rounded-full animate-spin"></div>
                        <p className="font-semibold mt-4">La nostra AI sta scrivendo la vostra storia d'amore...</p>
                        <p className="text-sm">Potrebbe volerci un momento.</p>
                    </div>
                )}
                {recap && (
                    <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap font-body">
                      {recap}
                    </div>
                )}
                 {!isLoading && !recap && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
                        <Sparkles className="h-16 w-16 mb-4 text-primary/50" />
                        <p className="font-semibold text-xl">Il tuo riepilogo generato apparirà qui.</p>
                    </div>
                 )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
