"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { useChatSocket } from "@/hooks/use-chat";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChatPage() {
  const { isConnected } = useChatSocket();

  return (
    <div className="h-full">
      {/* Indicateur de connexion */}
      {!isConnected && (
        <Alert variant="destructive" className="mb-4">
          <Icon name={Icons.info.warning} size="sm" className="mr-2" />
          <AlertDescription>
            Connexion au serveur de chat en cours...
          </AlertDescription>
        </Alert>
      )}

      {/* Layout principal du chat */}
      <ChatLayout />
    </div>
  );
}
