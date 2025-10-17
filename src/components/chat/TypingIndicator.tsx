"use client";

export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>
        {users.length === 1
          ? "Quelqu'un est en train d'écrire..."
          : `${users.length} personnes sont en train d'écrire...`}
      </span>
    </div>
  );
}
