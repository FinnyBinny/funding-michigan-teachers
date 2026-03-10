import { motion } from 'motion/react';
import { 
  Pencil, 
  Ruler, 
  BookOpen, 
  Award, 
  Star, 
  Trophy, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const TIERS = [
  {
    name: 'Pencil Pal',
    amount: '$10',
    icon: Pencil,
    color: 'bg-pencil',
    textColor: 'text-pencil-dark',
    rewards: [
      'Digital "Thank You" card',
      'Name on our digital wall',
      'Monthly impact newsletter'
    ],
    description: 'Perfect for providing basic supplies like pencils, notebooks, and art materials.'
  },
  {
    name: 'Ruler Rockstar',
    amount: '$50',
    icon: Ruler,
    color: 'bg-ruler',
    textColor: 'text-white',
    popular: true,
    rewards: [
      'All previous rewards',
      'Personal shout-out on Instagram',
      'MI Teacher Fund sticker pack',
      'Exclusive donor badge'
    ],
    description: 'Helps fund classroom organizational tools and specialized learning aids.'
  },
  {
    name: 'Textbook Tycoon',
    amount: '$250',
    icon: BookOpen,
    color: 'bg-apple',
    textColor: 'text-white',
    rewards: [
      'All previous rewards',
      'Video message from a funded teacher',
      'VIP invite to our annual gala',
      'Featured donor story'
    ],
    description: 'Provides essential textbooks, digital subscriptions, or specialized equipment.'
  }
];

export default function DonationTiers() {
  const handleJoin = (tier: typeof TIERS[0]) => {
    const amount = parseInt(tier.amount.replace('$', ''));
    const url = `https://givebutter.com/fmt/donate?amount=${amount}&frequency=monthly`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid md:grid-cols-3 gap-10">
      {TIERS.map((tier, index) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative group bg-white p-10 rounded-[3rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-chalkboard/5 flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:-translate-y-3",
            tier.popular && "ring-8 ring-ruler/5 scale-105 z-10"
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
            onClick={() => handleJoin(tier)}
            className={cn(
              "w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl hover:scale-[1.02]",
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
