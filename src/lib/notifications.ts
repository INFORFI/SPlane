'use client';

import { TaskStatus } from '@prisma/client';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
}

/**
 * Vérifier si les notifications sont supportées par le navigateur
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Obtenir l'état actuel des permissions de notification
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return { permission: 'denied', isSupported: false };
  }

  return {
    permission: Notification.permission,
    isSupported: true,
  };
}

/**
 * Demander la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  // Si la permission est déjà accordée, la retourner
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // Si la permission est refusée définitivement, la retourner
  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Demander la permission
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Erreur lors de la demande de permission de notification:', error);
    return 'denied';
  }
}

/**
 * Options pour une notification de changement de statut de tâche
 */
interface TaskStatusNotificationOptions {
  taskTitle: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  projectName?: string;
}

/**
 * Obtenir le libellé français d'un statut de tâche
 */
function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return 'À faire';
    case TaskStatus.IN_PROGRESS:
      return 'En cours';
    case TaskStatus.COMPLETED:
      return 'Terminée';
    case TaskStatus.CANCELED:
      return 'Annulée';
    default:
      return status;
  }
}

/**
 * Obtenir l'icône appropriée selon le statut
 */
function getStatusIcon(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.COMPLETED:
      return '✅';
    case TaskStatus.IN_PROGRESS:
      return '⏳';
    case TaskStatus.CANCELED:
      return '❌';
    case TaskStatus.TODO:
    default:
      return '📝';
  }
}

/**
 * Envoyer une notification de changement de statut de tâche
 */
export function sendTaskStatusNotification(options: TaskStatusNotificationOptions): void {
  const { permission, isSupported } = getNotificationPermission();

  if (!isSupported || permission !== 'granted') {
    console.warn('Les notifications ne sont pas disponibles ou autorisées');
    return;
  }

  const { taskTitle, newStatus, projectName } = options;
  const statusLabel = getStatusLabel(newStatus);
  const icon = getStatusIcon(newStatus);

  const title = `Splane - Statut de tâche mis à jour ${icon}`;
  const body = projectName
    ? `Votre tâche "${taskTitle}" dans le projet "${projectName}" est maintenant "${statusLabel}"`
    : `Votre tâche "${taskTitle}" est maintenant "${statusLabel}"`;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-status-${Date.now()}`, // Éviter les doublons
      requireInteraction: false,
      silent: false,
    });

    // Auto-fermer après 5 secondes
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Gestion des clics (optionnel - pourrait rediriger vers la tâche)
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}

/**
 * Tester les notifications avec un message de démonstration
 */
export function sendTestNotification(): void {
  sendTaskStatusNotification({
    taskTitle: 'Tâche de test',
    oldStatus: TaskStatus.TODO,
    newStatus: TaskStatus.IN_PROGRESS,
    projectName: 'Projet de démonstration',
  });
}

/**
 * Vérifier si l'utilisateur peut recevoir des notifications
 */
export function canSendNotifications(): boolean {
  const { permission, isSupported } = getNotificationPermission();
  return isSupported && permission === 'granted';
}