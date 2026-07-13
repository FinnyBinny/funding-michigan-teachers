import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { SUPPLY_DOODLES } from './supplyDoodles';

/**
 * The donate-page supply basket, powered by a real 2D physics engine
 * (matter-js, dynamically imported so it only loads where the basket
 * renders). Supplies are rigid bodies: they drop in from above the rim,
 * collide, tumble, and settle into a natural pile — and when the amount
 * goes down, the removed items fade away in place while the rest of the
 * pile resettles under gravity.
 */

const MAX_CHIPS = 12;      // caps the pile so it reads "full", not confetti
const PER_DOLLARS = 25;    // one supply lands per ~$25
const BASKET_CLASSES =
  'relative h-[150px] rounded-t-xl rounded-b-[1.75rem] ring-1 ring-pencil-dark/25 bg-gradient-to-b from-pencil/5 to-pencil/20';
const WEAVE = { backgroundImage: 'repeating-linear-gradient(-45deg, rgba(60,40,10,0.03) 0 8px, transparent 8px 16px)' };

export function targetCountFor(amount: number): number {
  return Math.min(MAX_CHIPS, Math.max(1, Math.ceil(amount / PER_DOLLARS)));
}

const doodleFor = (id: number) => SUPPLY_DOODLES[id % SUPPLY_DOODLES.length];

// Deterministic 0..1 from a chip id — organic-looking variety without
// Math.random, so re-renders never reshuffle the pile.
function pseudo(id: number, salt: number): number {
  const x = Math.sin((id + 1) * 127.1 * salt) * 43758.5453;
  return x - Math.floor(x);
}

interface Chip {
  id: number;
  dying?: boolean;
}

export default function SupplyBasket({ amount }: { amount: number }) {
  const reduceMotion = useReducedMotion();
  const target = targetCountFor(amount);
  return reduceMotion ? <StaticBasket target={target} /> : <PhysicsBasket target={target} />;
}

