// Static initial data for Funding Michigan Teachers
// To update this content, edit these values and redeploy.

export interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
  phone?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  deadline?: string;
}

export interface Donor {
  id: number;
  name: string;
  amount: number;
  tier: string;
  message: string;
  pos_x: number;
  pos_y: number;
}

export interface Project {
  id: number;
  teacher_name: string;
  school_name: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  votes: number;
}

export interface Story {
  id?: number;
  name: string;
  bio: string;
  impact: string;
  school: string;
  location: string;
  image: string;
}

export interface PastEvent {
  id: number;
  month: string;
  title: string;
  description: string;
  type: 'appreciation' | 'competition' | 'community';
  partner?: string;
}

export interface Location {
  id: string;
  name: string;
  district: string;
  impact: string;
  amount: string;
  lat: number;
  lng: number;
  demographics: {
    students: string;
    lowIncome: string;
    diversity: string;
  };
  projects: string[];
}

export interface Sponsor {
  id?: number;
  name: string;
  tier: string;
  website?: string;
  logo?: string;
  description?: string;
  amount?: number;
  active?: boolean;
}

export interface FoodPartner {
  id?: number;
  month: string;
  business: string;
  detail: string;
  image?: string;
  avif?: string;
  display_order?: number;
}

export interface TeacherOfTheMonth {
  id?: number;
  month: string;
  teacher_name: string;
  school: string;
  why: string;
  image?: string;
  subject?: string;
  display_order?: number;
}

export const EVENTS: Event[] = [
  {
    id: 3,
    title: 'FMT Coffee Bar at OHS Kickstart',
    date: '2026-08-19',
    description: "We're bringing the FMT Coffee Bar to Okemos High School's Kickstart — fresh coffee, decaf, and hot chocolate for staff as they gear up for the new school year, with our friends at Biggby Coffee. 9am–2pm, or while supplies last.",
    location: 'Okemos High School',
    type: 'appreciation',
  },
];

// Walmart Okemos lives in SPONSORS (Corporate Sponsors), not here — it's a
// business sponsor, not an individual/community supporter.
export const DONORS: Donor[] = [
  { id: 1, name: 'Finn Regan', amount: 250, tier: 'Hall of Fame', message: 'Because someone has to say thank you first.', pos_x: 0, pos_y: 0 },
  { id: 3, name: 'Anonymous', amount: 100, tier: 'Honor Roll', message: 'For every teacher who gave more than asked.', pos_x: 0, pos_y: 0 },
  { id: 4, name: 'Anonymous', amount: 50, tier: 'Bell Ringer', message: '', pos_x: 0, pos_y: 0 },
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    teacher_name: 'Danielle Tandoc',
    school_name: 'Okemos High School',
    title: 'New Dissection Lab Tools',
    description: 'Our dissection tools are over 10 years old — scalpels dull, equipment worn. Help fund a complete set of modern dissection tools so every biology and anatomy student can learn safely and effectively. These students deserve equipment that matches their ambition.',
    goal: 1000,
    raised: 0,
    votes: 0,
  },
  {
    id: 3,
    teacher_name: 'Christina Abbott',
    school_name: 'Okemos High School',
    title: 'Greenhouse & Life Science Lab Restock',
    description: "Miss Abbott's greenhouse and life science labs need real equipment: a 600 lb. poly utility dump cart to replace broken seed carts, two 6-tier commercial wire shelving units for greenhouse storage, and three bags of Pro-Mix HP Biofungicide with Mycorrhizae to keep student-grown plants healthy. Every item goes straight into her hands-on, research-driven classroom.",
    goal: 500,
    raised: 0,
    votes: 0,
  },
  {
    id: 2,
    teacher_name: 'Submit a Project',
    school_name: 'Your Classroom',
    title: 'Is Your Classroom Next?',
    description: 'Michigan teachers: if you have a specific need — classroom decorations, supplies, equipment, or materials — we want to hear from you. Tell us what your classroom needs to better support your students and we\'ll work to make it happen.',
    goal: 500,
    raised: 0,
    votes: 0,
  },
];

