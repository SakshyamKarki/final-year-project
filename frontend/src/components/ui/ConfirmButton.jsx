import { useState } from "react";
import Button from "./Button";

/**
 * ConfirmButton
 * Shows a primary trigger button. On first click it enters a "pending" state
 * and reveals Confirm / Cancel buttons inline — no browser dialog required.
 *
 * Props:
 *   label         — text for the trigger button
 *   confirmLabel  — text for the confirm button  (default "Confirm")
 *   cancelLabel   — text for the cancel button   (default "Cancel")
 *   variant       — Button variant for the trigger (default "danger")
 *   onConfirm     — async/sync callback when the user confirms
 *   disabled      — disable the trigger
 */
export default function ConfirmButton({
  label,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  disabled = false,
  className = "",
}) {
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
      setPending(false);
    }
  }

  if (!pending) {
    return (
      <Button
        variant={variant}
        disabled={disabled}
        className={className}
        onClick={() => setPending(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={variant} disabled={loading} onClick={handleConfirm}>
        {loading ? "…" : confirmLabel}
      </Button>
      <Button
        variant="secondary"
        disabled={loading}
        onClick={() => setPending(false)}
      >
        {cancelLabel}
      </Button>
    </span>
  );
}
