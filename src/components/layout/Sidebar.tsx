import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: Icons.nav.dashboard },
  {
    name: "Recherche",
    href: "/search",
    icon: "fluent-emoji:magnifying-glass-tilted-left",
  },
  { name: "FMPA", href: "/fmpa", icon: Icons.pompier.feu },
  { name: "Agenda", href: "/agenda", icon: Icons.nav.calendar },
  { name: "Chat", href: "/chat", icon: "fluent-emoji:speech-balloon" },
  { name: "Mailbox", href: "/mailbox", icon: "fluent-emoji:incoming-envelope" },
  { name: "Formations", href: "/formations", icon: Icons.nav.formations },
  { name: "TTA", href: "/tta", icon: Icons.nav.tta },
  { name: "Personnel", href: "/personnel", icon: Icons.nav.personnel },
  { name: "Portails", href: "/portails", icon: "fluent-emoji:door" },
  { name: "Actualités", href: "/actualites", icon: Icons.info.info },
  { name: "Documents", href: "/documents", icon: Icons.nav.documents },
  { name: "Design", href: "/showcase", icon: "fluent-emoji:artist-palette" },
  { name: "Paramètres", href: "/settings", icon: Icons.nav.settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="MindSP Logo"
            width={120}
            height={120}
            priority
            className="h-auto w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon name={item.icon} size="lg" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Version 1.0.0</p>
          <p>Phase 7 - CI/CD & DevOps</p>
        </div>
      </div>
    </div>
  );
}
