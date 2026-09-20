import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  User,
  Sparkles,
  X,
  Search,
  Printer,
  FileText,
  MapPin,
  Calendar,
  LayoutList,
  GitCommit
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import ScriptWorkflowModal from '../components/ScriptWorkflowModal';
import { useToast } from '../components/ui/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getSpeakerAvatar } from '../utils/formatters';
import { api } from '../services/api';

export default function AgendaManager({
  agenda = [],
  speakers = [],
  event,
  onRefresh,
  onOpenDelay,
  onGenerateScript,
  onOpenTeleprompter
}) {
  const toast = useToast();
  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [transitionWorkflowIndex, setTransitionWorkflowIndex] = useState(null);
  const [isRunOfShowOpen, setIsRunOfShowOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    activity_type: 'Session',
    speaker_id: '',
    start_time: '10:00 AM',
    end_time: '10:45 AM',
    duration_minutes: 45,
    room: 'Main Stage',
    notes: '',
    status: 'UPCOMING'
  });

  const filteredAgenda = agenda.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.speaker_name && item.speaker_name.toLowerCase().includes(q)) ||
      item.activity_type.toLowerCase().includes(q) ||
      (item.room && item.room.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      activity_type: 'Session',
      speaker_id: '',
      start_time: '10:00 AM',
      end_time: '10:45 AM',
      duration_minutes: 45,
      room: 'Main Stage',
      notes: '',
      status: 'UPCOMING'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      activity_type: item.activity_type,
      speaker_id: item.speaker_id || '',
      start_time: item.start_time,
      end_time: item.end_time,
      duration_minutes: item.duration_minutes,
      room: item.room || 'Main Stage',
      notes: item.notes || '',
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      if (editingItem) {
        await api.updateAgendaItem(editingItem.id, formData);
        toast.success('Session updated successfully.');
      } else {
        await api.createAgendaItem(formData);
        toast.success('New session added to stage timeline.');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save session.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.deleteAgendaItem(confirmDeleteId);
      setConfirmDeleteId(null);
      toast.success('Session deleted from master timeline.');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session.');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      await api.createAgendaItem({
        title: `${item.title} (Copy)`,
        activity_type: item.activity_type,
        speaker_id: item.speaker_id || '',
        start_time: item.start_time,
        end_time: item.end_time,
        duration_minutes: item.duration_minutes,
        room: item.room || 'Main Stage',
        notes: item.notes || '',
        status: 'UPCOMING'
      });
      toast.success('Session duplicated successfully.');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate session.');
    }
  };

  const handleStatusCycle = async (id, currentStatus) => {
    const cycle = ['UPCOMING', 'LIVE', 'COMPLETED', 'DELAYED', 'SKIPPED'];
    const currentIdx = cycle.indexOf(currentStatus);
    const nextStatus = cycle[(currentIdx + 1) % cycle.length];

    try {
      await api.updateActivityStatus(id, nextStatus);
      if (nextStatus === 'LIVE') {
        toast.success('Session transitioned to LIVE NOW.');
      } else if (nextStatus === 'COMPLETED') {
        toast.success('Session marked COMPLETED.');
      } else {
        toast.info(`Session status updated to ${nextStatus}.`);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to advance session status.');
    }
  };

  const handleMove = async (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === agenda.length - 1)
    )
      return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...agenda];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const payload = newItems.map((it, idx) => ({
      id: it.id,
      order_index: idx + 1
    }));

    try {
      await api.reorderAgenda(payload);
      toast.info('Timeline session order updated.');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reorder timeline.');
    }
  };

  const activityTypes = [
    'Keynote',
    'Ceremony',
    'Tradition',
    'Workshop',
    'Briefing',
    'Panel',
    'Break',
    'Competition',
    'Closing',
    'Session'
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & GLOBAL ACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 soft-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Agenda & Stage Rundown
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Master chronological timeline, room routing, assigned dignitaries, and real-time status management
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRunOfShowOpen(true)}
            className="btn-pill-secondary text-xs flex items-center gap-2"
            title="Export / Print Stage Rundown Sheet"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Run-of-Show Sheet</span>
          </button>

          <button
            onClick={openCreateModal}
            className="btn-pill-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOOLBAR: SEARCH, FILTERS & VIEW TOGGLE
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 soft-card">
        {/* Left: Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search session title, speaker, room..."
            className="soft-input pl-9 text-xs"
          />
        </div>

        {/* Center: Status Filter Chips */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'LIVE', 'UPCOMING', 'COMPLETED', 'DELAYED', 'SKIPPED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right: View Mode Toggle (Timeline vs List) */}
        <div className="segmented-tabs-container w-full md:w-auto justify-end">
          <button
            onClick={() => setViewMode('timeline')}
            className={`segmented-tab-btn flex items-center gap-1.5 text-xs ${
              viewMode === 'timeline' ? 'active' : ''
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`segmented-tab-btn flex items-center gap-1.5 text-xs ${
              viewMode === 'list' ? 'active' : ''
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT: TIMELINE VIEW VS LIST VIEW
          ───────────────────────────────────────────────────────────── */}
      {filteredAgenda.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="NO SESSIONS SCHEDULED"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No agenda items match your current filter criteria.'
              : 'Add your first session to build the stage flow rundown and timeline.'
          }
          actionLabel="Add Session"
          onAction={openCreateModal}
        />
      ) : viewMode === 'timeline' ? (
        /* ═══════════════════════════════════════════════════════════
           A. TIMELINE VIEW
           ═══════════════════════════════════════════════════════════ */
        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {filteredAgenda.map((item, index) => {
            const isLive = item.status === 'LIVE';
            const isCompleted = item.status === 'COMPLETED';
            const isSkipped = item.status === 'SKIPPED';

            return (
              <div key={item.id} className="relative group">
                {/* Timeline connector node */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-6 w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                    isLive
                      ? 'bg-red-500 border-red-300 shadow-md ring-4 ring-red-100'
                      : isCompleted
                      ? 'bg-emerald-500 border-emerald-300'
                      : isSkipped
                      ? 'bg-slate-400 border-slate-300'
                      : 'bg-white border-slate-300'
                  }`}
                />

                {/* Session Card */}
                <div
                  className={`p-6 soft-card transition-all duration-200 ${
                    isLive
                      ? 'border-2 border-red-400 shadow-md shadow-red-500/5'
                      : isCompleted
                      ? 'opacity-85'
                      : isSkipped
                      ? 'opacity-60'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Timing badge, Title & Speaker Details */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                          {item.start_time} - {item.end_time}
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                          {item.duration_minutes}m
                        </span>

                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                          {item.activity_type}
                        </span>

                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.room || 'Main Stage'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{item.order_index}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                          {item.title}
                        </h3>
                      </div>

                      {/* Speaker detail tag */}
                      {item.speaker_name && (
                        <div className="flex items-center gap-3 pt-1">
                          <img
                            src={getSpeakerAvatar(item.speaker_name, item.speaker_avatar)}
                            alt={item.speaker_name}
                            className="w-8 h-8 rounded-xl object-cover flex-shrink-0 shadow-sm"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {item.speaker_name}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 truncate max-w-xs">
                            {item.speaker_org}
                          </span>
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: Status badge & Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleStatusCycle(item.id, item.status)}
                        title="Click to advance status"
                        className="transition active:scale-95"
                      >
                        <StatusBadge status={item.status} size="md" />
                      </button>

                      <button
                        onClick={() => setTransitionWorkflowIndex(index)}
                        className="p-2.5 rounded-full bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 transition shadow-sm"
                        title="Generate Session Transition Script"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(item)}
                        className="p-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition shadow-sm"
                        title="Duplicate Session"
                      >
                        <Copy className="w-4 h-4 text-slate-500" />
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-sm"
                        title="Edit Session Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Reorder Arrows */}
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-200">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === agenda.length - 1}
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-2.5 rounded-full bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition shadow-sm"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
            B. HIGH-DENSITY LIST / TABLE VIEW
            ═══════════════════════════════════════════════════════════ */
        <div className="p-6 soft-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Time</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Session Title</th>
                <th className="p-3.5">Speaker</th>
                <th className="p-3.5">Room</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAgenda.map((item, index) => {
                const isLive = item.status === 'LIVE';
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition ${
                      isLive ? 'bg-red-50/30 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono text-slate-400 font-bold">
                      {item.order_index}
                    </td>
                    <td className="p-3.5 font-mono whitespace-nowrap text-slate-900 font-bold">
                      {item.start_time} - {item.end_time}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{item.duration_minutes}m</td>
                    <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="p-3.5">
                      {item.speaker_name ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getSpeakerAvatar(item.speaker_name, item.speaker_avatar)}
                            alt={item.speaker_name}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                          <span className="truncate max-w-[140px] text-slate-800 font-medium">{item.speaker_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">{item.room || 'Main Stage'}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {item.activity_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button onClick={() => handleStatusCycle(item.id, item.status)}>
                        <StatusBadge status={item.status} size="sm" />
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setTransitionWorkflowIndex(index)}
                          className="p-1.5 rounded-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          title="Generate Transition Script"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. ADD / EDIT SESSION MODAL
          ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Stage Session' : 'Add New Stage Session'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="soft-label">Session Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Keynote: Future of Quantum Computing"
                  className="soft-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="soft-label">Activity Type</label>
                  <select
                    value={formData.activity_type}
                    onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    className="soft-select"
                  >
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="soft-label">Assigned Speaker</label>
                  <select
                    value={formData.speaker_id}
                    onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
                    className="soft-select"
                  >
                    <option value="">-- No Speaker / Emcee Led --</option>
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.organization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="soft-label">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="10:00 AM"
                    className="soft-input font-mono"
                  />
                </div>

                <div>
                  <label className="soft-label">End Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="10:45 AM"
                    className="soft-input font-mono"
                  />
                </div>

                <div>
                  <label className="soft-label">Duration (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="soft-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="soft-label">Room / Stage Location</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Main Stage / Auditorium A"
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="soft-select"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="SKIPPED">Skipped</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="soft-label">Anchor Cues & AV Instructions</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Prepare handheld mic #2; queue introductory slide deck on main screen."
                  className="soft-input resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill-primary text-xs"
                >
                  {loading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. RUN-OF-SHOW MASTER RUNDOWN SHEET MODAL
          ───────────────────────────────────────────────────────────── */}
      {isRunOfShowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stage Run-of-Show Rundown Sheet</h3>
                  <p className="text-xs text-slate-500">Printable master schedule for emcees, AV teams, and stage technicians</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-pill-primary text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setIsRunOfShowOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs space-y-4">
              <table className="w-full text-left border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Time</th>
                    <th className="p-3.5">Dur</th>
                    <th className="p-3.5">Session & Speaker</th>
                    <th className="p-3.5">Room</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {agenda.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-indigo-700">{item.order_index}</td>
                      <td className="p-3.5 whitespace-nowrap text-slate-900 font-bold">{item.start_time} - {item.end_time}</td>
                      <td className="p-3.5">{item.duration_minutes}m</td>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        {item.speaker_name && (
                          <div className="text-indigo-700 text-[11px] font-medium">
                            Speaker: {item.speaker_name} ({item.speaker_org})
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-slate-500 text-[10px] italic mt-0.5">
                            Note: {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-sans text-slate-600">{item.room || 'Main Stage'}</td>
                      <td className="p-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SESSION TRANSITION SCRIPT WORKFLOW MODAL
          ───────────────────────────────────────────────────────────── */}
      {transitionWorkflowIndex !== null && (
        <ScriptWorkflowModal
          isOpen={transitionWorkflowIndex !== null}
          onClose={() => setTransitionWorkflowIndex(null)}
          workflowType="transition"
          event={event}
          previousSession={transitionWorkflowIndex > 0 ? filteredAgenda[transitionWorkflowIndex - 1] : null}
          currentSession={filteredAgenda[transitionWorkflowIndex]}
          nextSession={
            transitionWorkflowIndex < filteredAgenda.length - 1
              ? filteredAgenda[transitionWorkflowIndex + 1]
              : null
          }
          onOpenTeleprompter={onOpenTeleprompter}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. CONFIRM DELETE DIALOG
          ───────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Agenda Session"
        message="Are you sure you want to delete this session? This action will permanently remove it from the master stage timeline."
        confirmLabel="Delete Session"
        isDestructive={true}
      />
    </div>
  );
}
