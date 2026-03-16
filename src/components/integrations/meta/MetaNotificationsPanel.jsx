import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMetaNotifications,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
} from '@/redux/slices/metaIntegrationSlice';
import {
  BiCheckCircle,
  BiXCircle,
  BiAlertCircle,
  BiInfo,
  BiTrash2,
  BiBell,
  BiX,
} from 'react-icons/bi';

export default function MetaNotificationsPanel({ agentId, position = 'fixed' }) {
  const dispatch = useDispatch();
  const { meta: { notifications } } = useSelector((state) => state.metaIntegration);

  const [isVisible, setIsVisible] = useState(true);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Auto-remove notifications after 8 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.isRead && notification.autoRemove) {
        const timeout = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 8000);
        return () => clearTimeout(timeout);
      }
    });
  }, [notifications, dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleRemoveNotification = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro que deseas limpiar todas las notificaciones?')) {
      dispatch(clearNotifications());
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <BiCheckCircle className="text-green-600 text-2xl" />;
      case 'error':
        return <BiXCircle className="text-red-600 text-2xl" />;
      case 'warning':
        return <BiAlertCircle className="text-yellow-600 text-2xl" />;
      case 'info':
      default:
        return <BiInfo className="text-blue-600 text-2xl" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  // Compact view (floating bell icon)
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`${position} bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition relative`}
        title="Notificaciones"
      >
        <BiBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Full panel view
  return (
    <div className={`${position} bottom-6 right-6 z-50 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BiBell className="text-2xl" />
          <div>
            <h3 className="font-bold text-lg">Notificaciones</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-blue-100">{unreadCount} sin leer</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-blue-700 rounded transition"
        >
          <BiX className="text-2xl" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <BiBell className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No hay notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 ${getNotificationColor(notification.type)} ${
                notification.isRead ? 'opacity-60' : 'opacity-100'
              } transition hover:shadow-md`}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 pt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-semibold ${getTextColor(notification.type)} truncate`}>
                      {notification.title}
                    </p>
                    <button
                      onClick={() => handleRemoveNotification(notification.id)}
                      className={`flex-shrink-0 p-1 hover:bg-black/10 rounded transition ${getTextColor(notification.type)}`}
                    >
                      <BiX className="text-lg" />
                    </button>
                  </div>

                  {notification.message && (
                    <p className={`text-sm mt-1 ${getTextColor(notification.type)}`}>
                      {notification.message}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className={`${getTextColor(notification.type)} opacity-75`}>
                      {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`px-2 py-1 rounded font-semibold hover:bg-black/10 transition ${getTextColor(notification.type)}`}
                      >
                        Marcar leído
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="bg-gray-100 border-t border-gray-200 p-4 flex justify-between gap-2">
          <button
            onClick={handleClearAll}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition flex items-center justify-center gap-2"
          >
            <BiTrash2 />
            Limpiar todo
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
