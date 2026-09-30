/**
 * Bloomerang CRM — files the people who use the site's existing forms.
 *
 * This is an *additional* destination, never a replacement. Every form still
 * delivers through FormBold and still falls back to Supabase and a mailto, and
 * none of them waits on this or reports failure from it: a CRM that is slow,
 * blocked by an extension, or simply down must not make a teacher's supply
 * request look like it failed.
 *
 * Bloomerang's copy-paste embed is deliberately not used. It injects its own
 * markup and stylesheet, needs jQuery and jQuery Validate, polls for its
 * library every 500ms with no timeout, and on success navigates the browser
 * to the apex domain — which this site's Worker then 301s to www. Their
 * JavaScript API does the part that matters without any of that.
 *
 * jQuery still arrives with Bloomerang-v2.js, so the library is fetched only
 * when someone actually submits something. A visitor who never touches a form
 * — which is nearly all of them — downloads none of it.
 *
 * ── The key ────────────────────────────────────────────────────────────────
 * PUBLIC_KEY is Bloomerang's public web key, the same class of credential as
 * the Stripe publishable key and the Supabase anon key: designed to sit in the
 * browser, able only to create constituents and interactions. It is safe in
 * this repo. A Bloomerang *private* API key is a different thing and must
 * never appear here — that belongs in a Worker secret.
 */

const PUBLIC_KEY = 'pub_1e4d92ad-a318-11f1-9e81-0a3f1cc02b7b';

/**
 * One Bloomerang form per form on the site, so submissions arrive separated
 * in the CRM instead of piling into one bucket.
 *
 * ⚠️ THE ORDER OF THESE IDS IS UNVERIFIED. The embed code Bloomerang
 * generates is byte-for-byte identical across all five Constituent
 * Information forms apart from the ID itself — 56320 and 57344 are literally
 * the same file — so nothing in the scripts says which ID is "Teacher Supply
 * Request" and which is "Sponsorship Enquiry". These are assigned in the
 * order the scripts were supplied.
 *
 * To check or correct: Bloomerang → Settings → Website Integration, where
 * each form is listed by name with its ID. Fixing a wrong one is a single
 * line here.
 *
 * Nothing is lost if the order is wrong: every submission's interaction note
 * begins by naming what it was ("Teacher supply request — …"), so a record
 * filed under the wrong form still says what it is.
 */
export const BLOOMERANG_FORMS = {
  contact: '55296',
  supplies: '56320',
  pilotSchool: '57344',
  sponsor: '56321',
  /** The original form, kept for anything not covered above. */
  general: '53248',
} as const;

export type BloomerangForm = keyof typeof BLOOMERANG_FORMS;

/**
 * The mailing-list widget, which is a different Bloomerang concept from the
 * forms above: it calls joinMailingList rather than submitInteraction, and is
 * built to accept a signup that is only an email address. This is what the
 * Impact Report box on the homepage needed — filing it as a constituent
 * interaction with no name was the caveat flagged when these were first
 * wired.
 */
const EMAIL_SIGNUP_ID = '25600';

const SCRIPT_SRC = 'https://crm.bloomerang.co/Content/Scripts/Api/Bloomerang-v2.js';

/** Give up rather than spin forever behind a blocker or a dead connection. */
const TIMEOUT_MS = 12000;

export interface CrmFields {
  /** Whole name as typed. Split here; the forms ask for one name field. */
  name?: string;
  email: string;
  phone?: string;
  /** Everything else worth keeping, written into the interaction note. */
  note?: string;
}

interface BloomerangApi {
  _isReady?: boolean;
  useKey(key: string): void;
  useInteractionId(id: string): boolean;
  useEmailId(id: string): boolean;
  Account: {
    individual(): BloomerangApi['Account'];
    firstName(v: string): BloomerangApi['Account'];
    lastName(v: string): BloomerangApi['Account'];
    homeEmail(v: string): BloomerangApi['Account'];
    homePhone(v: string): BloomerangApi['Account'];
  };
  Interaction: { note(v: string): unknown };
  Api: {
    OnSuccess?: (r: unknown) => void;
    OnError?: (r: { Message?: string }) => void;
    submitInteraction(): void;
    joinMailingList(): void;
  };
}

