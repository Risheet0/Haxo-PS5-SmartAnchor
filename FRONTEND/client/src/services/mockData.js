/**
 * Realistic Mock Data Store for Smart Anchor (Offline / Demo Mode)
 * Default Event: TECHFEST 2026
 */

export const INITIAL_EVENT = {
  id: 1,
  name: 'TECHFEST 2026',
  description: 'Premier Technology & Innovation Leadership Summit',
  organizer_name: 'TechFest Global Committee',
  date: '2026-09-20',
  start_time: '09:00 AM',
  end_time: '06:00 PM',
  venue: 'Grand Convention Center',
  room: 'Main Auditorium',
  status: 'LIVE',
  current_delay_minutes: 0,
  created_at: new Date().toISOString()
};

export const INITIAL_SPEAKERS = [
  {
    id: 1,
    name: 'Dr. Rahul Sharma',
    designation: 'Chief AI Strategist',
    organization: 'Google DeepMind',
    bio: 'Pioneered research in large-scale transformer architectures and adaptive agentic reasoning systems. Author of "Autonomous Frontiers in Computing".',
    topic: 'Next-Generation Agentic AI Architectures',
    avatar_url: ''
  },
  {
    id: 2,
    name: 'Prof. Neha Patel',
    designation: 'Director of Robotics & AI Lab',
    organization: 'IIT Bombay',
    bio: 'Leading autonomous robotics perception systems and distributed edge computing paradigms across international smart infrastructure projects.',
    topic: 'Autonomous Edge Robotics in Smart Infrastructure',
    avatar_url: ''
  },
  {
    id: 3,
    name: 'Aarav Mehta',
    designation: 'VP of Engineering',
    organization: 'ScaleOps Technologies',
    bio: 'Veteran distributed systems architect building real-time mission-critical high-throughput pipelines and automated cloud-native resilience.',
    topic: 'Scaling Real-time Event Operations & Resiliency',
    avatar_url: ''
  },
  {
    id: 4,
    name: 'Riya Shah',
    designation: 'Founding Partner & Lead Evaluator',
    organization: 'Nexus Innovation Ventures',
    bio: 'Early-stage venture investor and hackathon grand jury evaluator across 100+ deep-tech startups and seed accelerator portfolios.',
    topic: 'Building Venture-Scale Engineering Companies',
    avatar_url: ''
  }
];

