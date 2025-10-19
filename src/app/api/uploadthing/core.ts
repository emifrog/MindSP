import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth-config";

const f = createUploadthing();

// FileRouter pour l'application
export const ourFileRouter = {
  // Upload pour les avatars (images uniquement, max 4MB)
  avatarUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Non authentifié");
      return { userId: session.user.id, tenantId: session.user.tenantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploadé:", file.url, "par", metadata.userId);
      return { url: file.url };
    }),

  // Upload pour les pièces jointes Chat (tous types, max 16MB, max 5 fichiers)
  chatAttachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
    audio: { maxFileSize: "16MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    text: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Non authentifié");
      return { userId: session.user.id, tenantId: session.user.tenantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Pièce jointe Chat uploadée:", file.url);
      return { url: file.url, name: file.name, size: file.size };
    }),

  // Upload pour les pièces jointes Mailbox (tous types, max 16MB, max 10 fichiers)
  mailAttachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "16MB", maxFileCount: 10 },
    audio: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    text: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Non authentifié");
      return { userId: session.user.id, tenantId: session.user.tenantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Pièce jointe Mail uploadée:", file.url);
      return { url: file.url, name: file.name, size: file.size };
    }),

  // Upload pour les documents (tous types, max 32MB, max 20 fichiers)
  documentUploader: f({
    image: { maxFileSize: "32MB", maxFileCount: 20 },
    video: { maxFileSize: "32MB", maxFileCount: 20 },
    audio: { maxFileSize: "32MB", maxFileCount: 20 },
    pdf: { maxFileSize: "32MB", maxFileCount: 20 },
    text: { maxFileSize: "32MB", maxFileCount: 20 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Non authentifié");
      return { userId: session.user.id, tenantId: session.user.tenantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document uploadé:", file.url);
      return { url: file.url, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
