import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formRepository } from '../db/repositories/formRepository';
import { eventRepository } from '../db/repositories/eventRepository';
import { adminDb } from '../db/storage';
import { useAdminToast } from '../context/AdminToastContext';
import { EventRegistrationFormCard } from '@/components/forms/EventRegistrationFormCard';
import { DEFAULT_REGISTRATION_FIELDS } from '../db/seed';
import type {
  EventRegistrationForm,
  FormSubmission,
  FormFieldConfig,
  FormFieldType,
} from '../db/types';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Eye,
  Download,
  Users,
  CreditCard,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Sliders,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  Type,
  AlignLeft,
  ListFilter,
  CheckSquare,
  Radio,
  Hash,
  Clock,
  Mail,
  Phone,
  Link2,
} from 'lucide-react';

const FIELD_TYPE_OPTIONS: {
  type: FormFieldType;
  label: string;
  badge: string;
  category: 'Standard' | 'Choice & Options' | 'Data & Date' | 'Contact & Web';
  icon: any;
  defaultPlaceholder?: string;
  defaultHelpText?: string;
  defaultOptions?: string[];
}[] = [
  {
    type: 'text',
    label: 'Single Line Text',
    badge: 'Text',
    category: 'Standard',
    icon: Type,
    defaultPlaceholder: 'Enter your answer',
  },
  {
    type: 'textarea',
    label: 'Paragraph Text',
    badge: 'Paragraph',
    category: 'Standard',
    icon: AlignLeft,
    defaultPlaceholder: 'Enter detailed response...',
  },
  {
    type: 'select',
    label: 'Dropdown Menu',
    badge: 'Dropdown',
    category: 'Choice & Options',
    icon: ListFilter,
    defaultOptions: ['Option 1', 'Option 2', 'Option 3'],
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    badge: 'Single Choice',
    category: 'Choice & Options',
    icon: Radio,
    defaultOptions: ['Option 1', 'Option 2'],
  },
  {
    type: 'checkbox',
    label: 'Checkboxes (Multi-select)',
    badge: 'Multi-select',
    category: 'Choice & Options',
    icon: CheckSquare,
    defaultOptions: ['Choice A', 'Choice B', 'Choice C'],
  },
  {
    type: 'number',
    label: 'Number Input',
    badge: 'Number',
    category: 'Data & Date',
    icon: Hash,
    defaultPlaceholder: '0',
  },
  {
    type: 'date',
    label: 'Date Picker',
    badge: 'Date',
    category: 'Data & Date',
    icon: Calendar,
  },
  {
    type: 'time',
    label: 'Time Picker',
    badge: 'Time',
    category: 'Data & Date',
    icon: Clock,
  },
  {
    type: 'email',
    label: 'Email Address',
    badge: 'Email',
    category: 'Contact & Web',
    icon: Mail,
    defaultPlaceholder: 'user@example.com',
  },
  {
    type: 'tel',
    label: 'Phone Number',
    badge: 'Phone',
    category: 'Contact & Web',
    icon: Phone,
    defaultPlaceholder: '+91 98765 43210',
  },
  {
    type: 'url',
    label: 'Website / Profile URL',
    badge: 'URL',
    category: 'Contact & Web',
    icon: Link2,
    defaultPlaceholder: 'https://',
  },
];

