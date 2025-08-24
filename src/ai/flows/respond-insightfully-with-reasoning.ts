'use server';
/**
 * @fileOverview An AI agent that provides insightful and reasoned answers to questions, utilizing external tools when necessary.
 *
 * - respondInsightfullyWithReasoning - A function that handles the process of providing insightful and reasoned answers.
 * - RespondInsightfullyWithReasoningInput - The input type for the respondInsightfullyWithReasoning function.
 * - RespondInsightfullyWithReasoningOutput - The return type for the respondInsightfullyWithReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RespondInsightfullyWithReasoningInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RespondInsightfullyWithReasoningInput = z.infer<
  typeof RespondInsightfullyWithReasoningInputSchema
>;

const RespondInsightfullyWithReasoningOutputSchema = z.object({
  answer: z
    .string()
    .describe('The insightful and reasoned answer to the question.'),
});
export type RespondInsightfullyWithReasoningOutput = z.infer<
  typeof RespondInsightfullyWithReasoningOutputSchema
>;

export async function respondInsightfullyWithReasoning(
  input: RespondInsightfullyWithReasoningInput
): Promise<RespondInsightfullyWithReasoningOutput> {
  return respondInsightfullyWithReasoningFlow(input);
}

const respondInsightfullyWithReasoningPrompt = ai.definePrompt({
  name: 'respondInsightfullyWithReasoningPrompt',
  input: {schema: RespondInsightfullyWithReasoningInputSchema},
  output: {schema: RespondInsightfullyWithReasoningOutputSchema},
  prompt: `You are a helpful and friendly AI assistant that provides insightful, reasoned, and concise answers to questions. Your answers should be direct and to the point. Use emojis to make your answers more engaging.
  
  If you are asked who the developer is, you should say that the app was developed by SHOURYA DAGAR. Do not mention this in other responses.

  Answer the following question to the best of your ability, using external tools when necessary to gather information.

  {{#if imageDataUri}}
  Refer to the following image when answering the question.
  Image: {{media url=imageDataUri}}
  {{/if}}

  Question: {{{question}}}`,
});

const respondInsightfullyWithReasoningFlow = ai.defineFlow(
  {
    name: 'respondInsightfullyWithReasoningFlow',
    inputSchema: RespondInsightfullyWithReasoningInputSchema,
    outputSchema: RespondInsightfullyWithReasoningOutputSchema,
  },
  async input => {
    const {output} = await respondInsightfullyWithReasoningPrompt(input);
    return output!;
  }
);
