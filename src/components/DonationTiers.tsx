import { motion } from 'motion/react';
import {
  Pencil,
  Ruler,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const TIERS = [
  {
    name: 'Bell Ringer',
    amount: '$10',
    value: 10,
    icon: Pencil,
    color: 'bg-pencil',
    textColor: 'text-pencil-dark',
    rewards: [
      'Supports monthly teacher appreciation efforts',
      'Contributes to classroom supply grants',
      'Name on our digital supporter wall',
      'Monthly impact newsletter'
    ],
    description: 'Every dollar goes directly toward the events, supplies, and gestures that remind Michigan teachers they are seen and valued.'
  },
  {
    name: 'Honor Roll',
    amount: '$50',
    value: 50,
    icon: Ruler,
    color: 'bg-ruler',
    textColor: 'text-white',
    popular: true,
    rewards: [
      'Amplifies our impact at appreciation events',
      'Helps fund food & treats at monthly staff meetings',
      'Personal shout-out on our Instagram',
      'Exclusive FMT supporter badge'
    ],
    description: 'Your monthly gift helps us show up for teachers — from staff meeting treats to recognition events — again and again throughout the school year.'
  },
  {
    name: 'Hall of Fame',
    amount: '$250',
    value: 250,
    icon: BookOpen,
    color: 'bg-apple',
    textColor: 'text-white',
    rewards: [
      'Powers our largest classroom grant initiatives',
      'Enables funding for specific teacher projects',
      'Video message from a funded teacher',
      'VIP invite to our annual appreciation event'
    ],
    description: 'At this level, your support powers the big-ticket items — the lab tools, equipment, and materials that school budgets simply can\'t cover.'
  }
];

interface DonationTiersProps {
  onDonate: (amount: number) => void;
}

export default function DonationTiers({ onDonate }: DonationTiersProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-10">
      {TIERS.map((tier, index) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative group bg-white p-7 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:-translate-y-3",
            tier.popular && "ring-4 md:ring-8 ring-ruler/5 md:scale-105 z-10"
          )}
        >
          {tier.popular && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-ruler text-white px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl">
              Most Impactful
            </div>
          )}

          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transform group-hover:rotate-12 transition-transform duration-500 shadow-lg",
            tier.color,
            tier.textColor
          )}>
            <tier.icon size={40} />
          </div>

          <h3 className="text-4xl font-serif font-bold mb-3">{tier.name}</h3>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-serif font-bold">{tier.amount}</span>
            <span className="text-muted font-bold text-[10px] uppercase tracking-widest">/ month</span>
          </div>

          <p className="text-chalkboard/60 text-lg mb-10 leading-relaxed font-light">
            {tier.description}
          </p>

          <div className="flex-1 space-y-5 mb-12">
            {tier.rewards.map(reward => (
              <div key={reward} className="flex items-start gap-4 text-sm font-medium group/item">
                <div className="w-6 h-6 rounded-full bg-apple/10 flex items-center justify-center shrink-0 group-hover/item:bg-apple group-hover/item:text-white transition-colors">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-chalkboard/80 group-hover/item:text-chalkboard transition-colors">{reward}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onDonate(tier.value)}
            className={cn(
              "w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl hover:scale-[1.02] cursor-pointer",
              tier.popular
                ? "bg-ruler text-white hover:bg-ruler/90"
                : "bg-chalkboard text-white hover:bg-apple"
            )}
          >
            Support for {tier.amount}
          </button>
        </motion.div>
      ))}
    </div>
  );
}
