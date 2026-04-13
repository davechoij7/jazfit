"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-[#2D1A20]/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-bg-card rounded-t-3xl border-t border-border pb-safe animate-slide-up">
        {/* Drag handle + close button row */}
        <div className="flex items-center justify-between pt-3 pb-2 px-4">
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
          <h2 className="text-lg font-bold text-text-primary px-6 pb-4">{title}</h2>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