function PhysicsBasket({ target }: { target: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [chips, setChips] = useState<Chip[]>([]);
  const chipsRef = useRef<Chip[]>([]);
  const [ready, setReady] = useState(false);

  const matterRef = useRef<typeof import('matter-js') | null>(null);
  const engineRef = useRef<import('matter-js').Engine | null>(null);
  const runnerRef = useRef<import('matter-js').Runner | null>(null);
  const bodiesRef = useRef(new Map<number, import('matter-js').Body>());
  const elsRef = useRef(new Map<number, HTMLDivElement>());
  const timersRef = useRef<number[]>([]);

  // Boot the physics world once
  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;

    (async () => {
      const M = await import('matter-js');
      const box = boxRef.current;
      if (disposed || !box) return;

      const engine = M.Engine.create({ enableSleeping: true });
      engine.gravity.y = 1;

      const W = box.clientWidth;
      const H = box.clientHeight;
      const t = 80; // wall thickness — thick enough that nothing tunnels through
      const floor = M.Bodies.rectangle(W / 2, H + t / 2 - 3, 4000, t, { isStatic: true });
      const left = M.Bodies.rectangle(-t / 2 + 3, H / 2 - 300, t, H + 900, { isStatic: true });
      const right = M.Bodies.rectangle(W + t / 2 - 3, H / 2 - 300, t, H + 900, { isStatic: true });
      M.Composite.add(engine.world, [floor, left, right]);

      // Sync DOM to bodies after every physics tick
      M.Events.on(engine, 'afterUpdate', () => {
        for (const [id, body] of bodiesRef.current) {
          const el = elsRef.current.get(id);
          if (!el) continue;
          const half = doodleFor(id).px / 2;
          el.style.transform = `translate(${(body.position.x - half).toFixed(1)}px, ${(body.position.y - half).toFixed(1)}px) rotate(${body.angle.toFixed(3)}rad)`;
        }
      });

      const runner = M.Runner.create();
      M.Runner.run(runner, engine);

      // Keep walls glued to the box when the layout resizes
      ro = new ResizeObserver(() => {
        const b = boxRef.current;
        if (!b) return;
        const W2 = b.clientWidth;
        const H2 = b.clientHeight;
        M.Body.setPosition(floor, { x: W2 / 2, y: H2 + t / 2 - 3 });
        M.Body.setPosition(left, { x: -t / 2 + 3, y: H2 / 2 - 300 });
        M.Body.setPosition(right, { x: W2 + t / 2 - 3, y: H2 / 2 - 300 });
      });
      ro.observe(box);

      matterRef.current = M;
      engineRef.current = engine;
      runnerRef.current = runner;
      setReady(true);
    })();

    return () => {
      disposed = true;
      ro?.disconnect();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      const M = matterRef.current;
      if (M && engineRef.current) {
        if (runnerRef.current) M.Runner.stop(runnerRef.current);
        M.Engine.clear(engineRef.current);
      }
      bodiesRef.current.clear();
    };
  }, []);

  // Reconcile the pile with the target count
  useEffect(() => {
    if (!ready) return;
    const M = matterRef.current;
    const engine = engineRef.current;
    const box = boxRef.current;
    if (!M || !engine || !box) return;

    const W = box.clientWidth;
    const alive = chipsRef.current.filter((c) => !c.dying);
    let next = chipsRef.current;

    if (target > alive.length) {
      const additions: Chip[] = [];
      let id = chipsRef.current.length ? Math.max(...chipsRef.current.map((c) => c.id)) + 1 : 0;
      while (additions.length < target - alive.length) additions.push({ id: id++ });

      additions.forEach((chip, k) => {
        const timer = window.setTimeout(() => {
          if (!engineRef.current) return;
          const d = doodleFor(chip.id);
          // Rigid body is slightly smaller than the art so doodles can
          // visually nestle instead of hovering apart.
          const side = d.px * 0.84;
          const body = M.Bodies.rectangle(
            W * (0.14 + 0.72 * pseudo(chip.id, 3)),
            -50 - 26 * pseudo(chip.id, 5),
            side,
            side,
            {
              chamfer: { radius: side * 0.28 },
              friction: 0.35,
              frictionAir: 0.02,
              restitution: 0.24,
              angle: (pseudo(chip.id, 7) - 0.5) * 0.7,
            },
          );
          M.Body.setAngularVelocity(body, (pseudo(chip.id, 9) - 0.5) * 0.16);
          bodiesRef.current.set(chip.id, body);
          M.Composite.add(engine.world, body);
        }, k * 110);
        timersRef.current.push(timer);
      });
      next = [...chipsRef.current, ...additions];
    } else if (target < alive.length) {
      // Newest items leave first; they fade in place, then their bodies
      // vanish and gravity resettles whatever was resting on them.
      const removeIds = new Set(alive.slice(target).map((c) => c.id));
      next = chipsRef.current.map((c) => (removeIds.has(c.id) ? { ...c, dying: true } : c));
      removeIds.forEach((rid) => {
        const timer = window.setTimeout(() => {
          const body = bodiesRef.current.get(rid);
          if (body && engineRef.current) {
            M.Composite.remove(engineRef.current.world, body);
            bodiesRef.current.delete(rid);
          }
          chipsRef.current = chipsRef.current.filter((c) => c.id !== rid);
          setChips(chipsRef.current);
        }, 380);
        timersRef.current.push(timer);
      });
    }

    // A gentle slosh so the pile jostles like liquid whenever the amount moves
    for (const [id, body] of bodiesRef.current) {
      M.Sleeping.set(body, false);
      M.Body.setVelocity(body, {
        x: body.velocity.x + (pseudo(id, 11) - 0.5) * 1.4,
        y: body.velocity.y - 1.3 * pseudo(id, 13),
      });
    }

    chipsRef.current = next;
    setChips(next);
  }, [target, ready]);

  return (
    <div ref={boxRef} className={BASKET_CLASSES} style={WEAVE} aria-hidden="true">
      {chips.map((chip) => {
        const d = doodleFor(chip.id);
        const { Art } = d;
        return (
          <div
            key={chip.id}
            ref={(el) => {
              if (el) elsRef.current.set(chip.id, el);
              else elsRef.current.delete(chip.id);
            }}
            className="absolute left-0 top-0 pointer-events-none will-change-transform drop-shadow-[0_3px_4px_rgba(60,40,10,0.18)]"
            style={{
              width: d.px,
              height: d.px,
              transform: 'translate(-9999px, -9999px)', // parked until first physics tick
              opacity: chip.dying ? 0 : 1,
              transition: 'opacity 350ms ease',
            }}
          >
            <Art />
          </div>
        );
      })}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-xl bg-pencil-dark/15" />
    </div>
  );
}

/** prefers-reduced-motion fallback: a still pile that only cross-fades. */
function StaticBasket({ target }: { target: number }) {
  const chips = Array.from({ length: target }, (_, i) => i);
  return (
    <div className={BASKET_CLASSES} style={WEAVE} aria-hidden="true">
      <div className="absolute inset-x-3 bottom-2 flex flex-wrap-reverse content-end justify-center gap-1">
        {chips.map((id) => {
          const d = doodleFor(id);
          const { Art } = d;
          return (
            <div
              key={id}
              style={{ width: d.px, height: d.px, transform: `rotate(${((id * 47) % 21) - 10}deg)` }}
              className="drop-shadow-[0_3px_4px_rgba(60,40,10,0.18)]"
            >
              <Art />
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-xl bg-pencil-dark/15" />
    </div>
  );
}
