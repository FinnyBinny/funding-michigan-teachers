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

export const EVENTS: Event[] = [
  {
    id: 1,
    title: "Easter Egg Hunt Fundraiser",
    date: '2026-04-05',
    description: "We hide pre-filled candy eggs in your yard for Easter morning — and every order raises funds for Michigan teachers! Choose 25, 50, 75, or 100 eggs ($15–$45). Add a Golden Egg (+$5) or Easter Basket (+$25). Serving Okemos, Haslett & Mason. Text to place your order — all orders due by March 30th!",
    location: "Okemos, Haslett & Mason",
    type: 'fundraiser',
    phone: '(517) 303-1652',
    ctaLabel: 'Text to Order',
    ctaUrl: 'sms:+15173031652&body=Hi! I\'d like to place an Easter Egg Hunt order.',
    deadline: 'Orders due March 30th',
  },
  {
    id: 2,
    title: "Teacher Appreciation Event — Details Coming Soon",
    date: '2026-05-07',
    description: "We're planning our next teacher appreciation event during Teacher Appreciation Week. Stay tuned for details — register your interest below and we'll keep you updated!",
    location: "Okemos, Michigan",
    type: 'appreciation',
  },
];

export const DONORS: Donor[] = [
  { id: 1, name: 'Finn Regan', amount: 250, tier: 'Hall of Fame', message: 'Because someone has to say thank you first.', pos_x: 0, pos_y: 0 },
  { id: 2, name: 'Walmart Okemos', amount: 250, tier: 'Hall of Fame', message: 'Proud to support the Okemos community.', pos_x: 0, pos_y: 0 },
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
    id: 2,
    teacher_name: 'Submit a Project',
    school_name: 'Your Classroom',
    title: 'Is Your Classroom Next?',
    description: 'Michigan teachers: if you have a specific need — supplies, equipment, materials — we want to hear from you. Tell us what your students need and we\'ll work to make it happen. No application is too small.',
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
    impact: 'Monthly staff meeting food from local businesses, classroom supply grants, door decorating competitions with $500+ in prizes, and year-round teacher appreciation events — all student-run, 100% community-funded.',
    amount: '$4,000+',
    lat: 42.7244,
    lng: -84.4333,
    demographics: { students: '1,800', lowIncome: '18%', diversity: '34%' },
    projects: ['Monthly Staff Meeting Food', 'Classroom Supply Grants', 'Door Decorating Competition', 'Teacher Appreciation Events'],
  },
];

export const PAST_EVENTS: PastEvent[] = [
  {
    id: 1,
    month: 'September 2025',
    title: 'Back-to-School Appreciation',
    description: 'Kicked off the school year by delivering cookies and free meal coupons to every staff member at Okemos High School — a sweet welcome back from the community.',
    type: 'appreciation',
    partner: 'Chick-Fil-A Okemos',
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
    partner: 'Tailgaters / Dunkin\' Okemos',
  },
  {
    id: 4,
    month: 'January 2026',
    title: 'Sweet Start to the New Year',
    description: 'Brought in mini bundt cakes for teachers returning from winter break — a small but meaningful gesture to remind them how valued they are heading into semester two.',
    type: 'appreciation',
    partner: 'Nothing Bundt Cakes',
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
    title: 'Pizza Party for the Whole School',
    description: 'Donated a full pizza lunch for the entire Okemos High School staff — because great teachers deserve more than a thank you. Hot slices, real gratitude.',
    type: 'appreciation',
    partner: 'Hungry Howie\'s Okemos',
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
