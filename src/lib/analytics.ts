/**
 * Provider-agnostic event hooks.
 *
 * Google Analytics 4 is live (see GA_MEASUREMENT_ID below). Events go through
 * gtag when it's configured and fall back to a `window.dataLayer` push
 * otherwise, so swapping GA for Plausible, Cloudflare Web Analytics or Meta
 * later is a change to this one file rather than a hunt through components.
 *
 * Never throws: analytics must not be able to break a donation, a supply
 * request, or a pickup.
 */
/**
 * Events worth counting. The five marked "conversion" are the ones to mark as
 * key events in GA4 (Admin → Events → Mark as key event) — the Google Ad Grant
 * requires at least one meaningful conversion, and a page view is not one.
 */
export type AnalyticsEvent =
  | 'donation_completed'        // conversion — a gift actually cleared Stripe
  | 'supply_request_submitted'  // conversion — a teacher asked for supplies
  | 'school_inquiry_submitted'  // conversion — a school asked about a pilot
  | 'sponsor_inquiry_submitted' // conversion — a business made contact
  | 'returnables_form_submitted'// conversion — a pickup was requested
  | 'newsletter_signup'
  | 'contact_form_submitted'
  | 'returnables_page_view'
  | 'returnables_cta_clicked'
  | 'returnables_form_started'
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
export const GA_MEASUREMENT_ID = 'G-KJ7R4XRHX2';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Set once `config` has fired, because that call carries the first page view.
 * The first trackPageView after it is the same view arriving twice, so it is
 * swallowed rather than double-counted.
 */
let configReportedFirstView = false;

/**
 * Loads gtag.js when a measurement ID is configured; a no-op otherwise.
 * Called once from main.tsx.
 */
export function initAnalytics(): void {
  try {
    if (!GA_MEASUREMENT_ID || typeof document === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    // Verbatim from Google's snippet, and it has to be: gtag.js reads each
    // dataLayer entry and only treats it as a command when it is an
    // `arguments` object. The tidier `(...args) => dataLayer.push(args)`
    // pushes a plain Array, which is silently ignored — the tag still loads
    // and still looks installed to every checker, while `js`, `config` and
    // every event are dropped. That is how this shipped, and why the property
    // recorded nothing.
    // eslint-disable-next-line prefer-rest-params, func-style
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    }
    window.gtag = gtag as (...args: unknown[]) => void;
    window.gtag('js', new Date());
    // `config` reports the first page view itself. Letting it do that means
    // traffic is recorded even if the SPA route tracking below breaks;
    // trackPageView swallows the duplicate and reports every change after.
    window.gtag('config', GA_MEASUREMENT_ID);
    configReportedFirstView = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(s);
  } catch {
    /* analytics is never allowed to surface an error to a visitor */
  }
}

/**
 * Reports an SPA page view; called by setPageMeta whenever a route mounts.
 *
 * GA4 reads `page_location` and `page_title`. `page_path` is a Universal
 * Analytics field and is ignored here, so it is not sent.
 */
export function trackPageView(_path: string, title: string): void {
  try {
    if (!GA_MEASUREMENT_ID) return;
    if (configReportedFirstView) {
      configReportedFirstView = false;
      return;
    }
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_title: title,
    });
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