const CHOICE_PRESETS = [
  { label: 'Yes / No', options: ['Yes', 'No'] },
  { label: 'Diet (Veg / Non-Veg)', options: ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan'] },
  { label: 'T-Shirt Sizes', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
  { label: 'Accommodation', options: ['Required', 'Not Required', 'Arranging Own Stay'] },
  {
    label: 'Ministry Role',
    options: [
      'Senior Pastor',
      'Associate Pastor',
      'Elder / Deacon',
      'Youth Pastor / Leader',
      'Worship Leader',
      'Seminary Student',
      'Church Member / Layperson',
    ],
  },
  {
    label: 'How Heard',
    options: [
      'Church Announcement',
      'Friend / Colleague',
      'WhatsApp Group',
      'Instagram / Social Media',
      'Equip Indian Churches Website',
      'Attended Past Conference',
    ],
  },
];

type FormTab = 'roster' | 'builder' | 'submissions';

export function AdminFormsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useAdminToast();

  const tabParam = (searchParams.get('tab') as FormTab) || 'roster';
  const formIdParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<FormTab>(tabParam);
  const [editingFormId, setEditingFormId] = useState<string | null>(formIdParam);

  // Sync tab with URL search params
  useEffect(() => {
    if (tabParam !== activeTab) setActiveTab(tabParam);
    if (formIdParam !== editingFormId) setEditingFormId(formIdParam);
  }, [tabParam, formIdParam]);

  const setTab = (newTab: FormTab, id: string | null = null) => {
    setActiveTab(newTab);
    setEditingFormId(id);
    const params = new URLSearchParams();
    params.set('tab', newTab);
    if (id) params.set('id', id);
    setSearchParams(params);
  };

  // State
  const [forms, setForms] = useState<EventRegistrationForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState(formRepository.getStats());
  const [events, setEvents] = useState(eventRepository.getAllEvents());

  // Filters for Roster tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');

  // Filters for Submissions tab
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFormFilter, setSubmissionFormFilter] = useState<string>('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');

  // Modals state
  const [previewForm, setPreviewForm] = useState<EventRegistrationForm | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  // Form Builder state
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [showAddPalette, setShowAddPalette] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<EventRegistrationForm>>({
    title: 'Payment Details',
    subtitle: '',
    eventId: '',
    status: 'active',
    baseAmount: 300,
    currency: 'INR',
    currencySymbol: '₹',
    allowQuantity: true,
    maxQuantity: 10,
    allowDonation: true,
    donationPlaceholder: 'Enter Amount',
    payButtonText: 'Pay ₹ {total}',
    showPaymentLogos: true,
    paymentInstructions: 'Instant confirmation via UPI, Cards, NetBanking.',
    successMessage: 'Thank you for registering! Your registration has been confirmed.',
    fields: [...DEFAULT_REGISTRATION_FIELDS],
  });

  const loadData = () => {
    setForms(formRepository.getAllForms({ search: searchQuery, status: statusFilter }));
    setSubmissions(
      formRepository.getAllSubmissions({
        search: submissionSearch,
        formId: submissionFormFilter,
        status: submissionStatusFilter as any,
      }),
    );
    setStats(formRepository.getStats());
    setEvents(eventRepository.getAllEvents());
  };

  useEffect(() => {
    loadData();
    return adminDb.subscribe(loadData);
  }, [searchQuery, statusFilter, submissionSearch, submissionFormFilter, submissionStatusFilter]);

  // Load editing form when builder opens
  useEffect(() => {
    if (activeTab === 'builder') {
      if (editingFormId) {
        const existing = formRepository.getFormById(editingFormId);
        if (existing) {
          setFormData({ ...existing });
          return;
        }
      }
      // New form defaults
      const firstEvent = events[0];
      setFormData({
        title: 'Payment Details',
        subtitle: firstEvent ? `${firstEvent.title} Registration` : 'Conference Registration',
        eventId: firstEvent ? firstEvent.id : '',
        status: 'active',
        baseAmount: 300,
        currency: 'INR',
        currencySymbol: '₹',
        allowQuantity: true,
        maxQuantity: 10,
        allowDonation: true,
        donationPlaceholder: 'Enter Amount',
        payButtonText: 'Pay ₹ {total}',
        showPaymentLogos: true,
        paymentInstructions: 'Instant confirmation via UPI, Cards, NetBanking.',
        successMessage: 'Thank you for registering! Your registration has been confirmed.',
        fields: [...DEFAULT_REGISTRATION_FIELDS],
      });
    }
  }, [activeTab, editingFormId, events]);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast('Please enter a form title', 'error');
      return;
    }
    if (!formData.eventId) {
      toast('Please select an event to link with this form', 'error');
      return;
    }

    try {
      if (editingFormId) {
        formRepository.updateForm(editingFormId, formData);
        toast('Registration form updated successfully', 'success');
      } else {
        const created = formRepository.createForm(formData as any);
        toast('New registration form created successfully', 'success');
        setEditingFormId(created.id);
      }
      setTab('roster');
    } catch (err: any) {
      toast(err.message || 'Failed to save form', 'error');
    }
  };

  const handleDeleteForm = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the form "${title}"? Associated registration records will be preserved.`)) {
      formRepository.deleteForm(id);
      toast('Form deleted successfully', 'success');
      loadData();
    }
  };

  const handleDuplicateForm = (id: string) => {
    const dup = formRepository.duplicateForm(id);
    if (dup) {
      toast('Form duplicated as draft', 'success');
      setTab('builder', dup.id);
    }
  };

  const handleCopyLink = (form: EventRegistrationForm) => {
    const url = `${window.location.origin}/register/${form.id}`;
    navigator.clipboard.writeText(url);
    setCopiedFormId(form.id);
    toast('Registration link copied to clipboard!', 'success');
    setTimeout(() => setCopiedFormId(null), 2500);
  };

  const handleAddField = (type: FormFieldType) => {
    const meta = FIELD_TYPE_OPTIONS.find((t) => t.type === type);
    const newId = `custom_${Date.now()}`;
    const newField: FormFieldConfig = {
      id: newId,
      name: newId,
      label: meta ? `Custom ${meta.label}` : 'New Question',
      type: type,
      required: false,
      enabled: true,
      placeholder: meta?.defaultPlaceholder || '',
      helpText: meta?.defaultHelpText || '',
      options: meta?.defaultOptions ? [...meta.defaultOptions] : undefined,
      isCustom: true,
    };

    const currentFields = formData.fields || [];
    setFormData({
      ...formData,
      fields: [...currentFields, newField],
    });
    setExpandedFieldId(newId);
    setShowAddPalette(false);
    toast(`Added new "${meta?.label || type}" question`, 'success');
  };

  const handleUpdateField = (index: number, updates: Partial<FormFieldConfig>) => {
    const updated = [...(formData.fields || [])];
    if (!updated[index]) return;
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, fields: updated });
  };

  const handleDeleteField = (index: number) => {
    const target = formData.fields?.[index];
    if (!target) return;
    const updated = (formData.fields || []).filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updated });
    if (expandedFieldId === target.id) {
      setExpandedFieldId(null);
    }
    toast(`Field "${target.label}" removed`, 'info');
  };

  const handleDuplicateField = (index: number) => {
    const source = formData.fields?.[index];
    if (!source) return;
    const newId = `custom_${Date.now()}`;
    const copy: FormFieldConfig = {
      ...source,
      id: newId,
      name: newId,
      label: `${source.label} (Copy)`,
      isCustom: true,
      options: source.options ? [...source.options] : undefined,
    };
    const updated = [...(formData.fields || [])];
    updated.splice(index + 1, 0, copy);
    setFormData({ ...formData, fields: updated });
    setExpandedFieldId(newId);
    toast(`Duplicated "${source.label}"`, 'success');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.fields || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setFormData({ ...formData, fields: list });
  };

  const handleAddOption = (fieldIndex: number) => {
    const field = formData.fields?.[fieldIndex];
    if (!field) return;
    const currentOptions = field.options || [];
    handleUpdateField(fieldIndex, {
      options: [...currentOptions, `Choice ${currentOptions.length + 1}`],
    });
  };

  const handleUpdateOption = (fieldIndex: number, optIndex: number, val: string) => {
    const field = formData.fields?.[fieldIndex];
    if (!field || !field.options) return;
    const newOptions = [...field.options];
    newOptions[optIndex] = val;
    handleUpdateField(fieldIndex, { options: newOptions });
  };

  const handleDeleteOption = (fieldIndex: number, optIndex: number) => {
    const field = formData.fields?.[fieldIndex];
    if (!field || !field.options) return;
    const newOptions = field.options.filter((_, i) => i !== optIndex);
    handleUpdateField(fieldIndex, { options: newOptions });
  };

  const handleApplyPreset = (fieldIndex: number, presetOptions: string[]) => {
    handleUpdateField(fieldIndex, { options: [...presetOptions] });
    toast('Preset choices applied to question', 'success');
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast('No registration submissions to export', 'error');
      return;
    }

    // Dynamic extraction of all custom response question keys
    const customQuestionKeys = Array.from(
      new Set(
        submissions.flatMap((s) => (s.customResponses ? Object.keys(s.customResponses) : []))
      )
    );

    const headers = [
      'Registration ID',
      'Event',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Age',
      'Church Name',
      'Role in Church',
      'Address',
      'City',
      'State',
      'Pincode',
      'How Heard',
      'Attended Before',
      ...customQuestionKeys.map((k) => `"${k.replace(/"/g, '""')}"`),
      'Quantity',
      'Unit Price',
      'Donation',
      'Total Amount',
      'Payment Status',
      'Payment Method',
      'Transaction ID',
      'Registered At',
    ];

    const rows = submissions.map((s) => [
      s.id,
      `"${s.eventTitle.replace(/"/g, '""')}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.lastName || '').replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      s.gender || '',
      s.age || '',
      `"${(s.churchName || '').replace(/"/g, '""')}"`,
      `"${(s.churchRole || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(s.city || '').replace(/"/g, '""')}"`,
      `"${(s.state || '').replace(/"/g, '""')}"`,
      s.pincode || '',
      `"${(s.howHeard || '').replace(/"/g, '""')}"`,
      s.attendedBefore || '',
      ...customQuestionKeys.map((k) => `"${(s.customResponses?.[k] || '').replace(/"/g, '""')}"`),
      s.quantity,
      s.unitAmount,
      s.donationAmount,
      s.totalAmount,
      s.paymentStatus,
      s.paymentMethod || '',
      s.transactionId || '',
      new Date(s.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eic-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Registrations CSV exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#094899]/10 text-[#094899] font-bold text-xs">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#094899]">
              Events Management
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#182541]">
            Event Registration Forms
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Build and manage customized event registration and payment forms matching our official layout, track delegate submissions, and accept conference fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab !== 'builder' && (
            <button
              type="button"
              onClick={() => setTab('builder', null)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#094899] hover:bg-[#073877] text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Form</span>
            </button>
          )}

          {activeTab === 'builder' && (
            <button
              type="button"
              onClick={() => setTab('roster')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Forms</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Forms</span>
            <FileText className="w-4 h-4 text-[#094899]" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900">{stats.totalForms}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Forms</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700">{stats.activeForms}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Registered Delegates</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900">{stats.totalSubmissions}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Collected</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-slate-900">
            ₹ {stats.totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'roster'
              ? 'border-[#094899] text-[#094899]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Registration Forms</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {forms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('builder')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'builder'
              ? 'border-[#094899] text-[#094899]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{editingFormId ? 'Edit Form' : 'Form Builder'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-[#094899] text-[#094899]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registrations & Attendees</span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {submissions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ALL FORMS ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forms by title, event..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#094899]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Forms List Table */}
          {forms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No registration forms found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Create a customized registration & payment form for any of your upcoming conferences or seminars.
              </p>
              <button
                type="button"
                onClick={() => setTab('builder', null)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#094899] text-white px-4 py-2 text-xs font-semibold hover:bg-[#073877] transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Form Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Form Title & Event</th>
                      <th className="py-3 px-4">Base Fee</th>
                      <th className="py-3 px-4">Fields</th>
                      <th className="py-3 px-4">Registrations</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forms.map((item) => {
                      const enabledCount = (item.fields || []).filter((f: FormFieldConfig) => f.enabled).length;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({item.slug})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-[#094899]" />
                              <span>{item.eventTitle}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {item.baseAmount === 0 ? (
                              <span className="text-emerald-700">Free</span>
                            ) : (
                              <span>{item.currencySymbol} {item.baseAmount.toFixed(2)}</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <span>{enabledCount} active fields</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSubmissionFormFilter(item.id);
                                setTab('submissions');
                              }}
                              className="inline-flex items-center gap-1.5 font-bold text-[#094899] hover:underline cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>{item.submissionsCount || 0} delegates</span>
                            </button>
                            {item.totalCollected > 0 && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Total: {item.currencySymbol} {item.totalCollected.toLocaleString()}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                item.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'draft'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.status === 'active' && <Check className="w-3 h-3" />}
                              <span className="capitalize">{item.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview Form */}
                              <button
                                type="button"
                                onClick={() => setPreviewForm(item)}
                                title="Live Preview Form"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Copy Public Link */}
                              <button
                                type="button"
                                onClick={() => handleCopyLink(item)}
                                title="Copy Public Registration Link"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                              >
                                {copiedFormId === item.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>

                              {/* Open Public Page */}
                              <Link
                                to={`/register/${item.id}`}
                                target="_blank"
                                title="Open Live Page"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Edit Form */}
                              <button
                                type="button"
                                onClick={() => setTab('builder', item.id)}
                                title="Edit Form"
                                className="p-1.5 text-slate-500 hover:text-[#094899] hover:bg-blue-50 rounded-md transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Duplicate Form */}
                              <button
                                type="button"
                                onClick={() => handleDuplicateForm(item.id)}
                                title="Duplicate Form"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>

                              {/* Delete Form */}
                              <button
                                type="button"
                                onClick={() => handleDeleteForm(item.id, item.title)}
                                title="Delete Form"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORM BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Settings & Fields (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingFormId ? 'Edit Event Registration Form' : 'Create New Registration Form'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure event pricing, attendee questions, payment badges, and form behavior.
              </p>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Event & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Associated Event <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) => {
                      const selectedEv = events.find((ev) => ev.id === e.target.value);
                      setFormData({
                        ...formData,
                        eventId: e.target.value,
                        eventTitle: selectedEv?.title || '',
                        subtitle: selectedEv ? `${selectedEv.title} Registration` : formData.subtitle,
                      });
                    }}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 focus:border-[#094899] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose an Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.startDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Form Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Payment Details"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-[#094899] focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtitle / Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Form Subtitle / Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. AIPC 2026 Conference Delegate Registration"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:border-[#094899] focus:outline-none"
                />
              </div>

              {/* Pricing & Fee Section */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#094899] block">
                  Ticket Pricing & Payment Controls
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Fee (Amount)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        {formData.currencySymbol || '₹'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        required
                        value={formData.baseAmount !== undefined ? formData.baseAmount : 300}
                        onChange={(e) => setFormData({ ...formData, baseAmount: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#094899]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Delegates per Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxQuantity || 10}
                      onChange={(e) => setFormData({ ...formData, maxQuantity: Number(e.target.value) })}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#094899]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Form Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none cursor-pointer capitalize"
                    >
                      <option value="active">Active (Open)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="closed">Closed (Sold Out)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowQuantity}
                      onChange={(e) => setFormData({ ...formData, allowQuantity: e.target.checked })}
                      className="rounded border-slate-300 text-[#094899] focus:ring-[#094899]"
                    />
                    <span>Allow Quantity Selector (- 1 + counter)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowDonation}
                      onChange={(e) => setFormData({ ...formData, allowDonation: e.target.checked })}
                      className="rounded border-slate-300 text-[#094899] focus:ring-[#094899]"
                    />
                    <span>Enable Optional Ministry Donation Field</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showPaymentLogos}
                      onChange={(e) => setFormData({ ...formData, showPaymentLogos: e.target.checked })}
                      className="rounded border-slate-300 text-[#094899] focus:ring-[#094899]"
                    />
                    <span>Display Payment Badges (UPI, VISA, RuPay, MasterCard)</span>
                  </label>
                </div>
              </div>

              {/* Attendee Fields & Custom Question Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Attendee Questions & Fields
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {formData.fields?.filter((f) => f.enabled).length || 0} active / {formData.fields?.length || 0} total
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure standard fields or add custom questions, dropdowns, radio options, and checkboxes for delegates.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPalette(!showAddPalette)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer ${
                        showAddPalette
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-[#094899] text-white hover:bg-[#073877]'
                      }`}
                    >
                      {showAddPalette ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Close Palette</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Question / Field</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Add Field Palette Drawer */}
                {showAddPalette && (
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-4 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#094899]" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Select Question / Field Type
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Click a type to add it to your registration form
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FIELD_TYPE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => handleAddField(opt.type)}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200/90 bg-white hover:border-[#094899] hover:bg-blue-50/50 hover:shadow-xs transition text-left cursor-pointer group"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-[#094899] group-hover:text-white transition">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#094899] truncate">
                                {opt.label}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium truncate">
                                {opt.category}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fields List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {formData.fields?.map((field: FormFieldConfig, index: number) => {
                    const isExpanded = expandedFieldId === field.id;
                    const meta = FIELD_TYPE_OPTIONS.find((t) => t.type === field.type);
                    const Icon = meta?.icon || Type;
                    const isChoiceType = ['select', 'radio', 'checkbox'].includes(field.type);

                    return (
                      <div
                        key={field.id}
                        className={`rounded-xl border transition ${
                          field.enabled
                            ? isExpanded
                              ? 'border-[#094899] bg-white shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            : 'border-slate-200/60 bg-slate-50/60 opacity-70'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between p-3 gap-2">
                          {/* Left: Reorder & Enable & Label */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveField(index, 'up')}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === (formData.fields?.length || 0) - 1}
                                onClick={() => handleMoveField(index, 'down')}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Enable Checkbox */}
                            <input
                              type="checkbox"
                              checked={field.enabled}
                              onChange={(e) => handleUpdateField(index, { enabled: e.target.checked })}
                              className="rounded border-slate-300 text-[#094899] focus:ring-[#094899] cursor-pointer"
                              title={field.enabled ? 'Enabled' : 'Disabled'}
                            />

                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    field.enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                                  }`}
                                >
                                  {field.label}
                                </span>
                                {field.required && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                    Required
                                  </span>
                                )}
                                {field.isCustom && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {meta?.badge || field.type}
                                {field.options ? ` (${field.options.length} options)` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Right: Quick Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Required toggle */}
                            <label className="hidden sm:flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer px-2 py-1 rounded hover:bg-slate-50">
                              <input
                                type="checkbox"
                                disabled={!field.enabled}
                                checked={field.required}
                                onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                              />
                              <span className={field.required ? 'font-bold text-rose-600 text-[10px]' : 'text-slate-500 text-[10px]'}>
                                Required *
                              </span>
                            </label>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateField(index)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Duplicate Field"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Settings toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                              className={`p-1.5 rounded-md transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                                isExpanded
                                  ? 'bg-[#094899] text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Field Settings"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span className="hidden md:inline text-[11px]">{isExpanded ? 'Done' : 'Edit'}</span>
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteField(index)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Field Editor Panel */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 bg-slate-50/70 p-4 rounded-b-xl space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {/* Label */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Field Label / Question <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#094899] focus:outline-none"
                                  placeholder="e.g. Do you require accommodation?"
                                />
                              </div>

                              {/* Field Type Selector */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Field Type
                                </label>
                                <select
                                  value={field.type}
                                  onChange={(e) => {
                                    const newType = e.target.value as FormFieldType;
                                    const newMeta = FIELD_TYPE_OPTIONS.find((t) => t.type === newType);
                                    handleUpdateField(index, {
                                      type: newType,
                                      options:
                                        ['select', 'radio', 'checkbox'].includes(newType) &&
                                        (!field.options || field.options.length === 0)
                                          ? newMeta?.defaultOptions || ['Option 1', 'Option 2']
                                          : field.options,
                                    });
                                  }}
                                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#094899] focus:outline-none"
                                >
                                  {FIELD_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.type} value={opt.type}>
                                      {opt.label} ({opt.category})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Placeholder (for text, email, tel, number, url, textarea) */}
                              {!isChoiceType && (
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Placeholder Text
                                  </label>
                                  <input
                                    type="text"
                                    value={field.placeholder || ''}
                                    onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#094899] focus:outline-none"
                                    placeholder="e.g. Type your answer here..."
                                  />
                                </div>
                              )}

                              {/* Help Text / Description */}
                              <div className={!isChoiceType ? '' : 'sm:col-span-2'}>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                  Help Text / Guidance (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={field.helpText || ''}
                                  onChange={(e) => handleUpdateField(index, { helpText: e.target.value })}
                                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#094899] focus:outline-none"
                                  placeholder="Small explanatory note shown beneath the input"
                                />
                              </div>
                            </div>

                            {/* Required checkbox toggle */}
                            <div className="flex items-center gap-2 pt-1">
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                <span>Mark this question as mandatory (Required *)</span>
                              </label>
                            </div>

                            {/* Choices / Options Editor for select, radio, checkbox */}
                            {isChoiceType && (
                              <div className="space-y-3 pt-2 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                  <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                                      Answer Options / Choices ({field.options?.length || 0})
                                    </span>
                                    <p className="text-[10px] text-slate-500">
                                      Define the available choices for delegates to choose from.
                                    </p>
                                  </div>

                                  {/* Quick Presets */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                                    {CHOICE_PRESETS.map((preset) => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => handleApplyPreset(index, preset.options)}
                                        className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:border-[#094899] hover:text-[#094899] transition cursor-pointer"
                                        title={`Load "${preset.label}" options`}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Options List */}
                                <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                                  {(field.options || []).map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-right">
                                        {optIndex + 1}.
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleUpdateOption(index, optIndex, e.target.value)}
                                        className="flex-1 rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-900 focus:border-[#094899] focus:outline-none"
                                        placeholder={`Option ${optIndex + 1}`}
                                      />
                                      <button
                                        type="button"
                                        disabled={(field.options?.length || 0) <= 1}
                                        onClick={() => handleDeleteOption(index, optIndex)}
                                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                        title="Delete Option"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}

                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAddOption(index)}
                                      className="inline-flex items-center gap-1.5 rounded border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-[#094899] transition cursor-pointer w-full justify-center"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>+ Add Another Option Choice</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Close settings */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedFieldId(null)}
                                className="rounded bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 text-xs font-semibold transition cursor-pointer"
                              >
                                Done Editing Field
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTab('roster')}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#094899] hover:bg-[#073877] text-white px-5 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Save & Publish Form
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Visual Preview matching screenshot (5 cols) */}
          <div className="lg:col-span-5 space-y-3 sticky top-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Form Preview
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Interactive Preview</span>
              </span>
            </div>

            {/* Interactive Preview Card */}
            <EventRegistrationFormCard
              form={formData as EventRegistrationForm}
              isPreview={true}
              onSuccess={(sub) => toast(`Preview submission received from ${sub.name}!`, 'success')}
            />
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATIONS & ATTENDEES SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Submissions Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="Search by attendee name, email, phone, church..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#094899]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <select
                value={submissionFormFilter}
                onChange={(e) => setSubmissionFormFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Forms</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title} ({f.eventTitle})
                  </option>
                ))}
              </select>

              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No registrations found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Registrations submitted through your event forms will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Delegate Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Church & Role</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {sub.name} {sub.lastName || ''}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{sub.id}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{sub.email}</div>
                          <div className="text-slate-500 text-[11px]">{sub.phone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{sub.churchName || '—'}</div>
                          <div className="text-slate-500 text-[11px]">{sub.churchRole || '—'}</div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <span className="truncate max-w-[160px] block">{sub.eventTitle}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span>{sub.currency === 'INR' ? '₹' : sub.currency} {sub.totalAmount.toFixed(2)}</span>
                          {sub.donationAmount > 0 && (
                            <div className="text-[10px] text-emerald-600 font-normal">
                              (+₹{sub.donationAmount} donation)
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              sub.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sub.paymentStatus === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span className="capitalize">{sub.paymentStatus}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: LIVE PREVIEW FORM MODAL */}
      {previewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-100 p-4 sm:p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewForm(null)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-3 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Form Live Preview Mode
              </span>
            </div>

            <EventRegistrationFormCard
              form={previewForm}
              isPreview={true}
              onSuccess={() => toast('Preview registration completed!', 'success')}
            />
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION DETAILS MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delegate Registration Details
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {selectedSubmission.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-bold text-slate-900">
                  {selectedSubmission.name} {selectedSubmission.lastName || ''}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gender & Age:</span>
                <span className="font-semibold text-slate-900">
                  {selectedSubmission.gender || '—'}, {selectedSubmission.age ? `${selectedSubmission.age} yrs` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Church Name:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.churchName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Church Role:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.churchRole || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">City, State, Pincode:</span>
                <span className="font-semibold text-slate-900">
                  {selectedSubmission.city || '—'}, {selectedSubmission.state || '—'} ({selectedSubmission.pincode || '—'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Attended EIC Before:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.attendedBefore || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Full Address:</span>
                <span className="font-medium text-slate-800">{selectedSubmission.address || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">How Heard:</span>
                <span className="font-medium text-slate-800">{selectedSubmission.howHeard || '—'}</span>
              </div>
            </div>

            {/* Custom Question Responses */}
            {selectedSubmission.customResponses &&
              Object.keys(selectedSubmission.customResponses).length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs bg-slate-50/80">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Custom Questions & Responses
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {Object.keys(selectedSubmission.customResponses).length} questions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {Object.entries(selectedSubmission.customResponses).map(([qKey, qVal]) => (
                      <div
                        key={qKey}
                        className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                      >
                        <span className="text-slate-500 block text-[11px] font-medium mb-0.5">
                          {qKey}:
                        </span>
                        <span className="font-semibold text-slate-900 break-words">
                          {String(qVal || '—')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Payment Details */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-bold text-slate-900">{selectedSubmission.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket Quantity:</span>
                <span className="font-semibold text-slate-900">{selectedSubmission.quantity} delegates</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹ {selectedSubmission.ticketTotal.toFixed(2)}
                </span>
              </div>
              {selectedSubmission.donationAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ministry Donation:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    + ₹ {selectedSubmission.donationAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                <span className="text-slate-800">Total Amount:</span>
                <span className="font-mono text-emerald-700">
                  ₹ {selectedSubmission.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                <span>Transaction Ref:</span>
                <span className="font-mono text-slate-700">{selectedSubmission.transactionId || '—'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
