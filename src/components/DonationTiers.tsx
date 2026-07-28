import { motion } from 'motion/react';
import { Pencil, UtensilsCrossed, BookOpen, Check } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Monthly giving tiers on the homepage. Names, amounts, and claims are kept
 * in lockstep with the tiles on /donate (src/pages/DonatePage.tsx) — one
 * language for giving across the whole site. Perks list only what FMT
 * actually delivers today (supporter wall, newsletter); nothing is promised
 * that hasn't been earned.
 */
const TIERS = [
  {
    name: 'Supply Starter',
    amount: '$25',
    value: 25,
    icon: Pencil,
    color: 'bg-pencil',
    textColor: 'text-pencil-dark',
    description: 'Helps stock a classroom supply box for a teacher who would otherwise buy it herself.',
    rewards: [
      'Supports classroom supply grants',
      'Your name on our supporter wall',
      'Monthly impact newsletter',
    ],
  },
  {
    name: 'Meeting Booster',
    amount: '$50',
    value: 50,
    icon: UtensilsCrossed,
    color: 'bg-ruler',
    textColor: 'text-white',
    popular: true,
    description: "Adds to a school's staff-meeting food fund, so teachers are fed at every meeting of the year.",
    rewards: [
      'Backs food at monthly staff meetings',
      'Supports Teacher of the Month gifts',
      'Everything in Supply Starter',
    ],
  },
  {
    name: 'Classroom Backer',
    amount: '$100',
    value: 100,
    icon: BookOpen,
    color: 'bg-apple',
    textColor: 'text-white',
    description: 'Builds toward a full $250 classroom grant — the lab tools and materials school budgets never cover.',
    rewards: [
      'Builds toward full classroom grants',
      'Supports whole-staff appreciation weeks',
      'Everything in Meeting Booster',
    ],
  },
];

interface DonationTiersProps {
  onDonate: (amount: number) => void;
}

export default function DonationTiers({ onDonate }: DonationTiersProps) {
  return (
    <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-start max-w-5xl mx-auto">
      {TIERS.map((tier, index) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          className={cn(
            'relative group bg-white p-6 sm:p-7 rounded-[1.75rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-chalkboard/5 flex flex-col transition-all duration-500 hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)] hover:-translate-y-1.5',
            tier.popular && 'ring-2 ring-ruler/25 md:pt-9',
          )}
        >
          {tier.popular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ruler text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] shadow-lg whitespace-nowrap">
              Most Impactful
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <div
              className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:rotate-6',
                tier.color,
                tier.textColor,
              )}
            >
              <tier.icon size={20} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-serif font-bold leading-tight">{tier.name}</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-serif font-bold tracking-[-0.01em]">{tier.amount}</span>
                <span className="text-muted font-bold text-[9px] uppercase tracking-[0.18em]">/ month</span>
              </div>
            </div>
          </div>

          <p className="text-chalkboard/60 text-sm mb-5 leading-relaxed font-light">
            {tier.description}
          </p>

          <div className="flex-1 space-y-2.5 mb-6">
            {tier.rewards.map((reward) => (
              <div key={reward} className="flex items-start gap-2.5 text-[13px]">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-apple/10 text-apple flex items-center justify-center shrink-0">
                  <Check size={10} strokeWidth={3} />
                </div>
                <span className="text-chalkboard/75 leading-snug">{reward}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onDonate(tier.value)}
            className={cn(
              'w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg hover:scale-[1.01] cursor-pointer',
              tier.popular
                ? 'bg-ruler text-white hover:bg-ruler/90'
                : 'bg-chalkboard text-white hover:bg-apple',
            )}
          >
            Give {tier.amount}/mo
          </button>
        </motion.div>
      ))}
    </div>
  );
}
