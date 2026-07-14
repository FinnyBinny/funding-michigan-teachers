/**
 * FormBold delivery for every site form — contact, newsletter signup,
 * classroom project submission, pilot-school interest, and corporate
 * sponsor inquiry. One FormBold endpoint receives all of them; the `Form`
 * field says which form a submission came from and `subject` keeps the
 * email notifications scannable.
 *
 * Setup (once): FormBold dashboard → create a form → copy the endpoint
 * URL (https://formbold.com/s/XXXXX) → paste just the XXXXX part below.
 * Form IDs are public by design — they ship in the page to every visitor,
 * and FormBold does its own spam filtering.
 *
 * Every form still falls back to Supabase (contact_submissions) and, as a
 * true last resort, a prefilled mailto — so no message is ever lost even
 * if FormBold is down or the ID is missing.
 */
const FORMBOLD_FORM_ID = ''; // ← paste the ID from https://formbold.com/s/<ID>

const FORM_ID = (import.meta.env.VITE_FORMBOLD_ID as string | undefined) || FORMBOLD_FORM_ID;

export async function submitToFormBold(fields: Record<string, unknown>): Promise<boolean> {
  if (!FORM_ID) return false;
  try {
    const res = await fetch(`https://formbold.com/s/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    });
    return res.ok;
  } catch {
    return false;
  }
}
