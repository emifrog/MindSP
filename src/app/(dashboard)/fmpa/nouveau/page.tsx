"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FMPAForm } from "@/components/fmpa/FMPAForm";

export default function NewFMPAPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/fmpa">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer une FMPA</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle Formation, Manœuvre ou Présence Active
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la FMPA</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle FMPA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FMPAForm />
        </CardContent>
      </Card>
    </div>
  );
}
