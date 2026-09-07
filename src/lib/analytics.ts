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

/**
 * Google Analytics 4 measurement ID (looks like "G-XXXXXXXXXX").
 *
 * Empty = analytics fully off (nothing loads, nothing is sent). To turn it on:
 * analytics.google.com → Admin → Create property → Web stream for
 * www.fundingmichiganteachers.org → paste the Measurement ID here. This is the
 * only line that needs to change; the Google Ad Grant requires conversion
 * tracking, which is configured on top of this once it's live.
 */
export const GA_MEASUREMENT_ID = '';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads gtag.js when a measurement ID is configured; a no-op otherwise.
 * Called once from main.tsx.
 */
export function initAnalytics(): void {
  try {
    if (!GA_MEASUREMENT_ID || typeof document === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    // SPA: we send page_view ourselves from setPageMeta on route changes.
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(s);
  } catch {
    /* analytics is never allowed to surface an error to a visitor */
  }
}

/** Reports an SPA page view; called by setPageMeta whenever a route mounts. */
export function trackPageView(path: string, title: string): void {
  try {
    if (!GA_MEASUREMENT_ID) return;
    window.gtag?.('event', 'page_view', { page_path: path, page_title: title });
  } catch {
    /* never surface */
  }
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  try {
    if (typeof window === 'undefined') return;
    if (GA_MEASUREMENT_ID && window.gtag) {
      window.gtag('event', event, props);
      return;
    }
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
