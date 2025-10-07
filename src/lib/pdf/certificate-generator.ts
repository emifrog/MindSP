/**
 * Générateur d'attestations de formation
 * Utilise jsPDF pour générer des PDF
 */

interface CertificateData {
  participantName: string;
  formationTitle: string;
  formationCode: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  instructorName?: string;
  tenantName: string;
  score?: number;
  validityYears?: number;
}

export async function generateCertificate(
  data: CertificateData
): Promise<string> {
  // Import dynamique de jsPDF (côté client uniquement)
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Bordure décorative
  doc.setDrawColor(30, 64, 175); // Bleu primaire
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Titre
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("ATTESTATION DE FORMATION", pageWidth / 2, 35, {
    align: "center",
  });

  // Sous-titre
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(data.tenantName, pageWidth / 2, 45, { align: "center" });

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(40, 50, pageWidth - 40, 50);

  // Corps du texte
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  let yPos = 70;

  doc.text("Il est certifié que", pageWidth / 2, yPos, { align: "center" });

  yPos += 15;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(data.participantName.toUpperCase(), pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("a suivi avec succès la formation", pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 15;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`"${data.formationTitle}"`, pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(`(Code: ${data.formationCode})`, pageWidth / 2, yPos, {
    align: "center",
  });

  // Détails de la formation
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  const startDateStr = data.startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateStr = data.endDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.text(`Du ${startDateStr} au ${endDateStr}`, pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 8;
  doc.text(`Durée: ${data.duration} heures`, pageWidth / 2, yPos, {
    align: "center",
  });

  if (data.instructorName) {
    yPos += 8;
    doc.text(`Formateur: ${data.instructorName}`, pageWidth / 2, yPos, {
      align: "center",
    });
  }

  if (data.score !== undefined) {
    yPos += 8;
    doc.text(`Note obtenue: ${data.score}/100`, pageWidth / 2, yPos, {
      align: "center",
    });
  }

  if (data.validityYears) {
    yPos += 8;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Validité: ${data.validityYears} an${data.validityYears > 1 ? "s" : ""}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
  }

  // Date de délivrance
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const deliveryDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Fait le ${deliveryDate}`, pageWidth / 2, yPos, {
    align: "center",
  });

  // Signature (placeholder)
  yPos += 15;
  doc.setFontSize(10);
  doc.text("Le Responsable de Formation", pageWidth / 2, yPos, {
    align: "center",
  });

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Document généré automatiquement - MindSP",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  // Retourner le PDF en base64
  return doc.output("dataurlstring");
}

export async function downloadCertificate(
  data: CertificateData,
  filename?: string
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const pdfDataUrl = await generateCertificate(data);

  // Créer un lien de téléchargement
  const link = document.createElement("a");
  link.href = pdfDataUrl;
  link.download =
    filename ||
    `attestation_${data.formationCode}_${data.participantName.replace(/\s+/g, "_")}.pdf`;
  link.click();
}
