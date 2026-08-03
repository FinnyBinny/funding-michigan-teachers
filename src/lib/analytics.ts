/**
 * Provider-agnostic event hooks.
 *
 * The site has no analytics installed today, so these calls are inert — they
 * push to `window.dataLayer` when something is listening and no-op otherwise.
 * That means the returnables funnel is already instrumented, and connecting
 * Google Analytics, Plausible, Cloudflare Web Analytics, or Meta later is a
 * change to this one file rather than a hunt through components.
 *
 * Never throws: analytics must not be able to break a donation or a pickup
 * request.
 */
export type AnalyticsEvent =
  | 'returnables_page_view'
  | 'returnables_cta_clicked'
  | 'returnables_form_started'
  | 'returnables_form_submitted'
  | 'stripe_donation_clicked'
  | 'faq_opened';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer?.push({ event, ...props });
  } catch {
    /* analytics is never allowed to surface an error to a visitor */
  }
}

const SOURCE_KEY = 'fmt_campaign_source';

/**
 * Captures ?source= from a QR/campaign link and remembers it for the session,
 * so a pickup request submitted after scrolling still reports which door
 * hanger, post, or school handout it came from.
 */
export function captureSource(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('source');
    if (fromUrl) {
      sessionStorage.setItem(SOURCE_KEY, fromUrl.slice(0, 40));
      return fromUrl.slice(0, 40);
    }
    return sessionStorage.getItem(SOURCE_KEY) ?? 'direct';
  } catch {
    return 'direct';
  }
}
