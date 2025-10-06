import QRCode from "qrcode";

/**
 * Génère un QR code en base64
 * @param data - Données à encoder dans le QR code
 * @param options - Options de génération
 * @returns Promise<string> - QR code en base64
 */
export async function generateQRCode(
  data: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#FFFFFF",
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    throw new Error("Impossible de générer le QR code");
  }
}

/**
 * Génère un QR code pour une FMPA
 * @param fmpaId - ID de la FMPA
 * @param qrCode - Code QR unique de la FMPA
 * @returns Promise<string> - QR code en base64
 */
export async function generateFMPAQRCode(
  fmpaId: string,
  qrCode: string
): Promise<string> {
  // Créer l'URL d'émargement
  const emargementUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/emargement/${fmpaId}?code=${qrCode}`;

  return generateQRCode(emargementUrl, {
    width: 400,
    margin: 3,
  });
}

/**
 * Télécharge un QR code
 * @param dataURL - QR code en base64
 * @param filename - Nom du fichier
 */
export function downloadQRCode(dataURL: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
