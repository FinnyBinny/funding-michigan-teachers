import { motion } from 'motion/react';
import { Award, Star, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDonors } from '../hooks/useLocalData';

const FOOD_PARTNERS = [
  {
    month: 'September',
    business: 'Chick-Fil-A Okemos',
    detail: 'Cookies + free meal coupons for every single staff member',
    avif: '/images/IMG_3714(CFA).avif',
    image: '/images/IMG_3714(CFA)-opt.jpg',
  },
  {
    month: 'October',
    business: 'Tailgaters / Dunkin, Okemos',
    detail: 'Fresh donuts for the whole staff',
    avif: '/images/IMG_4369(DNK).avif',
    image: '/images/IMG_4369(DNK)-opt.jpg',
  },
  {
    month: 'January',
    business: 'Nothing Bundt Cakes, Okemos',
    detail: 'Mini Bundt Cakes — the perfect January pick-me-up',
    avif: '/images/IMG_5678(NBC).avif',
    image: '/images/IMG_5678(NBC)-opt.jpg',
  },
  {
    month: 'March',
    business: "Hungry Howie's, Okemos",
    detail: 'Pizza for the whole staff, donated by FMT founder Finn Regan',
    avif: '/images/IMG_6308(FR).avif',
    image: '/images/IMG_6308(FR)-opt.jpg',
  },
];

export default function DonorWall() {
  const donors = useDonors();

  return (
    <div className="space-y-20">

      {/* Cash Supporters */}
      <div>
        <p className="text-center text-[10px] uppercase tracking-[0.25em] font-bold text-white/50 mb-10">
          Individual &amp; Community Supporters
        </p>
        <div className="flex flex-wrap justify-center gap-5">
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
              <h4 className="font-bold text-sm leading-tight text-white">{donor.name}</h4>
              <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">{donor.tier}</p>
              {donor.message && (
                <p className="text-[11px] italic mt-3 text-white/70 leading-snug">"{donor.message}"</p>
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
            <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-dashed border-white/25 flex items-center justify-center text-white/30">
              <span className="text-xl font-bold">+</span>
            </div>
            <p className="text-sm font-bold text-white/40">Your name here</p>
            <p className="text-[10px] text-white/25 mt-1">Donate today</p>
          </motion.div>
        </div>
      </div>

      {/* Food Partners */}
      <div>
        <p className="text-center text-[10px] uppercase tracking-[0.25em] font-bold text-white/50 mb-3">
          In-Kind Community Partners
        </p>
        <p className="text-center text-sm text-white/50 mb-10 font-light max-w-lg mx-auto">
          Every month during the school year, local Okemos businesses donate food for OHS teacher staff meetings.
          This is what community support actually looks like.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {FOOD_PARTNERS.map((partner, index) => (
            <motion.div
              key={partner.business}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="aspect-[3/4] w-full">
                <picture>
                  <source srcSet={partner.avif} type="image/avif" />
                  <img
                    src={partner.image}
                    alt={`${partner.business} donation — ${partner.month}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-chalkboard/85 via-chalkboard/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white/50 text-[9px] uppercase tracking-[0.18em] font-bold mb-0.5">{partner.month}</p>
                <p className="text-white font-bold text-sm leading-tight">{partner.business}</p>
                <p className="text-white/65 text-[11px] mt-1 leading-snug">{partner.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
