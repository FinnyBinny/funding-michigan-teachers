/**
 * Bloomerang CRM — constituent submissions, without the embed.
 *
 * Bloomerang gives you a copy-paste <script> that injects its own markup and
 * stylesheet. We use its JavaScript API instead and keep our own form, for
 * four reasons that all showed up in the snippet itself:
 *
 *   · it ships its own CSS (a #328efd blue, unstyled inputs) and would have
 *     looked like a widget bolted onto the page
 *   · it polls every 500ms for the library with no timeout, so a blocked or
 *     slow script leaves a permanently empty box and no message
 *   · on success it calls window.location.replace on the APEX domain, which
 *     the Worker then 301s to www — a full reload of a single-page app plus
 *     a redirect hop, from a form that could just say thank you in place
 *   · it needs jQuery and jQuery Validate, which this site does not use
 *
 * jQuery still arrives with Bloomerang-v2.js, which is why this module is
 * imported by exactly one lazily-loaded page. No other route pays for it.
 *
 * ── The key ────────────────────────────────────────────────────────────────
 * PUBLIC_KEY is Bloomerang's public web key, the same class of credential as
 * the Stripe publishable key and the Supabase anon key: it is designed to sit
 * in the browser and can only create constituents and interactions. It is
 * safe in this repo. A Bloomerang *private* API key is a different thing
 * entirely and must never appear here — if server-side CRM access is ever
 * needed, it belongs in a Worker secret.
 */

const PUBLIC_KEY = 'pub_1e4d92ad-a318-11f1-9e81-0a3f1cc02b7b';

/**
 * The Constituent Information form this submission is filed against, from the
 * embed code Bloomerang generated. Bloomerang allows one of these per page,
 * which is why the form lives on its own route.
 */
const INTERACTION_ID = '53248';

const SCRIPT_SRC = 'https://crm.bloomerang.co/Content/Scripts/Api/Bloomerang-v2.js';

/** Give up rather than spin forever behind a blocker or a bad connection. */
const LOAD_TIMEOUT_MS = 12000;

export interface ConstituentFields {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  comment?: string;
  /** Whether they asked to hear from FMT. Only sent when true. */
  optIn?: boolean;
}

interface BloomerangApi {
  _isReady?: boolean;
  useKey(key: string): void;
  useInteractionId(id: string): boolean;
  Account: {
    individual(): BloomerangApi['Account'];
    firstName(v: string): BloomerangApi['Account'];
    lastName(v: string): BloomerangApi['Account'];
    homeEmail(v: string): BloomerangApi['Account'];
    homePhone(v: string): BloomerangApi['Account'];
    homeAddress(street: string, city: string, state: string, zip: string, country: string): unknown;
    optedInStatus(email: boolean, mail: boolean, phone: boolean): unknown;
  };
  Interaction: { note(v: string): unknown };
  Api: {
    OnSuccess?: (r: unknown) => void;
    OnError?: (r: { Message?: string }) => void;
    submitInteraction(): void;
  };
}

declare global {
  interface Window { Bloomerang?: BloomerangApi }
}

let loader: Promise<BloomerangApi> | null = null;

/**
 * Loads Bloomerang-v2.js once and resolves when its API is ready.
 *
 * The library sets `_isReady` some time after the script's load event, so
 * readiness is polled — but with a deadline, unlike Bloomerang's own loader.
 */
export function loadBloomerang(): Promise<BloomerangApi> {
  if (loader) return loader;

  loader = new Promise<BloomerangApi>((resolve, reject) => {
    const ready = () => window.Bloomerang?._isReady === true;
    const settle = () => resolve(window.Bloomerang as BloomerangApi);

    if (ready()) return settle();

    const started = Date.now();
    const poll = () => {
      if (ready()) return settle();
      if (Date.now() - started > LOAD_TIMEOUT_MS) {
        loader = null; // let a retry try again
        return reject(new Error('Bloomerang did not load'));
      }
      window.setTimeout(poll, 200);
    };

    if (!document.querySelector(`script[src^="${SCRIPT_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onerror = () => {
        loader = null;
        reject(new Error('Bloomerang script blocked'));
      };
      document.head.appendChild(s);
    }
    poll();
  });

  return loader;
}

/**
 * Files a constituent and their interaction against the form in Bloomerang.
 *
 * Rejects on anything that goes wrong, including a refusal from Bloomerang,
 * so the caller can fall back to the site's own form delivery rather than
 * telling someone their message went through when it did not.
 */
export function submitConstituent(fields: ConstituentFields): Promise<void> {
  return loadBloomerang().then(
    (B) =>
      new Promise<void>((resolve, reject) => {
        B.useKey(PUBLIC_KEY);
        B.useInteractionId(INTERACTION_ID);

        B.Account.individual()
          .firstName(fields.firstName)
          .lastName(fields.lastName)
          .homeEmail(fields.email)
          .homePhone(fields.phone ?? '');

        // Bloomerang's own embed always sends the address, blank or not,
        // because it needs the country to decide GDPR consent handling.
        B.Account.homeAddress(
          fields.street ?? '',
          fields.city ?? '',
          fields.state ?? '',
          fields.zip ?? '',
          'US',
        );

        // Consent is only ever asserted when the box was actually ticked.
        if (fields.optIn) B.Account.optedInStatus(true, true, false);

        B.Interaction.note(fields.comment ?? '');

        let done = false;
        const finish = (fn: () => void) => {
          if (done) return;
          done = true;
          fn();
        };

        B.Api.OnSuccess = () => finish(resolve);
        B.Api.OnError = (r) => finish(() => reject(new Error(r?.Message || 'Bloomerang rejected the submission')));
        // Neither callback firing would hang the button forever.
        window.setTimeout(() => finish(() => reject(new Error('Bloomerang timed out'))), LOAD_TIMEOUT_MS);

        B.Api.submitInteraction();
      }),
  );
}
