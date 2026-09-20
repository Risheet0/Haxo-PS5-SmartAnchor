import {
  INITIAL_EVENT,
  INITIAL_SPEAKERS,
  INITIAL_AGENDA,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LOGS,
  INITIAL_REGISTRATION_FORM,
  DEFAULT_REGISTRATION_FIELDS,
  getMockStore,
  setMockStore,
  resetMockStore
} from './mockData';
import { shiftTimeString } from '../utils/formatters';

const API_BASE = '/api';

/**
 * Role-Based Security Guard for Manager-Only Operations
 */
const requireManagerRole = () => {
  try {
    const saved = localStorage.getItem('sasm_user');
    const user = saved ? JSON.parse(saved) : null;
    if (!user || user.role !== 'manager') {
      throw new Error('403 Forbidden: Manager authorization required for this action.');
    }
    return user;
  } catch (err) {
    if (err.message.includes('403 Forbidden')) {
      throw err;
    }
    throw new Error('403 Forbidden: Manager authorization required.');
  }
};

const getAuthHeaders = () => {
  try {
    const saved = localStorage.getItem('sasm_user');
    const user = saved ? JSON.parse(saved) : null;
    if (user && user.email) {
      return {
        'x-manager-email': user.email,
        'x-manager-name': user.name || '',
        'x-user-email': user.email,
        'x-user-role': user.role || ''
      };
    }
  } catch (e) {}
  return {};
};

/**
 * Helper to attempt network fetch with seamless fallback to LocalStorage mock database
 */
const fetchWithFallback = async (url, options = {}, mockHandler) => {
  try {
    const mergedHeaders = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers: mergedHeaders });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: data.message || data.error || `HTTP ${res.status} Error`
        };
      }
      return data;
    }
  } catch (err) {
    // Network failed or server offline -> use mock handler
  }
  return await mockHandler();
};

import { SASM_MOCK_EVENTS } from './sasmEventsData';

