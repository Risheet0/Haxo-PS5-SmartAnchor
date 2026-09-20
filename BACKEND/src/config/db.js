import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/smart_anchor.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`[DB] Connected to SQLite database at ${dbPath}`);
  }
});

// Async Promisified DB Helpers
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbExec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Default Seed Data (TechFest 2026)
 */
export const SEED_EVENT = {
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

export const SEED_SPEAKERS = [
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

export const SEED_AGENDA = [
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

export const SEED_ANNOUNCEMENTS = [
  {
    id: 1,
    original_prompt: 'TechFest 2026 is officially LIVE in Grand Auditorium.',
    ai_script: 'Delegates and guests, TechFest 2026 is now officially in session in the Main Auditorium.',
    priority: 'normal',
    is_active: 0,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const SEED_LOGS = [
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

/**
 * Initialize Tables and Seed Initial Data if tables are empty
 */
export const initDB = async () => {
  await dbExec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organizer_name TEXT,
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      venue TEXT,
      room TEXT,
      status TEXT DEFAULT 'LIVE',
      current_delay_minutes INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS speakers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT,
      organization TEXT,
      bio TEXT,
      topic TEXT,
      avatar_url TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      room TEXT,
      status TEXT DEFAULT 'UPCOMING',
      speaker_id INTEGER,
      speaker_name TEXT,
      speaker_org TEXT,
      speaker_designation TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_prompt TEXT NOT NULL,
      ai_script TEXT,
      priority TEXT DEFAULT 'urgent',
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_scripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      script TEXT NOT NULL,
      script_type TEXT,
      tone TEXT,
      length TEXT,
      speaker_id INTEGER,
      provider TEXT,
      word_count INTEGER,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      email_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registration_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL UNIQUE,
      form_mode TEXT DEFAULT 'custom_form',
      google_form_url TEXT DEFAULT '',
      fields_json TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      form_data_json TEXT NOT NULL,
      registration_code TEXT NOT NULL,
      status TEXT DEFAULT 'CONFIRMED',
      registered_at TEXT NOT NULL
    );
  `);

  // Check if events table has data
  const existingEvent = await dbGet(`SELECT id FROM events WHERE id = 1`);
  if (!existingEvent) {
    console.log('[DB] Seeding default TechFest 2026 dataset...');
    await resetToSeedData();
    console.log('[DB] ✅ Default dataset seeded successfully.');
  } else {
    // Check if registration_form for event 1 exists
    const existingForm = await dbGet(`SELECT id FROM registration_forms WHERE event_id = 1`);
    if (!existingForm) {
      await dbRun(
        `INSERT INTO registration_forms (event_id, form_mode, google_form_url, fields_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [1, 'custom_form', '', JSON.stringify(DEFAULT_REGISTRATION_FIELDS), new Date().toISOString(), new Date().toISOString()]
      );
    }
    console.log('[DB] Existing SQLite dataset detected. Retaining state.');
  }
};

/**
 * Resets database to default TechFest 2026 seed
 */
export const resetToSeedData = async () => {
  await dbExec(`
    DELETE FROM events;
    DELETE FROM speakers;
    DELETE FROM agenda;
    DELETE FROM announcements;
    DELETE FROM logs;
    DELETE FROM registration_forms;
    DELETE FROM registrations;
  `);

  // Seed Registration Form
  await dbRun(
    `INSERT INTO registration_forms (event_id, form_mode, google_form_url, fields_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 'custom_form', '', JSON.stringify(DEFAULT_REGISTRATION_FIELDS), new Date().toISOString(), new Date().toISOString()]
  );

  // Seed Event
  await dbRun(
    `INSERT INTO events (id, name, description, organizer_name, date, start_time, end_time, venue, room, status, current_delay_minutes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      SEED_EVENT.id,
      SEED_EVENT.name,
      SEED_EVENT.description,
      SEED_EVENT.organizer_name,
      SEED_EVENT.date,
      SEED_EVENT.start_time,
      SEED_EVENT.end_time,
      SEED_EVENT.venue,
      SEED_EVENT.room,
      SEED_EVENT.status,
      SEED_EVENT.current_delay_minutes,
      SEED_EVENT.created_at
    ]
  );

  // Seed Speakers
  for (const s of SEED_SPEAKERS) {
    await dbRun(
      `INSERT INTO speakers (id, name, designation, organization, bio, topic, avatar_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.designation, s.organization, s.bio, s.topic, s.avatar_url, new Date().toISOString()]
    );
  }

  // Seed Agenda
  for (const a of SEED_AGENDA) {
    await dbRun(
      `INSERT INTO agenda (id, order_index, title, activity_type, start_time, end_time, duration_minutes, room, status, speaker_id, speaker_name, speaker_org, speaker_designation, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id,
        a.order_index,
        a.title,
        a.activity_type,
        a.start_time,
        a.end_time,
        a.duration_minutes,
        a.room,
        a.status,
        a.speaker_id,
        a.speaker_name,
        a.speaker_org,
        a.speaker_designation,
        a.notes,
        new Date().toISOString()
      ]
    );
  }

  // Seed Announcements
  for (const an of SEED_ANNOUNCEMENTS) {
    await dbRun(
      `INSERT INTO announcements (id, original_prompt, ai_script, priority, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [an.id, an.original_prompt, an.ai_script, an.priority, an.is_active, an.created_at]
    );
  }

  // Seed Logs
  for (const l of SEED_LOGS) {
    await dbRun(
      `INSERT INTO logs (id, action_type, message, timestamp)
       VALUES (?, ?, ?, ?)`,
      [l.id, l.action_type, l.message, l.timestamp]
    );
  }
};
