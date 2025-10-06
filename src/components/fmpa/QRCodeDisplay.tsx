"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode } from "lucide-react";
import Image from "next/image";
import { downloadQRCode } from "@/lib/qrcode";

interface QRCodeDisplayProps {
  fmpaId: string;
  fmpaTitle: string;
}

export function QRCodeDisplay({ fmpaId, fmpaTitle }: QRCodeDisplayProps) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fmpa/${fmpaId}/qrcode`);
      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        toast({
          title: "QR Code généré",
          description: "Le QR code a été généré avec succès",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de générer le QR code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      downloadQRCode(qrCode, `qrcode-${fmpaTitle.replace(/\s+/g, "-")}`);
      toast({
        title: "QR Code téléchargé",
        description: "Le QR code a été téléchargé avec succès",
      });
    }
  };

  return (
    <div className="space-y-4">
      {!qrCode ? (
        <Button onClick={generateQRCode} disabled={loading}>
          <QrCode className="mr-2 h-4 w-4" />
          {loading ? "Génération..." : "Générer le QR Code"}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center rounded-lg border bg-white p-4">
            <Image
              src={qrCode}
              alt="QR Code"
              width={300}
              height={300}
              className="rounded"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
            <Button
              onClick={generateQRCode}
              variant="outline"
              className="flex-1"
            >
              Régénérer
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Scannez ce QR code pour émarger à la FMPA
          </p>
        </div>
      )}
    </div>
  );
}
