'use client';
import { useState, useEffect } from 'react';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function MenuBarClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    const timeout = setTimeout(() => {
      setNow(new Date());
    }, msUntilNextMinute);
    return () => clearTimeout(timeout);
  }, [now]);

  return (
    <span className="menubar-clock" title={formatDate(now)}>
      {formatTime(now)}
    </span>
  );
}
