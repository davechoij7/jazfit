"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, children, title, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-[#2D1A20]/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-bg-card rounded-t-3xl border-t border-border animate-slide-up flex flex-col max-h-[90dvh]">
        {/* Drag handle + close button row */}
        <div className="shrink-0 flex items-center justify-between pt-3 pb-2 px-4">
          <div className="w-10 h-1 rounded-full bg-text-dim mx-auto" />
          <button
            onClick={onClose}
            className="absolute right-4 top-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-dim active:text-text-primary"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {title && (
          <h2 className="shrink-0 text-lg font-bold text-text-primary px-6 pb-4">{title}</h2>
        )}
        <div className="overflow-y-auto px-6 pb-4">{children}</div>
        {footer && (
          <div className="shrink-0 px-6 pt-2 pb-safe">{footer}</div>
        )}
        {!footer && <div className="shrink-0 pb-safe" />}
      </div>
    </div>,
    document.body
  );
}
