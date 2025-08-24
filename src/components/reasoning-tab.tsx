'use client';

import {useState} from 'react';
import {Sparkles, Bot} from 'lucide-react';
import {respondInsightfullyWithReasoning} from '@/ai/flows/respond-insightfully-with-reasoning';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Skeleton} from '@/components/ui/skeleton';
import {VoiceInputButton} from '@/components/voice-input-button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

export function ReasoningTab() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setError(null);

    try {
      const result = await respondInsightfullyWithReasoning({question});
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
        <div className="relative">
          <Textarea
            placeholder="Ask Nexora a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="pr-40 min-h-[100px] text-base"
            disabled={isLoading || isListening}
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <VoiceInputButton
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
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
              <Bot className="h-6 w-6" />
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
              <Bot className="h-6 w-6 text-primary" />
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
