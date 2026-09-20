import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sasm_database';

/**
 * 1. Event Mongoose Schema & Model
 */
const eventSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String },
  description: { type: String, default: '' },
  organizer_name: { type: String },
  organizer: { type: String },
  organizer_type: { type: String, default: 'Organization' },
  category: { type: String, default: 'Technology' },
  date: { type: String },
  start_time: { type: String },
  end_time: { type: String },
  venue: { type: String },
  room: { type: String },
  city: { type: String, default: 'Ahmedabad' },
  location: { type: String },
  image: { type: String },
  capacity: { type: Number, default: 500 },
  eligibility: { type: String },
  registration_status: { type: String, default: 'OPEN' },
  registration_deadline: { type: String },
  status: { type: String, default: 'LIVE' },
  current_delay_minutes: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() }
});

/**
 * 2. Speaker Mongoose Schema & Model
 */
const speakerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  email_verified: { type: Number, default: 0 },
  designation: { type: String },
  organization: { type: String },
  bio: { type: String },
  topic: { type: String },
  avatar_url: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() }
});

/**
 * 3. Agenda Mongoose Schema & Model
 */
const agendaSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  order_index: { type: Number, required: true },
  title: { type: String, required: true },
  activity_type: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  duration_minutes: { type: Number, required: true },
  room: { type: String },
  status: { type: String, default: 'UPCOMING' },
  speaker_id: { type: Number },
  speaker_name: { type: String },
  speaker_org: { type: String },
  speaker_designation: { type: String },
  notes: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() }
});

/**
 * 4. Announcement Mongoose Schema & Model
 */
const announcementSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  original_prompt: { type: String, required: true },
  ai_script: { type: String },
  priority: { type: String, default: 'urgent' },
  is_active: { type: Number, default: 1 },
  created_at: { type: String, default: () => new Date().toISOString() }
});

/**
 * 5. Audit Log Mongoose Schema & Model
 */
const logSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  action_type: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

/**
 * 6. User Account Mongoose Schema & Model
 */
const userSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String },
  temp_password: { type: String },
  role: { type: String, default: 'user' },
  event_id: { type: Number, default: 1 },
  email_verified: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() }
});

/**
 * 7. OTP Mongoose Schema & Model
 */
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp_hash: { type: String, required: true },
  expires_at: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  is_used: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const MongoEvent = mongoose.models.MongoEvent || mongoose.model('MongoEvent', eventSchema);
export const MongoSpeaker = mongoose.models.MongoSpeaker || mongoose.model('MongoSpeaker', speakerSchema);
export const MongoAgenda = mongoose.models.MongoAgenda || mongoose.model('MongoAgenda', agendaSchema);
export const MongoAnnouncement = mongoose.models.MongoAnnouncement || mongoose.model('MongoAnnouncement', announcementSchema);
export const MongoLog = mongoose.models.MongoLog || mongoose.model('MongoLog', logSchema);
export const MongoUser = mongoose.models.MongoUser || mongoose.model('MongoUser', userSchema);
export const MongoOtp = mongoose.models.MongoOtp || mongoose.model('MongoOtp', otpSchema);

let isConnected = false;
let mongoMemoryServer = null;

/**
 * Connect to MongoDB instance on localhost:27017 or start background local MongoDB server
 */
export const connectMongoDB = async () => {
  if (isConnected) return true;
  try {
    console.log(`[MongoDB] Connecting to MongoDB instance at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 1500
    });
    isConnected = true;
    console.log(`[MongoDB] ✅ Successfully connected to MongoDB database ("sasm_database") on localhost:27017.`);
    return true;
  } catch (err) {
    console.log(`[MongoDB] System MongoDB service not detected on port 27017. Initializing local MongoDB database engine on localhost:27017...`);
    MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'sasm_database'
      },
      binary: {
        version: '7.0.5'
      }
    }).then(async (server) => {
      mongoMemoryServer = server;
      await mongoose.connect('mongodb://localhost:27017/sasm_database');
      isConnected = true;
      console.log(`[MongoDB] ✅ Local MongoDB database engine active and connected at mongodb://localhost:27017/sasm_database`);
    }).catch((e2) => {
      console.warn(`[MongoDB Notice] Local Mongo engine startup notice: ${e2.message}. Dual persistence active.`);
    });
    return false;
  }
};
