import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap
} from 'lucide-react';

const NOTIFICATION_CONFIG = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-accent-red/10',
    borderColor: 'border-accent-red/30',
    iconColor: 'text-accent-red'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-accent-yellow/10',
    borderColor: 'border-accent-yellow/30',
    iconColor: 'text-accent-yellow'
  },
  info: {
    icon: Info,
    bgColor: 'bg-accent-blue/10',
    borderColor: 'border-accent-blue/30',
    iconColor: 'text-accent-blue'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-accent-green/10',
    borderColor: 'border-accent-green/30',
    iconColor: 'text-accent-green'
  },
  event: {
    icon: Zap,
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  }
};

export default function NotificationCenter() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationToast({ notification, onDismiss }) {
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto ${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {notification.message}
          </p>
          {notification.indicator && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-400">
              {notification.indicator}
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
