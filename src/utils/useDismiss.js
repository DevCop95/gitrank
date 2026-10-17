import { useEffect, useRef } from 'react';

/**
 * Calls `onDismiss` when the user taps/clicks outside `ref`, presses Escape,
 * or moves keyboard focus outside it. While `open` is false nothing is attached.
 *
 * Uses `pointerdown` instead of `mousedown`: iOS Safari does not emit mouse
 * events when tapping non-interactive areas, so a mousedown listener never
 * fires there and the popup stays stuck open.
 */
export function useDismiss(ref, open, onDismiss) {
  const callbackRef = useRef(onDismiss);
  callbackRef.current = onDismiss;

  useEffect(() => {
    if (!open) return undefined;

    const isOutside = (target) => ref.current && !ref.current.contains(target);
    const dismiss = () => callbackRef.current();

    const handlePointer = (event) => {
      if (isOutside(event.target)) dismiss();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') dismiss();
    };
    const handleFocus = (event) => {
      if (isOutside(event.target)) dismiss();
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('focusin', handleFocus);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [open, ref]);
}
