/**
 * Bloomerang CRM — files form submissions through this site's own Worker.
 *
 * ── Why this no longer runs in the browser ─────────────────────────────────
 * It used to call Bloomerang's JavaScript API directly from the page. That
 * worked only while their forms had no reCAPTCHA. Their own embed sends a
 * captcha token with every submit, obtained from a widget their library
 * renders, and nothing outside that embed can produce one — no site key is
 * exposed anywhere to get a token with. Once reCAPTCHA was enabled, a browser
 * call was refused regardless of what it contained.
 *
 * So the call moved to the Worker, where it is authenticated with a private
 * API key instead. Captcha exists to prove a human filled in a form; it does
 * not apply to an authenticated server-to-server call.
 *
 * Three things improved on the way. Bloomerang's library brought jQuery with
 * it and no page loads either any more. The private key never reaches the
 * browser, unlike the public key it replaces. And the Worker can look for an
 * existing constituent before creating one, so the same teacher asking twice
 * does not become two people in the CRM.
 *
 * Still an additional write, never a gate. Every form delivers through
 * FormBold and falls back to Supabase and a mailto; none of them waits on
 * this or reports its failure. A CRM that is down must not make a teacher's
 * supply request look like it failed.
 */

/**
 * What each site form is filed as, used as the interaction subject so a
 * record in the CRM says what it came from.
 */
export const BLOOMERANG_FORMS = {
  contact: 'Website — contact form',
  supplies: 'Website — teacher supply request',
  pilotSchool: 'Website — bring FMT to your school',
  sponsor: 'Website — sponsorship enquiry',
  newsletter: 'Website — Impact Report signup',
  project: 'Website — classroom project submission',
  returnables: 'Website — returnables pickup request',
  classroomReturnables: 'Website — classroom returnables sign-up',
} as const;

export type BloomerangForm = keyof typeof BLOOMERANG_FORMS;

export interface CrmFields {
  /** Whole name as typed; the Worker splits it. Absent for the newsletter. */
  name?: string;
  email: string;
  phone?: string;
  /** Everything else worth keeping, recorded as the interaction note. */
  note?: string;
}

/**
 * Why a submission did not land, written to the console and nowhere else.
 *
 * These calls are invisible to the visitor — their message already went
 * through — but swallowing the reason entirely once meant "it isn't working"
 * could not be diagnosed by anyone. Open the console, submit, read the line.
 */
function report(detail: unknown) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Bloomerang] not filed in the CRM:',
    detail,
    '\nSubmissions still reach FMT by email; only the CRM copy is affected.',
  );
}

/**
 * Files someone into Bloomerang. Resolves true on success, false otherwise —
 * it never throws, because every caller runs it beside a delivery that has
 * already worked.
 *
 * Call it without awaiting. The form should say it went through as soon as
 * FormBold or Supabase confirms; whether the CRM also took it is not
 * something the visitor can act on.
 */
export async function fileWithBloomerang(form: BloomerangForm, fields: CrmFields): Promise<boolean> {
  try {
    const res = await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: BLOOMERANG_FORMS[form], ...fields }),
    });

    if (res.ok) return true;

    const detail = await res.json().catch(() => ({ status: res.status }));
    // 503 means the Worker has no API key yet. That is a setup step rather
    // than a fault, and it says so instead of reading as a breakage.
    report(res.status === 503 ? 'BLOOMERANG_API_KEY is not set on the Worker yet' : detail);
    return false;
  } catch (err) {
    report(err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * The Impact Report box collects an email and nothing else, which the old
 * browser API could not file as a constituent at all. The Worker falls back
 * to the address as the surname, which Bloomerang accepts and staff can tidy.
 */
export function joinMailingList(fields: { name?: string; email: string }): Promise<boolean> {
  return fileWithBloomerang('newsletter', {
    ...fields,
    note: 'Signed up for the Impact Report on fundingmichiganteachers.org',
  });
}
