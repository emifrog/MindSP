"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return "💬";
      case "FMPA_INVITATION":
        return "📅";
      case "FMPA_REMINDER":
        return "⏰";
      case "FMPA_CANCELLED":
        return "❌";
      case "PARTICIPATION_APPROVED":
        return "✅";
      case "PARTICIPATION_REJECTED":
        return "⛔";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-pointer"
                onClick={() => handleNotificationClick(notification.id)}
                asChild
              >
                <Link
                  href={notification.linkUrl || "#"}
                  className={`flex gap-3 p-3 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="w-full text-center text-sm text-primary"
              >
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
