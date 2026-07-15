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
} as const;

export async function submitToFormBold(formId: string, fields: Record<string, unknown>): Promise<boolean> {
  if (!formId) return false;
  try {
    const res = await fetch(`https://formbold.com/s/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    });
    return res.ok;
  } catch {
    return false;
  }
}
