// Types pour la Mailbox (Email Interne)

export interface MailMessage {
  id: string;
  subject: string;
  body: string;
  fromId: string;
  tenantId: string;
  isDraft: boolean;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  from?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    email: string;
  };
  recipients?: MailRecipient[];
  attachments?: MailAttachment[];
  labels?: MailLabel[];
  _count?: {
    recipients: number;
    attachments: number;
  };
}

export interface MailRecipient {
  id: string;
  messageId: string;
  userId: string;
  type: RecipientType;
  isRead: boolean;
  readAt: Date | null;
  folder: MailFolder;
  isArchived: boolean;
  isStarred: boolean;
  deletedAt: Date | null;

  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    email: string;
  };
  message?: MailMessage;
}

export type RecipientType = "TO" | "CC" | "BCC";

export type MailFolder = "INBOX" | "SENT" | "DRAFTS" | "ARCHIVE" | "TRASH";

export interface MailAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface MailLabel {
  id: string;
  messageId: string;
  userId: string;
  name: string;
  color: string;
}

// Données pour créer un message
export interface CreateMailData {
  subject: string;
  body: string;
  to: string[]; // Array of user IDs
  cc?: string[];
  bcc?: string[];
  isDraft?: boolean;
  isImportant?: boolean;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
}

// Données pour mettre à jour un message
export interface UpdateMailData {
  subject?: string;
  body?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  isImportant?: boolean;
}

// Statistiques Mailbox
export interface MailboxStats {
  inbox: number;
  unread: number;
  sent: number;
  drafts: number;
  archived: number;
  starred: number;
}

// Filtres de recherche
export interface MailSearchFilters {
  folder?: MailFolder;
  isRead?: boolean;
  isStarred?: boolean;
  isImportant?: boolean;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachments?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  labels?: string[];
}
