'use client';

import { useCallback, useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();

    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!showReconnected) return;
    const timer = window.setTimeout(() => setShowReconnected(false), 3200);
    return () => window.clearTimeout(timer);
  }, [showReconnected]);

  const dismissReconnected = useCallback(() => {
    setShowReconnected(false);
  }, []);

  return { online, showReconnected, dismissReconnected };
}
