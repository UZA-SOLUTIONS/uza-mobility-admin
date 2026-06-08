'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, type Socket } from 'socket.io-client';
import {
  getNotificationsSocketUrl,
  NOTIFICATION_SOCKET_EVENT,
} from '@/lib/notifications/socket';
import { notificationKeys } from '@/queries/notifications';
import type { AppNotification } from '@/types/notifications';

/**
 * Single app-wide Socket.IO connection for `/notifications`.
 * Invalidates notification queries when the server pushes a new alert.
 */
export function NotificationSocketListener() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = session?.accessToken;
    if (!token || session?.error === 'RefreshAccessTokenError') {
      return;
    }

    const socket = io(getNotificationsSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    const currentUserId = session?.user?.id;

    const onNotification = (payload: AppNotification) => {
      if (currentUserId && payload.userId !== currentUserId) {
        return;
      }
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    socket.on(NOTIFICATION_SOCKET_EVENT, onNotification);

    return () => {
      socket.off(NOTIFICATION_SOCKET_EVENT, onNotification);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [
    status,
    session?.accessToken,
    session?.user?.id,
    session?.error,
    queryClient,
  ]);

  return null;
}