export const api = {
  getMe: async () => {
    return fetchWithFallback(
      `${API_BASE}/auth/me`,
      { method: 'GET' },
      () => {
        try {
          const saved = localStorage.getItem('sasm_user');
          if (saved) {
            return { success: true, user: JSON.parse(saved) };
          }
        } catch (e) {}
        return { success: false, message: 'Unauthenticated' };
      }
    );
  },

  getSpeakerConsole: async (eventId) => {
    const saved = localStorage.getItem('sasm_user');
    const user = saved ? JSON.parse(saved) : null;
    return fetchWithFallback(
      `${API_BASE}/events/${eventId}/speaker-console`,
      { method: 'GET' },
      () => {
        const ev = getMockStore('event', INITIAL_EVENT);
        if (user && user.role === 'speaker' && String(user.event_id || 1) !== String(eventId)) {
          return {
            success: false,
            status: 403,
            message: 'Access Denied: You do not have permission to access this event.'
          };
        }
        if (String(eventId) !== '1' && String(eventId) !== 'techfest-2026' && String(eventId) !== String(ev.id)) {
          return {
            success: false,
            status: 404,
            message: 'Event Not Found: The requested event could not be found.'
          };
        }
        return {
          success: true,
          event: ev,
          agenda: getMockStore('agenda', INITIAL_AGENDA),
          speakers: getMockStore('speakers', INITIAL_SPEAKERS),
          announcements: getMockStore('announcements', INITIAL_ANNOUNCEMENTS)
        };
      }
    );
  },

  login: async (credentials) => {
    return fetchWithFallback(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      },
      () => {
        const { email = 'user@example.com', role = 'user', name } = credentials;
        const resolvedRole = role === 'manager' || role === 'speaker' ? role : 'user';
        return {
          success: true,
          user: {
            id: `usr-${Date.now()}`,
            name: name || (resolvedRole === 'speaker' ? 'Risheet' : resolvedRole === 'manager' ? 'Event Manager' : 'Alex Johnson'),
            email: email.trim(),
            role: resolvedRole,
            event_id: 1,
            eventId: 1,
            event_name: 'TechFest 2026',
            organization: 'TechFest 2026',
            organizationId: 'org-1',
            email_verified: true,
            logged_in_at: new Date().toISOString()
          }
        };
      }
    );
  },
  // ─────────────────────────────────────────────────────────────────────────
  // 1. EVENT ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  getAllEvents: async () => {
    return fetchWithFallback(`${API_BASE}/events`, {}, () => {
      return getMockStore('sasm_all_events', SASM_MOCK_EVENTS);
    });
  },

  getEvent: async () => {
    return fetchWithFallback(`${API_BASE}/events/current`, {}, () => {
      return getMockStore('event', INITIAL_EVENT);
    });
  },

  getEventById: async (id) => {
    return fetchWithFallback(`${API_BASE}/events/${id}`, {}, () => {
      const all = getMockStore('sasm_all_events', SASM_MOCK_EVENTS);
      return all.find((e) => String(e.id) === String(id)) || all[0];
    });
  },

  createEvent: async (eventData) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      },
      () => {
        const all = getMockStore('sasm_all_events', SASM_MOCK_EVENTS);
        const newEv = {
          id: `sasm-ev-${Date.now()}`,
          title: eventData.title || eventData.name || 'New Event',
          name: eventData.name || eventData.title || 'New Event',
          organizer: eventData.organizer || eventData.organizer_name || 'Event Host Committee',
          organizerType: eventData.organizer_type || 'Organization',
          category: eventData.category || 'Technology',
          institution: eventData.venue || 'Grand Convention Center',
          venue: eventData.venue || 'Grand Convention Center',
          room: eventData.room || 'Main Auditorium',
          city: eventData.city || 'Ahmedabad',
          location: eventData.location || `${eventData.venue || 'Grand Convention Center'}, ${eventData.city || 'Ahmedabad'}`,
          isMultiDay: Boolean(eventData.isMultiDay || eventData.is_multi_day || (eventData.daySchedules && eventData.daySchedules.length > 1)),
          totalDays: eventData.totalDays || eventData.total_days || (eventData.daySchedules?.length || 1),
          date: eventData.date || new Date().toISOString().split('T')[0],
          endDate: eventData.endDate || eventData.end_date || eventData.date || new Date().toISOString().split('T')[0],
          startTime: eventData.startTime || eventData.start_time || '09:00 AM',
          endTime: eventData.endTime || eventData.end_time || '06:00 PM',
          eventType: eventData.eventType || 'Conference',
          description: eventData.description || '',
          eligibility: eventData.eligibility || 'Open to all students and participants',
          registrationStatus: 'OPEN',
          registrationDeadline: eventData.registration_deadline || '',
          image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          tags: eventData.tags || ['Conference', 'Summit'],
          capacity: Number(eventData.capacity) || 500,
          featured: true,
          status: 'LIVE',
          daySchedules: eventData.daySchedules || eventData.day_schedules || []
        };
        const updated = [newEv, ...all];
        setMockStore('sasm_all_events', updated);
        return newEv;
      }
    );
  },

  updateEvent: async (data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/events/current`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const current = getMockStore('event', INITIAL_EVENT);
        const updated = { ...current, ...data };
        setMockStore('event', updated);
        return updated;
      }
    );
  },

  resetDemoData: async () => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/events/reset-demo`,
      { method: 'POST' },
      () => {
        resetMockStore();
        return { message: 'Demo data restored successfully' };
      }
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. AGENDA ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  getAgenda: async () => {
    return fetchWithFallback(`${API_BASE}/agenda`, {}, () => {
      return getMockStore('agenda', INITIAL_AGENDA);
    });
  },

  createActivity: async (data) => {
    requireManagerRole(); // Security check
    return api.createAgendaItem(data);
  },

  createAgendaItem: async (data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const linkedSpeaker = speakers.find((s) => String(s.id) === String(data.speaker_id));

        const newItem = {
          id: Date.now(),
          order_index: agenda.length + 1,
          title: data.title || 'Untitled Session',
          activity_type: data.activity_type || 'Session',
          start_time: data.start_time || '10:00 AM',
          end_time: data.end_time || '10:45 AM',
          duration_minutes: Number(data.duration_minutes) || 45,
          room: data.room || 'Main Auditorium',
          status: data.status || 'UPCOMING',
          speaker_id: linkedSpeaker ? linkedSpeaker.id : null,
          speaker_name: linkedSpeaker ? linkedSpeaker.name : null,
          speaker_org: linkedSpeaker ? linkedSpeaker.organization : null,
          speaker_designation: linkedSpeaker ? linkedSpeaker.designation : null,
          notes: data.notes || ''
        };

        const updated = [...agenda, newItem];
        setMockStore('agenda', updated);
        return newItem;
      }
    );
  },

  updateAgendaItem: async (id, data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const linkedSpeaker = data.speaker_id
          ? speakers.find((s) => String(s.id) === String(data.speaker_id))
          : null;

        const updated = agenda.map((item) => {
          if (item.id === Number(id)) {
            return {
              ...item,
              ...data,
              speaker_name: linkedSpeaker ? linkedSpeaker.name : item.speaker_name,
              speaker_org: linkedSpeaker ? linkedSpeaker.organization : item.speaker_org,
              speaker_designation: linkedSpeaker
                ? linkedSpeaker.designation
                : item.speaker_designation
            };
          }
          return item;
        });

        setMockStore('agenda', updated);
        return updated.find((a) => a.id === Number(id));
      }
    );
  },

  deleteActivity: async (id) => {
    requireManagerRole(); // Security check
    return api.deleteAgendaItem(id);
  },

  deleteAgendaItem: async (id) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda/${id}`,
      { method: 'DELETE' },
      () => {
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const filtered = agenda.filter((a) => a.id !== Number(id));
        setMockStore('agenda', filtered);
        return { success: true };
      }
    );
  },

  updateActivityStatus: async (id, status) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda/${id}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      },
      () => {
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const logs = getMockStore('logs', INITIAL_LOGS);

        const updatedAgenda = agenda.map((item) => {
          if (item.id === Number(id)) {
            return { ...item, status };
          }
          return item;
        });

        const targetItem = agenda.find((a) => a.id === Number(id));
        const newLog = {
          id: Date.now(),
          action_type: `SESSION_${status}`,
          message: `Session "${targetItem?.title || id}" transitioned to ${status}.`,
          timestamp: new Date().toISOString()
        };

        setMockStore('agenda', updatedAgenda);
        setMockStore('logs', [newLog, ...logs]);
        return { success: true, status };
      }
    );
  },

  addDelay: async ({ minutes, targetActivityId, reason }) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda/delay`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes, targetActivityId, reason })
      },
      () => {
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const event = getMockStore('event', INITIAL_EVENT);
        const logs = getMockStore('logs', INITIAL_LOGS);

        const pivotIdx = agenda.findIndex(
          (a) => String(a.id) === String(targetActivityId)
        );
        const startIndex = pivotIdx >= 0 ? pivotIdx : 0;

        const updatedAgenda = agenda.map((item, idx) => {
          if (idx >= startIndex) {
            return {
              ...item,
              start_time: shiftTimeString(item.start_time, Number(minutes)),
              end_time: shiftTimeString(item.end_time, Number(minutes)),
              status: item.status === 'UPCOMING' ? 'DELAYED' : item.status
            };
          }
          return item;
        });

        const updatedEvent = {
          ...event,
          current_delay_minutes: (event.current_delay_minutes || 0) + Number(minutes)
        };

        const newLog = {
          id: Date.now(),
          action_type: 'DELAY_ADDED',
          message: `Injected +${minutes}m delay starting at session #${startIndex + 1} (${reason}).`,
          timestamp: new Date().toISOString()
        };

        setMockStore('agenda', updatedAgenda);
        setMockStore('event', updatedEvent);
        setMockStore('logs', [newLog, ...logs]);

        return { success: true, minutes, targetActivityId };
      }
    );
  },

  reorderAgenda: async (items) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/agenda/reorder`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      },
      () => {
        setMockStore('agenda', items);
        return { success: true };
      }
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. SPEAKER ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  getSpeakers: async () => {
    return fetchWithFallback(`${API_BASE}/speakers`, {}, () => {
      return getMockStore('speakers', INITIAL_SPEAKERS);
    });
  },

  sendSpeakerOtp: async (email) => {
    return fetchWithFallback(
      `${API_BASE}/speakers/send-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      },
      () => {
        return { success: true, message: 'Verification code sent to speaker email.' };
      }
    );
  },

  verifySpeakerOtp: async (email, otp) => {
    return fetchWithFallback(
      `${API_BASE}/speakers/verify-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      },
      () => {
        return { success: true, message: 'Speaker email verified successfully' };
      }
    );
  },

  createSpeaker: async (data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/speakers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const newSpeaker = {
          id: Date.now(),
          name: data.name || 'Anonymous Dignitary',
          email: data.email || '',
          email_verified: 1,
          designation: data.designation || 'Special Guest',
          organization: data.organization || 'Industry Partner',
          bio: data.bio || '',
          topic: data.topic || '',
          avatar_url: data.avatar_url || ''
        };
        const updated = [...speakers, newSpeaker];
        setMockStore('speakers', updated);
        return newSpeaker;
      }
    );
  },

  updateSpeaker: async (id, data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/speakers/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const updated = speakers.map((sp) =>
          sp.id === Number(id) ? { ...sp, ...data } : sp
        );
        setMockStore('speakers', updated);
        return updated.find((s) => s.id === Number(id));
      }
    );
  },

  deleteSpeaker: async (id) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/speakers/${id}`,
      { method: 'DELETE' },
      () => {
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const filtered = speakers.filter((s) => s.id !== Number(id));
        setMockStore('speakers', filtered);
        return { success: true };
      }
    );
  },

  resendManagerEmail: async (speakerId) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/speakers/${speakerId}/resend-manager-email`,
      {
        method: 'POST'
      },
      () => {
        return {
          success: true,
          message: 'Notification email successfully delivered to manager email.',
          managerEmail: 'manager@sasm.org'
        };
      }
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. AI SCRIPT SYNTHESIS WORKSPACE (LIVE GEMINI + LOCAL ENGINE FALLBACK)
  // ─────────────────────────────────────────────────────────────────────────
  generateScript: async (payload) => {
    return fetchWithFallback(
      `${API_BASE}/ai/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      () => {
        const {
          scriptType = 'Speaker Introduction',
          tone = 'Professional',
          length = 'Standard',
          audience = 'Tech Community & Delegates',
          customNotes = '',
          speakerId,
          topic: rawTopic
        } = payload;

        const event = getMockStore('event', INITIAL_EVENT);
        const speakers = getMockStore('speakers', INITIAL_SPEAKERS);
        const agenda = getMockStore('agenda', INITIAL_AGENDA);
        const eventName = event?.name || 'TECHFEST 2026';
        const venue = event?.venue || 'Grand Convention Center';

        // Resolve speaker details
        const speaker = speakerId ? speakers.find(s => s.id === Number(speakerId)) : null;
        const speakerName = payload.speakerName || speaker?.name || 'our distinguished guest';
        const speakerOrg = payload.speakerOrg || speaker?.organization || '';
        const speakerDesig = payload.speakerDesig || speaker?.designation || '';
        const speakerBio = payload.speakerBio || speaker?.bio || '';
        const speakerTopic = rawTopic || speaker?.topic || 'the next session';

        // ═══════════════════════════════════════════════════════════════════════
        // LOCAL SMART TEMPLATE SYNTHESIS ENGINE (OFFLINE FALLBACK)
        // ═══════════════════════════════════════════════════════════════════════
        const toneMap = {
      Professional: { greeting: 'Good morning', adj: 'distinguished', energy: 'confident', applause: 'warm round of applause' },
      Formal: { greeting: 'Respected dignitaries', adj: 'esteemed', energy: 'composed', applause: 'generous appreciation' },
      Friendly: { greeting: 'Hey everyone', adj: 'amazing', energy: 'relaxed', applause: 'big round of applause' },
      Energetic: { greeting: 'What\'s up, everyone', adj: 'incredible', energy: 'electric', applause: 'thunderous round of applause' },
      Technical: { greeting: 'Welcome, colleagues', adj: 'accomplished', energy: 'measured', applause: 'respectful acknowledgment' },
      Short: { greeting: 'Hello everyone', adj: 'wonderful', energy: 'brisk', applause: 'warm welcome' }
    };
    const tv = toneMap[tone] || toneMap.Professional;

    // Audience-specific flavoring
    const audienceShort = audience.split('&')[0].trim();

    // Build custom notes insertion
    const notesBlock = customNotes
      ? `\n\n[Stage Cue: Reference special talking points]\n\n${customNotes}\n`
      : '';

    // ─── SCRIPT BUILDERS BY TYPE ──────────────────────────────────
    const builders = {
      'Speaker Introduction': {
        Short: () =>
`[Stage Cue: Step center, smile at audience]

"${tv.greeting}! Let's welcome **${speakerName}**${speakerOrg ? ` from **${speakerOrg}**` : ''} to the stage.

${speakerDesig ? `A ${tv.adj} ${speakerDesig}, ` : ''}they'll be speaking on **${speakerTopic}**.

[Stage Cue: Lead ${tv.applause}]

Please welcome them with a ${tv.applause}!"${notesBlock}`,

        Standard: () =>
`[Stage Cue: Stand center stage, smile warmly, make direct eye contact with ${audienceShort}]

"${tv.greeting}, ${tv.adj} delegates and guests! Welcome to this special session at **${eventName}**.

[Stage Cue: Open hand gesture towards the stage entrance]

It is our privilege to introduce our next speaker — **${speakerName}**${speakerOrg ? `, representing **${speakerOrg}**` : ''}${speakerDesig ? `, serving as ${speakerDesig}` : ''}.

${speakerBio ? `[Stage Cue: Briefly glance at notes, maintain ${tv.energy} posture]\n\n${speakerBio.split('.').slice(0, 2).join('.')}.\n` : ''}
Today, they will be sharing insights on **${speakerTopic}** — a topic that resonates deeply with our ${audienceShort} community.

[Stage Cue: Pause for two beats, build anticipation]

This is a session you won't want to miss. Please join me in extending a ${tv.applause}!

[Stage Cue: Step back, lead enthusiastic applause, gesture speaker to podium]"${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Walk confidently to center podium, establish commanding ${tv.energy} presence, sweep gaze across all sections]

"${tv.greeting}, ${tv.adj} delegates, honoured guests, faculty members, and esteemed members of the ${audienceShort} community! Welcome to this landmark session at **${eventName}** — hosted here at the **${venue}**.

[Stage Cue: Pause for three beats to build gravitas]

Before I introduce our next speaker, let me take a moment to acknowledge the extraordinary journey that has brought us all together today. This event represents the convergence of bold ideas, transformative thinking, and collaborative brilliance that defines our generation.

[Stage Cue: Open hand gesture towards the stage entrance, maintain ${tv.energy} eye contact]

And speaking of brilliance — it is my absolute honour and distinct privilege to introduce someone who truly embodies the spirit of innovation and leadership.

Ladies and gentlemen, please welcome **${speakerName}**${speakerOrg ? `, a visionary leader from **${speakerOrg}**` : ''}${speakerDesig ? `, currently serving as **${speakerDesig}**` : ''}.

${speakerBio ? `[Stage Cue: Briefly reference speaker credentials with admiration]\n\n${speakerBio}\n` : ''}
[Stage Cue: Slight forward lean to emphasize significance]

Today, they bring to our stage an exceptionally timely and impactful discourse on **${speakerTopic}**. In a world where ${audienceShort.toLowerCase()} are navigating unprecedented technological shifts, this session promises to deliver actionable insights, fresh perspectives, and bold predictions that will shape the conversations for months to come.

[Stage Cue: Transition energy — build towards audience participation]

I personally had the privilege of previewing some of the key themes, and I can tell you — you are in for an absolute treat. The depth of research, the clarity of vision, and the practical frameworks being presented today set a new benchmark for thought leadership.

[Stage Cue: Step back slightly, raise voice with enthusiasm]

So without further ado — let us give **${speakerName}** the warmest, most ${tv.energy} welcome this auditorium has ever witnessed!

[Stage Cue: Initiate standing ovation energy, lead sustained ${tv.applause}, gesture speaker to the podium with a respectful bow]

${speakerName}, the stage is yours!"${notesBlock}`
      },

      'Opening Script': {
        Short: () =>
`[Stage Cue: Step to podium, bright smile]

"${tv.greeting}! Welcome to **${eventName}**!

We have an ${tv.adj} lineup of sessions ahead. Let's dive right in!

[Stage Cue: Signal AV team to start]"${notesBlock}`,

        Standard: () =>
`[Stage Cue: Step confidently to center podium, broad engaging smile]

"${tv.greeting}, visionaries, innovators, and ${tv.adj} guests! Welcome to **${eventName}** at the **${venue}**!

[Stage Cue: Sweep gaze across the auditorium, acknowledge all sections of ${audienceShort}]

Today marks a celebration of cutting-edge technology, disruptive ideas, and collaborative excellence. We have assembled a world-class roster of speakers, panel sessions, and live demonstrations designed to push the boundaries of what's possible.

[Stage Cue: Project voice with ${tv.energy} authority]

On behalf of the organising committee — ${event?.organizer_name || 'our dedicated team'} — we are thrilled to have you here. Over the coming hours, prepare to be inspired, challenged, and energized.

[Stage Cue: Signal AV team for opening sequence]

Without further ado, let us officially inaugurate **${eventName}**! Let the innovation begin!"${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Walk to center stage with commanding ${tv.energy} presence, pause, take a breath, sweep panoramic gaze across the entire auditorium]

"${tv.greeting}, ${tv.adj} delegates, industry pioneers, research scholars, government representatives, media partners, and every single passionate individual who has made the journey to be here today — welcome, welcome, welcome to **${eventName}**!

[Stage Cue: Extend arms in welcoming gesture, smile broadly at every section]

Standing here at the **${venue}**, looking out at this extraordinary gathering of minds, I am filled with an overwhelming sense of purpose. This is not just another event — this is a movement. A convergence point where the brightest ideas in technology, innovation, and human potential come together to chart the course of our shared future.

[Stage Cue: Lower voice slightly for emphasis, lean forward]

Let me share something with you. When our organising team — ${event?.organizer_name || 'our dedicated committee'} — first envisioned this edition, we asked ourselves one question: "How do we create an experience that doesn't just inform, but transforms?" And every session, every speaker, every demonstration you'll witness today was curated with exactly that ambition.

[Stage Cue: Straighten up, resume ${tv.energy} projection]

For our ${audienceShort} gathered here — you are the reason this event exists. Your curiosity drives our curation. Your feedback shapes our programming. And your energy is what transforms a conference hall into a launchpad for the extraordinary.

[Stage Cue: Pause for dramatic emphasis — two full beats of silence]

Today's agenda is packed with keynote masterclasses, breakthrough panel discussions, hands-on workshops, and live technology showcases that will challenge your assumptions and expand your horizons. We have ${speakers.length} exceptional speakers lined up — each a leader in their field, each bringing something truly unique to this stage.

[Stage Cue: Gesture to the main stage screen as it illuminates]

But before we begin — I want every single person in this room to make a promise to themselves: Be present. Ask hard questions. Network fiercely. And leave here today with at least one idea that will change how you think about what's possible.

[Stage Cue: Signal AV team for opening video montage, build crescendo energy]

So — are we ready? Let us officially inaugurate **${eventName}**! The future starts right now, right here!

[Stage Cue: Lead opening applause, maintain high energy as lights shift to event theme]"${notesBlock}`
      },

      'Transition Script': {
        Short: () =>
`[Stage Cue: Step forward, maintain energy]

"Wonderful session! A big ${tv.applause} for that presentation.

[Stage Cue: Gesture to screen]

Up next: **${speakerTopic}**. Let's keep the momentum going!"${notesBlock}`,

        Standard: () =>
`[Stage Cue: Step center stage, maintain high energy and ${tv.energy} posture]

"Thank you, everyone! What a ${tv.adj} session that was — a tremendous ${tv.applause} once again!

[Stage Cue: Acknowledge previous speaker with open palm gesture]

As we maintain our stage momentum here at **${eventName}**, we are transitioning into our next featured session on **${speakerTopic}**.

[Stage Cue: Direct audience attention to the main stage screen]

${speaker ? `Please welcome **${speakerName}**${speakerOrg ? ` from **${speakerOrg}**` : ''} as they take us through the next segment.` : 'Our next presenter is ready to deliver what promises to be another highlight of the day.'}

[Stage Cue: Lead transitional applause, step aside]

Please ensure you are seated. We begin in just a moment!"${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Hold position center stage, allow previous speaker's applause to naturally conclude, then step forward with ${tv.energy} warmth]

"What a phenomenal, absolutely ${tv.adj} session! I think I speak for everyone in this room when I say — that was exceptional. Let us give one more sustained ${tv.applause}!

[Stage Cue: Lead extended applause, acknowledge departing speaker with respectful nod]

Now — I know that energy is running high, and rightfully so. What you've just witnessed is the kind of thought leadership that defines events like **${eventName}**. The insights shared will undoubtedly spark conversations long after we leave the ${venue} today.

[Stage Cue: Shift posture slightly to signal transition, modulate vocal tone]

And if you thought that was impressive — we're just getting started. Our programming team has sequenced today's sessions for maximum impact, and our next segment continues to build on those themes.

[Stage Cue: Open hand gesture to the main display as it refreshes]

We are now transitioning into a session on **${speakerTopic}**. ${speaker ? `Taking the stage is **${speakerName}**${speakerOrg ? `, representing **${speakerOrg}**` : ''}${speakerDesig ? `, serving as ${speakerDesig}` : ''}. ${speakerBio ? speakerBio.split('.')[0] + '.' : ''}` : 'Our next presenter brings a wealth of experience and a fresh perspective that perfectly complements what we\'ve experienced so far.'}

[Stage Cue: Build anticipation with slight pause]

For our ${audienceShort} — this is a session where I encourage you to have your notepads ready. The practical takeaways here will be significant.

[Stage Cue: Step back with open gesture, lead welcoming ${tv.applause}]

Please welcome them to the stage with your warmest appreciation!"${notesBlock}`
      },

      'Closing Script': {
        Short: () =>
`[Stage Cue: Stand center, warm smile]

"What an incredible day at **${eventName}**! Thank you all for your energy and participation.

[Stage Cue: Bow respectfully]

Travel safely, and see you at the next edition!"${notesBlock}`,

        Standard: () =>
`[Stage Cue: Stand tall center stage, warm reflective tone]

"What an extraordinary day of innovation, insights, and breakthrough collaboration here at **${eventName}**!

[Stage Cue: Acknowledge organizers, stage crew, and ${audienceShort}]

We witnessed ${speakers.length || 'multiple'} exceptional speakers, each bringing their unique expertise and vision to this stage. From cutting-edge research to practical industry frameworks, today's sessions have set a new benchmark for excellence.

On behalf of the organising committee — ${event?.organizer_name || 'our entire team'} — we extend our heartfelt gratitude for your energy, engagement, and participation.

[Stage Cue: Warm, personal tone]

To our speakers, panelists, volunteers, AV crew, and every single person who made this event possible — thank you from the bottom of our hearts.

[Stage Cue: Deep respectful bow, lead final applause]

Travel safely, stay connected, and we look forward to welcoming you at our next grand edition!"${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Walk to center stage for the final time, take a moment to look across the auditorium, let the significance of the moment settle]

"${tv.adj} delegates, honoured guests, and every single member of the ${audienceShort} community who has been part of this ${tv.adj} journey — we have arrived at the closing chapter of **${eventName}**.

[Stage Cue: Pause — allow the weight of the day to resonate]

What a day this has been. Let me take you back to where we started this morning — a room full of anticipation, curiosity, and possibility. And now, as we stand here at the finish line, I want each of you to reflect on how much ground we've covered.

[Stage Cue: Begin slow walk across the stage, maintaining intimate connection with audience]

We heard from ${speakers.length || 'some of the most'} brilliant minds in their respective fields. ${speakers.length > 0 ? `From **${speakers[0]?.name}**'s compelling opening on ${speakers[0]?.topic || 'cutting-edge innovation'}${speakers.length > 1 ? `, to **${speakers[speakers.length - 1]?.name}**'s powerful closing insights` : ''} — every session delivered substance, depth, and genuine value.` : 'Every session was carefully crafted to deliver substance, depth, and genuine value.'}

[Stage Cue: Pause, shift to personal and grateful tone]

But an event of this calibre doesn't happen by accident. Behind every smooth transition, every perfectly timed AV cue, every seamless speaker handoff — there is a team of extraordinary individuals working tirelessly behind the scenes.

To our organising committee, ${event?.organizer_name || 'our dedicated team'} — your vision made this possible. To our technology and operations crew — your precision made it flawless. To our volunteers — your warmth made it welcoming. And to our sponsors and partners — your investment made it sustainable.

[Stage Cue: Turn to face the full audience, voice rising with genuine emotion]

And most importantly — to every single one of you seated here. **You** are the heartbeat of this event. Your questions challenged our speakers. Your energy filled this hall. Your passion reminded all of us why we do what we do.

[Stage Cue: Straighten posture, shift to forward-looking energy]

As you leave the **${venue}** today, I want to leave you with one thought: The conversations that started on this stage are not meant to end here. Take them forward. Build on them. Challenge them. Share them. Let the ideas you encountered today become the innovations you create tomorrow.

[Stage Cue: Final dramatic pause — three full beats of silence]

On behalf of everyone who made **${eventName}** possible — from the bottom of our hearts — thank you. Thank you for being here, for being engaged, and for being part of something truly special.

[Stage Cue: Deep, respectful bow — hold for three seconds]

Travel safely, stay inspired, and we cannot wait to welcome you back for our next edition. Until then — keep pushing boundaries, keep asking questions, and keep building the future.

[Stage Cue: Step back, lead sustained standing ovation, wave warmly as event theme music plays]

Thank you, **${eventName}**! This has been unforgettable!"${notesBlock}`
      },

      'Delay Announcement': {
        Short: () =>
`[Stage Cue: Step forward calmly]

"A quick note — we're taking a brief 10-minute pause for technical adjustments. Please enjoy networking.

[Stage Cue: Reassuring smile]

We'll be right back!"${notesBlock}`,

        Standard: () =>
`[Stage Cue: Step center stage with calm, reassuring composure]

"Ladies and gentlemen, your attention for a brief administrative note:

[Stage Cue: Maintain reassuring eye contact with ${audienceShort}]

We are currently taking a short pause to finalise some technical calibrations and ensure the best possible experience for our upcoming sessions. This is expected to last approximately 10 minutes.

[Stage Cue: Gesture towards foyer/networking area]

In the meantime, please feel free to visit our demonstration booths in the foyer, connect with fellow delegates, or grab a refreshment. Our team is working diligently to resume promptly.

[Stage Cue: Conclude with warm smile and reassuring nod]

Thank you for your patience and understanding. We'll be back before you know it!"${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Walk to center podium with calm composure and reassuring body language]

"${tv.adj} delegates, honoured guests, and all members of our wonderful ${audienceShort} community — may I have your attention for just a moment?

[Stage Cue: Maintain steady, reassuring eye contact — project calm authority]

I want to be fully transparent with you, as you deserve nothing less. Our technical operations team has identified a calibration requirement that needs to be addressed before we proceed with our next session. This is a routine adjustment, and our AV engineers are already working on it.

[Stage Cue: Open, honest palm gesture]

We anticipate this brief intermission will last approximately 10-15 minutes. I know your time is incredibly valuable, and I assure you that we are doing everything in our power to minimise this pause.

[Stage Cue: Shift to warm, encouraging tone]

But rather than seeing this as a delay, I'd love for you to see it as an opportunity. Some of the best conversations at events like **${eventName}** happen in the corridors, over coffee, and at the demo stations.

Our demonstration booths in the foyer are showcasing some truly impressive technology from our sponsors and partners. Our networking lounge is open and ready. And our refreshment stations have been restocked.

[Stage Cue: Smile warmly, project genuine care]

I've seen some of the content that's coming up in our next sessions, and I can personally promise you — it will be worth the wait. The best is truly yet to come.

[Stage Cue: Check watch subtly, maintain composure]

We will make an announcement as soon as we are ready to resume. Thank you for your incredible patience and understanding. Events of this scale require precision, and we'd rather take a moment now to deliver perfection than rush through anything less than excellent.

[Stage Cue: Step back with reassuring nod and warm smile]

See you all back in your seats shortly!"${notesBlock}`
      },

      'Emergency Announcement': {
        Short: () =>
`[Stage Cue: Step forward calmly]

"Your attention, please. ${customNotes || 'We are addressing a brief operational matter.'}

[Stage Cue: Reassuring nod]

Thank you for your cooperation."${notesBlock}`,

        Standard: () =>
`[Stage Cue: Step forward with calm authority, maintain composed posture]

"Ladies and gentlemen, your attention please.

[Stage Cue: Make deliberate eye contact across all sections]

${customNotes || 'Our operations team is currently addressing a situation that requires your cooperation. Please remain in your seats and follow any instructions from our event staff.'}

[Stage Cue: Maintain steady, reassuring presence]

Your safety and comfort remain our absolute top priority. Our team is fully trained and prepared for situations like this, and we have everything under control.

[Stage Cue: Pause for 3 seconds, project calm confidence]

We appreciate your patience and understanding. We will provide you with an update shortly."${notesBlock}`,

        Detailed: () =>
`[Stage Cue: Walk to center stage promptly but without urgency, project calm authoritative presence, maintain measured breathing]

"${tv.adj} delegates and honoured guests — may I please have your full attention for an important announcement.

[Stage Cue: Make deliberate, sweeping eye contact across all sections of the auditorium]

${customNotes || 'Our operations and safety team has identified a matter that requires our collective attention. I want to assure every single person in this room that our team has been thoroughly trained for exactly these situations, and we have robust protocols in place.'}

[Stage Cue: Pause for three full seconds — allow the message to register, maintain absolute composure]

Here is what I'd like to ask of you: Please remain calmly in your seats. If you are in the corridors or foyer area, please follow the guidance of our event marshals who are clearly identifiable by their high-visibility jackets. There is no need for concern — we are taking precautionary measures to ensure your complete safety and comfort.

[Stage Cue: Modulate tone to warm and reassuring]

Your wellbeing is, and always will be, our number one priority at **${eventName}**. Our security team, medical support staff, and venue management are all coordinating seamlessly as I speak.

[Stage Cue: Slight forward lean to convey personal sincerity]

I will personally ensure that you receive regular updates every few minutes until the situation is fully resolved. In the meantime, please look after those around you, stay hydrated, and know that we are in excellent hands.

[Stage Cue: Nod respectfully, step back with calm composure]

Thank you for your incredible composure, cooperation, and trust. We will have you back to enjoying our programme very shortly."${notesBlock}`
      }
    };

    // ─── SELECT AND GENERATE ──────────────────────────────────────
    const typeBuilder = builders[scriptType] || builders['Speaker Introduction'];

    // Normalize length key
    let lengthKey = 'Standard';
    if (length === 'Short' || tone === 'Short') lengthKey = 'Short';
    else if (length === 'Detailed') lengthKey = 'Detailed';

    const buildFn = typeBuilder[lengthKey] || typeBuilder['Standard'];
    const generated = buildFn();

      return {
        script: generated,
        scriptType,
        tone,
        length: lengthKey,
        provider: 'Intelligent Stage AI Engine (Offline Mode)',
        wordCount: generated.split(/\s+/).filter(Boolean).length
      };
    }
  );
},

