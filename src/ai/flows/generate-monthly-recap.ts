'use server';

/**
 * @fileOverview A monthly recap generator AI agent.
 *
 * - generateMonthlyRecap - A function that handles the monthly recap generation process.
 * - GenerateMonthlyRecapInput - The input type for the generateMonthlyRecap function.
 * - GenerateMonthlyRecapOutput - The return type for the generateMonthlyRecap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyRecapInputSchema = z.object({
  month: z.string().describe('The month for which the recap is generated (e.g., "July").'),
  year: z.string().describe('The year for which the recap is generated (e.g., "2024").'),
  photos: z
    .array(z.string())
    .describe(
      'Array of photo data URIs (as strings) to include in the recap, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' + 
      'Example: [\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+bA8JgAAAADAQBl4QtQAAAAASUVORK5CYII=\']'
    ),
  notes: z.string().describe('A summary of notes from the month.'),
});
export type GenerateMonthlyRecapInput = z.infer<typeof GenerateMonthlyRecapInputSchema>;

const GenerateMonthlyRecapOutputSchema = z.object({
  recap: z.string().describe('The generated monthly recap.'),
});
export type GenerateMonthlyRecapOutput = z.infer<typeof GenerateMonthlyRecapOutputSchema>;

export async function generateMonthlyRecap(input: GenerateMonthlyRecapInput): Promise<GenerateMonthlyRecapOutput> {
  return generateMonthlyRecapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyRecapPrompt',
  input: {schema: GenerateMonthlyRecapInputSchema},
  output: {schema: GenerateMonthlyRecapOutputSchema},
  prompt: `Sei un assistente personale che crea un riepilogo mensile per una coppia. Il tuo tono è caloroso, romantico e un po' poetico.

Il riepilogo deve includere un sommario degli eventi del mese, basato sulle note e sulle foto fornite.

Mese: {{{month}}}
Anno: {{{year}}}
Note: {{{notes}}}
Foto:
{{#each photos}}
{{media url=this}}
{{/each}}

Scrivi un riepilogo mensile coerente e coinvolgente in italiano usando le informazioni qui sopra. Racconta una storia, non elencare solo i fatti.`,
});

const generateMonthlyRecapFlow = ai.defineFlow(
  {
    name: 'generateMonthlyRecapFlow',
    inputSchema: GenerateMonthlyRecapInputSchema,
    outputSchema: GenerateMonthlyRecapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
