'use client';

import {useState, useRef} from 'react';
import Image from 'next/image';
import {Sparkles, BrainCircuit, Paperclip, X} from 'lucide-react';
import {respondInsightfullyWithReasoning} from '@/ai/flows/respond-insightfully-with-reasoning';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {VoiceInputButton} from '@/components/voice-input-button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';

export function ReasoningTab() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {toast} = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: 'Unsupported file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!question.trim() && !uploadedImage) || isLoading) return;

    setIsLoading(true);
    setAnswer('');
    setError(null);

    try {
      const result = await respondInsightfullyWithReasoning({
        question,
        imageDataUri: uploadedImage ?? undefined,
      });
      setAnswer(result.answer);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuestion(transcript);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadedImage && (
          <div className="relative mb-2 w-fit">
            <Image
              src={uploadedImage}
              alt="preview"
              width={120}
              height={120}
              className="rounded-md object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-muted-foreground/50 text-white hover:bg-muted-foreground"
              onClick={() => setUploadedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="relative">
          <Textarea
            placeholder="Ask Nexora a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="pr-40 min-h-[100px] text-base"
            disabled={isLoading || isListening}
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <VoiceInputButton
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <Button
              type="submit"
              disabled={isLoading || (!question.trim() && !uploadedImage)}
              className="h-10"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Ask
            </Button>
          </div>
        </div>
      </form>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6" />
              Nexora is thinking...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {answer && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              Nexora's Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
