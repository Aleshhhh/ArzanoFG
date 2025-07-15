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
  prompt: `You are a personal assistant creating a monthly recap for a couple.

  The recap should include a summary of the month's events, based on the provided notes and photos.

  Month: {{{month}}}
  Year: {{{year}}}
  Notes: {{{notes}}}
  Photos:
  {{#each photos}}
  {{media url=this}}
  {{/each}}

  Write a coherent and engaging monthly recap using the above information.`,
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