export const STORIES: Story[] = [
  {
    id: 1,
    name: 'Mrs. Freeman',
    bio: 'Health & PE teacher at Okemos High School — and one of the most genuinely supportive people you will ever meet. Since Finn\'s freshman year, she has been his loudest cheerleader, showing up at his lows and spreading positivity through every hallway.',
    impact: 'Funding Michigan Teachers has had a direct positive impact on teacher morale throughout the district. Whether it be handing out school supplies, supplying food at staff meetings or encouraging students to write letters to teachers for Valentine\'s Day, they have never fallen short of making sure we are supported.',
    school: 'Okemos High School',
    location: 'Okemos, MI',
    image: '/images/mrs-freeman-opt.jpg',
  },
  {
    id: 2,
    name: 'Mrs. Shelby Fletcher',
    bio: 'High School English teacher whose energy for her students is impossible to ignore. She shows up — every day, for every student — with more enthusiasm than the school budget could ever account for.',
    impact: 'Treats at staff meetings, thoughtful decorations near the teachers\' lounge, classroom supplies, and support on professional development days — every gesture has made a real difference in how valued our teachers feel.',
    school: 'Okemos High School',
    location: 'Okemos, MI',
    image: '',
  },
  {
    id: 3,
    name: 'Danielle Tandoc',
    bio: '10th grade Biology and 12th grade Anatomy teacher at Okemos High School. A decade in the classroom and still just as passionate about science as day one — the kind of teacher students remember for life.',
    impact: 'This past year we have had numerous times when food was provided or goodies or materials we could use in our classroom. This raises spirits and truly allows teachers to feel valued.',
    school: 'Okemos High School',
    location: 'Okemos, MI',
    image: '',
  },
];

export const LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Okemos High School',
    district: 'Okemos Public Schools',
    impact: 'Our home base: food at every staff meeting during the 2025–26 school year, classroom supply grants, door decorating competitions with $500+ in prizes, Teacher of the Month, the Post Office of Love letter campaign, and year-round appreciation events — all student-run, 100% community-funded.',
    amount: '$15K+ org-wide',
    lat: 42.7244,
    lng: -84.4333,
    demographics: { students: '1,800', lowIncome: '18%', diversity: '34%' },
    projects: ['Staff Meeting Food (Every Meeting)', 'Classroom Supply Grants', 'Door Decorating Competition', 'Teacher of the Month', 'Post Office of Love', 'Coffee Bar'],
  },
  {
    id: '2',
    name: 'Kinawa Middle School',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.7180, lng: -84.4180,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '3',
    name: 'Chippewa Middle School',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.7080, lng: -84.4430,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '4',
    name: 'Cornell Elementary',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.7320, lng: -84.4260,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '5',
    name: 'Bennett Woods Elementary',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.6990, lng: -84.4640,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '6',
    name: 'Hiawatha Elementary',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.7150, lng: -84.4520,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '7',
    name: 'Central Montessori',
    district: 'Okemos Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A "Be our guest" meal cards delivered to every staff member.',
    amount: 'Appreciation Week',
    lat: 42.7230, lng: -84.4450,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '8',
    name: 'Haslett High School',
    district: 'Haslett Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~130 staff members.',
    amount: '~130 educators',
    lat: 42.7530, lng: -84.4010,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
  {
    id: '9',
    name: 'East Lansing High School',
    district: 'East Lansing Public Schools',
    impact: 'Teacher Appreciation Week — Chick-fil-A free entrée cards for ~170 staff members.',
    amount: '~170 educators',
    lat: 42.7480, lng: -84.4840,
    demographics: { students: '', lowIncome: '', diversity: '' },
    projects: ['Teacher Appreciation Week Meal Cards'],
  },
];

// Walmart Okemos is the only cash sponsor to date. Every other business
// below is an in-kind partner (donated goods/services, not a cash gift) —
// they belong on the In-Kind Partners wall, not here.
export const SPONSORS: Sponsor[] = [
  { id: 1, name: 'Walmart (5110 Times Square Pl. Okemos, MI)', tier: 'Principal\'s Circle', amount: 250, description: 'Proud to support the Okemos community.', active: true },
];

