import { HONEYPOT_NAME } from '../lib/forms';

/**
 * A field only bots fill in.
 *
 * Spam bots were sending the site's forms with every box full of random
 * letters ("lZLgHywjIMhSoDWBpT"), eight of the twenty newest submissions in
 * November 2026. They landed in the FormBold inbox and were filed in
 * Bloomerang as new constituents.
 *
 * A bot that fills every input fills this one too. A person never sees it:
 * it is moved off-screen (not display:none, which many bots skip), hidden from
 * screen readers, out of the Tab order, and named so no browser autofills it.
 * submitToFormBold() and fileWithBloomerang() check it and send nothing when
 * it has a value, while the form still shows the bot its usual "thank you".
 *
 * Put one inside every <form> that sends anything.
 */
export default function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
