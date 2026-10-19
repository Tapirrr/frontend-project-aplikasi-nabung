"use client";
import { useEffect, useRef } from "react";

export default function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const r = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = r.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={r}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === r.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}