// Every business carries its full street address so the right store/location
// gets the public thank-you. Format: Name (#### Street. City, MI).
export const FOOD_PARTNERS: FoodPartner[] = [
  { id: 1, month: 'September', business: 'Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)', detail: 'Cookies + free meal coupons for every staff member', image: '/images/IMG_3714(CFA)-opt.jpg', avif: '/images/IMG_3714(CFA).avif', display_order: 1 },
  { id: 2, month: 'October', business: "Tailgaters / Dunkin' (3450 Okemos Rd. Okemos, MI)", detail: 'Fresh donuts for the whole staff — one of many donut runs they\'ve donated for FMT events throughout the year', image: '/images/IMG_4369(DNK)-opt.jpg', avif: '/images/IMG_4369(DNK).avif', display_order: 2 },
  { id: 3, month: 'January', business: 'Nothing Bundt Cakes (2090 W Grand River Ave. Okemos, MI)', detail: 'Mini Bundt Cakes — the perfect January pick-me-up', image: '/images/IMG_5678(NBC)-opt.jpg', avif: '/images/IMG_5678(NBC).avif', display_order: 3 },
  { id: 4, month: 'March', business: "Hungry Howie's (2160 W Grand River Ave. Okemos, MI)", detail: 'Pizza for the whole staff, donated by FMT founder Finn Regan', image: '/images/IMG_6308(FR)-opt.jpg', avif: '/images/IMG_6308(FR).avif', display_order: 4 },
  { id: 5, month: 'May', business: 'Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)', detail: 'Teacher Appreciation Week — 1,000 "Be our guest" meal cards ($3,000+ value) for educators across 9 schools', image: '/images/may-chick-fil-a-cards.jpg', display_order: 5 },
  { id: 6, month: 'May', business: "Dunkin' (3450 Okemos Rd. Okemos, MI)", detail: 'Teacher Appreciation Week — coffee + donuts at the OHS staff meeting where we announced Teacher of the Month winners', image: '/images/may-staff-meeting.jpg', display_order: 6 },
  { id: 7, month: '2025–27', business: 'Biggby Coffee (3520 Okemos Rd. Okemos, MI)', detail: 'Donated coffee, decaf, and hot chocolate for both FMT Coffee Bar events this year — and again for the 2026–27 Kickstart', image: '/images/coffee-bar-biggby-opt.jpg', display_order: 7 },
  { id: 9, month: 'May', business: 'Playmakers (2299 W Grand River Ave. Okemos, MI)', detail: 'Teacher Appreciation Week — donated two $25 Playmakers gift cards for staff appreciation', display_order: 9 },
  { id: 10, month: 'May', business: 'Cottage Inn Pizza (1743 W Grand River Ave. Okemos, MI)', detail: 'Teacher Appreciation Week — donated five $20 gift cards for staff appreciation', display_order: 10 },
  { id: 11, month: 'May', business: "Culver's (3440 Okemos Rd. Okemos, MI)", detail: 'Teacher Appreciation Week — donated 75 free scoop tokens for staff', display_order: 11 },
];

export const TEACHERS_OF_THE_MONTH: TeacherOfTheMonth[] = [
  {
    id: 1,
    month: 'May 2026',
    teacher_name: 'Mrs. Turner',
    school: 'Okemos High School',
    subject: 'Educator',
    why: 'Students describe Mrs. Turner as a consistently positive and caring presence in the classroom. She goes out of her way to ensure every student understands the material — explaining things clearly and patiently — while also checking in on students personally to make sure they feel seen, included, and welcome. Her calm classroom environment and understanding nature, whether it comes to absences, late work, or just day-to-day support, make her someone students genuinely appreciate having in their corner.',
    image: '',
    display_order: 1,
  },
  {
    id: 2,
    month: 'May 2026',
    teacher_name: 'Miss Abbott',
    school: 'Okemos High School',
    subject: 'Science',
    why: "Students love Miss Abbott for making learning fun, engaging, and meaningful. She brings personal experiences into her lessons, runs exciting labs, and creates a welcoming classroom environment through thoughtful touches like rotating seating pods that help students connect with one another. What stands out most is her intentionality — she backs everything she does with evidence, from mindset activities to mental health practices, showing students she truly cares about their growth inside and outside of academics.",
    image: '',
    display_order: 2,
  },
  {
    id: 3,
    month: 'May 2026',
    teacher_name: 'Miss Richter',
    school: 'Okemos High School',
    subject: 'Chemistry',
    why: "Students say Miss Richter has a gift for making chemistry approachable and enjoyable, using real-life examples and patient, clear explanations that help even those who don't love science find the subject fun. She creates a safe, welcoming classroom where students feel free to express themselves, and her carefully crafted lessons leave a lasting impression — with more than one student saying she's changed the way they think about the subject entirely.",
    image: '',
    display_order: 3,
  },
];

