'use client';

import {Bot, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import Image from 'next/image';

interface MessageProps {
  text: string;
  isUser: boolean;
  image?: string;
}

export function Message({text, isUser, image}: MessageProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {isUser ? (
        <User className="h-8 w-8 rounded-full bg-primary text-primary-foreground p-1.5" />
      ) : (
        <Bot className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground p-1.5" />
      )}
      <div
        className={cn(
          'p-3 rounded-lg max-w-sm',
          isUser ? 'bg-primary/10' : 'bg-secondary/10'
        )}
      >
        {image && (
          <Image
            src={image}
            alt="user upload"
            width={200}
            height={200}
            className="rounded-md mb-2"
          />
        )}
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
