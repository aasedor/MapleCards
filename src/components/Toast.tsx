'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const COLORS: Record<string, { bg: string; border: string; text: string }> = {
  success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
  error:   { bg: '#fef2f2', border: 'var(--red, #c0392b)', text: 'var(--red, #c0392b)' },
  info:    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
};

const ICONS: Record<string, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
};

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const colors = COLORS[type];

  useEffect(() => {
    // Slide in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Start exit
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 3600);
    // Remove
    const removeTimer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg max-w-sm"
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
        fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '16px' }}>{ICONS[type]}</span>
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto bg-transparent border-none cursor-pointer text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: colors.text }}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