declare global {
  interface Window { Bloomerang?: BloomerangApi }
}

/**
 * "Ms. Freeman" -> { first: 'Ms.', last: 'Freeman' }; "Cher" -> last: 'Cher'.
 *
 * Bloomerang wants the two separately and the forms ask for one field.
 * Everything before the final space is the first name, which keeps middle
 * names and initials attached to it rather than dropping them.
 */
export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

let loader: Promise<BloomerangApi> | null = null;

/** Loads Bloomerang-v2.js once, with a deadline their own loader lacks. */
function loadBloomerang(): Promise<BloomerangApi> {
  if (loader) return loader;

  loader = new Promise<BloomerangApi>((resolve, reject) => {
    const ready = () => window.Bloomerang?._isReady === true;
    if (ready()) return resolve(window.Bloomerang as BloomerangApi);

    const started = Date.now();
    const poll = () => {
      if (ready()) return resolve(window.Bloomerang as BloomerangApi);
      if (Date.now() - started > TIMEOUT_MS) {
        loader = null; // allow a later submission to try again
        return reject(new Error('Bloomerang did not load'));
      }
      window.setTimeout(poll, 200);
    };

    if (!document.querySelector(`script[src^="${SCRIPT_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onerror = () => { loader = null; reject(new Error('Bloomerang script blocked')); };
      document.head.appendChild(s);
    }
    poll();
  });

  return loader;
}

/**
 * Files someone into Bloomerang. Resolves true on success, false on anything
 * else — it never throws and never rejects, because every caller is running
 * it beside a delivery that already worked.
 *
 * Call it without awaiting. The form should tell the visitor it went through
 * as soon as FormBold or Supabase confirms; whether the CRM also took it is
 * not something they can act on.
 */
export function fileWithBloomerang(form: BloomerangForm, fields: CrmFields): Promise<boolean> {
  return loadBloomerang()
    .then(
      (B) =>
        new Promise<boolean>((resolve) => {
          const { first, last } = splitName(fields.name ?? '');

          B.useKey(PUBLIC_KEY);
          B.useInteractionId(BLOOMERANG_FORMS[form]);
          B.Account.individual()
            .firstName(first)
            .lastName(last)
            .homeEmail(fields.email)
            .homePhone(fields.phone ?? '');
          B.Interaction.note(fields.note ?? '');

          settleOn(B, resolve, () => B.Api.submitInteraction());
        }),
    )
    .catch(() => false);
}

/**
 * Adds someone to the Bloomerang mailing list.
 *
 * Separate from the above because Bloomerang treats it separately: a
 * different widget id, a different API call, and it accepts a signup that is
 * only an email address — which is all the Impact Report box on the homepage
 * asks for.
 */
export function joinMailingList(fields: { name?: string; email: string }): Promise<boolean> {
  return loadBloomerang()
    .then(
      (B) =>
        new Promise<boolean>((resolve) => {
          const { first, last } = splitName(fields.name ?? '');

          B.useKey(PUBLIC_KEY);
          B.useEmailId(EMAIL_SIGNUP_ID);
          B.Account.individual().firstName(first).lastName(last).homeEmail(fields.email);

          settleOn(B, resolve, () => B.Api.joinMailingList());
        }),
    )
    .catch(() => false);
}

/**
 * Wires Bloomerang's success and error callbacks to one resolve, fires the
 * submission, and guarantees an answer: neither callback firing would
 * otherwise leave the promise pending forever.
 */
function settleOn(B: BloomerangApi, resolve: (ok: boolean) => void, fire: () => void) {
  let done = false;
  const settle = (ok: boolean) => { if (!done) { done = true; resolve(ok); } };
  B.Api.OnSuccess = () => settle(true);
  B.Api.OnError = () => settle(false);
  window.setTimeout(() => settle(false), TIMEOUT_MS);
  fire();
}
