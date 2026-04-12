"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { deleteWorkoutSession } from "@/actions/workout";

export function DeleteWorkoutButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteWorkoutSession(sessionId);
      router.push("/history");
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -mr-2 text-text-dim active:text-error transition-colors touch-manipulation"
        aria-label="Delete workout"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Delete workout?">
        <p className="text-sm text-text-muted mb-6">
          This will permanently remove this workout and all its sets. This can&apos;t be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            isLoading={isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
