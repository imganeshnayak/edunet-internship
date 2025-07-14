// Incorporate trending topics into hashtag suggestions.

'use server';

/**
 * @fileOverview Flow to incorporate trending topics from a social media platform into hashtag suggestions.
 *
 * - incorporateTrendingTopics - A function that incorporates trending topics into hashtag suggestions.
 * - IncorporateTrendingTopicsInput - The input type for the incorporateTrendingTopics function.
 * - IncorporateTrendingTopicsOutput - The return type for the incorporateTrendingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncorporateTrendingTopicsInputSchema = z.object({
  platform: z.string().describe('The social media platform (e.g., Instagram, X, Facebook, LinkedIn).'),
  hashtags: z.array(z.string()).describe('The initial list of hashtags.'),
});
export type IncorporateTrendingTopicsInput = z.infer<typeof IncorporateTrendingTopicsInputSchema>;

const IncorporateTrendingTopicsOutputSchema = z.array(z.string()).describe('The list of hashtags with trending topics incorporated.');
export type IncorporateTrendingTopicsOutput = z.infer<typeof IncorporateTrendingTopicsOutputSchema>;

export async function incorporateTrendingTopics(
  input: IncorporateTrendingTopicsInput
): Promise<IncorporateTrendingTopicsOutput> {
  return incorporateTrendingTopicsFlow(input);
}

const trendingTopicsTool = ai.defineTool({
  name: 'getTrendingTopics',
  description: 'Retrieves the current trending topics for a given social media platform.',
  inputSchema: z.object({
    platform: z.string().describe('The social media platform to get trending topics from.'),
  }),
  outputSchema: z.array(z.string()).describe('A list of trending topics for the specified platform.'),
},
async (input) => {
    // TODO: Replace with actual implementation to fetch trending topics for the given platform
    // This is a placeholder implementation
    if (input.platform === 'Instagram') {
      return ['#instagood', '#photooftheday', '#fashion'];
    } else if (input.platform === 'X') {
      return ['#news', '#tech', '#sports'];
    } else {
      return [];
    }
  }
);

const incorporateTrendingTopicsPrompt = ai.definePrompt({
  name: 'incorporateTrendingTopicsPrompt',
  tools: [trendingTopicsTool],
  input: {schema: IncorporateTrendingTopicsInputSchema},
  output: {schema: IncorporateTrendingTopicsOutputSchema},
  prompt: `You are an expert in social media trends and hashtag optimization.

You are given an initial list of hashtags and a social media platform.
Your task is to incorporate relevant trending topics from the given platform into the hashtag list, with a maximum of 20 hashtags.

Initial Hashtags: {{hashtags}}
Social Media Platform: {{platform}}

You can use the getTrendingTopics tool to retrieve trending topics for the platform.

Return the final list of hashtags.`,
});

const incorporateTrendingTopicsFlow = ai.defineFlow(
  {
    name: 'incorporateTrendingTopicsFlow',
    inputSchema: IncorporateTrendingTopicsInputSchema,
    outputSchema: IncorporateTrendingTopicsOutputSchema,
  },
  async input => {
    const {output} = await incorporateTrendingTopicsPrompt(input);
    return output!;
  }
);
