/**
 * True only while scripts/build-markdown.mjs renders the pages to Markdown.
 *
 * A reader of the Markdown cannot press "next story", a school-year tab or
 * "show all events", so the three homepage sections that hide content behind
 * those controls print everything instead. In the browser, and for the
 * homepage's prerendered HTML, this is always false and nothing changes.
 */
export const RENDER_ALL: boolean = (globalThis as { __FMT_MARKDOWN__?: boolean }).__FMT_MARKDOWN__ === true;
