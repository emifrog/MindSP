/**
 * Génère un PDF de la liste d'émargement pour une FMPA
 * Utilise jsPDF pour la génération côté client
 */

interface Participant {
  firstName: string;
  lastName: string;
  badge: string | null;
  status: string;
  presentAt?: Date | null;
}

interface FMPAData {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location: string;
  participants: Participant[];
}

export async function generateEmargementPDF(fmpaData: FMPAData): Promise<Blob> {
  // Dynamically import jsPDF to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF();

  // En-tête
  doc.setFontSize(18);
  doc.text("Feuille d'Émargement", 105, 20, { align: "center" });

  // Informations FMPA
  doc.setFontSize(12);
  doc.text(`FMPA: ${fmpaData.title}`, 20, 35);
  doc.text(`Type: ${fmpaData.type}`, 20, 42);
  doc.text(`Date: ${fmpaData.startDate.toLocaleDateString("fr-FR")}`, 20, 49);
  doc.text(
    `Horaires: ${fmpaData.startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${fmpaData.endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
    20,
    56
  );
  doc.text(`Lieu: ${fmpaData.location}`, 20, 63);

  // Tableau des participants
  const tableData = fmpaData.participants.map((p, index) => [
    index + 1,
    `${p.firstName} ${p.lastName}`,
    p.badge || "-",
    p.status === "PRESENT" ? "✓" : "",
    p.presentAt
      ? new Date(p.presentAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    "", // Signature
  ]);

  (doc as any).autoTable({
    startY: 75,
    head: [["N°", "Nom et Prénom", "Badge", "Présent", "Heure", "Signature"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 25 },
      5: { cellWidth: 40 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
    doc.text(
      `Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      105,
      doc.internal.pageSize.height - 5,
      { align: "center" }
    );
  }

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
