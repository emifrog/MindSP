/**
 * Système de queue avec BullMQ et Redis
 * Pour les tâches asynchrones (emails, notifications, etc.)
 */

import { Queue, Worker, Job } from "bullmq";
import { sendEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// ============================================
// QUEUES
// ============================================

export const emailQueue = new Queue("emails", { connection });
export const notificationQueue = new Queue("notifications", { connection });
export const reminderQueue = new Queue("reminders", { connection });

// ============================================
// WORKERS
// ============================================

/**
 * Worker pour l'envoi d'emails
 */
export const emailWorker = new Worker(
  "emails",
  async (job: Job) => {
    console.log(`📧 Traitement email job ${job.id}`);

    const { to, subject, html } = job.data;

    try {
      const success = await sendEmail({ to, subject, html });

      if (!success) {
        throw new Error("Échec envoi email");
      }

      console.log(`✅ Email envoyé à ${to}`);
      return { success: true, to };
    } catch (error) {
      console.error(`❌ Erreur envoi email:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // 5 emails en parallèle max
    limiter: {
      max: 10, // Max 10 emails
      duration: 1000, // Par seconde
    },
  }
);

/**
 * Worker pour les notifications
 */
export const notificationWorker = new Worker(
  "notifications",
  async (job: Job) => {
    console.log(`🔔 Traitement notification job ${job.id}`);

    const { userId, tenantId, type, title, message, link, metadata } = job.data;

    try {
      await createNotification({
        userId,
        tenantId,
        type,
        title,
        message,
        link,
        metadata,
      });

      console.log(`✅ Notification créée pour user ${userId}`);
      return { success: true, userId };
    } catch (error) {
      console.error(`❌ Erreur création notification:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

/**
 * Worker pour les rappels FMPA
 */
export const reminderWorker = new Worker(
  "reminders",
  async (job: Job) => {
    console.log(`⏰ Traitement rappel job ${job.id}`);

    const { fmpaId, type } = job.data;

    try {
      // Récupérer la FMPA et ses participants
      const { prisma } = await import("@/lib/prisma");
      const fmpa = await prisma.fMPA.findUnique({
        where: { id: fmpaId },
        include: {
          participations: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!fmpa) {
        throw new Error("FMPA introuvable");
      }

      // Envoyer les rappels
      for (const participation of fmpa.participations) {
        // Email
        await emailQueue.add(`reminder-${participation.userId}`, {
          to: participation.user.email,
          subject: `Rappel : ${fmpa.title}`,
          html: `<p>Rappel : La FMPA "${fmpa.title}" commence demain.</p>`,
        });

        // Notification in-app
        await notificationQueue.add(`reminder-notif-${participation.userId}`, {
          userId: participation.user.id,
          tenantId: fmpa.tenantId,
          type: "FMPA_REMINDER",
          title: "Rappel FMPA",
          message: `La FMPA "${fmpa.title}" commence demain`,
          link: `/fmpa/${fmpa.id}`,
        });
      }

      console.log(`✅ Rappels envoyés pour FMPA ${fmpaId}`);
      return { success: true, count: fmpa.participations.length };
    } catch (error) {
      console.error(`❌ Erreur envoi rappels:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

// ============================================
// HELPERS
// ============================================

/**
 * Ajouter un job d'email
 */
export async function queueEmail(
  to: string,
  subject: string,
  html: string,
  options?: { delay?: number }
) {
  return emailQueue.add(
    `email-${Date.now()}`,
    { to, subject, html },
    {
      delay: options?.delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );
}

/**
 * Ajouter un job de notification
 */
export async function queueNotification(
  data: {
    userId: string;
    tenantId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
  },
  options?: { delay?: number }
) {
  return notificationQueue.add(`notif-${Date.now()}`, data, {
    delay: options?.delay,
    attempts: 2,
  });
}

/**
 * Planifier un rappel FMPA (24h avant)
 */
export async function scheduleReminderFMPA(fmpaId: string, startDate: Date) {
  const now = new Date();
  const reminderTime = new Date(startDate);
  reminderTime.setHours(reminderTime.getHours() - 24); // 24h avant

  const delay = reminderTime.getTime() - now.getTime();

  if (delay > 0) {
    return reminderQueue.add(
      `reminder-fmpa-${fmpaId}`,
      { fmpaId, type: "FMPA_REMINDER" },
      {
        delay,
        attempts: 2,
      }
    );
  }

  return null;
}

// ============================================
// MONITORING
// ============================================

export async function getQueueStats() {
  const [emailStats, notifStats, reminderStats] = await Promise.all([
    emailQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
    reminderQueue.getJobCounts(),
  ]);

  return {
    emails: emailStats,
    notifications: notifStats,
    reminders: reminderStats,
  };
}

// Gestion des erreurs
emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Notification job ${job?.id} failed:`, err);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err);
});

// Logs de succès
emailWorker.on("completed", (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

notificationWorker.on("completed", (job) => {
  console.log(`✅ Notification job ${job.id} completed`);
});

reminderWorker.on("completed", (job) => {
  console.log(`✅ Reminder job ${job.id} completed`);
});