generateEmergencyAnnouncement: async (payload) => {
    return api.generateScript({
      scriptType: 'Emergency Announcement',
      customNotes: payload?.rawNote || ''
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. ANNOUNCEMENTS & ALERTS
  // ─────────────────────────────────────────────────────────────────────────
  getAnnouncements: async () => {
    return fetchWithFallback(`${API_BASE}/announcements`, {}, () => {
      return getMockStore('announcements', INITIAL_ANNOUNCEMENTS);
    });
  },

  createAnnouncement: async (data) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/announcements`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const announcements = getMockStore('announcements', INITIAL_ANNOUNCEMENTS);
        const newAnnouncement = {
          id: Date.now(),
          original_prompt: data.original_prompt || '',
          ai_script: data.ai_script || data.original_prompt || '',
          priority: data.priority || 'urgent',
          is_active: 1,
          created_at: new Date().toISOString()
        };
        const updated = [newAnnouncement, ...announcements];
        setMockStore('announcements', updated);
        return newAnnouncement;
      }
    );
  },

  dismissAnnouncement: async (id) => {
    requireManagerRole(); // Security check
    return fetchWithFallback(
      `${API_BASE}/announcements/${id}/dismiss`,
      { method: 'POST' },
      () => {
        const announcements = getMockStore('announcements', INITIAL_ANNOUNCEMENTS);
        const updated = announcements.map((a) =>
          a.id === Number(id) ? { ...a, is_active: 0 } : a
        );
        setMockStore('announcements', updated);
        return { success: true };
      }
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. AUDIT LOGS
  // ─────────────────────────────────────────────────────────────────────────
  getLogs: async () => {
    return fetchWithFallback(`${API_BASE}/logs`, {}, () => {
      return getMockStore('logs', INITIAL_LOGS);
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. EVENT REGISTRATION & ATTENDEE INTAKE FORMS
  // ─────────────────────────────────────────────────────────────────────────
  getRegistrationForm: async (eventId = 1) => {
    return fetchWithFallback(`${API_BASE}/events/${eventId}/registration-form`, {}, () => {
      return getMockStore('registration_form', INITIAL_REGISTRATION_FORM);
    });
  },

  saveRegistrationForm: async (eventId = 1, formData) => {
    requireManagerRole(); // Security check for hosts
    return fetchWithFallback(
      `${API_BASE}/events/${eventId}/registration-form`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      },
      () => {
        const updated = {
          event_id: Number(eventId),
          form_mode: formData.form_mode || 'custom_form',
          google_form_url: formData.google_form_url || '',
          fields: formData.fields || DEFAULT_REGISTRATION_FIELDS,
          updated_at: new Date().toISOString()
        };
        setMockStore('registration_form', updated);
        return updated;
      }
    );
  },

  submitEventRegistration: async (eventId = 1, submission) => {
    return fetchWithFallback(
      `${API_BASE}/events/${eventId}/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      },
      () => {
        const form = getMockStore('registration_form', INITIAL_REGISTRATION_FORM);
        const fields = form.fields || DEFAULT_REGISTRATION_FIELDS;
        
        // Validate required fields
        const missing = [];
        for (const f of fields) {
          if (f.required && (!submission[f.id] || String(submission[f.id]).trim() === '')) {
            missing.push(f.label || f.id);
          }
        }
        if (missing.length > 0) {
          throw new Error(`Mandatory fields missing: ${missing.join(', ')}`);
        }

        const registrations = getMockStore('registrations', []);
        const newRecord = {
          id: Date.now(),
          event_id: Number(eventId),
          user_name: submission.full_name || submission.name || 'Attendee',
          user_email: submission.email || '',
          registration_code: `TF26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          status: 'CONFIRMED',
          form_data: submission,
          registered_at: new Date().toISOString()
        };

        setMockStore('registrations', [newRecord, ...registrations]);
        return newRecord;
      }
    );
  },

  getEventRegistrations: async (eventId = 1) => {
    return fetchWithFallback(`${API_BASE}/events/${eventId}/registrations`, {}, () => {
      return getMockStore('registrations', []);
    });
  }
};
