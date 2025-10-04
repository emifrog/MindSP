"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
  Verification: "Le lien de vérification a expiré ou a déjà été utilisé.",
  Default: "Une erreur est survenue lors de l'authentification.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Erreur d&apos;authentification
          </CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
