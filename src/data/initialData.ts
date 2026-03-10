// Static initial data for Funding Michigan Teachers
// To update this content, edit these values and redeploy.

export interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
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
    title: 'Spring Fundraiser Gala',
    date: '2026-04-18',
    description: 'Join us for our annual Spring Fundraiser Gala — an evening of community, celebration, and making a real difference for Michigan teachers. Dinner, live music, and a silent auction.',
    location: 'Okemos Conference Center, Okemos, MI',
    type: 'fundraiser',
  },
  {
    id: 2,
    title: 'Teacher Appreciation Week Kickoff',
    date: '2026-05-04',
    description: "Celebrate Michigan's incredible educators with us during National Teacher Appreciation Week. Free classroom supply kits, recognition awards, and community thanks.",
    location: 'Okemos High School, Okemos, MI',
    type: 'appreciation',
  },
  {
    id: 3,
    title: 'Community Classroom Showcase',
    date: '2026-06-07',
    description: 'Teachers share the projects your donations have funded. See the impact firsthand — from science labs to reading corners — and connect with the educators you support.',
    location: 'East Lansing Public Library, East Lansing, MI',
    type: 'showcase',
  },
  {
    id: 4,
    title: 'Back to School Supply Drive',
    date: '2026-08-15',
    description: 'Help us fill hundreds of classrooms before the new school year begins. Drop off supplies or donate online. Every pencil, notebook, and calculator makes a difference.',
    location: 'Multiple drop-off locations across Michigan',
    type: 'fundraiser',
  },
  {
    id: 5,
    title: 'Grant Application Workshop',
    date: '2026-09-10',
    description: 'A free workshop for Michigan teachers to learn how to apply for classroom funding grants. Walk away with a complete application and expert guidance.',
    location: 'Virtual (Zoom) — Register on our website',
    type: 'workshop',
  },
];

export const DONORS: Donor[] = [
  { id: 1, name: 'Sarah & Tom Williams', amount: 250, tier: 'Textbook Tycoon', message: 'Education is the greatest investment.', pos_x: 0, pos_y: 0 },
  { id: 2, name: 'Okemos Rotary Club', amount: 500, tier: 'Textbook Tycoon', message: 'Proud to support our local teachers!', pos_x: 0, pos_y: 0 },
  { id: 3, name: 'Jennifer K.', amount: 50, tier: 'Ruler Rockstar', message: 'For every teacher who stayed late to help.', pos_x: 0, pos_y: 0 },
  { id: 4, name: 'Marcus Thompson', amount: 50, tier: 'Ruler Rockstar', message: 'My 6th grade teacher changed my life.', pos_x: 0, pos_y: 0 },
  { id: 5, name: 'The Patel Family', amount: 10, tier: 'Pencil Pal', message: 'Happy to give back!', pos_x: 0, pos_y: 0 },
  { id: 6, name: 'Lansing Business Journal', amount: 250, tier: 'Textbook Tycoon', message: 'Supporting Michigan education leaders.', pos_x: 0, pos_y: 0 },
  { id: 7, name: 'Anonymous', amount: 10, tier: 'Pencil Pal', message: '', pos_x: 0, pos_y: 0 },
  { id: 8, name: 'Coach Rivera', amount: 50, tier: 'Ruler Rockstar', message: 'Teachers are the real MVPs.', pos_x: 0, pos_y: 0 },
  { id: 9, name: 'Mid-Michigan Credit Union', amount: 500, tier: 'Textbook Tycoon', message: 'Investing in the next generation.', pos_x: 0, pos_y: 0 },
  { id: 10, name: 'Emma & Jake Foster', amount: 10, tier: 'Pencil Pal', message: 'Thank you to all the teachers!', pos_x: 0, pos_y: 0 },
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    teacher_name: 'Ms. Rachel Torres',
    school_name: 'Okemos High School',
    title: 'STEM Lab Expansion',
    description: 'Fund new microscopes, lab kits, and hands-on materials so every student can experience real scientific discovery. Our current equipment is over 12 years old.',
    goal: 1500,
    raised: 820,
    votes: 143,
  },
  {
    id: 2,
    teacher_name: 'Mr. David Kim',
    school_name: 'East Lansing Middle School',
    title: 'Classroom Library Reboot',
    description: 'Our classroom library hasn\'t been updated in 6 years. Help us add 200 new books that reflect our students\' diverse backgrounds and ignite a love of reading.',
    goal: 800,
    raised: 530,
    votes: 98,
  },
  {
    id: 3,
    teacher_name: 'Mrs. Amara Johnson',
    school_name: 'Waverly Elementary',
    title: 'Sensory Corner for Special Ed',
    description: 'Create a calming sensory space for students with autism and sensory processing differences — with weighted blankets, fidget tools, and soft lighting.',
    goal: 1200,
    raised: 390,
    votes: 211,
  },
  {
    id: 4,
    teacher_name: 'Mr. Carlos Mendez',
    school_name: 'Lansing Arts & Science Academy',
    title: 'Digital Art & Music Studio',
    description: 'Bring creativity to our students with tablets, digital drawing pens, and music production software. Arts education is just as critical as any core subject.',
    goal: 2000,
    raised: 650,
    votes: 75,
  },
];

