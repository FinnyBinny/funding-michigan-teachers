/**
 * FormBold delivery for every site form. Each form posts to its own
 * FormBold endpoint so submissions land in cleanly separated inboxes; the
 * `Form` field still names the source and `subject` keeps notifications
 * scannable.
 *
 * The IDs are the code after https://formbold.com/s/ from the FormBold
 * dashboard. They're public by design (they ship to every visitor, and
 * FormBold does its own spam filtering), so hardcoding them is fine.
 *
 * Every form still falls back to Supabase (contact_submissions) and, as a
 * true last resort, a prefilled mailto — so no message is ever lost even
 * if FormBold is unreachable.
 *
 * ── Where these actually land ───────────────────────────────────────────────
 * The destination inbox is a FormBold setting, not a code one: FormBold →
 * the form → Settings → Email notifications. Changing the address there
 * changes where every submission for that form arrives, with no deploy.
 *
 * Six of the seven IDs below already point at the same form, so in practice
 * one address change covers nearly everything. Each submission carries a
 * `Form:` field naming its source, so a single inbox stays sortable, and
 * `_replyto` (see below) is set to the sender so replying is one click.
 */
export const FORMBOLD = {
  contact: '6QXyV',    // "Get in Touch" — homepage contact form
  newsletter: '3VkQX', // Newsletter signup
  sponsor: '3AYxr',    // "Let's talk" — corporate sponsor inquiry
  pilot: '6lBey',      // "Bring FMT to your school" — pilot interest
  // No dedicated form was created for teacher project submissions yet, so
  // they route to the general "Get in Touch" inbox (tagged Form: … so
  // they're easy to spot). Swap in a new ID here to separate them.
  project: '6QXyV',
  // Returnables pickup requests ("Your Cans. Their Classrooms.") also land in
  // the contact inbox for now, tagged Form: 'Returnables pickup request'.
  // Create a dedicated FormBold form and paste its ID here to split them out.
  returnables: '6QXyV',
  // Teacher supply requests. Same inbox for now, tagged
  // Form: 'Teacher supply request' — nothing to set up before the page works.
  supplies: '6QXyV',
  // Door decorating competition entries: their own "Door Decorating
  // Entries" form (created November 2026), so they stop mixing with the
  // general inbox. Still tagged Form: 'Door decorating entry'.
  doorDecorating: 'oWpKp',
} as const;

/** The name of the hidden field only bots fill in (components/Honeypot.tsx). */
export const HONEYPOT_NAME = 'fmt_hp_check';

/**
 * True when a bot has filled in a honeypot field on this page. Checked
 * page-wide, so one bot-filled form stops every send from that page load.
 * Never throws: a check that cannot run lets the submission through.
 */
export function honeypotTripped(): boolean {
  try {
    return [...document.querySelectorAll<HTMLInputElement>(`input[name="${HONEYPOT_NAME}"]`)]
      .some((el) => el.value.trim() !== '');
  } catch {
    return false;
  }
}

export async function submitToFormBold(formId: string, fields: Record<string, unknown>): Promise<boolean> {
  if (!formId) return false;
  // A bot: report success so it moves on, and send nothing.
  if (honeypotTripped()) return true;
  try {
    /**
     * Reply-To, set to whoever filled the form in.
     *
     * Without it every notification arrives from FormBold, so answering a
     * teacher's supply request meant copying their address out of the message
     * body into a new email. With it, hitting reply in your inbox goes
     * straight back to them.
     *
     * `_replyto` is FormBold's own field name. It is sent alongside `email`
     * rather than instead of it, so the address still appears in the body.
     */
    const replyTo = typeof fields.email === 'string' && fields.email.includes('@')
      ? { _replyto: fields.email }
      : {};

    const res = await fetch(`https://formbold.com/s/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...fields, ...replyTo }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
