import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Makes an overlay behave as a modal dialog for keyboard and screen-reader
 * users. Every overlay on the site used to be a styled <div>: focus stayed on
 * the button behind it, Tab walked the page hidden under the backdrop, and
 * Escape did nothing — on the donate checkout, someone using a keyboard had to
 * tab through the whole page and footer to reach the card form.
 *
 * While mounted:
 *   - focus moves into the dialog ([data-autofocus] if present, else the first
 *     control, else the dialog itself);
 *   - the app behind (#root) is inert and does not scroll, so render the
 *     dialog OUTSIDE #root, with createPortal(…, document.body);
 *   - Tab and Shift+Tab cycle inside it, and Escape calls onClose;
 *   - on close, focus returns to whatever opened it.
 *
 * The element also needs role="dialog", aria-modal="true" and an
 * aria-labelledby pointing at its visible title.
 */
export function useModalDialog(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    const focusables = () =>
      [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (n) => n.tagName === 'IFRAME' || n.getClientRects().length > 0,
      );
    const start = el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0];
    if (start) start.focus();
    else {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) {
        e.preventDefault();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      root?.removeAttribute('inert');
      html.style.overflow = prevOverflow;
      // The opener may have unmounted with the page; only return to it if
      // it is still there.
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [ref]);
}
