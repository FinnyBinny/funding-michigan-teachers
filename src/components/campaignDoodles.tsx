/**
 * Campaign doodles for the "Your Cans. Their Classrooms." returnables page.
 *
 * ── Why these were redrawn ──────────────────────────────────────────────────
 * The first version gave every can and bottle the same smiley face and the
 * same pair of stick arms and legs, marching in an evenly spaced row. That is
 * the house style of stock clipart, and it read as generated rather than
 * drawn — which is the one thing this campaign cannot afford, since the whole
 * organization is built on a kid drawing something for a teacher.
 *
 * What replaces it:
 *   · no faces, no limbs — an object with a smile is a mascot, not a drawing
 *   · outlines are wobbly paths, not rects and ellipses, so no edge is
 *     mechanically straight and no corner is mathematically round
 *   · the color is laid down as a separate shape nudged off the outline, the
 *     way a crayon fill never quite lands inside the line
 *   · `tilt` varies each instance, so a row of them is never a uniform march
 *
 * Still the same recipe as supplyDoodles.tsx — 48x48 viewBox, #2b2b2b
 * outlines — so campaign art and school-supply art share a scene.
 */

const OUTLINE = '#2b2b2b';

const ink = {
  stroke: OUTLINE,
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
};

/**
 * The crayon fill: the same silhouette, nudged and very slightly rotated so
 * it sits off the line. Drawn under the outline, never on top of it.
 */
function Crayon({ d, color, dx = 1.2, dy = -1, rotate = -1.2 }: {
  d: string; color: string; dx?: number; dy?: number; rotate?: number;
}) {
  return (
    <g transform={`translate(${dx} ${dy}) rotate(${rotate} 24 26)`} opacity={0.92}>
      <path d={d} fill={color} stroke="none" />
    </g>
  );
}

/** Hand-drawn can. No two sides are parallel, which is the point. */
const CAN_BODY =
  'M14.6 12.3c3.4-1 15.8-1.2 18.9-.2.9 4.2 1.2 20.4.4 25.7-3.6 1.1-16.2 1.2-19.6.1-.9-5.3-.8-21.3.3-25.6Z';
const CAN_LID =
  'M14.4 12.2c.6-1.9 4.4-3 9.6-3 5 0 9 1.2 9.5 3-.7 1.8-4.6 2.9-9.6 2.9-5.1 0-8.9-1.1-9.5-2.9Z';
const CAN_LABEL = 'M14.2 22.6c4-.7 15.6-.8 19.4-.2-.1 2-.1 4 0 5.9-4 .6-15.5.7-19.5 0 .2-1.9.2-3.8.1-5.7Z';

