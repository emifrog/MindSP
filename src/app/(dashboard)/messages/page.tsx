"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Conversation {
  id: string;
  type: string;
  name: string | null;
  lastMessageAt: string | null;
  members: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar: string | null;
    };
  }>;
  messages: Array<{
    content: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === "DIRECT") {
      const otherMember = conversation.members.find(
        (m) => m.user.id !== user?.id
      );
      return otherMember
        ? `${otherMember.user.firstName} ${otherMember.user.lastName}`
        : "Conversation";
    }
    return conversation.name || "Groupe";
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return "Aucun message";
    }
    const lastMsg = conversation.messages[0];
    return `${lastMsg.sender.firstName}: ${lastMsg.content.substring(0, 50)}${lastMsg.content.length > 50 ? "..." : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communiquez avec votre équipe</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Liste des conversations */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucune conversation</h3>
            <p className="text-muted-foreground">
              Commencez une nouvelle conversation avec vos collègues
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {conversation.type === "DIRECT" ? (
                          <MessageSquare className="h-6 w-6 text-primary" />
                        ) : (
                          <Users className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getConversationName(conversation)}
                        </CardTitle>
                        <CardDescription>
                          {conversation.members.length} membre(s)
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {conversation._count.messages} message(s)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getLastMessage(conversation)}
                  </p>
                  {conversation.lastMessageAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(
                        new Date(conversation.lastMessageAt),
                        "dd MMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
