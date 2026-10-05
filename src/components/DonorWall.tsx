import { motion } from 'motion/react';
import { Award, Star, Heart, Building2, ArrowRight } from 'lucide-react';
import { cn, splitBusinessName } from '../lib/utils';
import { useDonors, useSponsors, useFoodPartners } from '../hooks/useLocalData';


export default function DonorWall() {
  const donors = useDonors();
  const sponsors = useSponsors().filter((s) => s.active !== false);
  const foodPartners = useFoodPartners();

  return (
    <div className="space-y-20">

      {/* Cash Supporters */}
      <div>
        <p className="text-center text-[0.625rem] uppercase tracking-[0.25em] font-bold text-white/70 mb-10">
          Individual &amp; Community Supporters
        </p>
        <div className="rail-sm rail-auto md:flex md:flex-wrap md:justify-center gap-4 md:gap-5" role="region" tabIndex={0} aria-label="Individual and community supporters">
          {donors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className={cn(
                "p-6 rounded-2xl border flex flex-col items-center text-center max-w-[190px] transition-shadow hover:shadow-md",
                donor.tier === 'Textbook Tycoon' || donor.tier === 'Hall of Fame'
                  ? "bg-apple/15 border-apple/30"
                  : donor.tier === 'Ruler Rockstar' || donor.tier === 'Honor Roll'
                  ? "bg-ruler/15 border-ruler/30"
                  : "bg-white/10 border-white/15"
              )}
            >
              <div className={cn(
                "w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center",
                donor.tier === 'Textbook Tycoon' ? "bg-apple text-white" :
                donor.tier === 'Ruler Rockstar' ? "bg-ruler text-white" : "bg-pencil/30 text-chalkboard"
              )}>
                {donor.tier === 'Textbook Tycoon'
                  ? <Award size={18} />
                  : donor.tier === 'Ruler Rockstar'
                  ? <Star size={18} />
                  : <Heart size={18} />}
              </div>
              <p className="font-bold text-sm leading-tight text-white">{donor.name}</p>
              <p className="text-[0.625rem] uppercase tracking-widest font-bold text-white/70 mt-1">{donor.tier}</p>
              {donor.message && (
                <p className="text-[0.6875rem] italic mt-3 text-white/70 leading-snug">"{donor.message}"</p>
              )}
            </motion.div>
          ))}

          {/* Open "your name here" slot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: donors.length * 0.07 }}
            className="p-6 rounded-2xl border border-dashed border-white/20 flex flex-col items-center text-center max-w-[190px] bg-transparent"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-dashed border-white/25 flex items-center justify-center text-white/70">
              <span className="text-xl font-bold">+</span>
            </div>
            <p className="text-sm font-bold text-white/70">Your name here</p>
            <p className="text-[0.625rem] text-white/70 mt-1">Donate today</p>
          </motion.div>
        </div>
      </div>

      {/* Corporate Sponsors — distinct from individuals and in-kind partners */}
      <div>
        <p className="text-center text-[0.625rem] uppercase tracking-[0.25em] font-bold text-white/70 mb-3">
          Corporate Sponsors
        </p>
        <p className="text-center text-sm text-white/70 mb-10 font-light max-w-lg mx-auto">
          Businesses that put real dollars behind Michigan teachers — publicly, proudly, year after year.
        </p>
        <div className="rail-sm rail-auto md:flex md:flex-wrap md:justify-center gap-4 md:gap-5" role="region" tabIndex={0} aria-label="Corporate sponsors">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id ?? sponsor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white/[0.06] ring-1 ring-white/12 rounded-2xl px-7 py-6 flex flex-col items-center text-center max-w-[220px] hover:ring-pencil/40 transition-all"
            >
              <div className="w-11 h-11 mb-4 rounded-xl bg-pencil/20 ring-1 ring-pencil/30 flex items-center justify-center text-pencil">
                <Building2 size={18} strokeWidth={1.5} />
              </div>
              <p className="font-serif font-bold text-base leading-tight text-white">{splitBusinessName(sponsor.name).name}</p>
              <p className="text-[0.625rem] uppercase tracking-[0.22em] font-bold text-pencil/80 mt-1.5">{sponsor.tier}</p>
              {sponsor.description && (
                <p className="text-[0.6875rem] italic mt-3 text-white/70 leading-snug font-light">"{sponsor.description}"</p>
              )}
            </motion.div>
          ))}

          {/* Open slot — recruit the next sponsor */}
          <motion.a
            href="/sponsors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: sponsors.length * 0.08 }}
            className="group border border-dashed border-white/20 rounded-2xl px-7 py-6 flex flex-col items-center justify-center text-center max-w-[220px] hover:border-pencil/50 transition-colors"
          >
            <div className="w-11 h-11 mb-4 rounded-xl border-2 border-dashed border-white/25 flex items-center justify-center text-white/70 group-hover:text-pencil group-hover:border-pencil/40 transition-colors">
              <ArrowRight size={16} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Your business here</p>
            <p className="text-[0.625rem] text-white/70 mt-1">Become a sponsor</p>
          </motion.a>
        </div>
      </div>

      {/* In-kind partners: their names here, their photos on /sponsors.
          This was three tall photo cards, the same three photos that also
          appear on /sponsors and used to appear on /for-schools. */}
      <div className="text-center">
        <p className="text-[0.625rem] uppercase tracking-[0.25em] font-bold text-white/70 mb-3">
          In-Kind Community Partners
        </p>
        <p className="text-sm text-white/75 mb-6 font-light max-w-lg mx-auto">
          Local businesses donate the food and gift cards for the staff meetings and appreciation weeks we run.
        </p>
        <ul className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-6" aria-label="In-kind partners">
          {[...new Set(foodPartners.map((p) => splitBusinessName(p.business).name))].map((name) => (
            <li key={name} className="px-3.5 py-1.5 rounded-full bg-white/[0.07] ring-1 ring-white/15 text-sm text-white/90">
              {name}
            </li>
          ))}
        </ul>
        <a
          href="/sponsors"
          onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/sponsors'); window.dispatchEvent(new PopStateEvent('popstate')); }}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-pencil underline underline-offset-4 decoration-pencil/40 hover:decoration-pencil"
        >
          See what each one gave <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>

    </div>
  );
}
