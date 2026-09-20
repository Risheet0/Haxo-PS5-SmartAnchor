/**
 * SASM Platform - Universal Event Discovery & Management Dataset
 * Supports Technology, Cultural, Sports, Business, Educational, and Community Events
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
    venue: 'Main Auditorium & Expo Hall A',
    date: '2026-09-20',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    eventType: 'Conference',
    category: 'Technology',
    description: 'Premier technology gathering in Ahmedabad bringing together engineering students, researchers, and tech leaders to explore AI, robotics, and edge computing.',
    eligibility: 'Open to Students, Developers & Tech Professionals',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-09-25',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'Robotics', 'Edge Computing', 'Keynote'],
    contactEmail: 'contact@sasm-events.org',
    contactPhone: '+91 98765 43210',
    capacity: 1200,
    featured: true
  },
  {
    id: 'sasm-ev-2',
    title: 'Nirma MindSparks Annual College Festival',
    organizer: 'Nirma University Student Council',
    organizerType: 'College / University',
    institution: 'Nirma University',
    location: 'Sarkhej-Gandhinagar Highway, Ahmedabad',
    city: 'Ahmedabad',
    venue: 'Nirma Campus Auditorium & Sports Grounds',
    date: '2026-10-05',
    startTime: '09:30 AM',
    endTime: '08:00 PM',
    eventType: 'Cultural & Tech Festival',
    category: 'Cultural',
    description: 'Annual flagship university festival featuring music concerts, hackathons, robotics obstacle runs, literary debates, and cultural showcases.',
    eligibility: 'Undergraduate & Postgraduate Students from all streams',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-01',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Music', 'Cultural', 'Hackathon', 'Debate'],
    contactEmail: 'mindsparks@nirmauni.ac.in',
    contactPhone: '+91 98234 11223',
    capacity: 2500,
    featured: true
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
    date: '2026-10-15',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    eventType: 'Exhibition & Networking',
    category: 'Business',
    description: 'High-level business symposium connecting regional startups, venture capital investors, enterprise leaders, and government policy makers.',
    eligibility: 'Entrepreneurs, Founders, Investors & Business Executives',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-10',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    tags: ['Venture Capital', 'Startups', 'Networking', 'Leadership'],
    contactEmail: 'expo@gcci.org',
    contactPhone: '+91 99112 33445',
    capacity: 800,
    featured: false
  },
  {
    id: 'sasm-ev-4',
    title: 'IIT Gandhinagar Inter-College Sports Championship',
    organizer: 'IIT Gandhinagar Athletics Committee',
    organizerType: 'College / University',
    institution: 'IIT Gandhinagar Campus',
    location: 'Palaj, Gandhinagar',
    city: 'Gandhinagar',
    venue: 'IIT Sports Complex Arena',
    date: '2026-10-22',
    startTime: '08:00 AM',
    endTime: '07:00 PM',
    eventType: 'Sports Tournament',
    category: 'Sports',
    description: 'Regional inter-collegiate sports championship featuring athletics, basketball, football, chess, badminton, and table tennis tournaments.',
    eligibility: 'College Students with valid institution ID cards',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-10-18',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    tags: ['Athletics', 'Basketball', 'Football', 'Tournaments'],
    contactEmail: 'sports@iitgn.ac.in',
    contactPhone: '+91 97788 44332',
    capacity: 1500,
    featured: true
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
    date: '2026-11-01',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    eventType: 'Interactive Workshop',
    category: 'Workshop',
    description: 'Hands-on design workshop covering design systems, micro-interactions, Figma prototyping, and user accessibility standards.',
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
    venue: 'BKC Convention Center',
    date: '2026-11-10',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    eventType: '36-Hour Hackathon',
    category: 'Hackathon',
    description: 'Nationwide hackathon focused on next-generation digital payments, open banking APIs, smart contracts, and decentralized finance.',
    eligibility: 'Developers, FinTech Enthusiasts & Engineering Students',
    registrationStatus: 'OPEN',
    registrationDeadline: '2026-11-05',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    tags: ['FinTech', 'Web3', 'Blockchain', 'APIs'],
    contactEmail: 'hackathon@fintechmumbai.org',
    contactPhone: '+91 98200 11223',
    capacity: 2000,
    featured: true
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
