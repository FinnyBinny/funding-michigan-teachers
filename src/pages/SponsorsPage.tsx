import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import CorporateSponsors from '../components/CorporateSponsors';
import DonationModal from '../components/DonationModal';

const FOOD_PARTNERS = [
  {
    month: 'September',
    business: 'Chick-Fil-A Okemos',
    detail: 'Cookies + free meal coupons for every staff member',
    avif: '/images/IMG_3714(CFA).avif',
    image: '/images/IMG_3714(CFA)-opt.jpg',
  },
  {
    month: 'October',
    business: "Tailgaters / Dunkin', Okemos",
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

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function SponsorsPage() {
  const [showDonation, setShowDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | undefined>(undefined);

  const handleDonate = (amount?: number) => {
    setDonationAmount(amount);
    setShowDonation(true);
  };

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-chalkboard/5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo + back */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-chalkboard/50 hover:text-chalkboard transition-colors text-sm font-bold uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div className="w-px h-6 bg-chalkboard/10" />

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform shrink-0">
                <img src="/images/fmt-logo-lc.png" alt="Funding Michigan Teachers" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight hidden sm:block">Funding Michigan Teachers</span>
            </button>
          </div>

          {/* Donate button only */}
          <button
            onClick={() => handleDonate()}
            className="bg-chalkboard text-white px-6 py-2.5 rounded-full hover:bg-apple transition-all hover:scale-105 active:scale-95 shadow-lg font-bold text-sm cursor-pointer"
          >
            Donate Now
          </button>
        </div>
      </header>

      <main>

        {/* Page Hero */}
        <section className="py-16 sm:py-24 px-6 classroom-grid relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-ruler/10 text-ruler px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 uppercase tracking-widest border border-ruler/20">
                <Building2 size={13} />
                <span>Corporate Partnerships</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[0.95] mb-6 text-balance">
                Partner with<br />
                <span className="text-apple italic font-normal">FMT</span>.
              </h1>
              <p className="text-lg text-chalkboard/60 max-w-2xl mx-auto leading-relaxed font-light mb-10">
                Corporate sponsors are the backbone of what we do. Put your business behind Michigan's most dedicated educators — and earn real, visible recognition for it.
              </p>
              <p className="text-[11px] text-chalkboard/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
                501(c)(3) Nonprofit · EIN 93-4485967 · 100% to teachers
                <span className="inline-block w-4 h-px bg-chalkboard/20" />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sponsor Tiers */}
        <section className="py-12 sm:py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <CorporateSponsors
              onDonate={handleDonate}
              onContact={() => {
                window.location.href = 'mailto:hello@fundingmichiganteachers.org?subject=Corporate%20Sponsorship%20Inquiry';
              }}
            />
          </div>
        </section>

        {/* Current In-Kind Partners */}
        <section className="py-12 sm:py-16 px-6 bg-chalkboard relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-pencil/20 text-pencil px-4 py-1.5 rounded-full text-[11px] font-bold mb-6 uppercase tracking-widest border border-pencil/30"
              >
                <Heart size={13} />
                <span>In-Kind Partners</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                Businesses Already <span className="text-pencil italic font-normal">Showing Up</span>.
              </h2>
              <p className="text-white/55 max-w-xl mx-auto font-light leading-relaxed">
                Every month during the school year, local Okemos businesses donate food for teacher staff meetings.
                This is what community support actually looks like.
              </p>
            </div>

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
                        alt={`${partner.business} — ${partner.month}`}
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

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="bg-chalkboard text-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-white/30 text-xs">
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Funding Michigan Teachers</span>
            <span className="font-mono uppercase tracking-widest text-[9px] px-3 py-1 bg-white/5 rounded-full">EIN: 93-4485967</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Back to Main Site
            </button>
            <a href="mailto:hello@fundingmichiganteachers.org" className="hover:text-white transition-colors">
              hello@fundingmichiganteachers.org
            </a>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
        amount={donationAmount}
        frequency="monthly"
      />

    </div>
  );
}
