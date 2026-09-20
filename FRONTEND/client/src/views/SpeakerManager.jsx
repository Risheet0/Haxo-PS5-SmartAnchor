import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  User,
  Building,
  X,
  Search,
  Tv,
  Volume2,
  Copy,
  Check,
  Eye,
  Mail,
  CheckCircle2,
  RefreshCw,
  Shield,
  AlertTriangle
} from 'lucide-react';
import ScriptWorkflowModal from '../components/ScriptWorkflowModal';
import { useToast } from '../components/ui/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import OtpInput from '../components/auth/OtpInput';
import OtpTimer from '../components/auth/OtpTimer';
import { getSpeakerAvatar, parseStageScript } from '../utils/formatters';
import { api } from '../services/api';

export default function SpeakerManager({
  speakers = [],
  agenda = [],
  event,
  onRefresh,
  onGenerateScript,
  onOpenTeleprompter
}) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [viewingSpeaker, setViewingSpeaker] = useState(null);
  const [workflowSpeaker, setWorkflowSpeaker] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detail Modal Script State
  const [introScript, setIntroScript] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Email & Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Manager Email Success & Retry State
  const [createdSuccessResult, setCreatedSuccessResult] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    organization: '',
    bio: '',
    topic: '',
    avatar_url: '',
    social_url: ''
  });

  const getSpeakerSession = (speakerId) => {
    return agenda.find((a) => a.speaker_id === speakerId) || null;
  };

  const getSpeakerStatus = (speakerId) => {
    const session = getSpeakerSession(speakerId);
    if (!session) return 'READY';
    if (session.status === 'LIVE') return 'ON STAGE';
    if (session.status === 'COMPLETED') return 'COMPLETED';
    if (session.status === 'DELAYED') return 'DELAYED';
    return 'UPCOMING';
  };

  const filteredSpeakers = speakers.filter((speaker) => {
    const session = getSpeakerSession(speaker.id);
    const speakerStatus = getSpeakerStatus(speaker.id);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ON STAGE' && speakerStatus === 'ON STAGE') ||
      (statusFilter === 'READY' && (speakerStatus === 'READY' || speakerStatus === 'UPCOMING')) ||
      (statusFilter === 'COMPLETED' && speakerStatus === 'COMPLETED') ||
      (statusFilter === 'DELAYED' && speakerStatus === 'DELAYED');

    const matchesSession =
      sessionFilter === 'ALL' || (session && String(session.id) === String(sessionFilter));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      speaker.name.toLowerCase().includes(q) ||
      speaker.designation.toLowerCase().includes(q) ||
      speaker.organization.toLowerCase().includes(q) ||
      (speaker.topic && speaker.topic.toLowerCase().includes(q)) ||
      (session && session.title.toLowerCase().includes(q));

    return matchesStatus && matchesSession && matchesSearch;
  });

  const isValidEmailFormat = (email) => {
    if (!email || !email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, email: val }));
    setEmailError('');
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setOtpValue('');
    }
  };

  const handleSendSpeakerOtp = async () => {
    if (!formData.email || !formData.email.trim()) {
      setEmailError('Email ID is required.');
      return;
    }
    if (!isValidEmailFormat(formData.email)) {
      setEmailError('Please enter a valid email address (e.g. speaker@example.com).');
      return;
    }
    setEmailError('');
    setSendingOtp(true);
    try {
      const res = await api.sendSpeakerOtp(formData.email.trim());
      if (res.success || res.message) {
        setOtpSent(true);
        setOtpValue('');
        setOtpError('');
        toast.success(`Verification code sent to ${formData.email.trim()}`);
      } else {
        setEmailError(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      setEmailError(err.message || 'Failed to send OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifySpeakerOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpError('');
    setVerifyingOtp(true);
    try {
      const res = await api.verifySpeakerOtp(formData.email.trim(), otpValue);
      if (res.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        toast.success('Speaker email verified successfully!');
      } else {
        setOtpError(res.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setOtpError(err.message || 'Failed to verify OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const openCreateModal = () => {
    setEditingSpeaker(null);
    setCreatedSuccessResult(null);
    setFormData({
      name: '',
      email: '',
      designation: '',
      organization: '',
      bio: '',
      topic: '',
      avatar_url: '',
      social_url: ''
    });
    setIsEmailVerified(false);
    setOtpSent(false);
    setOtpValue('');
    setEmailError('');
    setOtpError('');
    setIsModalOpen(true);
  };

  const openEditModal = (speaker) => {
    setEditingSpeaker(speaker);
    setCreatedSuccessResult(null);
    setFormData({
      name: speaker.name,
      email: speaker.email || '',
      designation: speaker.designation,
      organization: speaker.organization,
      bio: speaker.bio || '',
      topic: speaker.topic || '',
      avatar_url: speaker.avatar_url || '',
      social_url: speaker.social_url || ''
    });
    setIsEmailVerified(true);
    setOtpSent(false);
    setOtpValue('');
    setEmailError('');
    setOtpError('');
    setIsModalOpen(true);
  };

  const openViewDrawer = async (speaker) => {
    setViewingSpeaker(speaker);
    setCopied(false);
    setIsSpeaking(false);

    const session = getSpeakerSession(speaker.id);
    const defaultIntro = `[Stage Cue: Stand center stage, smile warmly, look directly at audience]

"A very warm welcome, delegates and guests! It is our distinct honor to welcome **${speaker.name}** to the stage.

[Stage Cue: Acknowledge the speaker with an open hand gesture]

Serving as **${speaker.designation}** at **${speaker.organization}**, today's session will explore:
*${speaker.topic || session?.title || 'Keynote Presentation'}*.

[Stage Cue: Lead the audience with applause]

Please give an enthusiastic round of applause for **${speaker.name}**!"`;

    setIntroScript(defaultIntro);
  };

  const handleRegenerateIntro = async () => {
    if (!viewingSpeaker) return;
    setGeneratingScript(true);
    const session = getSpeakerSession(viewingSpeaker.id);

    try {
      const res = await api.generateScript({
        scriptType: 'Speaker Introduction',
        speakerId: viewingSpeaker.id,
        currentActivityId: session?.id,
        tone: 'Professional',
        customNotes: viewingSpeaker.bio || ''
      });
      setIntroScript(res.script);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleCopyIntro = () => {
    navigator.clipboard.writeText(introScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const vocalLines = (introScript || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !(line.startsWith('[') && line.endsWith(']')))
      .join(' ')
      .replace(/[*_#"]/g, '');

    if (!vocalLines) return;
    const utterance = new SpeechSynthesisUtterance(vocalLines);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Protect against double click / duplicate submission
    if (!formData.name.trim() || !formData.designation.trim() || !formData.organization.trim())
      return;

    if (!formData.email || !isValidEmailFormat(formData.email)) {
      setEmailError('Valid Email ID is required.');
      return;
    }

    if (!isEmailVerified && !editingSpeaker) {
      setEmailError('Please verify speaker email address before creating speaker.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        email_verified: isEmailVerified ? 1 : 0
      };
      if (editingSpeaker) {
        await api.updateSpeaker(editingSpeaker.id, payload);
        toast.success('Speaker profile updated successfully.');
        setIsModalOpen(false);
        onRefresh();
      } else {
        const res = await api.createSpeaker(payload);
        toast.success('Speaker registered successfully.');
        setCreatedSuccessResult({
          speaker: res,
          emailSent: res.emailSent !== false,
          managerEmail: res.managerEmail || 'your registered Manager email'
        });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save speaker profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryManagerEmail = async () => {
    if (!createdSuccessResult?.speaker?.id) return;
    setResendingEmail(true);
    try {
      const res = await api.resendManagerEmail(createdSuccessResult.speaker.id);
      if (res.success || res.message) {
        toast.success(`Notification email delivered to ${res.managerEmail || 'Manager email'}`);
        setCreatedSuccessResult((prev) => ({
          ...prev,
          emailSent: true,
          managerEmail: res.managerEmail || prev?.managerEmail
        }));
      } else {
        toast.error('Failed to send notification email. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to resend email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.deleteSpeaker(confirmDeleteId);
      if (viewingSpeaker?.id === confirmDeleteId) setViewingSpeaker(null);
      setConfirmDeleteId(null);
      toast.success('Speaker profile deleted.');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete speaker.');
    }
  };

  const readyCount = speakers.filter((s) => {
    const st = getSpeakerStatus(s.id);
    return st === 'READY' || st === 'UPCOMING';
  }).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & SPEAKER METRICS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 soft-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Speaker & Dignitary Directory
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Maintain keynote dignitary profiles, linked stage sessions, biographical dossiers, and AI intro scripts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold">
            <span className="text-slate-700 font-bold">{speakers.length} Speakers</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">{readyCount} Ready</span>
          </div>

          <button
            onClick={openCreateModal}
            className="btn-pill-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Speaker / Guest</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOOLBAR: SEARCH, STATUS FILTERS & SESSION FILTER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 soft-card">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search speaker, organization, topic..."
            className="soft-input pl-9 text-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {['ALL', 'ON STAGE', 'READY', 'UPCOMING', 'COMPLETED', 'DELAYED'].map((filter) => (
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

        {/* Session Selector Dropdown */}
        <div className="w-full lg:w-64">
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="soft-select text-xs"
          >
            <option value="ALL">All Agenda Sessions</option>
            {agenda.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.order_index} {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SPEAKER DIRECTORY GRID
          ───────────────────────────────────────────────────────────── */}
      {filteredSpeakers.length === 0 ? (
        <EmptyState
          icon={User}
          title="NO SPEAKERS YET"
          description="Add your first speaker or dignitary to generate introductions, bios, and stage teleprompter cues."
          actionLabel="Add Speaker"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map((speaker) => {
            const session = getSpeakerSession(speaker.id);
            const speakerStatus = getSpeakerStatus(speaker.id);
            const isOnStage = speakerStatus === 'ON STAGE';

            return (
              <div
                key={speaker.id}
                className={`p-6 soft-card flex flex-col justify-between relative group transition-all duration-200 ${
                  isOnStage
                    ? 'border-2 border-red-400 shadow-lg shadow-red-500/5'
                    : 'hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Profile Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={getSpeakerAvatar(speaker.name, speaker.avatar_url)}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-sm flex-shrink-0"
                      />
                      {isOnStage && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                      )}
                    </div>

                    {/* Status Pill & Quick Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isOnStage
                            ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                            : speakerStatus === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : speakerStatus === 'DELAYED'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {speakerStatus}
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openViewDrawer(speaker)}
                          className="p-1.5 rounded-full bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                          title="View Full Profile & Intro Script"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(speaker)}
                          className="p-1.5 rounded-full bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                          title="Edit Speaker Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(speaker.id)}
                          className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-600 border border-slate-200 hover:bg-red-50"
                          title="Delete Speaker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Speaker Identity */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                    {speaker.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                    {speaker.designation}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                    <Building className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span>{speaker.organization}</span>
                  </p>

                  {/* Linked Stage Session Tag */}
                  {session ? (
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="font-bold uppercase text-indigo-700">
                          Session #{session.order_index}
                        </span>
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 line-clamp-1">{session.title}</p>
                    </div>
                  ) : (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 italic">
                      Unassigned to agenda session
                    </div>
                  )}

                  {/* Keynote Topic */}
                  {speaker.topic && (
                    <p className="mt-2.5 text-xs text-slate-600 italic line-clamp-2">
                      Topic: "{speaker.topic}"
                    </p>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => openViewDrawer(speaker)}
                    className="btn-pill-secondary text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => setWorkflowSpeaker(speaker)}
                    className="btn-pill-accent text-xs flex items-center justify-center gap-1.5"
                    title="Generate Speaker Introduction with AI Context"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Intro</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SPEAKER PROFILE & SCRIPT DRAWER / MODAL
          ───────────────────────────────────────────────────────────── */}
      {viewingSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={getSpeakerAvatar(viewingSpeaker.name, viewingSpeaker.avatar_url)}
                  alt={viewingSpeaker.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {viewingSpeaker.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingSpeaker.designation} • {viewingSpeaker.organization}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const sp = viewingSpeaker;
                    setViewingSpeaker(null);
                    openEditModal(sp);
                  }}
                  className="btn-pill-secondary text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  Edit
                </button>

                <button
                  onClick={() => setViewingSpeaker(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Linked Session Info */}
              {(() => {
                const session = getSpeakerSession(viewingSpeaker.id);
                return session ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                        Assigned Session
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{session.title}</span>
                    </div>
                    <div className="text-right font-mono text-slate-500">
                      <span className="block font-bold text-slate-800">
                        {session.start_time} - {session.end_time}
                      </span>
                      <span className="text-[10px]">{session.room || 'Main Stage'}</span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Bio & Topic */}
              <div className="space-y-3">
                {viewingSpeaker.topic && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Keynote / Session Topic
                    </span>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      "{viewingSpeaker.topic}"
                    </p>
                  </div>
                )}

                {viewingSpeaker.bio && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Biographical Dossier
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {viewingSpeaker.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Stage Introduction Teleprompter Script */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Stage Introduction Script</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRegenerateIntro}
                      disabled={generatingScript}
                      className="p-2 rounded-full bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 text-xs font-bold transition shadow-sm"
                      title="Regenerate with AI"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${generatingScript ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={handleCopyIntro}
                      className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition"
                      title="Copy Script"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleToggleVoice}
                      className={`p-2 rounded-full border text-xs font-bold transition ${
                        isSpeaking
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Voice Rehearsal"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenTeleprompter && onOpenTeleprompter(introScript)}
                      className="btn-pill-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Teleprompter</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed max-h-56 overflow-y-auto pr-1">
                  {parseStageScript(introScript).map((line, idx) => {
                    if (line.type === 'cue') {
                      return (
                        <div
                          key={idx}
                          className="my-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider inline-block"
                        >
                          ⚡ {line.content}
                        </div>
                      );
                    }
                    if (line.type === 'empty') return <div key={idx} className="h-1" />;
                    return (
                      <p key={idx} className="text-slate-800">
                        {line.content}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. ADD / EDIT SPEAKER MODAL
          ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            
            {/* ── SUCCESS RESULT SCREEN ── */}
            {createdSuccessResult ? (
              createdSuccessResult.emailSent ? (
                <div className="p-8 text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                      ✓ Speaker Created Successfully
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      The speaker has been added successfully.
                    </p>
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1 my-3 text-left">
                      <div className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span>Manager Email Dispatch:</span>
                      </div>
                      <p className="text-slate-700 pt-0.5">
                        Login information has been sent to your registered Manager email:
                      </p>
                      <div className="font-mono font-bold text-indigo-700 text-xs pt-1">
                        {createdSuccessResult.managerEmail}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Existing Manager Login Notice</span>
                    </div>
                    <div>• No new Manager account was created.</div>
                    <div>• Use your existing Manager username and password.</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSuccessResult(null);
                      setIsModalOpen(false);
                      onRefresh();
                    }}
                    className="w-full btn-pill-primary text-xs py-3 font-bold uppercase tracking-wider shadow-md"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ── EMAIL DELIVERY FAILED SCREEN ── */
                <div className="p-8 text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangle className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-950">
                      Speaker Created (Email Delivery Failed)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed max-w-md mx-auto font-medium">
                      Speaker created successfully, but the notification email could not be sent.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 font-mono">
                    <div>Note: Retrying email will ONLY resend the notification to {createdSuccessResult.managerEmail} and will NOT create duplicate speaker records.</div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedSuccessResult(null);
                        setIsModalOpen(false);
                        onRefresh();
                      }}
                      className="w-1/2 btn-pill-secondary text-xs py-3 font-bold"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={handleRetryManagerEmail}
                      disabled={resendingEmail}
                      className="w-1/2 btn-pill-primary text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      {resendingEmail ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Retrying Email...</span>
                        </>
                      ) : (
                        <span>Retry Email</span>
                      )}
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* ── NORMAL FORM ── */
              <>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      {editingSpeaker ? 'Edit Speaker Profile' : 'Add New Dignitary / Speaker'}
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
                    <label className="soft-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Rajeshwari Menon"
                      className="soft-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="soft-label">Designation / Role *</label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. VP of Research & AI"
                        className="soft-input"
                      />
                    </div>

                    <div>
                      <label className="soft-label">Organization *</label>
                      <input
                        type="text"
                        required
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="e.g. DeepMind"
                        className="soft-input"
                      />
                    </div>
                  </div>

                  {/* Email ID & Email Verification OTP Flow */}
                  <div>
                    <label className="soft-label flex items-center justify-between">
                      <span>Email ID *</span>
                      {isEmailVerified && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleEmailChange}
                        disabled={isEmailVerified || otpSent}
                        placeholder="e.g. speaker@example.com"
                        className={`soft-input pr-28 ${emailError ? 'border-red-400 bg-red-50/20' : ''}`}
                      />
                      {!isEmailVerified && !otpSent && (
                        <button
                          type="button"
                          onClick={handleSendSpeakerOtp}
                          disabled={sendingOtp || !isValidEmailFormat(formData.email)}
                          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          {sendingOtp ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Verify Email</span>
                          )}
                        </button>
                      )}
                      {isEmailVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailVerified(false);
                            setOtpSent(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-indigo-600 underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {emailError && <p className="text-xs text-red-500 font-semibold mt-1">{emailError}</p>}
                  </div>

                  {/* Inline OTP Verification Card */}
                  {otpSent && !isEmailVerified && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Enter 6-digit OTP sent to <span className="text-indigo-700 font-semibold">{formData.email}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                        >
                          Change Email
                        </button>
                      </div>

                      <OtpInput
                        value={otpValue}
                        onChange={setOtpValue}
                        hasError={Boolean(otpError)}
                      />

                      {otpError && <p className="text-xs text-red-500 font-semibold text-center">{otpError}</p>}

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <OtpTimer initialSeconds={60} onResend={handleSendSpeakerOtp} isResending={sendingOtp} />

                        <button
                          type="button"
                          onClick={handleVerifySpeakerOtp}
                          disabled={verifyingOtp || otpValue.length !== 6}
                          className="btn-pill-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
                        >
                          {verifyingOtp ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <span>Verify Code</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="soft-label">Keynote / Session Topic</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g. Autonomous Real-Time Multi-Agent Architectures"
                      className="soft-input"
                    />
                  </div>

                  <div>
                    <label className="soft-label">Photo / Avatar URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="Leave blank for automatic stylized avatar"
                      className="soft-input"
                    />
                  </div>

                  <div>
                    <label className="soft-label">Biographical Context (for Anchor Cues)</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Notable achievements, career highlights, book authorship, key talking points..."
                      className="soft-input resize-none"
                    />
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100">
                    {!editingSpeaker && !isEmailVerified ? (
                      <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                        ⚠️ Verify speaker email to enable creation
                      </span>
                    ) : <span />}

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="btn-pill-secondary text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || (!editingSpeaker && !isEmailVerified)}
                        className="btn-pill-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Speaker...</span>
                          </>
                        ) : editingSpeaker ? (
                          'Save Profile'
                        ) : (
                          'Create Speaker'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SCRIPT WORKFLOW MODAL
          ───────────────────────────────────────────────────────────── */}
      {workflowSpeaker && (
        <ScriptWorkflowModal
          isOpen={Boolean(workflowSpeaker)}
          onClose={() => setWorkflowSpeaker(null)}
          workflowType="speaker-intro"
          event={event}
          speaker={workflowSpeaker}
          currentSession={getSpeakerSession(workflowSpeaker.id)}
          onOpenTeleprompter={onOpenTeleprompter}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CONFIRM DELETE DIALOG
          ───────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Speaker Profile"
        message="Are you sure you want to remove this dignitary profile from the event directory? Any linked agenda session will have speaker unassigned."
        confirmLabel="Delete Speaker"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
