'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import { useTaskNotifications } from '@/hook/useTaskNotifications';

interface NotificationPermissionProps {
  onClose: () => void;
  onPermissionGranted?: () => void;
}

export default function NotificationPermission({
  onClose,
  onPermissionGranted,
}: NotificationPermissionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { permissionState, requestPermission } = useTaskNotifications();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Attendre la fin de l'animation
  }, [onClose]);

  // Si les permissions sont déjà accordées, ne pas afficher le composant
  useEffect(() => {
    if (permissionState.permission === 'granted') {
      handleClose();
    }
  }, [permissionState.permission, handleClose]);

  if (!permissionState.isSupported || permissionState.permission === 'granted') {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 bg-[var(--primary-muted)] rounded-lg flex items-center justify-center">
            <Bell className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
              Notifications de tâches
            </h3>
            <p className="text-xs text-[var(--foreground-secondary)] mb-3">
              Autoriser les notifications pour être informé des changements de statut de vos tâches
              directement sur votre bureau.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded text-xs font-medium transition-colors"
              >
                Autoriser
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded text-xs font-medium transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
