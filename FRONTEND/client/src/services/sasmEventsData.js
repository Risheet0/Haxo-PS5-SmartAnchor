/**
 * SASM Platform - Universal Event Discovery & Management Dataset
 * Supports Single-Day and Multi-Day Events across Technology, Cultural, Sports, Business, etc.
 */

export const EVENT_CATEGORIES = [
  'ALL',
  'Technology',
  'Education',
  'Business',
  'Cultural',
  'Sports',
  'Entertainment',
  'Workshop',
  'Conference',
  'Hackathon',
  'Competition',
  'Networking',
  'Community',
  'Other'
];

export const ORGANIZER_TYPES = [
  'ALL',
  'College / University',
  'Company',
  'Organization',
  'Community',
  'Individual Organizer',
  'Other'
];

export const SUPPORTED_CITIES = [
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { id: 'gandhinagar', name: 'Gandhinagar', state: 'Gujarat' },
  { id: 'vadodara', name: 'Vadodara', state: 'Gujarat' },
  { id: 'surat', name: 'Surat', state: 'Gujarat' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' }
];

export const SASM_MOCK_EVENTS = [
  {
    id: 'sasm-ev-1',
    title: 'Ahmedabad Innovation & Technology Summit 2026',
    organizer: 'TechFest Gujarat Committee & GDG Ahmedabad',
    organizerType: 'Organization',
    institution: 'Grand Convention Center',
    location: 'SG Highway, Ahmedabad',
    city: 'Ahmedabad',
    venue: 'Grand Convention Center (Main Auditorium & Expo Hall A)',
    isMultiDay: true,
    totalDays: 3,
    date: '2026-09-20',
    endDate: '2026-09-22',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    eventType: 'Conference & Summit',
    category: 'Technology',
    description: 'Premier 3-day technology gathering in Ahmedabad bringing together engineering students, researchers, and tech leaders to explore AI architectures, robotics, cloud resilience, and agentic workflows.',
    eligibility: 'Open to Students, Developers & Tech Professionals',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-09-25',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'Robotics', 'Edge Computing', 'Keynote', '3-Day Summit'],
    contactEmail: 'contact@sasm-events.org',
    contactPhone: '+91 98765 43210',
    capacity: 1200,
    featured: true,
    daySchedules: [
      {
        day: 1,
        date: '2026-09-20',
        label: 'Day 1: Inauguration & AI Keynote Track',
        venue: 'Grand Convention Center',
        room: 'Main Auditorium & Expo Hall A',
        time: '09:00 AM - 06:00 PM',
        highlight: 'Ceremonial Address, DeepMind Keynote, and AI Innovation Workshops'
      },
      {
        day: 2,
        date: '2026-09-21',
        label: 'Day 2: Developer Sprints & Technical Tracks',
        venue: 'Tech Innovation Park Arena',
        room: 'Lab 3 & Workshop Studio',
        time: '09:30 AM - 07:00 PM',
        highlight: 'Hands-on Agentic Robotics, Cloud Scaling Masterclasses & Lightning Demos'
      },
      {
        day: 3,
        date: '2026-09-22',
        label: 'Day 3: Startup Pitches & Grand Valedictory',
        venue: 'Grand Convention Center',
        room: 'Open Air Amphitheatre',
        time: '10:00 AM - 05:30 PM',
        highlight: 'Top 10 Jury Pitching, Cash Prize Distribution & Closing Ceremony'
      }
    ]
  },
  {
    id: 'sasm-ev-2',
    title: 'Nirma MindSparks Annual College Festival',
    organizer: 'Nirma University Student Council',
    organizerType: 'College / University',
    institution: 'Nirma University',
    location: 'Sarkhej-Gandhinagar Highway, Ahmedabad',
    city: 'Ahmedabad',
    venue: 'Nirma Campus (Auditorium & Sports Complex)',
    isMultiDay: true,
    totalDays: 2,
    date: '2026-10-05',
    endDate: '2026-10-06',
    startTime: '09:30 AM',
    endTime: '08:00 PM',
    eventType: 'Cultural & Tech Festival',
    category: 'Cultural',
    description: 'Annual 2-day flagship university festival featuring music concerts, hackathons, robotics obstacle runs, literary debates, and cultural showcases.',
    eligibility: 'Undergraduate & Postgraduate Students from all streams',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-01',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Music', 'Cultural', 'Hackathon', 'Debate', '2-Day Fest'],
    contactEmail: 'mindsparks@nirmauni.ac.in',
    contactPhone: '+91 98234 11223',
    capacity: 2500,
    featured: true,
    daySchedules: [
      {
        day: 1,
        date: '2026-10-05',
        label: 'Day 1: Tech Obstacle Arena & Literary Battles',
        venue: 'Nirma University Campus',
        room: 'Main Auditorium & Engineering Block',
        time: '09:30 AM - 06:00 PM',
        highlight: 'RoboWars, Coding Sprints, Parliamentary Debates & Project Displays'
      },
      {
        day: 2,
        date: '2026-10-06',
        label: 'Day 2: Music Concert & Cultural Grand Gala',
        venue: 'Nirma University Grounds',
        room: 'Open Air Amphitheatre',
        time: '10:00 AM - 10:00 PM',
        highlight: 'Dance Troupes, Celebrity Star Night Concert & Trophy Celebrations'
      }
    ]
  },
  {
    id: 'sasm-ev-3',
    title: 'Gujarat Business Leadership & Startup Expo',
    organizer: 'Gujarat Chamber of Commerce & Industry',
    organizerType: 'Company',
    institution: 'GCCI Exhibition Complex',
    location: 'Ashram Road, Ahmedabad',
    city: 'Ahmedabad',
    venue: 'GCCI Main Convention Hall',
    isMultiDay: true,
    totalDays: 2,
    date: '2026-10-15',
    endDate: '2026-10-16',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    eventType: 'Exhibition & Networking',
    category: 'Business',
    description: 'High-level 2-day business symposium connecting regional startups, venture capital investors, enterprise leaders, and government policy makers.',
    eligibility: 'Entrepreneurs, Founders, Investors & Business Executives',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-10',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    tags: ['Venture Capital', 'Startups', 'Networking', 'Leadership'],
    contactEmail: 'expo@gcci.org',
    contactPhone: '+91 99112 33445',
    capacity: 800,
    featured: false,
    daySchedules: [
      {
        day: 1,
        date: '2026-10-15',
        label: 'Day 1: Startup Pavilion & Investor Matchmaking',
        venue: 'GCCI Exhibition Complex',
        room: 'Hall A (Expo Floor)',
        time: '10:00 AM - 05:00 PM',
        highlight: '100+ Startup Booths, Speed Pitching & Angel Investor Roundtables'
      },
      {
        day: 2,
        date: '2026-10-16',
        label: 'Day 2: Policy Panels & Enterprise Summit',
        venue: 'GCCI Convention Center',
        room: 'Executive Grand Ballroom',
        time: '10:00 AM - 04:30 PM',
        highlight: 'State Industry Leaders Panel, Trade Agreements & Networking Luncheon'
      }
    ]
  },
  {
    id: 'sasm-ev-4',
    title: 'IIT Gandhinagar Inter-College Sports Championship',
    organizer: 'IIT Gandhinagar Athletics Committee',
    organizerType: 'College / University',
    institution: 'IIT Gandhinagar Campus',
    location: 'Palaj, Gandhinagar',
    city: 'Gandhinagar',
    venue: 'IIT Sports Complex Arena & Grounds',
    isMultiDay: true,
    totalDays: 3,
    date: '2026-10-22',
    endDate: '2026-10-24',
    startTime: '08:00 AM',
    endTime: '07:00 PM',
    eventType: 'Sports Tournament',
    category: 'Sports',
    description: 'Regional 3-day inter-collegiate sports championship featuring athletics, basketball, football, chess, badminton, and table tennis tournaments.',
    eligibility: 'College Students with valid institution ID cards',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-18',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    tags: ['Athletics', 'Basketball', 'Football', 'Tournaments', '3-Day Championship'],
    contactEmail: 'sports@iitgn.ac.in',
    contactPhone: '+91 97788 44332',
    capacity: 1500,
    featured: true,
    daySchedules: [
      {
        day: 1,
        date: '2026-10-22',
        label: 'Day 1: Track & Field Athletics & Badminton',
        venue: 'IIT Sports Complex Arena',
        room: 'Indoor Badminton Courts & Track Stadium',
        time: '08:00 AM - 06:00 PM',
        highlight: 'Opening March Past, 100m/400m Heats, and Badminton Knockouts'
      },
      {
        day: 2,
        date: '2026-10-23',
        label: 'Day 2: Basketball, Table Tennis & Football',
        venue: 'IIT Sports Complex',
        room: 'Outdoor Basketball Courts & Football Stadium',
        time: '08:30 AM - 07:00 PM',
        highlight: 'Inter-College Football Quarterfinals & Basketball Showdowns'
      },
      {
        day: 3,
        date: '2026-10-24',
        label: 'Day 3: Championship Finals & Medal Ceremony',
        venue: 'IIT Main Sports Stadium',
        room: 'Center Arena',
        time: '09:00 AM - 05:00 PM',
        highlight: 'Grand Final Matches, Gold Medal Felicitation & Closing Trophies'
      }
    ]
  },
  {
    id: 'sasm-ev-5',
    title: 'Vadodara Design & UI/UX Masterclass',
    organizer: 'Vadodara Creative Guild & ScaleOps Design Team',
    organizerType: 'Community',
    institution: 'Vadodara Design Studio',
    location: 'Alkapuri, Vadodara',
    city: 'Vadodara',
    venue: 'Alkapuri Design Hub',
    isMultiDay: false,
    totalDays: 1,
    date: '2026-11-01',
    endDate: '2026-11-01',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    eventType: 'Interactive Workshop',
    category: 'Workshop',
    description: 'Hands-on intensive single-day design workshop covering design systems, micro-interactions, Figma prototyping, and user accessibility standards.',
    eligibility: 'Product Designers, UI/UX Enthusiasts & Students',
    registrationStatus: 'CLOSING SOON',
    registrationDeadline: '2026-10-28',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Accessibility'],
    contactEmail: 'workshop@vadi-design.org',
    contactPhone: '+91 96655 44332',
    capacity: 150,
    featured: false
  },
  {
    id: 'sasm-ev-6',
    title: 'Mumbai FinTech & Web3 Innovation Hackathon',
    organizer: 'FinTech India Association & AWS User Group',
    organizerType: 'Company',
    institution: 'Bandra-Kurla Complex Tech Arena',
    location: 'BKC, Mumbai',
    city: 'Mumbai',
    venue: 'BKC Convention Center & Innovation Lab',
    isMultiDay: true,
    totalDays: 2,
    date: '2026-11-10',
    endDate: '2026-11-11',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    eventType: '36-Hour Hackathon',
    category: 'Hackathon',
    description: 'Nationwide 2-day hackathon focused on next-generation digital payments, open banking APIs, smart contracts, and decentralized finance.',
    eligibility: 'Developers, FinTech Enthusiasts & Engineering Students',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-11-05',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    tags: ['FinTech', 'Web3', 'Blockchain', 'APIs', 'Hackathon'],
    contactEmail: 'hackathon@fintechmumbai.org',
    contactPhone: '+91 98200 11223',
    capacity: 2000,
    featured: true,
    daySchedules: [
      {
        day: 1,
        date: '2026-11-10',
        label: 'Day 1: Problem Statement Reveal & 24hr Coding Kickoff',
        venue: 'BKC Convention Center',
        room: 'Grand Hack Arena & Mentorship Pods',
        time: '09:00 AM - Overnight',
        highlight: 'API Briefings, Architecture Checkpoints & Midnight Code Review'
      },
      {
        day: 2,
        date: '2026-11-11',
        label: 'Day 2: Final Demos, Jury Evaluation & Awards',
        venue: 'BKC Tech Center',
        room: 'Main Stage Auditorium',
        time: '08:00 AM - 09:00 PM',
        highlight: 'Top 8 Live Prototype Demos, Venture Grant Presentations & Celebrations'
      }
    ]
  }
];

/**
 * LOCATION PRIORITY SORTING LOGIC
 * Prioritizes events matching selectedCity to the top, followed by all other events.
 * NEVER filters out valid events unless explicitly requested.
 */
export function sortEventsByLocation(events = [], selectedCity = 'Ahmedabad') {
  if (!selectedCity || selectedCity === 'ALL') return events;

  const normalizedCity = selectedCity.toLowerCase().trim();

  // Primary Priority: Selected City Match
  const priorityEvents = [];
  // Normal Priority: All other locations
  const otherEvents = [];

  events.forEach((ev) => {
    if (ev.city && ev.city.toLowerCase().trim() === normalizedCity) {
      priorityEvents.push(ev);
    } else {
      otherEvents.push(ev);
    }
  });

  // Concatenate priority events first, followed by all remaining events
  return [...priorityEvents, ...otherEvents];
}
