import { motion } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  Star,
  Award,
  Crown,
  Handshake,
  TrendingUp,
  Users,
  Heart,
  Mail,
} from 'lucide-react';
import { cn } from '../lib/utils';

const SPONSOR_TIERS = [
  {
    name: 'Pencil Partner',
    price: '$250',
    period: 'per year',
    value: 250,
    icon: Building2,
    accent: 'bg-pencil',
    accentText: 'text-chalkboard',
    border: 'border-pencil/30',
    description:
      'An accessible entry point for local businesses that want to stand behind Michigan teachers and get recognized for it.',
    perks: [
      'Logo featured on the FMT website sponsors page',
      'Business name in printed materials at teacher appreciation events',
      'One dedicated social media shout-out',
      'Tax-deductible 501(c)(3) contribution',
    ],
  },
  {
    name: 'Campus Champion',
    price: '$500',
    period: 'per year',
    value: 500,
    icon: Star,
    accent: 'bg-ruler',
    accentText: 'text-white',
    border: 'border-ruler/30',
    popular: true,
    description:
      'The sweet spot for businesses ready to show up for teachers consistently and earn meaningful community visibility.',
    perks: [
      'Everything in Pencil Partner',
      'Featured spotlight in FMT\'s monthly newsletter',
      'Dedicated Instagram post every quarter',
      'Your name on teacher thank-you flyers shown at staff meetings',
      'Personalized certificate of appreciation for your business',
    ],
  },
  {
    name: "Principal's Circle",
    price: '$1,000',
    period: 'per year',
    value: 1000,
    icon: Award,
    accent: 'bg-apple',
    accentText: 'text-white',
    border: 'border-apple/30',
    description:
      'For organizations committed to making a visible, trackable impact in Okemos classrooms — and proving it to their community.',
    perks: [
      'Everything in Campus Champion',
      'Your logo on physical appreciation banners, flyers, and pinned post',
      'Personal thank-you video from a teacher you helped fund',
      'Quarterly impact report tied to your specific contribution',
      '"Sponsored by [Business]" callout at one staff meeting per semester',
      'Input into which classroom projects get funded',
    ],
  },
  {
    name: 'Founding Patron',
    price: '$2,500',
    period: 'per year',
    value: 2500,
    icon: Crown,
    accent: 'bg-chalkboard',
    accentText: 'text-pencil',
    border: 'border-chalkboard/20',
    premium: true,
    description:
      'Our highest honor, reserved for partners who believe deeply in the future of Michigan education and want to help define it.',
    perks: [
      'Everything in Principal\'s Circle',
      'Named sponsorship fund — e.g., "[Business] Teacher Appreciation Fund"',
      'Co-branded social content published throughout the year',
      'First pick of which school or project your dollars fund',
      'Direct monthly check-ins with FMT founder Finn Regan',
      'Permanent wall-of-honor recognition on the FMT website',
      'Early access to new programs and initiatives',
    ],
  },
];

const WHY_STATS = [
  {
    icon: Users,
    value: '1,200+',
    label: 'Teachers Reached',
    color: 'text-ruler',
    bg: 'bg-ruler/10',
  },
  {
    icon: TrendingUp,
    value: '$4,000+',
    label: 'Raised for Classrooms',
    color: 'text-apple',
    bg: 'bg-apple/10',
  },
  {
    icon: Heart,
    value: '3+',
    label: 'Schools Served',
    color: 'text-pencil-dark',
    bg: 'bg-pencil/20',
  },
];

interface CorporateSponsorsProps {
  onContact: () => void;
  onDonate: (amount: number) => void;
}

export default function CorporateSponsors({ onContact, onDonate }: CorporateSponsorsProps) {
  return (
    <div>

      {/* Impact Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-16 md:mb-24">
        {WHY_STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-chalkboard/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-6"
          >
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0', stat.bg)}>
              <stat.icon size={26} className={stat.color} />
            </div>
            <div>
              <p className={cn('text-3xl font-serif font-bold leading-none', stat.color)}>{stat.value}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sponsor Tier Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
        {SPONSOR_TIERS.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'relative group bg-white p-7 rounded-[2rem] border flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:-translate-y-2',
              tier.border,
              tier.popular && 'ring-4 ring-ruler/10 md:scale-[1.03] z-10 shadow-xl',
              tier.premium && 'ring-4 ring-chalkboard/10'
            )}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ruler text-white px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                Most Popular
              </div>
            )}
            {tier.premium && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-chalkboard text-pencil px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                Top Tier
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-7 transform group-hover:rotate-6 transition-transform duration-500 shadow-md shrink-0',
              tier.accent,
              tier.accentText
            )}>
              <tier.icon size={26} />
            </div>

            {/* Name & Price */}
            <h3 className="text-2xl font-serif font-bold mb-1 leading-tight">{tier.name}</h3>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-serif font-bold">{tier.price}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{tier.period}</span>
            </div>

            <p className="text-chalkboard/55 text-sm mb-8 leading-relaxed font-light flex-none">
              {tier.description}
            </p>

            {/* Perks */}
            <div className="flex-1 space-y-3.5 mb-8">
              {tier.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-3 text-sm group/item">
                  <div className="w-5 h-5 rounded-full bg-apple/10 flex items-center justify-center shrink-0 mt-px group-hover/item:bg-apple group-hover/item:text-white transition-colors">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-chalkboard/75 group-hover/item:text-chalkboard transition-colors leading-snug">
                    {perk}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => onDonate(tier.value)}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg hover:scale-[1.02] cursor-pointer uppercase tracking-widest',
                tier.popular
                  ? 'bg-ruler text-white hover:bg-ruler/90'
                  : tier.premium
                  ? 'bg-chalkboard text-pencil hover:bg-apple hover:text-white'
                  : 'bg-chalkboard text-white hover:bg-apple'
              )}
            >
              Become a Sponsor
            </button>
          </motion.div>
        ))}
      </div>

      {/* Custom Package CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-chalkboard rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-5 uppercase tracking-widest border border-pencil/20">
            <Handshake size={13} />
            <span>Custom Packages Available</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3 leading-tight">
            Need something <span className="text-pencil italic font-normal">tailored</span>?
          </h3>
          <p className="text-white/55 max-w-lg leading-relaxed font-light">
            We're happy to build a sponsorship package around your goals — whether that's a specific school,
            a branded supply drive, or an in-kind food donation. Reach out and let's talk.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <button
            onClick={onContact}
            className="flex items-center gap-3 bg-apple text-white px-8 py-4 rounded-2xl font-bold hover:bg-apple/90 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer whitespace-nowrap"
          >
            <Mail size={18} />
            Get in Touch
          </button>
          <button
            onClick={() => onDonate(500)}
            className="flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10 cursor-pointer whitespace-nowrap"
          >
            Donate Directly
          </button>
        </div>
      </motion.div>

    </div>
  );
}
