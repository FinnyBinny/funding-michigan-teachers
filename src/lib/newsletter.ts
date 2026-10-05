import { supabase } from './supabase';
import { submitToFormBold, FORMBOLD } from './forms';
import { joinMailingList } from './bloomerang';
import { track } from './analytics';

/**
 * Signs an email up for the Impact Report. Used by the homepage box and the
 * donation thank-you screen. True when at least one delivery took it.
 */
export async function subscribeToImpactReport(email: string, source = 'website'): Promise<boolean> {
  let submitted = false;

  // Filed in the CRM too; never awaited or shown to the visitor.
  void joinMailingList({ email });

  if (await submitToFormBold(FORMBOLD.newsletter, {
    Form: 'Newsletter signup',
    subject: 'Newsletter Signup — Funding Michigan Teachers',
    email,
    Source: source,
  })) submitted = true;

  if (supabase) {
    const { error } = await supabase.from('contact_submissions').insert({
      name: 'Newsletter Signup',
      email,
      type: 'newsletter',
      extra: { source },
    });
    if (!error) submitted = true;
  }

  if (submitted) track('newsletter_signup', { source });
  return submitted;
}
