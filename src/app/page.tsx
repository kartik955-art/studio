import Image from 'next/image';
import {Header} from '@/components/layout/header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {ReasoningTab} from '@/components/reasoning-tab';
import {ImageGenTab} from '@/components/image-gen-tab';
import {ChatbotTab} from '@/components/chatbot-tab';
import {
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-4xl gap-2">
          <h1 className="text-3xl font-semibold font-headline">
            Welcome to Nexora
          </h1>
          <p className="text-muted-foreground">
            Your intelligent AI assistant for reasoning and image generation.
          </p>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <Tabs defaultValue="reasoning">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reasoning">
                <Sparkles className="mr-2 h-4 w-4" />
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="image-generation">
                <ImageIcon className="mr-2 h-4 w-4" />
                Image Generation
              </TabsTrigger>
              <TabsTrigger value="chatbot">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chatbot
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reasoning" className="mt-6">
              <ReasoningTab />
            </TabsContent>
            <TabsContent value="image-generation" className="mt-6">
              <ImageGenTab />
            </TabsContent>
            <TabsContent value="chatbot" className="mt-6">
              <ChatbotTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