export const STORIES: Story[] = [
  {
    id: 1,
    name: 'Ms. Rachel Torres',
    bio: 'I\'ve been teaching chemistry at Okemos High for 11 years. My students come in curious and leave with a passion for science — but only when they have the tools to explore.',
    impact: 'The new STEM lab equipment transformed our classes. For the first time, every student got to run their own experiment. Three of my students just entered the state science fair.',
    school: 'Okemos High School',
    location: 'Okemos, MI',
    image: 'https://picsum.photos/seed/teacher-rachel/800/800',
  },
  {
    id: 2,
    name: 'Mr. David Kim',
    bio: 'Growing up, books were my escape and my greatest teacher. I became an English teacher because I wanted every kid to find that same magic between the pages.',
    impact: 'Our new classroom library has 200 fresh titles. Students who said they hated reading are now finishing books and asking for more. Reading scores are up 18% this semester.',
    school: 'East Lansing Middle School',
    location: 'East Lansing, MI',
    image: 'https://picsum.photos/seed/teacher-david/800/800',
  },
  {
    id: 3,
    name: 'Mrs. Amara Johnson',
    bio: 'Every child deserves a space where they feel safe, seen, and ready to learn. My special education students need tools that most school budgets simply can\'t provide.',
    impact: 'Our sensory corner has reduced classroom disruptions by 40%. One of my students, who struggled to complete a single task, now finishes full assignments with confidence.',
    school: 'Waverly Elementary',
    location: 'Lansing, MI',
    image: 'https://picsum.photos/seed/teacher-amara/800/800',
  },
];

export const LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Okemos High School',
    district: 'Okemos Public Schools',
    impact: 'Expanded STEM lab access for 400+ students, enabling hands-on science experiments for the first time.',
    amount: '$1,200',
    lat: 42.7244,
    lng: -84.4333,
    demographics: { students: '1,800', lowIncome: '18%', diversity: '34%' },
    projects: ['STEM Lab', 'AP Support Materials', 'Robotics Club'],
  },
  {
    id: '2',
    name: 'Waverly Elementary',
    district: 'Waverly Community Schools',
    impact: 'Created a sensory learning environment for special education students, improving engagement and outcomes.',
    amount: '$950',
    lat: 42.7367,
    lng: -84.5814,
    demographics: { students: '520', lowIncome: '42%', diversity: '51%' },
    projects: ['Sensory Corner', 'Adaptive Learning Tools', 'Art Supplies'],
  },
  {
    id: '3',
    name: 'East Lansing Middle School',
    district: 'East Lansing Public Schools',
    impact: 'Rebuilt the classroom library with 200 diverse titles, boosting reading engagement across all grade levels.',
    amount: '$800',
    lat: 42.7362,
    lng: -84.4839,
    demographics: { students: '720', lowIncome: '23%', diversity: '41%' },
    projects: ['Classroom Library', 'Reading Program', 'Writing Journals'],
  },
  {
    id: '4',
    name: 'Grand Rapids West Middle School',
    district: 'Grand Rapids Public Schools',
    impact: 'Funded a full classroom technology refresh with Chromebooks and projectors for 35 students.',
    amount: '$1,800',
    lat: 42.9634,
    lng: -85.6681,
    demographics: { students: '640', lowIncome: '67%', diversity: '78%' },
    projects: ['Chromebooks', 'Projector System', 'Digital Literacy Program'],
  },
  {
    id: '5',
    name: 'Flint Preparatory Academy',
    district: 'Flint Community Schools',
    impact: 'Provided science kits and lab materials for a school that had zero lab equipment for over three years.',
    amount: '$1,400',
    lat: 43.0125,
    lng: -83.6875,
    demographics: { students: '410', lowIncome: '81%', diversity: '89%' },
    projects: ['Science Lab Kits', 'Safety Equipment', 'STEM Mentorship'],
  },
  {
    id: '6',
    name: 'Ann Arbor Open Elementary',
    district: 'Ann Arbor Public Schools',
    impact: 'Launched a student-led garden and outdoor learning program connecting science to real-world sustainability.',
    amount: '$750',
    lat: 42.2808,
    lng: -83.743,
    demographics: { students: '390', lowIncome: '29%', diversity: '44%' },
    projects: ['Garden Program', 'Outdoor Classroom', 'Environmental Science'],
  },
];

export const FAQ_DATA = [
  {
    question: 'How do I donate?',
    answer: 'Click "Donate Now" at the top of the page or scroll to the "Choose Your Impact" section. You can give monthly at $10, $50, or $250 — or make a one-time gift through our GiveButter page.',
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
    answer: 'Over 90% of all donations go directly to classroom resources — supplies, technology, books, and materials. A small portion covers operational costs like web hosting and event planning.',
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
