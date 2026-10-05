import { useEffect, useRef } from 'react';

/**
 * Shown when a form could not be delivered by any route (FormBold and
 * Supabase both failed).
 *
 * Forms used to say "thank you" regardless, after a window.open(mailto:)
 * that pop-up blockers and phones without a mail app quietly swallow, so a
 * request could be lost while the visitor was told it had arrived. This says
 * plainly that it did not send, and offers the same email as a link the
 * visitor presses themselves, with their answers already in it.
 *
 * role="alert" so a screen reader announces it the moment it appears.
 */
export function SendFailed({ mailto, onDark = false }: { mailto: string; onDark?: boolean }) {
  return (
    <p role="alert" className={`text-sm font-bold leading-relaxed ${onDark ? 'text-pencil' : 'text-apple'}`}>
      We couldn't send that from here.{' '}
      <a href={mailto} className="underline underline-offset-2">Email it to us instead</a>
      {' '}— your answers are already filled in.
    </p>
  );
}

/**
 * For the heading of a success panel that replaces a form. The form held
 * focus, so when it disappears focus falls to the page body and a screen
 * reader says nothing; focusing the heading reads the confirmation out.
 * Give the heading tabIndex={-1}.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}