export const PAST_EVENTS: PastEvent[] = [
  {
    id: 1,
    month: 'September 2025',
    title: 'Back-to-School Appreciation',
    description: 'Kicked off the school year by serving cookies and free meal coupons to every staff member at the first staff meeting of the year — a sweet welcome back from the community.',
    type: 'appreciation',
    partner: 'Chick-Fil-A (2075 W Grand River Ave. Okemos, MI)',
  },
  {
    id: 2,
    month: 'December 2025',
    title: 'Door Decorating Competition',
    description: 'Students and staff decorated classroom doors in a school-wide competition, with $500+ in prizes awarded to the most creative entries. Big smiles, big creativity.',
    type: 'competition',
  },
  {
    id: 3,
    month: 'October 2025',
    title: 'Fresh Donuts for the Whole Staff',
    description: 'Surprised the entire Okemos High School staff with fresh donuts at their staff meeting — because every teacher deserves a great end to their day.',
    type: 'appreciation',
    partner: "Tailgaters / Dunkin' (3450 Okemos Rd. Okemos, MI)",
  },
  {
    id: 4,
    month: 'January 2026',
    title: 'Sweet Start to the New Year',
    description: 'Brought in mini bundt cakes at the first staff meeting after winter break — a small but meaningful gesture to remind teachers how valued they are heading into semester two.',
    type: 'appreciation',
    partner: 'Nothing Bundt Cakes (2090 W Grand River Ave. Okemos, MI)',
  },
  {
    id: 5,
    month: 'February 2026',
    title: 'Valentine\'s Day Letters',
    description: 'Organized a student-written Valentine\'s Day letter campaign — every teacher at Okemos High School received a heartfelt, handwritten note from a student who appreciates them.',
    type: 'community',
  },
  {
    id: 6,
    month: 'March 2026',
    title: 'Pizza Party for the Staff',
    description: 'Brought in a full pizza spread for the teachers at the staff meeting — because great teachers deserve more than a thank you. Hot slices, real gratitude.',
    type: 'appreciation',
    partner: "Hungry Howie's (2160 W Grand River Ave. Okemos, MI)",
  },
  {
    id: 7,
    month: 'April 2026',
    title: 'FMT Coffee Bar — First Event',
    description: 'Our first FMT Coffee Bar of the year, staffed by our student team and fueled by Biggby Coffee — coffee, decaf, and hot chocolate to get staff through the final stretch of the school year.',
    type: 'appreciation',
    partner: 'Biggby Coffee (3520 Okemos Rd. Okemos, MI)',
  },
  {
    id: 8,
    month: 'May 2026',
    title: 'Teacher Appreciation Week — District-Wide',
    description: 'Our biggest week ever: 1,000 Chick-fil-A "Be our guest" meal cards ($3,000+ value) delivered to 1,000+ educators across 9 schools — every Okemos building plus Haslett and East Lansing High School — plus gift cards from Playmakers (two $25) and Cottage Inn (five $20), 75 free scoop tokens from Culver\'s, and Dunkin\' coffee and donuts at the OHS staff meeting where our first Teachers of the Month were announced.',
    type: 'appreciation',
    partner: "Chick-fil-A, Dunkin', Playmakers, Cottage Inn & Culver's",
  },
  {
    id: 9,
    month: 'June 2026',
    title: 'FMT Coffee Bar — End of Year',
    description: 'Closed out the school year with a second Coffee Bar, sending staff into summer with coffee, decaf, and hot chocolate from Biggby — a small thank-you for a full year of showing up.',
    type: 'appreciation',
    partner: 'Biggby Coffee (3520 Okemos Rd. Okemos, MI)',
  },
];

export const FAQ_DATA = [
  {
    question: 'How do I donate?',
    answer: 'Click "Donate Now" at the top of the page, or scroll down and choose your impact level. All donations are processed securely through Zeffy — a free platform for nonprofits, meaning zero processing fees come out of your gift.',
  },
  {
    question: 'Are donations tax-deductible?',
    answer: 'Yes! Funding Michigan Teachers is a registered 501(c)(3) nonprofit organization (EIN: 93-4485967). All donations are fully tax-deductible to the extent allowed by law.',
  },
  {
    question: 'How do teachers apply for funding?',
    answer: 'Teachers can submit a classroom project through our Classroom Projects section or reach out to us directly at hello@fundingmichiganteachers.org. We review applications on a rolling basis.',
  },
  {
    question: 'How is the money used?',
    answer: '100% of donations go directly to teachers and classroom resources — supplies, food for staff meetings, appreciation events, and materials. We are a student-run organization with zero paid staff, which means your dollar goes exactly where it should.',
  },
  {
    question: 'Who runs Funding Michigan Teachers?',
    answer: 'We are a student-led nonprofit founded and operated by high school students from Okemos, Michigan. We believe young people can make a real difference in their communities.',
  },
  {
    question: 'How can I volunteer or get involved?',
    answer: 'We\'d love your help! You can volunteer at events, help spread the word, or even join our student leadership team. Send us a message through the Contact form below.',
  },
];
