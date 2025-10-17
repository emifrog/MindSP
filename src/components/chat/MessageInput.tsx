"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useChatChannel } from "@/hooks/use-chat";
import TextareaAutosize from "react-textarea-autosize";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, startTyping, stopTyping } = useChatChannel(channelId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      startTyping();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 3000);
  };

  const handleSend = () => {
    if (!content.trim()) return;

    sendMessage({ content: content.trim() });
    setContent("");
    setIsTyping(false);
    stopTyping();

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        {/* Bouton emoji */}
        <Button variant="ghost" size="icon" className="shrink-0">
          <Icon name="fluent-emoji:grinning-face" size="md" />
        </Button>

        {/* Textarea */}
        <div className="relative flex-1">
          <TextareaAutosize
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Envoyer un message..."
            className="max-h-[200px] min-h-[40px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            minRows={1}
            maxRows={8}
          />
        </div>

        {/* Bouton pièce jointe */}
        <Button variant="ghost" size="icon" className="shrink-0">
          <Icon name={Icons.action.file} size="sm" />
        </Button>

        {/* Bouton envoyer */}
        <Button
          onClick={handleSend}
          disabled={!content.trim()}
          className="shrink-0"
        >
          <Icon name={Icons.action.send} size="sm" className="mr-2" />
          Envoyer
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
          Entrée
        </kbd>{" "}
        pour envoyer,{" "}
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
          Shift + Entrée
        </kbd>{" "}
        pour nouvelle ligne
      </p>
    </div>
  );
}
