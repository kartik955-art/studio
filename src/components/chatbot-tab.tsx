'use client';

import {useState, useRef, useEffect} from 'react';
import Image from 'next/image';
import {
  Send,
  BrainCircuit,
  User,
  Sparkles,
  Paperclip,
  X,
  Camera,
} from 'lucide-react';
import {respondInsightfullyWithReasoning} from '@/ai/flows/respond-insightfully-with-reasoning';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Avatar} from '@/components/ui/avatar';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {cn} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {CameraCapture} from '@/components/camera-capture';

interface Message {
  role: 'user' | 'bot';
  content: string;
  image?: string;
}

function BotMessage({content}: {content: string}) {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent('');
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(prev => prev + content.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 10); // Adjust speed of typing animation here

    return () => clearInterval(intervalId);
  }, [content]);

  return <p className="whitespace-pre-wrap">{displayedContent}</p>;
}

export function ChatbotTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {toast} = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

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

  const handlePhotoTaken = (dataUri: string) => {
    setUploadedImage(dataUri);
    setIsCameraOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: uploadedImage ?? undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);
    setError(null);

    try {
      const result = await respondInsightfullyWithReasoning({
        question: input,
        imageDataUri: uploadedImage ?? undefined,
      });
      const botMessage: Message = {role: 'bot', content: result.answer};
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
      // If there's an error, remove the user's message to allow them to try again.
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex h-[700px] flex-col bg-card/50 backdrop-blur-sm border-white/20">
      <CardContent className="flex flex-1 flex-col p-6">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <p className="mt-4">
                  Start a conversation by asking a question.
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'bot' && (
                  <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5" />
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.image && (
                    <Image
                      src={message.image}
                      alt="Uploaded content"
                      width={300}
                      height={200}
                      className="rounded-md mb-2"
                    />
                  )}
                  {message.role === 'bot' ? (
                    <BotMessage content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
                  <BrainCircuit className="h-5 w-5" />
                </Avatar>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {error && (
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <div className="mt-4 border-t pt-4">
          {uploadedImage && (
            <div className="relative mb-2 w-fit">
              <Image
                src={uploadedImage}
                alt="preview"
                width={80}
                height={80}
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <Camera className="h-5 w-5" />
                  <span className="sr-only">Use camera</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Take a Photo</DialogTitle>
                </DialogHeader>
                <CameraCapture onCapture={handlePhotoTaken} />
              </DialogContent>
            </Dialog>
            <Input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="h-12 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !uploadedImage)}
              size="lg"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
