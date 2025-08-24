'use client';

import {useState, useRef, useEffect} from 'react';
import {Paperclip, Send, Bot, User, BrainCircuit} from 'lucide-react';
import {respondInsightfullyWithReasoning} from '@/ai/flows/respond-insightfully-with-reasoning';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Message} from '@/components/message';
import Image from 'next/image';

type Message = {
  text: string;
  isUser: boolean;
  image?: string;
};

export function ChatbotTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !uploadedImage) || isLoading) return;

    const userMessage: Message = {text: input, isUser: true};
    if (uploadedImage) {
      userMessage.image = uploadedImage;
    }
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const result = await respondInsightfullyWithReasoning({
        question: input,
        imageDataUri: uploadedImage ?? undefined,
      });

      let accumulatedText = '';
      for (let i = 0; i < result.answer.length; i++) {
        accumulatedText += result.answer[i];
        if ((i + 1) % 5 === 0 || i === result.answer.length - 1) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (!lastMessage.isUser) {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                text: accumulatedText,
              };
              return newMessages;
            } else {
              return [
                ...prev,
                {text: accumulatedText, isUser: false},
              ];
            }
          });
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessages(prev => [
        ...prev,
        {text: `Error: ${errorMsg}`, isUser: false},
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] w-full bg-card/50 backdrop-blur-sm border rounded-lg shadow-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <Message
              key={index}
              text={msg.text}
              isUser={msg.isUser}
              image={msg.image}
            />
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/20">
        {uploadedImage && (
          <div className="relative mb-2 w-20 h-20">
            <Image
              src={uploadedImage}
              alt="upload preview"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted-foreground/50 text-white"
              onClick={() => setUploadedImage(null)}
            >
              <span className="text-xs">X</span>
            </Button>
          </div>
        )}
        <div className="relative">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            className="pr-20 min-h-[50px] bg-transparent"
            disabled={isLoading}
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !uploadedImage)}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
