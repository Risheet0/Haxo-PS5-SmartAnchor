import {
  INITIAL_EVENT,
  INITIAL_SPEAKERS,
  INITIAL_AGENDA,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LOGS,
  getMockStore,
  setMockStore,
  resetMockStore
} from './mockData';
import { shiftTimeString } from '../utils/formatters';

const API_BASE = '/api';

/**
 * Helper to attempt network fetch with seamless fallback to LocalStorage mock database
 */
const fetchWithFallback = async (url, options = {}, mockHandler) => {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network failed or server offline -> silently use mock handler
  }
  return mockHandler();
};

export const api = {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. EVENT ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  getEvent: async () => {
    return fetchWithFallback(`${API_BASE}/events/current`, {}, () => {
      return getMockStore('event', INITIAL_EVENT);
    });
  },

  updateEvent: async (data) => {
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
    return api.createAgendaItem(data);
  },

  createAgendaItem: async (data) => {
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
    return api.deleteAgendaItem(id);
  },

  deleteAgendaItem: async (id) => {
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

  createSpeaker: async (data) => {
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

  // ─────────────────────────────────────────────────────────────────────────
  // 4. AI SCRIPT SYNTHESIS WORKSPACE
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
          audience = 'Tech Community & Delegates',
          customNotes = ''
        } = payload;

        const event = getMockStore('event', INITIAL_EVENT);
        const eventName = event?.name || 'TECHFEST 2026';

        let generated = '';

        switch (scriptType) {
          case 'Speaker Introduction':
            generated = `[Stage Cue: Stand center stage, smile warmly, look directly at audience]

"A very warm welcome to ${eventName}, esteemed delegates and guests!

[Stage Cue: Open hand gesture towards the stage entrance]

It is our distinct honor to welcome our keynote speaker to the podium. With extensive pioneering contributions across the industry, today's session explores key technological breakthroughs.

[Stage Cue: Pause briefly for anticipation, lead enthusiastic applause]

Please join me in extending a rousing round of applause!"`;
            break;

          case 'Opening Script':
            generated = `[Stage Cue: Step confidently to center podium, broad engaging smile]

"Good morning, visionaries, innovators, and distinguished guests! Welcome to **${eventName}**!

[Stage Cue: Sweep gaze across the auditorium audience]

Today we assemble to celebrate cutting-edge engineering, disruptive ideas, and high-impact stage demonstrations.

[Stage Cue: Signal AV team for opening video montage]

Without further ado, let us officially inaugurate this milestone stage flow!"`;
            break;

          case 'Transition Script':
            generated = `[Stage Cue: Step center stage, maintain high energy and warm posture]

"Thank you, everyone! A tremendous round of applause once again for that outstanding presentation.

[Stage Cue: Acknowledge previous session with open palm]

As we maintain our stage momentum here at ${eventName}, we are now transitioning directly into our next featured session.

[Stage Cue: Direct audience attention to the main stage screen]

Please ensure you are seated as we welcome our next participants to the floor!"`;
            break;

          case 'Closing Script':
            generated = `[Stage Cue: Stand tall center stage, warm reflective tone]

"What an extraordinary day of innovation, insights, and breakthrough collaboration here at **${eventName}**!

[Stage Cue: Acknowledge organizers, stage crew, and audience]

On behalf of the entire organizing committee and our AV teams, we extend our heartfelt gratitude for your energy and participation.

[Stage Cue: Deep respectful bow, lead final standing ovation]

Thank you, travel safely, and we look forward to seeing you at our next grand edition!"`;
            break;

          case 'Delay Announcement':
            generated = `[Stage Cue: Step center stage with calm, reassuring composure]

"Ladies and gentlemen, your attention for a brief administrative note:

[Stage Cue: Maintain reassuring eye contact with delegates]

We are currently taking a short 10-minute pause to finalize technical AV calibration. Please feel free to network and check out our demonstration booths in the foyer.

[Stage Cue: Conclude with warm smile]

We will resume our live stage program promptly in 10 minutes. Thank you for your patience!"`;
            break;

          case 'Emergency Announcement':
            generated = `[Stage Cue: Step forward calmly, maintain authoritative yet reassuring posture]

"Ladies and gentlemen, your attention please:

${customNotes || 'Please remain seated while we resolve a brief technical pause.'}

[Stage Cue: Pause for 3 seconds, nod respectfully]

We appreciate your cooperation as our operations team resumes our scheduled flow immediately."`;
            break;

          default:
            generated = `[Stage Cue: Stand center stage, address the room with clear projection]

"Welcome delegates to ${eventName}. We are proceeding with our scheduled stage rundown."`;
            break;
        }

        return {
          script: generated,
          scriptType,
          tone,
          wordCount: generated.split(/\s+/).length
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
  }
};