export function PopCan({ color = '#E8564A', tilt = 0 }: { color?: string; tilt?: number }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform={`rotate(${tilt} 24 26)`}>
        <Crayon d={CAN_BODY} color={color} />
        <path d={CAN_BODY} {...ink} />
        <path d={CAN_LID} fill="#e9eef0" {...ink} />
        {/* the tab, drawn in one scratchy stroke rather than a perfect ring */}
        <path d="M21 11.4c1.2-.9 4.6-1 6 0" stroke={OUTLINE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d={CAN_LABEL} fill="#fffdf6" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

const BOTTLE_BODY =
  'M20.6 13.4c.2 2.1-3.7 3.9-3.6 7.6.2 4.6-.1 12.3.2 15.1.2 2.3 1.9 3.4 6.8 3.4 4.8 0 6.6-1.1 6.8-3.4.3-2.9 0-10.6.2-15.1.2-3.7-3.8-5.5-3.6-7.6-2 .4-4.8.4-6.8 0Z';

export function Bottle({ color = '#5EA9DD', tilt = 0 }: { color?: string; tilt?: number }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform={`rotate(${tilt} 24 26)`}>
        {/* cap — a squat scribbled block, not a rounded rect */}
        <path d="M20.4 5.2c2.3-.6 5.1-.6 7.4 0 .3 1.4.3 2.8 0 4.2-2.4.5-5.1.5-7.4 0-.4-1.4-.4-2.8 0-4.2Z"
              fill="#E8564A" {...ink} />
        <path d="M20.8 9.4c.1 1.4.1 2.8-.2 4.1 2.2.5 4.7.5 6.9 0-.3-1.3-.3-2.7-.2-4.1" {...ink} />
        <Crayon d={BOTTLE_BODY} color={color} dx={-1.3} dy={1.1} rotate={1.4} />
        <path d={BOTTLE_BODY} {...ink} />
        <path d="M17.2 24.6c4.3-.7 9.6-.7 13.8-.1-.1 2-.1 4 0 6-4.3.6-9.6.6-13.9 0 .2-2 .2-3.9.1-5.9Z"
              fill="#fffdf6" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/**
 * The dime. Drawn as an imperfect circle — a kid's coin is never round, and a
 * perfect one next to hand-drawn cans is what makes a set look assembled.
 */
export function Dime({ tilt = 0 }: { tilt?: number }) {
  const D = 'M24 10.8c7.3 0 13.4 5.9 13.2 13.3-.2 7.2-6 13.1-13.2 13.1-7.4 0-13.3-6-13.1-13.4.2-7.1 6-13 13.1-13Z';
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform={`rotate(${tilt} 24 24)`}>
        <Crayon d={D} color="#d7dde0" dx={1} dy={1.1} rotate={2} />
        <path d={D} {...ink} />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={OUTLINE}
          fontFamily="Architects Daughter, cursive"
        >
          10¢
        </text>
      </g>
    </svg>
  );
}

/** The schoolhouse, drawn the way the shirt artwork draws one. */
export function SchoolHouse() {
  const ROOF = 'M7.6 26.6C15 21 24.2 14.2 32 10.6c8 3.6 17.2 10.5 24.6 16.1-16.4 1-32.7 1-49 0Z';
  const BODY = 'M12.4 26.6c13.1-.9 26.2-.9 39.3 0 .8 7.8.8 15.6.1 23.4-13.2.9-26.4.9-39.5 0-.7-7.8-.7-15.6.1-23.4Z';
  return (
    <svg viewBox="0 0 64 56" fill="none" aria-hidden="true">
      {/* flag, on a pole that leans a little */}
      <path d="M31.6 3.9c.3 2.4.4 4.8.3 7.2" stroke={OUTLINE} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M32 4.4c3.4-.2 4.9.8 7.4 1.2-2.1 1.5-4.1 2.4-7.6 2.2.2-1.1.3-2.3.2-3.4Z" fill="#5EA9DD" {...ink} />
      <Crayon d={ROOF} color="#E8564A" dx={1.4} dy={-1.2} rotate={-1} />
      <path d={ROOF} {...ink} />
      <Crayon d={BODY} color="#FFD54F" dx={-1.5} dy={1.3} rotate={1} />
      <path d={BODY} {...ink} />
      {/* door — an arch with an uneven shoulder */}
      <path d="M26.6 50.2c-.2-4.6-.3-9.3 0-13.9 1-3.1 9.4-3.2 10.6-.1.4 4.6.3 9.3.1 14" fill="#4bbfb3" {...ink} />
      {/* windows, each a different wobble */}
      <path d="M16.2 32.4c2.6-.5 5.2-.5 7.8-.1.3 2.5.3 5 0 7.5-2.6.4-5.3.4-7.9 0-.3-2.5-.3-5 .1-7.4Z" fill="#fffdf6" {...ink} />
      <path d="M40.3 32.2c2.7-.4 5.4-.4 8 .1.2 2.4.2 4.9 0 7.3-2.7.5-5.4.5-8.1.1-.3-2.5-.3-5 .1-7.5Z" fill="#fffdf6" {...ink} />
      {/* bell window */}
      <path d="M32 16.8c1.9 0 3.4 1.5 3.3 3.4-.1 1.8-1.5 3.1-3.3 3.1-1.9 0-3.4-1.5-3.3-3.4.1-1.7 1.5-3.1 3.3-3.1Z" fill="#fffdf6" {...ink} />
    </svg>
  );
}
