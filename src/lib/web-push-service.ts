// Service Web Push API pour notifications navigateur

/**
 * Demander la permission pour les notifications push
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Ce navigateur ne supporte pas les notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Afficher une notification navigateur
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions & {
    onClick?: () => void;
  }
) {
  if (!("Notification" in window)) {
    console.warn("Ce navigateur ne supporte pas les notifications");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Permission de notification non accordée");
    return;
  }

  const notification = new Notification(title, {
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    ...options,
  });

  if (options?.onClick) {
    notification.onclick = () => {
      options.onClick?.();
      notification.close();
    };
  }

  return notification;
}

/**
 * Vérifier si les notifications sont supportées
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Vérifier si les notifications sont activées
 */
export function isNotificationEnabled(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

/**
 * Enregistrer le Service Worker pour les notifications push
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker non supporté");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker enregistré:", registration);
    return registration;
  } catch (error) {
    console.error("Erreur enregistrement Service Worker:", error);
    return null;
  }
}

/**
 * S'abonner aux notifications push
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // Envoyer l'abonnement au serveur
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error("Erreur abonnement push:", error);
    return null;
  }
}

/**
 * Se désabonner des notifications push
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Informer le serveur
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Erreur désabonnement push:", error);
    return false;
  }
}

/**
 * Hook pour gérer les notifications push
 */
export class WebPushManager {
  private static instance: WebPushManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): WebPushManager {
    if (!WebPushManager.instance) {
      WebPushManager.instance = new WebPushManager();
    }
    return WebPushManager.instance;
  }

  async initialize(): Promise<boolean> {
    // Vérifier le support
    if (!isNotificationSupported()) {
      console.warn("Notifications non supportées");
      return false;
    }

    // Demander la permission
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.warn("Permission de notification refusée");
      return false;
    }

    // Enregistrer le Service Worker
    this.registration = await registerPushServiceWorker();
    if (!this.registration) {
      console.warn("Service Worker non enregistré");
      return false;
    }

    // S'abonner aux push
    const subscription = await subscribeToPushNotifications(this.registration);
    if (!subscription) {
      console.warn("Abonnement push échoué");
      return false;
    }

    console.log("✅ Web Push initialisé avec succès");
    return true;
  }

  async showNotification(
    title: string,
    options?: NotificationOptions & { onClick?: () => void }
  ) {
    return showBrowserNotification(title, options);
  }

  async disable(): Promise<boolean> {
    return await unsubscribeFromPushNotifications();
  }

  isEnabled(): boolean {
    return isNotificationEnabled();
  }

  isSupported(): boolean {
    return isNotificationSupported();
  }
}

// Export singleton
export const webPushManager = WebPushManager.getInstance();
