let ioInstance = null;

export const initSocketService = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => ioInstance;

export const broadcastEventUpdated = (event) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting event_updated');
    ioInstance.emit('event_updated', event);
  }
};

export const broadcastAgendaUpdated = (agenda = null) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting agenda_updated');
    ioInstance.emit('agenda_updated', agenda);
  }
};

export const broadcastAgendaReordered = (newAgenda) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting agenda_reordered');
    ioInstance.emit('agenda_reordered', newAgenda);
  }
};

export const broadcastActivityStatusChanged = ({ allItems, targetId, status }) => {
  if (ioInstance) {
    console.log(`[Socket] Broadcasting activity_status_changed: ID ${targetId} -> ${status}`);
    ioInstance.emit('activity_status_changed', { allItems, targetId, status });
  }
};

export const broadcastDelayAdded = ({ event, agenda, minutes, targetActivityId, reason }) => {
  if (ioInstance) {
    console.log(`[Socket] Broadcasting delay_added: +${minutes}m at #${targetActivityId}`);
    ioInstance.emit('delay_added', { event, agenda, minutes, targetActivityId, reason });
  }
};

export const broadcastSpeakerUpdated = (speaker = null) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting speaker_updated');
    ioInstance.emit('speaker_updated', speaker);
  }
};

export const broadcastEmergencyAnnouncement = (newAnnouncement) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting emergency_announcement');
    ioInstance.emit('emergency_announcement', newAnnouncement);
  }
};

export const broadcastAnnouncementDismissed = ({ id }) => {
  if (ioInstance) {
    console.log(`[Socket] Broadcasting announcement_dismissed: ID ${id}`);
    ioInstance.emit('announcement_dismissed', { id });
  }
};

export const broadcastSystemReset = ({ event, agenda, speakers }) => {
  if (ioInstance) {
    console.log('[Socket] Broadcasting system_reset');
    ioInstance.emit('system_reset', { event, agenda, speakers });
  }
};