export const INITIAL_AGENDA = [
  {
    id: 1,
    order_index: 1,
    title: 'Opening Ceremony & Presidential Address',
    activity_type: 'Ceremony',
    start_time: '09:00 AM',
    end_time: '09:30 AM',
    duration_minutes: 30,
    room: 'Main Auditorium',
    status: 'COMPLETED',
    speaker_id: null,
    speaker_name: null,
    speaker_org: null,
    speaker_designation: null,
    notes: 'Welcome address by the organizing committee and ceremonial lamp lighting.'
  },
  {
    id: 2,
    order_index: 2,
    title: 'Keynote: The Future of Autonomous Systems',
    activity_type: 'Keynote',
    start_time: '09:30 AM',
    end_time: '10:15 AM',
    duration_minutes: 45,
    room: 'Main Auditorium',
    status: 'COMPLETED',
    speaker_id: 1,
    speaker_name: 'Dr. Rahul Sharma',
    speaker_org: 'Google DeepMind',
    speaker_designation: 'Chief AI Strategist',
    notes: 'Keynote address followed by audience interactive Q&A.'
  },
  {
    id: 3,
    order_index: 3,
    title: 'AI Innovation Workshop & Live Teardown',
    activity_type: 'Workshop',
    start_time: '10:15 AM',
    end_time: '11:00 AM',
    duration_minutes: 45,
    room: 'Main Auditorium',
    status: 'LIVE',
    speaker_id: 2,
    speaker_name: 'Prof. Neha Patel',
    speaker_org: 'IIT Bombay',
    speaker_designation: 'Director of Robotics & AI Lab',
    notes: 'Live coding walkthrough and real-time model evaluation on projector screen.'
  },
  {
    id: 4,
    order_index: 4,
    title: 'Hackathon Briefing & Problem Statements',
    activity_type: 'Briefing',
    start_time: '11:00 AM',
    end_time: '11:30 AM',
    duration_minutes: 30,
    room: 'Main Auditorium',
    status: 'UPCOMING',
    speaker_id: 3,
    speaker_name: 'Aarav Mehta',
    speaker_org: 'ScaleOps Technologies',
    speaker_designation: 'VP of Engineering',
    notes: 'Announcement of track themes, sponsor API keys, and mentor office hours.'
  },
  {
    id: 5,
    order_index: 5,
    title: 'Project Showcase & Finalist Pitches',
    activity_type: 'Showcase',
    start_time: '11:30 AM',
    end_time: '01:00 PM',
    duration_minutes: 90,
    room: 'Main Auditorium',
    status: 'UPCOMING',
    speaker_id: 4,
    speaker_name: 'Riya Shah',
    speaker_org: 'Nexus Innovation Ventures',
    speaker_designation: 'Founding Partner',
    notes: 'Top 10 finalist teams present 5-minute live technical demonstrations.'
  },
  {
    id: 6,
    order_index: 6,
    title: 'Judging Round & Jury Deliberation',
    activity_type: 'Judging',
    start_time: '02:00 PM',
    end_time: '03:30 PM',
    duration_minutes: 90,
    room: 'Executive Jury Lounge',
    status: 'UPCOMING',
    speaker_id: null,
    speaker_name: null,
    speaker_org: null,
    speaker_designation: null,
    notes: 'Closed-door evaluation of code repositories, architectural rigor, and UX polish.'
  },
  {
    id: 7,
    order_index: 7,
    title: 'Prize Distribution & Winner Felicitation',
    activity_type: 'Ceremony',
    start_time: '04:00 PM',
    end_time: '04:45 PM',
    duration_minutes: 45,
    room: 'Main Auditorium',
    status: 'UPCOMING',
    speaker_id: null,
    speaker_name: null,
    speaker_org: null,
    speaker_designation: null,
    notes: 'Grand trophy reveal and cash grant distributions.'
  },
  {
    id: 8,
    order_index: 8,
    title: 'Closing Ceremony & Valedictory Vote of Thanks',
    activity_type: 'Closing',
    start_time: '04:45 PM',
    end_time: '05:30 PM',
    duration_minutes: 45,
    room: 'Main Auditorium',
    status: 'UPCOMING',
    speaker_id: null,
    speaker_name: null,
    speaker_org: null,
    speaker_designation: null,
    notes: 'Closing gratitude remarks and commemorative group photograph.'
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    original_prompt: 'TechFest 2026 is officially LIVE in Grand Auditorium.',
    ai_script: 'Delegates and guests, TechFest 2026 is now officially in session in the Main Auditorium.',
    priority: 'normal',
    is_active: 0,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_LOGS = [
  {
    id: 1,
    action_type: 'EVENT_INITIALIZED',
    message: 'TECHFEST 2026 stage management operations online in Grand Auditorium.',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 2,
    action_type: 'SESSION_STARTED',
    message: 'Opening Ceremony & Presidential Address started on time.',
    timestamp: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 3,
    action_type: 'SESSION_COMPLETED',
    message: 'Keynote address concluded successfully.',
    timestamp: new Date(Date.now() - 2700000).toISOString()
  },
  {
    id: 4,
    action_type: 'SESSION_LIVE',
    message: 'AI Innovation Workshop & Live Teardown is currently LIVE on Main Stage.',
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
];

/**
 * Storage helpers for LocalStorage persistence in mock mode
 */
const STORAGE_PREFIX = 'smart_anchor_mock_';

export const getMockStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[MockStore] Failed to read from localStorage', e);
  }
  return fallback;
};

export const setMockStore = (key, val) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('[MockStore] Failed to write to localStorage', e);
  }
};

export const DEFAULT_REGISTRATION_FIELDS = [
  { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Rahul Verma' },
  { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. rahul@example.com' },
  { id: 'mobile_number', label: 'Mobile Number', type: 'tel', required: true, placeholder: 'e.g. +91 98765 43210' },
  { id: 'college', label: 'College / University', type: 'text', required: true, placeholder: 'e.g. IIT Bombay / L.D. College' },
  { id: 'department', label: 'Department / Field of Study', type: 'text', required: true, placeholder: 'e.g. Computer Science / AI / IT' },
  { id: 'year_semester', label: 'Year / Semester', type: 'select', required: false, options: ['1st Year', '2nd Year', '3rd Year', '4th Year / Final', 'Postgraduate / PhD', 'Working Professional'] },
  { id: 'roll_number', label: 'College ID / Roll Number', type: 'text', required: false, placeholder: 'e.g. 21CS045' },
  { id: 'dietary_notes', label: 'Dietary or Special Requirements', type: 'textarea', required: false, placeholder: 'Any accessibility or dietary preferences...' }
];

export const INITIAL_REGISTRATION_FORM = {
  event_id: 1,
  form_mode: 'custom_form',
  google_form_url: '',
  fields: DEFAULT_REGISTRATION_FIELDS
};

export const resetMockStore = () => {
  setMockStore('event', INITIAL_EVENT);
  setMockStore('speakers', INITIAL_SPEAKERS);
  setMockStore('agenda', INITIAL_AGENDA);
  setMockStore('announcements', INITIAL_ANNOUNCEMENTS);
  setMockStore('logs', INITIAL_LOGS);
  setMockStore('registration_form', INITIAL_REGISTRATION_FORM);
  setMockStore('registrations', []);
};
