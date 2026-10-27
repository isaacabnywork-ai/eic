import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { eventRepository } from '../db/repositories/eventRepository';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { mediaRepository } from '../db/repositories/mediaRepository';
import { useAdminToast } from '../context/AdminToastContext';
import type {
  CustomEvent,
  EventStatus,
  EventOperationalStatus,
  EventScheduleSession,
  EventFaqItem,
} from '../db/types';

export function AdminEventEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useAdminToast();

  const categories = taxonomyRepository.getCategories();
  const speakers = taxonomyRepository.getSpeakers();
  const organizers = taxonomyRepository.getOrganizers();
  const venues = taxonomyRepository.getVenues();
  const mediaItems = mediaRepository.getAll();

  // Active section tab
  type EditorTab = 'basic' | 'datetime' | 'location' | 'faculty' | 'registration' | 'agenda' | 'faqs' | 'seo';
  const [activeTab, setActiveTab] = useState<EditorTab>('basic');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [featuredPosterUrl, setFeaturedPosterUrl] = useState('');
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  const [status, setStatus] = useState<EventStatus>('draft');
  const [operationalStatus, setOperationalStatus] = useState<EventOperationalStatus>('scheduled');

  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState('17:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [hideEndTime, setHideEndTime] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const [venueId, setVenueId] = useState<string>('');
  const [customVenueName, setCustomVenueName] = useState('');
  const [customVenueAddress, setCustomVenueAddress] = useState('');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  const [onlineJoinUrl, setOnlineJoinUrl] = useState('');

  const [speakerIds, setSpeakerIds] = useState<string[]>([]);
  const [organizerIds, setOrganizerIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const [registrationUrl, setRegistrationUrl] = useState('');
  const [registrationButtonLabel, setRegistrationButtonLabel] = useState('Register for Conference');
  const [registrationAvailable, setRegistrationAvailable] = useState(true);
  const [externalInfoUrl, setExternalInfoUrl] = useState('');
  const [promotionalVideoUrl, setPromotionalVideoUrl] = useState('');

  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const [schedules, setSchedules] = useState<EventScheduleSession[]>([]);
  const [faqs, setFaqs] = useState<EventFaqItem[]>([]);

  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [socialSharingImageUrl, setSocialSharingImageUrl] = useState('');

  // Media selector modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Load existing event data if editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = eventRepository.getById(id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setShortDescription(existing.shortDescription);
        setFullDescription(existing.fullDescription);
        setFeaturedPosterUrl(existing.featuredPosterUrl);
        setGalleryImageUrls(existing.galleryImageUrls || []);
        setStatus(existing.status);
        setOperationalStatus(existing.operationalStatus);
        setStartDate(existing.startDate);
        setStartTime(existing.startTime);
        setEndDate(existing.endDate);
        setEndTime(existing.endTime);
        setIsAllDay(existing.isAllDay);
        setHideEndTime(existing.hideEndTime);
        setTimezone(existing.timezone);
        setIsRecurring(existing.isRecurring);
        setRecurrenceRule(existing.recurrenceRule || 'weekly');
        setRecurrenceEndDate(existing.recurrenceEndDate || '');
        setVenueId(existing.venueId || '');
        setCustomVenueName(existing.customVenueName || '');
        setCustomVenueAddress(existing.customVenueAddress || '');
        setIsOnlineOnly(existing.isOnlineOnly);
        setOnlineJoinUrl(existing.onlineJoinUrl || '');
        setSpeakerIds(existing.speakerIds || []);
        setOrganizerIds(existing.organizerIds || []);
        setCategoryIds(existing.categoryIds || []);
        setTagIds(existing.tagIds || []);
        setRegistrationUrl(existing.registrationUrl || '');
        setRegistrationButtonLabel(existing.registrationButtonLabel || 'Register for Conference');
        setRegistrationAvailable(existing.registrationAvailable);
        setExternalInfoUrl(existing.externalInfoUrl || '');
        setPromotionalVideoUrl(existing.promotionalVideoUrl || '');
        setIsFree(existing.isFree);
        setPrice(existing.price || 0);
        setCurrency(existing.currency || 'INR');
        setCurrencySymbol(existing.currencySymbol || '₹');
        setSchedules(existing.schedules || []);
        setFaqs(existing.faqs || []);
        setSeoTitle(existing.seoTitle || '');
        setMetaDescription(existing.metaDescription || '');
        setSocialSharingImageUrl(existing.socialSharingImageUrl || '');
      } else {
        toast.error('The requested event was not found in database.', 'Not Found');
        navigate('/admin/events');
      }
    }
  }, [id, isEditing]);

  // Auto-slug generator from title if slug not customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSave = (targetStatus?: EventStatus) => {
    if (!title.trim()) {
      toast.error('Please enter an event title.', 'Validation Error');
      setActiveTab('basic');
      return;
    }

    const finalStatus = targetStatus || status;
    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const eventPayload: Omit<CustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByEmail'> = {
      title: title.trim(),
      slug: finalSlug,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      featuredPosterUrl:
        featuredPosterUrl.trim() ||
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&h=800&q=80',
      galleryImageUrls,
      status: finalStatus,
      operationalStatus,
      startDate,
      startTime,
      endDate,
      endTime,
      isAllDay,
      hideEndTime,
      timezone,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : undefined,
      recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
      venueId: venueId || undefined,
      customVenueName: customVenueName.trim() || undefined,
      customVenueAddress: customVenueAddress.trim() || undefined,
      isOnlineOnly,
      onlineJoinUrl: isOnlineOnly ? onlineJoinUrl.trim() : undefined,
      speakerIds,
      organizerIds,
      categoryIds,
      tagIds,
      registrationUrl: registrationUrl.trim(),
      registrationButtonLabel: registrationButtonLabel.trim() || 'Register for Conference',
      registrationAvailable,
      externalInfoUrl: externalInfoUrl.trim() || undefined,
      promotionalVideoUrl: promotionalVideoUrl.trim() || undefined,
      isFree,
      price: isFree ? 0 : Number(price) || 0,
      currency,
      currencySymbol,
      schedules,
      faqs,
      seoTitle: seoTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      socialSharingImageUrl: socialSharingImageUrl.trim() || undefined,
    };

    if (isEditing && id) {
      const updated = eventRepository.update(id, eventPayload);
      if (updated) {
        toast.success(`Updated "${updated.title}" successfully.`, 'Event Saved');
        navigate('/admin/events');
      }
    } else {
      const created = eventRepository.create(eventPayload);
      toast.success(`Created "${created.title}" successfully.`, 'Event Created');
      navigate('/admin/events');
    }
  };

  // Schedule Session Helpers
  const addScheduleSession = () => {
    const newSession: EventScheduleSession = {
      id: `sch-${Date.now()}`,
      title: 'New Session',
      description: '',
      date: startDate,
      startTime: '10:00',
      endTime: '11:30',
      speakerIds: [],
      displayOrder: schedules.length + 1,
    };
    setSchedules([...schedules, newSession]);
  };

  const updateScheduleSession = (sId: string, updates: Partial<EventScheduleSession>) => {
    setSchedules((prev) => prev.map((s) => (s.id === sId ? { ...s, ...updates } : s)));
  };

  const removeScheduleSession = (sId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== sId));
  };

  // FAQ Helpers
  const addFaq = () => {
    const newFaq: EventFaqItem = {
      id: `faq-${Date.now()}`,
      question: 'Frequently Asked Question?',
      answer: 'Answer to this question.',
      displayOrder: faqs.length + 1,
    };
    setFaqs([...faqs, newFaq]);
  };

  const updateFaq = (fId: string, updates: Partial<EventFaqItem>) => {
    setFaqs((prev) => prev.map((f) => (f.id === fId ? { ...f, ...updates } : f)));
  };

  const removeFaq = (fId: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== fId));
  };

  const toggleSpeaker = (sId: string) => {
    setSpeakerIds((prev) => (prev.includes(sId) ? prev.filter((x) => x !== sId) : [...prev, sId]));
  };

  const toggleOrganizer = (oId: string) => {
    setOrganizerIds((prev) => (prev.includes(oId) ? prev.filter((x) => x !== oId) : [...prev, oId]));
  };

  const toggleCategory = (cId: string) => {
    setCategoryIds((prev) => (prev.includes(cId) ? prev.filter((x) => x !== cId) : [...prev, cId]));
  };

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'basic', label: '1. Basic Info', icon: '📝' },
    { id: 'datetime', label: '2. Date & Time', icon: '🕒' },
    { id: 'location', label: '3. Location & Venue', icon: '📍' },
    { id: 'faculty', label: '4. Faculty & Speakers', icon: '🎙️' },
    { id: 'registration', label: '5. Tickets & Links', icon: '🎟️' },
    { id: 'agenda', label: '6. Schedule / Agenda', icon: '📅' },
    { id: 'faqs', label: '7. FAQs', icon: '❓' },
    { id: 'seo', label: '8. SEO & Social', icon: '🔍' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#070A0F]/95 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/events"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            ←
          </Link>
          <div>
            <h1 className="font-serif text-lg font-bold text-white truncate max-w-sm sm:max-w-md">
              {isEditing ? `Edit: ${title || 'Untitled Event'}` : 'Create New Custom Event'}
            </h1>
            <span className="text-[11px] font-mono text-amber-400">
              Status: {status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            Publish Event →
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B111E] p-6 shadow-sm">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'basic' && (
          <div className="space-y-5 max-w-3xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Event Details & Descriptions
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Event Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. All India Pastors Conference 2026: Proclaiming Christ Faithfully"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400">
                <span>/events/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none pl-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Short Summary / Tagline</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A concise, high-impact summary displayed on event cards and notifications."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Full Description (Markdown & HTML supported)</label>
              <textarea
                rows={8}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Complete conference overview, keynote messages, themes, requirements, and logistics..."
                className="w-full font-mono rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Poster Image */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Featured Poster URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={featuredPosterUrl}
                  onChange={(e) => setFeaturedPosterUrl(e.target.value)}
                  placeholder="https://.../event-poster.jpg"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Media Library
                </button>
              </div>

              {featuredPosterUrl && (
                <div className="mt-2 w-48 aspect-[16/10] overflow-hidden rounded-xl border border-slate-700">
                  <img src={featuredPosterUrl} alt="Poster Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            {/* Operational Status */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Operational State</label>
                <select
                  value={operationalStatus}
                  onChange={(e) => setOperationalStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="moved_online">Moved Online</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATE & TIME */}
        {activeTab === 'datetime' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Schedules, Dates & Timezone
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Start Time</label>
                <input
                  type="time"
                  disabled={isAllDay}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">End Time</label>
                <input
                  type="time"
                  disabled={isAllDay || hideEndTime}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>All-Day Event</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={hideEndTime}
                  onChange={(e) => setHideEndTime(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Hide End Time</span>
              </label>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST • UTC+05:30 - India Standard Time)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST • UTC+04:00)</option>
                <option value="America/New_York">America/New_York (EST • UTC-05:00)</option>
                <option value="Europe/London">Europe/London (GMT • UTC+00:00)</option>
              </select>
            </div>

            {/* Recurrence Settings */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>This is a recurring event</span>
              </label>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block">Recurrence Pattern</label>
                    <select
                      value={recurrenceRule}
                      onChange={(e) => setRecurrenceRule(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block">Recurrence End Date</label>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LOCATION & VENUE */}
        {activeTab === 'location' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Physical Venue & Online Coordinates
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Select Configured Venue</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="">-- No predefined venue / Custom venue --</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city}, {v.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Custom Venue Name</label>
                <input
                  type="text"
                  value={customVenueName}
                  onChange={(e) => setCustomVenueName(e.target.value)}
                  placeholder="e.g. Grace Bible Assembly Hall"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Custom Address / City</label>
                <input
                  type="text"
                  value={customVenueAddress}
                  onChange={(e) => setCustomVenueAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Online Event Option */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isOnlineOnly}
                  onChange={(e) => setIsOnlineOnly(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Online / Virtual Livestream Event</span>
              </label>

              {isOnlineOnly && (
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="text-xs text-slate-300 block font-semibold">Join / Broadcast Stream URL</label>
                  <input
                    type="url"
                    value={onlineJoinUrl}
                    onChange={(e) => setOnlineJoinUrl(e.target.value)}
                    placeholder="https://zoom.us/j/... or YouTube Livestream"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FACULTY & SPEAKERS */}
        {activeTab === 'faculty' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Speakers, Faculty & Organizers
            </h2>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Event Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const isSelected = categoryIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {c.name} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speakers selection */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Faculty & Speakers</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {speakers.map((spk) => {
                  const isSelected = speakerIds.includes(spk.id);
                  return (
                    <div
                      key={spk.id}
                      onClick={() => toggleSpeaker(spk.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {spk.photoUrl ? (
                        <img src={spk.photoUrl} alt={spk.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">
                          {spk.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{spk.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{spk.designation || spk.organization}</p>
                      </div>
                      <span className="ml-auto text-amber-400 font-bold">{isSelected ? '✓' : '+'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Organizers selection */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Host Organizers</label>
              <div className="flex flex-wrap gap-2">
                {organizers.map((org) => {
                  const isSelected = organizerIds.includes(org.id);
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => toggleOrganizer(org.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {org.name} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REGISTRATION & PRICING */}
        {activeTab === 'registration' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Registration, Ticketing & Pricing
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Registration URL</label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://equipindianchurches.com/register/aipc-2026 or Google Forms / Tithely link"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Button Label</label>
                <input
                  type="text"
                  value={registrationButtonLabel}
                  onChange={(e) => setRegistrationButtonLabel(e.target.value)}
                  placeholder="Register for Conference"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={registrationAvailable}
                    onChange={(e) => setRegistrationAvailable(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Registration Currently Open</span>
                </label>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Free Admission (No Registration Fee)</span>
              </label>

              {!isFree && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-semibold">Registration Price</label>
                    <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs">
                      <span className="text-amber-400 font-bold mr-1">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-transparent text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-semibold">Currency Code</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Promotional Video URL (YouTube / Vimeo)</label>
              <input
                type="url"
                value={promotionalVideoUrl}
                onChange={(e) => setPromotionalVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 6: SCHEDULE & AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Multi-Session Conference Agenda
              </h2>
              <button
                type="button"
                onClick={addScheduleSession}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                + Add Session
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
                No session schedule items added yet. Click "+ Add Session" to create your conference agenda.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((sch, sIdx) => (
                  <div key={sch.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                        Session #{sIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeScheduleSession(sch.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] text-slate-400 block font-semibold">Session Title</label>
                        <input
                          type="text"
                          value={sch.title}
                          onChange={(e) => updateScheduleSession(sch.id, { title: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block font-semibold">Date</label>
                        <input
                          type="date"
                          value={sch.date}
                          onChange={(e) => updateScheduleSession(sch.id, { date: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block font-semibold">Start Time</label>
                        <input
                          type="time"
                          value={sch.startTime}
                          onChange={(e) => updateScheduleSession(sch.id, { startTime: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block font-semibold">End Time</label>
                        <input
                          type="time"
                          value={sch.endTime}
                          onChange={(e) => updateScheduleSession(sch.id, { endTime: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block font-semibold">Session Summary</label>
                      <textarea
                        rows={2}
                        value={sch.description}
                        onChange={(e) => updateScheduleSession(sch.id, { description: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Event Frequently Asked Questions
              </h2>
              <button
                type="button"
                onClick={addFaq}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                + Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
                No FAQs added yet. Help attendees with logistics, travel, materials, and recording access.
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, fIdx) => (
                  <div key={faq.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                        FAQ #{fIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(faq.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block font-semibold">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 block font-semibold">Answer</label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SEO & SOCIAL SHARING */}
        {activeTab === 'seo' && (
          <div className="space-y-5 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Search Engine & Social Media Metadata
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Custom SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title ? `${title} | Equip Indian Churches` : 'Custom Meta Title'}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="High-converting search snippet description..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Social Sharing Image URL (og:image)</label>
              <input
                type="url"
                value={socialSharingImageUrl}
                onChange={(e) => setSocialSharingImageUrl(e.target.value)}
                placeholder="https://.../og-share-card.jpg"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B111E] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-base font-bold text-white">Select Media Asset</h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {mediaItems.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setFeaturedPosterUrl(m.url);
                    setIsMediaModalOpen(false);
                    toast.success(`Selected "${m.name}".`, 'Media Selected');
                  }}
                  className="group relative aspect-[16/10] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden cursor-pointer hover:border-amber-400 transition"
                >
                  <img src={m.url} alt={m.altText} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white">
                    Select
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
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
