import React, { useState, useEffect } from 'react';
import {
  FileText,
  Link,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  Check,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Asterisk,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { DEFAULT_REGISTRATION_FIELDS } from '../services/mockData';
import { useToast } from './ui/ToastContext';

export default function RegistrationFormBuilder({ eventId = 1, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formMode, setFormMode] = useState('custom_form'); // 'custom_form' | 'google_form'
  const [googleFormUrl, setGoogleFormUrl] = useState('');
  const [fields, setFields] = useState(DEFAULT_REGISTRATION_FIELDS);
  const [previewMode, setPreviewMode] = useState(false);

  // New custom field modal/input state
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadFormConfig();
  }, [eventId]);

  const loadFormConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getRegistrationForm(eventId);
      if (data) {
        setFormMode(data.form_mode || 'custom_form');
        setGoogleFormUrl(data.google_form_url || '');
        if (data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
          setFields(data.fields);
        }
      }
    } catch (err) {
      console.warn('Failed to load registration form config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRequired = (id) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleRemoveField = (id) => {
    if (fields.length <= 1) {
      toast.warning('Form must have at least one field.');
      return;
    }
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) {
      toast.warning('Please enter a question / field label.');
      return;
    }

    const fieldId = 'custom_' + Date.now();
    const optionsArray =
      newFieldType === 'select'
        ? newFieldOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    const newField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options: optionsArray
    };

    setFields((prev) => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    setShowAddModal(false);
    toast.success(`Added question: "${newField.label}"`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (formMode === 'google_form' && !googleFormUrl.trim()) {
        toast.warning('Please enter a valid Google Form URL.');
        return;
      }

      await api.saveRegistrationForm(eventId, {
        form_mode: formMode,
        google_form_url: googleFormUrl.trim(),
        fields
      });

      toast.success('Registration form settings saved successfully.');
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Failed to save registration form:', err);
      toast.error('Failed to save form settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        Loading form configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & FORM MODE SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
                Event Registration &amp; Attendee Intake Form
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Configure how participants sign up for your event. Use an in-app dynamic form with mandatory field rules or attach an external Google Form.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode ? 'Edit Builder' : 'Live Preview'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Form Settings'}</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFormMode('custom_form')}
            className={`p-4 rounded-2xl border text-left transition ${
              formMode === 'custom_form'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Custom In-App Registration Form</span>
              {formMode === 'custom_form' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className={`text-xs ${formMode === 'custom_form' ? 'text-slate-300' : 'text-slate-500'}`}>
              Collect Name, College, Field, Mobile, and custom questions directly on SASM with required/optional validation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormMode('google_form')}
            className={`p-4 rounded-2xl border text-left transition ${
              formMode === 'google_form'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Google Form / External Link</span>
              {formMode === 'google_form' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className={`text-xs ${formMode === 'google_form' ? 'text-slate-300' : 'text-slate-500'}`}>
              Provide your Google Form link. Attendees will be redirected or view your Google Form when they click to join.
            </p>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. GOOGLE FORM URL MODE VIEW
          ───────────────────────────────────────────────────────────── */}
      {formMode === 'google_form' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Link className="w-4 h-4 text-indigo-600" />
            <span>Google Form Integration Link</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-600 font-bold block">
              Google Form URL / Link:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={googleFormUrl}
                onChange={(e) => setGoogleFormUrl(e.target.value)}
                placeholder="https://forms.gle/your-google-form-id or https://docs.google.com/forms/..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-950 bg-slate-50"
              />
              {googleFormUrl && (
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Tip: Paste the short URL from Google Forms (e.g. <code>https://forms.gle/...</code>) or the full form URL.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CUSTOM FORM BUILDER VIEW
          ───────────────────────────────────────────────────────────── */}
      {formMode === 'custom_form' && !previewMode && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-950 uppercase tracking-wider font-mono">
                Intake Questions &amp; Mandatory Rules ({fields.length} Fields)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle <span className="font-bold text-red-600">Required</span> to force attendees to enter data before registration confirmation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Question</span>
            </button>
          </div>

          {/* Fields List */}
          <div className="space-y-3 font-mono">
            {fields.map((field, idx) => (
              <div
                key={field.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-950 font-sans">
                        {field.label}
                      </span>
                      {field.required ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                          <Asterisk className="w-2.5 h-2.5" />
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Optional
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 uppercase">
                        {field.type}
                      </span>
                    </div>

                    {field.placeholder && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Placeholder: "{field.placeholder}"
                      </p>
                    )}
                    {field.options && field.options.length > 0 && (
                      <p className="text-[11px] text-indigo-600 mt-1 truncate">
                        Options: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleRequired(field.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      field.required
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {field.required ? '★ Required' : '☆ Optional'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. LIVE ATTENDEE FORM PREVIEW
          ───────────────────────────────────────────────────────────── */}
      {formMode === 'custom_form' && previewMode && (
        <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                LIVE ATTENDEE PREVIEW
              </span>
              <h4 className="text-xl font-bold text-white mt-1">
                Event Registration Form
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
            >
              Close Preview
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.id} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    disabled
                    placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 resize-none h-20"
                  />
                ) : f.type === 'select' ? (
                  <select
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
                  >
                    <option>Select {f.label}...</option>
                    {(f.options || []).map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    disabled
                    placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <div className="px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs">
              Submit &amp; Confirm Registration (Preview Mode)
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. ADD CUSTOM QUESTION MODAL
          ───────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-950">
                Add Custom Intake Question
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Question / Field Label: *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. GitHub Profile URL or Team Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Input Type:
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="text">Single-line Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone / Mobile</option>
                    <option value="number">Number</option>
                    <option value="select">Dropdown Select</option>
                    <option value="textarea">Paragraph Textarea</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mandatory:
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewFieldRequired(!newFieldRequired)}
                    className={`w-full py-2.5 rounded-xl border text-xs font-bold transition ${
                      newFieldRequired
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {newFieldRequired ? '★ Required' : '☆ Optional'}
                  </button>
                </div>
              </div>

              {newFieldType === 'select' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dropdown Options (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="e.g. Option A, Option B, Option C"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Placeholder / Helper Text:
                </label>
                <input
                  type="text"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  placeholder="e.g. Enter full URL..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
