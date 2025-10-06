/**
 * Service d'envoi d'emails
 * Configuration pour les notifications FMPA
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoie un email (à configurer avec un service SMTP)
 * Pour la production, utilisez Resend, SendGrid, ou AWS SES
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Configurer avec un vrai service d'email
    // Exemple avec Resend:
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'MindSP <noreply@mindsp.fr>',
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    // });

    console.log("📧 Email à envoyer:", {
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return false;
  }
}

/**
 * Template email de confirmation d'inscription
 */
export function getRegistrationEmailTemplate(data: {
  userName: string;
  fmpaTitle: string;
  fmpaType: string;
  startDate: Date;
  location: string;
  requiresApproval: boolean;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚒 MindSP</h1>
          </div>
          <div class="content">
            <h2>Inscription confirmée</h2>
            <p>Bonjour ${data.userName},</p>
            <p>Votre inscription à la FMPA suivante a bien été enregistrée :</p>
            <ul>
              <li><strong>Titre :</strong> ${data.fmpaTitle}</li>
              <li><strong>Type :</strong> ${data.fmpaType}</li>
              <li><strong>Date :</strong> ${data.startDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</li>
              <li><strong>Heure :</strong> ${data.startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</li>
              <li><strong>Lieu :</strong> ${data.location}</li>
            </ul>
            ${data.requiresApproval ? "<p><em>⚠️ Votre inscription est en attente d'approbation par un responsable.</em></p>" : "<p>✅ Votre inscription est confirmée.</p>"}
            <p>Nous vous rappelons de vous présenter à l'heure avec l'équipement requis.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par MindSP.</p>
            <p>Pour toute question, contactez votre responsable de centre.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Template email de rappel
 */
export function getReminderEmailTemplate(data: {
  userName: string;
  fmpaTitle: string;
  startDate: Date;
  location: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ea580c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚒 MindSP - Rappel</h1>
          </div>
          <div class="content">
            <h2>Rappel : FMPA demain</h2>
            <p>Bonjour ${data.userName},</p>
            <div class="alert">
              <strong>⏰ Rappel :</strong> Vous êtes inscrit(e) à la FMPA suivante qui aura lieu <strong>demain</strong> :
            </div>
            <ul>
              <li><strong>Titre :</strong> ${data.fmpaTitle}</li>
              <li><strong>Date :</strong> ${data.startDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</li>
              <li><strong>Heure :</strong> ${data.startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</li>
              <li><strong>Lieu :</strong> ${data.location}</li>
            </ul>
            <p>N'oubliez pas de vous présenter à l'heure avec l'équipement requis.</p>
            <p>En cas d'empêchement, merci de prévenir au plus vite.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par MindSP.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
