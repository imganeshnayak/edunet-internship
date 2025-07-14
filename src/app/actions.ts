
'use server';

import { generateSocialMediaCaption, GenerateSocialMediaCaptionInput } from '@/ai/flows/generate-social-media-caption';
import { incorporateTrendingTopics } from '@/ai/flows/incorporate-trending-topics';
import { z } from 'zod';

const ActionInputSchema = z.object({
  photo: z.instanceof(File),
  platform: z.enum(['Instagram', 'X', 'Facebook', 'LinkedIn']),
});

export interface AppState {
  caption?: string;
  hashtags?: string[];
  error?: string;
  imageUrl?: string;
}

const initialState: AppState = {};

export async function generateContent(
  prevState: AppState,
  formData: FormData
): Promise<AppState> {
  const validatedFields = ActionInputSchema.safeParse({
    photo: formData.get('photo'),
    platform: formData.get('platform'),
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map((issue) => issue.message).join(', ');
    return { ...initialState, error: `Invalid input: ${errorMessages}` };
  }
  
  const { photo: photoFile, platform } = validatedFields.data;


  if (!photoFile || photoFile.size === 0) {
    return { ...initialState, error: 'Please upload an image.' };
  }
  if (!platform) {
    return { ...initialState, error: 'Please select a platform.' };
  }

  const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
  const photoDataUri = `data:${photoFile.type};base64,${photoBuffer.toString('base64')}`;

  try {
    const captionResult = await generateSocialMediaCaption({ photoDataUri, platform });
    if (!captionResult) {
        return { ...initialState, error: 'Failed to generate content.' };
    }
    
    const trendingHashtags = await incorporateTrendingTopics({
        platform: platform,
        hashtags: captionResult.hashtags,
    });

    return {
      ...initialState,
      caption: captionResult.caption,
      hashtags: trendingHashtags,
      imageUrl: photoDataUri,
    };
  } catch (e: any) {
    console.error(e);
    return { ...initialState, error: e.message || 'An unexpected error occurred.' };
  }
}
