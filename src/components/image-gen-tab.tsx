'use client';

import {useState} from 'react';
import Image from 'next/image';
import {ImageIcon, Wand2, Download} from 'lucide-react';
import {generateImage} from '@/ai/flows/generate-image-from-prompt';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {VoiceInputButton} from '@/components/voice-input-button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

export function ImageGenTab() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setImageUrl('');
    setError(null);

    try {
      const result = await generateImage({prompt});
      setImageUrl(result.image);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    // a fun filename could include part of the prompt
    const filename = `${prompt.slice(0, 20).replace(/\s/g, '_') || 'generated'}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setPrompt(transcript);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Describe the image you want to create..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="h-12 text-base bg-transparent"
            disabled={isLoading || isListening}
          />
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            size="lg"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </form>

      <Card className="w-full aspect-video flex items-center justify-center bg-card/50 backdrop-blur-sm border-white/20 overflow-hidden shadow-lg">
        <CardContent className="p-0 w-full h-full flex items-center justify-center relative group">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={prompt}
                width={1024}
                height={576}
                className="object-contain w-full h-full"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownload}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <ImageIcon className="mx-auto h-12 w-12" />
              <p className="mt-4">Your generated image will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
