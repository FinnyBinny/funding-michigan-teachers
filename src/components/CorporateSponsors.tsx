import { STAT } from '../data/impactStats';
import { motion } from 'motion/react';
import { Building2, Check, Star, Award, Crown, Handshake, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * The four sponsorship levels on /sponsors.
 *
 * Each card lists at most three benefits, and only the ones it ADDS to the
 * level below — the columns ran to 690px of near-identical bullets when every
 * card restated everything. Keep it that way: a fourth bullet goes in the
 * level above, or replaces one.
 *
 * Only list what FMT delivers today. These were cut in October 2026 as
 * commitments nobody had been asked to keep yet; add any back once they are
 * real: a thank-you video from a teacher, input into which projects get
 * funded, co-branded social content, permanent wall-of-honor recognition,
 * early access to new programs, and a certificate of appreciation.
 *
 * Tier names must match the tier column in the sponsors table and the picker
 * in AdminPanel.
 */
const SPONSOR_TIERS = [
  {
    name: 'Pencil Partner',
    price: '$250',
    value: 250,
    icon: Building2,
    iconClass: 'bg-pencil text-chalkboard',
    perks: [
      'Your logo on our sponsors page',
      'Your name at our appreciation events',
      'A thank-you post on our social media',
    ],
  },
  {
    name: 'Campus Champion',
    price: '$500',
    value: 500,
    icon: Star,
    iconClass: 'bg-ruler text-white',
    includes: 'Pencil Partner',
    perks: [
      'A spotlight in our monthly newsletter',
      'An Instagram post every quarter',
      'Your name on staff-meeting thank-you flyers',
    ],
  },
  {
    name: "Principal's Circle",
    price: '$1,000',
    value: 1000,
    icon: Award,
    iconClass: 'bg-apple text-white',
    includes: 'Campus Champion',
    perks: [
      'Your logo on event banners and flyers',
      '"Sponsored by" at a staff meeting each semester',
      'A quarterly report on what your gift paid for',
    ],
  },
  {
    name: 'Founding Patron',
    price: '$2,500',
    value: 2500,
    icon: Crown,
    iconClass: 'bg-pencil text-chalkboard',
    includes: "Principal's Circle",
    dark: true,
    perks: [
      'A fund named for your business',
      'You choose the school or project it supports',
      'A monthly check-in with our founder',
    ],
  },
];

const WHY_STATS = [STAT.staff, STAT.support, STAT.partnerSchools];

interface CorporateSponsorsProps {
  onContact: () => void;
  onDonate: (amount: number) => void;
}

export default function CorporateSponsors({ onContact, onDonate }: CorporateSponsorsProps) {
  return (
    <div>

      {/* Impact figures: one strip, three across even on a phone. */}
      <dl className="grid grid-cols-3 divide-x divide-chalkboard/10 bg-white rounded-[1.5rem] ring-1 ring-chalkboard/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-10 md:mb-14 max-w-3xl mx-auto">
        {WHY_STATS.map((stat) => (
          // A term must come before its description in a <dl>; the figure is
          // shown first by reversing the column, not the markup.
          <div key={stat.label} className="px-3 py-4 sm:px-6 sm:py-5 text-center flex flex-col-reverse">
            <dt className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-bold text-muted mt-1.5 leading-snug">{stat.label}</dt>
            <dd className="font-serif font-bold text-xl sm:text-3xl leading-none text-chalkboard">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Levels. A swipeable row on phones, four across on wide screens. */}
      <div
        className="rail-sm md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-4"
        role="region"
        tabIndex={0}
        aria-label="Sponsorship levels"
      >
        {SPONSOR_TIERS.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className={cn(
              'rounded-[1.75rem] p-6 flex flex-col ring-1',
              tier.dark
                ? 'bg-chalkboard ring-chalkboard text-white'
                : 'bg-white ring-chalkboard/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)]',
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', tier.iconClass)}>
                <tier.icon size={17} aria-hidden="true" />
              </div>
              <h3 className="font-serif font-bold text-lg leading-tight">{tier.name}</h3>
            </div>

            <p className="flex items-baseline gap-1.5 mb-5">
              <span className="text-3xl font-serif font-bold">{tier.price}</span>
              <span className={cn('text-[10px] font-bold uppercase tracking-widest', tier.dark ? 'text-white/70' : 'text-muted')}>a year</span>
            </p>

            <div className={cn('border-t pt-4 flex-1 mb-6', tier.dark ? 'border-white/15' : 'border-chalkboard/10')}>
              {tier.includes && (
                <p className={cn('text-xs font-bold mb-2.5', tier.dark ? 'text-pencil' : 'text-ruler')}>
                  Everything in {tier.includes}, plus:
                </p>
              )}
              <ul className="space-y-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                    <Check size={14} strokeWidth={2.5} className={cn('shrink-0 mt-0.5', tier.dark ? 'text-pencil' : 'text-apple')} aria-hidden="true" />
                    <span className={tier.dark ? 'text-white/85' : 'text-chalkboard/80'}>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onDonate(tier.value)}
              aria-label={`Become a ${tier.name} sponsor, ${tier.price} a year`}
              className={cn(
                'w-full py-3 rounded-xl font-bold text-xs uppercase tracking-[0.16em] transition-colors active:scale-[0.98] cursor-pointer',
                tier.dark ? 'bg-pencil text-chalkboard hover:bg-white' : 'bg-chalkboard text-white hover:bg-apple',
              )}
            >
              Become a sponsor
            </button>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-xs text-muted leading-relaxed max-w-2xl mx-auto mb-10 md:mb-14">
        Food, gift cards and supplies count toward a level at fair market value. Funding Michigan Teachers is a
        <span className="whitespace-nowrap">501(c)(3)</span>, EIN 93-4485967; sponsorships are tax-deductible to the extent the law allows.
      </p>

      {/* Custom Package CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-chalkboard rounded-[2.5rem] p-7 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-5 uppercase tracking-widest border border-pencil/20">
            <Handshake size={13} aria-hidden="true" />
            <span>Custom Packages Available</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 leading-tight">
            Need something <span className="text-pencil italic font-normal">tailored</span>?
          </h3>
          <p className="text-white/70 max-w-lg leading-relaxed font-light">
            We're happy to build a sponsorship around your goals — a specific school,
            a branded supply drive, or food for a staff meeting. Reach out and let's talk.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <button
            onClick={onContact}
            className="flex items-center justify-center gap-3 bg-apple text-white px-8 py-4 rounded-2xl font-bold hover:bg-apple/90 transition-all active:scale-95 shadow-xl cursor-pointer whitespace-nowrap w-full sm:w-auto"
          >
            <Mail size={18} aria-hidden="true" />
            Get in Touch
          </button>
          <button
            onClick={() => onDonate(500)}
            className="flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10 cursor-pointer whitespace-nowrap w-full sm:w-auto"
          >
            Donate Directly
          </button>
        </div>
      </motion.div>

    </div>
  );
}
