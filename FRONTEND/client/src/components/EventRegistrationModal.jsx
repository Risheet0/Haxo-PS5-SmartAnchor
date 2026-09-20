import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Ticket,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Share2,
  Download,
  Asterisk
} from 'lucide-react';
import { api } from '../services/api';
import { DEFAULT_REGISTRATION_FIELDS } from '../services/mockData';
import { useToast } from './ui/ToastContext';

export default function EventRegistrationModal({
  event,
  isOpen,
  onClose,
  onRegistrationSuccess,
  currentUser = null
}) {
  const toast = useToast();
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [registeredPass, setRegisteredPass] = useState(null);

  useEffect(() => {
    if (isOpen && event) {
      setRegisteredPass(null);
      setFieldErrors({});
      loadSchema();
    }
  }, [isOpen, event]);

  const loadSchema = async () => {
    try {
      setLoadingSchema(true);
      const config = await api.getRegistrationForm(event?.id || 1);
      setFormConfig(config);

      // Pre-fill user data if available
      const initial = {};
      const fields = config?.fields || DEFAULT_REGISTRATION_FIELDS;
      fields.forEach((f) => {
        if (f.id === 'full_name' || f.id === 'name') {
          initial[f.id] = currentUser?.name || '';
        } else if (f.id === 'email') {
          initial[f.id] = currentUser?.email || '';
        } else {
          initial[f.id] = '';
        }
      });
      setFormData(initial);
    } catch (err) {
      console.warn('Failed to load form schema:', err);
    } finally {
      setLoadingSchema(false);
    }
  };

  if (!isOpen || !event) return null;

  const handleInputChange = (fieldId, val) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmitCustomForm = async (e) => {
    e.preventDefault();
    const fields = formConfig?.fields || DEFAULT_REGISTRATION_FIELDS;
    const errors = {};

    // Validate mandatory fields
    fields.forEach((f) => {
      if (f.required) {
        const val = formData[f.id];
        if (!val || String(val).trim() === '') {
          errors[f.id] = `${f.label} is required`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.warning('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitEventRegistration(event.id || 1, {
        ...formData,
        eventId: event.id,
        eventTitle: event.title
      });

      setRegisteredPass(res);
      toast.success('Registration confirmed! Pass generated.');
      if (onRegistrationSuccess) {
        onRegistrationSuccess(event.id, res);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleFormComplete = () => {
    const dummyPass = {
      registration_code: `GF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      user_name: currentUser?.name || 'Attendee',
      user_email: currentUser?.email || '',
      registered_at: new Date().toISOString()
    };
    setRegisteredPass(dummyPass);
    toast.success('Google Form registration marked as confirmed.');
    if (onRegistrationSuccess) {
      onRegistrationSuccess(event.id, dummyPass);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Ticket className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                EVENT REGISTRATION
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {event.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Event Metadata Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-700">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.organizer || event.institution}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.venue || event.location}, {event.city}</span>
            </div>
          </div>

          {loadingSchema ? (
            <div className="py-12 text-center font-mono text-xs text-slate-500">
              Loading event registration details...
            </div>
          ) : registeredPass ? (
            /* ─────────────────────────────────────────────────────────────
                SUCCESS CONFIRMATION: DIGITAL EVENT PASS
                ───────────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  You're Registered!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your registration is confirmed. Present your pass code at the registration desk.
                </p>
              </div>

              {/* Digital Event Pass Ticket */}
              <div className="p-6 rounded-3xl bg-slate-950 text-white font-mono text-left space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest block">
                      VERIFIED ATTENDEE PASS
                    </span>
                    <span className="text-sm font-bold text-white font-sans">{event.title}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">ATTENDEE</span>
                    <span className="font-bold text-slate-200">
                      {registeredPass.user_name || formData.full_name || 'Participant'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">PASS CODE</span>
                    <span className="font-bold text-amber-400 tracking-wider">
                      {registeredPass.registration_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">DATE &amp; VENUE</span>
                    <span className="text-slate-300">
                      {event.date} • {event.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">REGISTERED AT</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(registeredPass.registered_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex gap-1 h-6 items-center opacity-70">
                    <span className="w-1 h-full bg-white" />
                    <span className="w-0.5 h-full bg-white" />
                    <span className="w-1.5 h-full bg-white" />
                    <span className="w-0.5 h-full bg-white" />
                    <span className="w-1 h-full bg-white" />
                    <span className="w-2 h-full bg-white" />
                    <span className="w-0.5 h-full bg-white" />
                    <span className="w-1 h-full bg-white" />
                    <span className="w-1.5 h-full bg-white" />
                    <span className="w-0.5 h-full bg-white" />
                    <span className="w-1 h-full bg-white" />
                    <span className="w-2 h-full bg-white" />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    SMART ANCHOR SECURE PASS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  Done &amp; Return to My Events
                </button>
              </div>
            </div>
          ) : formConfig?.form_mode === 'google_form' ? (
            /* ─────────────────────────────────────────────────────────────
                GOOGLE FORM MODE VIEW
                ───────────────────────────────────────────────────────────── */
            <div className="space-y-6 font-mono text-center">
              <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-950 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <ExternalLink className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold">
                  Organizer Registration via Google Forms
                </h4>
                <p className="text-xs text-indigo-800/80 leading-relaxed font-sans max-w-md mx-auto">
                  The host of <strong>{event.title}</strong> has configured registration via Google Forms. Click the button below to open and submit your details.
                </p>

                {formConfig?.google_form_url ? (
                  <div className="pt-2">
                    <a
                      href={formConfig.google_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm"
                    >
                      <span>Open Official Google Form</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700">
                    (Organizer link pending. You can still confirm your spot below.)
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <span className="font-bold text-slate-800 block">
                  Completed the Google Form?
                </span>
                <p className="text-slate-500 font-sans text-xs">
                  Click below to confirm your registration and add this event to your "My Events" schedule.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleFormComplete}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs"
                >
                  I Have Submitted — Confirm Registration
                </button>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                CUSTOM INTAKE FORM MODE VIEW
                ───────────────────────────────────────────────────────────── */
            <form onSubmit={handleSubmitCustomForm} className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight">
                    Attendee Information
                  </h4>
                  <p className="text-xs text-slate-500">
                    Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory for entry.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {formConfig?.fields?.length || DEFAULT_REGISTRATION_FIELDS.length} Questions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formConfig?.fields || DEFAULT_REGISTRATION_FIELDS).map((field) => {
                  const hasError = Boolean(fieldErrors[field.id]);
                  const isFullWidth = field.type === 'textarea' || field.id === 'dietary_notes';

                  return (
                    <div
                      key={field.id}
                      className={isFullWidth ? 'sm:col-span-2 space-y-1' : 'space-y-1'}
                    >
                      <label className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700">
                        <span>{field.label}</span>
                        {field.required && (
                          <span className="text-red-500 font-bold" title="Mandatory Field">
                            *
                          </span>
                        )}
                        {!field.required && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Optional)
                          </span>
                        )}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono resize-none transition bg-slate-50 focus:bg-white focus:outline-none ${
                            hasError
                              ? 'border-red-500 focus:border-red-600 ring-1 ring-red-200'
                              : 'border-slate-200 focus:border-slate-950'
                          }`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono transition bg-slate-50 focus:bg-white focus:outline-none ${
                            hasError
                              ? 'border-red-500 focus:border-red-600 ring-1 ring-red-200'
                              : 'border-slate-200 focus:border-slate-950'
                          }`}
                        >
                          <option value="">-- Select {field.label} --</option>
                          {(field.options || [
                            '1st Year',
                            '2nd Year',
                            '3rd Year',
                            '4th Year / Final',
                            'Postgraduate / PhD',
                            'Working Professional'
                          ]).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono transition bg-slate-50 focus:bg-white focus:outline-none ${
                            hasError
                              ? 'border-red-500 focus:border-red-600 ring-1 ring-red-200'
                              : 'border-slate-200 focus:border-slate-950'
                          }`}
                        />
                      )}

                      {hasError && (
                        <p className="text-[11px] font-mono text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors[field.id]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-500">
                  By registering, you agree to event attendance guidelines.
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <Ticket className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
