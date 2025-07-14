'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { generateContent, type AppState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ImageUp, Loader2, Copy, Check, X as XIcon, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';

const initialState: AppState = {};

const platforms = [
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'X', label: 'X (Twitter)', icon: Twitter },
  { value: 'Facebook', label: 'Facebook', icon: Facebook },
  { value: 'LinkedIn', label: 'LinkedIn', icon: Linkedin },
];

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button aria-label="Copy" variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export default function ClientPage() {
  const [state, formAction] = useFormState(generateContent, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (state.caption) {
      // Clear file input after successful submission
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImagePreview(null);
    }
  }, [state.caption])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Generate Content
      </Button>
    );
  };
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          TrendifyAI
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Upload an image, select a platform, and let AI generate your next viral post.
        </p>
      </header>

      <div className="grid gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create Your Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo">Upload Image</Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                {imagePreview ? (
                  <div className="relative group">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      width={400}
                      height={400}
                      className="w-full h-auto max-h-80 object-contain rounded-md border"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={clearImage}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageUp className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Social Media Platform</Label>
                 <Select name="platform" required defaultValue="Instagram">
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <p.icon className="h-4 w-4" />
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        {useFormStatus().pending && (
           <Card className="shadow-lg animate-pulse">
            <CardHeader><CardTitle className="font-headline text-2xl">Generating...</CardTitle></CardHeader>
             <CardContent className="space-y-6">
                <div className="w-full h-64 bg-muted rounded-md"></div>
                <div className="space-y-2">
                   <div className="h-4 w-24 bg-muted rounded"></div>
                   <div className="h-20 w-full bg-muted rounded-md"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 w-24 bg-muted rounded"></div>
                   <div className="flex flex-wrap gap-2">
                      <div className="h-6 w-20 bg-muted rounded-full"></div>
                      <div className="h-6 w-24 bg-muted rounded-full"></div>
                      <div className="h-6 w-16 bg-muted rounded-full"></div>
                      <div className="h-6 w-28 bg-muted rounded-full"></div>
                   </div>
                </div>
             </CardContent>
           </Card>
        )}

        {state.caption && !useFormStatus().pending && (
          <Card className="shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.imageUrl && (
                 <Image
                    src={state.imageUrl}
                    alt="Uploaded image"
                    width={400}
                    height={400}
                    className="w-full h-auto max-h-80 object-contain rounded-md border"
                    data-ai-hint="social media lifestyle"
                 />
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="caption">Generated Caption</Label>
                  <CopyButton textToCopy={state.caption || ''} />
                </div>
                <Textarea id="caption" readOnly value={state.caption} className="h-32" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Suggested Hashtags</Label>
                  <CopyButton textToCopy={state.hashtags?.join(' ') || ''} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.hashtags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
