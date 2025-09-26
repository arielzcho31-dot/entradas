'use server';

/**
 * @fileOverview AI flow to suggest relevant content (blog posts, articles) based on event details.
 *
 * - suggestRelevantContent - The main function to suggest content.
 * - SuggestRelevantContentInput - Input type for the function, including event details.
 * - SuggestRelevantContentOutput - Output type, containing a list of suggested content URLs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantContentInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventDescription: z.string().describe('A detailed description of the event.'),
  eventCategory: z.string().describe('The category of the event (e.g., music, sports, conference).'),
});
export type SuggestRelevantContentInput = z.infer<typeof SuggestRelevantContentInputSchema>;

const SuggestRelevantContentOutputSchema = z.object({
  suggestedContentUrls: z.array(z.string()).describe('A list of URLs for blog posts, articles, or other content relevant to the event.'),
});
export type SuggestRelevantContentOutput = z.infer<typeof SuggestRelevantContentOutputSchema>;

export async function suggestRelevantContent(input: SuggestRelevantContentInput): Promise<SuggestRelevantContentOutput> {
  return suggestRelevantContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantContentPrompt',
  input: {schema: SuggestRelevantContentInputSchema},
  output: {schema: SuggestRelevantContentOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant content for events.

  Given the following event details, suggest a list of relevant blog posts, articles, and other online resources that would enhance a user's understanding or enjoyment of the event.
  Return ONLY a list of valid URLs.

  Event Name: {{{eventName}}}
  Event Description: {{{eventDescription}}}
  Event Category: {{{eventCategory}}}

  Suggested Content URLs:`, // No Handlebars `{{#each}}` as the model directly returns an array of strings.
});

const suggestRelevantContentFlow = ai.defineFlow(
  {
    name: 'suggestRelevantContentFlow',
    inputSchema: SuggestRelevantContentInputSchema,
    outputSchema: SuggestRelevantContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
