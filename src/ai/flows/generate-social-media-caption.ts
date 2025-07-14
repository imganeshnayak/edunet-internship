// The use server directive is required for all flow files.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating social media captions.
 *
 * - generateSocialMediaCaption - A function that generates a social media caption based on an image and platform.
 * - GenerateSocialMediaCaptionInput - The input type for the generateSocialMediaCaption function.
 * - GenerateSocialMediaCaptionOutput - The return type for the generateSocialMediaCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a social media caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  platform: z.enum(['Instagram', 'X', 'Facebook', 'LinkedIn']).describe('The social media platform to generate a caption for.'),
});

export type GenerateSocialMediaCaptionInput = z.infer<typeof GenerateSocialMediaCaptionInputSchema>;

const GenerateSocialMediaCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated social media caption.'),
  hashtags: z.array(z.string()).describe('A list of relevant hashtags for the image.'),
});

export type GenerateSocialMediaCaptionOutput = z.infer<typeof GenerateSocialMediaCaptionOutputSchema>;

export async function generateSocialMediaCaption(input: GenerateSocialMediaCaptionInput): Promise<GenerateSocialMediaCaptionOutput> {
  return generateSocialMediaCaptionFlow(input);
}

const generateSocialMediaCaptionPrompt = ai.definePrompt({
  name: 'generateSocialMediaCaptionPrompt',
  input: {schema: GenerateSocialMediaCaptionInputSchema},
  output: {schema: GenerateSocialMediaCaptionOutputSchema},
  prompt: `You are an AI assistant that generates engaging social media captions and relevant hashtags for images.

  Generate a caption and a list of hashtags optimized for {{platform}} using the following image:

  Image: {{media url=photoDataUri}}

  Caption:
  Hashtags:`,
});

const generateSocialMediaCaptionFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaCaptionFlow',
    inputSchema: GenerateSocialMediaCaptionInputSchema,
    outputSchema: GenerateSocialMediaCaptionOutputSchema,
  },
  async input => {
    const {output} = await generateSocialMediaCaptionPrompt(input);
    return output!;
  }
);
