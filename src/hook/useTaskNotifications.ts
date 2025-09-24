'use client';

import { useEffect, useState } from 'react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTaskStatusNotification,
  canSendNotifications
} from '@/lib/notifications';
import type { NotificationPermissionState } from '@/lib/notifications';

export interface UseTaskNotificationsReturn {
  // État des permissions
  permissionState: NotificationPermissionState;
  canSend: boolean;

  // Actions
  requestPermission: () => Promise<NotificationPermission>;

  // Fonctions de notification
  notifyTaskStatusChange: (options: {
    taskTitle: string;
    oldStatus: string;
    newStatus: string;
    projectName?: string;
  }) => void;
}

/**
 * Hook personnalisé pour gérer les notifications de tâches
 */
export function useTaskNotifications(): UseTaskNotificationsReturn {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
  });

  // Initialiser l'état des permissions au montage
  useEffect(() => {
    const currentState = getNotificationPermission();
    setPermissionState(currentState);
  }, []);

  // Fonction pour demander la permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    const newPermission = await requestNotificationPermission();
    const newState = getNotificationPermission();
    setPermissionState(newState);
    return newPermission;
  };

  // Fonction pour envoyer une notification de changement de statut
  const notifyTaskStatusChange = (options: {
    taskTitle: string;
    oldStatus: string;
    newStatus: string;
    projectName?: string;
  }) => {
    if (!canSendNotifications()) {
      console.warn('Impossible d\'envoyer la notification: permissions insuffisantes');
      return;
    }

    // Convertir les statuts string en TaskStatus enum
    const oldTaskStatus = options.oldStatus as any;
    const newTaskStatus = options.newStatus as any;

    sendTaskStatusNotification({
      taskTitle: options.taskTitle,
      oldStatus: oldTaskStatus,
      newStatus: newTaskStatus,
      projectName: options.projectName,
    });
  };

  return {
    permissionState,
    canSend: canSendNotifications(),
    requestPermission,
    notifyTaskStatusChange,
  };
}