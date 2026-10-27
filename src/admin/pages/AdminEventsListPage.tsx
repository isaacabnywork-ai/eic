import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventRepository } from '../db/repositories/eventRepository';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { adminDb } from '../db/storage';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { 
  CustomEvent, 
  EventStatus
} from '../db/types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  MapPin, 
  Users, 
  Building2, 
  FolderPlus
} from 'lucide-react';

// Sub-components / Views embedded in the single page
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminSpeakersPage } from './AdminSpeakersPage';
import { AdminOrganizersPage } from './AdminOrganizersPage';
import { AdminVenuesPage } from './AdminVenuesPage';

type EventHubTab = 'roster' | 'editor' | 'categories' | 'speakers' | 'organizers' | 'venues';

export function AdminEventsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useAdminToast();
  const { user } = useAdminAuth();

  const tabParam = (searchParams.get('tab') as EventHubTab) || 'roster';
  const eventIdParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<EventHubTab>(tabParam);
  const [editingId, setEditingId] = useState<string | null>(eventIdParam);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    if (eventIdParam !== editingId) {
      setEditingId(eventIdParam);
    }
  }, [tabParam, eventIdParam]);

  const setTab = (newTab: EventHubTab, id: string | null = null) => {
    setActiveTab(newTab);
    setEditingId(id);
    const params = new URLSearchParams();
    params.set('tab', newTab);
    if (id) params.set('id', id);
    setSearchParams(params);
  };

  // --- Roster State ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [stats, setStats] = useState(eventRepository.getStats());

  const categories = taxonomyRepository.getCategories();
  const venues = taxonomyRepository.getVenues();
  const speakers = taxonomyRepository.getSpeakers();
  const organizers = taxonomyRepository.getOrganizers();

  const loadRoster = () => {
    const res = eventRepository.getAll({
      search,
      status: statusFilter,
      categoryId: categoryFilter,
      perPage: 50,
    });
    setEvents(res.items);
    setStats(eventRepository.getStats());
  };

  useEffect(() => {
    loadRoster();
    return adminDb.subscribe(loadRoster);
  }, [search, statusFilter, categoryFilter]);

  const handleDuplicate = (id: string) => {
    const dup = eventRepository.duplicate(id);
    if (dup) {
      toast.success(`Duplicated "${dup.title}" as draft.`, 'Event Duplicated');
      loadRoster();
    }
  };

  const handleStatusToggle = (ev: CustomEvent) => {
    const nextStatus: EventStatus = ev.status === 'published' ? 'draft' : 'published';
    eventRepository.setStatus(ev.id, nextStatus);
    toast.success(`Event status changed to ${nextStatus}.`, 'Status Updated');
    loadRoster();
  };

  const handleTrash = (id: string, title: string) => {
    if (confirm(`Move "${title}" to Trash?`)) {
      eventRepository.moveToTrash(id);
      toast.info(`Moved "${title}" to Trash.`, 'Event Trashed');
      loadRoster();
    }
  };

  // --- Single Event Editor State ---
  const [formData, setFormData] = useState<Partial<CustomEvent>>({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    featuredPosterUrl: '',
    galleryImageUrls: [],
    status: 'published',
    operationalStatus: 'scheduled',
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endDate: new Date().toISOString().slice(0, 10),
    endTime: '17:30',
    isAllDay: false,
    hideEndTime: false,
    timezone: 'Asia/Kolkata',
    isRecurring: false,
    venueId: '',
    customVenueName: '',
    customVenueAddress: '',
    isOnlineOnly: false,
    onlineJoinUrl: '',
    speakerIds: [],
    organizerIds: [],
    categoryIds: [],
    tagIds: [],
    registrationUrl: '',
    registrationButtonLabel: 'Register Now',
    registrationAvailable: true,
    isFree: true,
    currency: 'INR',
    currencySymbol: '₹',
    schedules: [],
    faqs: [],
  });

  useEffect(() => {
    if (activeTab === 'editor') {
      if (editingId) {
        const found = eventRepository.getById(editingId);
        if (found) {
          setFormData({ ...found });
        }
      } else {
        // Reset to fresh event template
        setFormData({
          title: '',
          slug: '',
          shortDescription: '',
          fullDescription: '',
          featuredPosterUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=1067&q=80',
          galleryImageUrls: [],
          status: 'published',
          operationalStatus: 'scheduled',
          startDate: new Date().toISOString().slice(0, 10),
          startTime: '09:00',
          endDate: new Date().toISOString().slice(0, 10),
          endTime: '17:30',
          isAllDay: false,
          hideEndTime: false,
          timezone: 'Asia/Kolkata',
          isRecurring: false,
          venueId: venues[0]?.id || '',
          customVenueName: '',
          customVenueAddress: '',
          isOnlineOnly: false,
          onlineJoinUrl: '',
          speakerIds: speakers[0] ? [speakers[0].id] : [],
          organizerIds: organizers[0] ? [organizers[0].id] : [],
          categoryIds: categories[0] ? [categories[0].id] : [],
          tagIds: [],
          registrationUrl: 'https://equipindianchurches.com/events',
          registrationButtonLabel: 'Register Now',
          registrationAvailable: true,
          isFree: true,
          currency: 'INR',
          currencySymbol: '₹',
          schedules: [
            {
              id: 's-1',
              title: 'Keynote Expository Session I',
              date: new Date().toISOString().slice(0, 10),
              startTime: '09:30',
              endTime: '11:00',
              speakerIds: [],
              displayOrder: 1,
            },
          ],
          faqs: [],
        });
      }
    }
  }, [activeTab, editingId]);

  const handleSaveEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error('Event title is required');
      return;
    }

    const slug = formData.slug?.trim() || 
      formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const saved = eventRepository.save({
      ...formData,
      title: formData.title.trim(),
      slug,
      shortDescription: formData.shortDescription?.trim() || '',
      fullDescription: formData.fullDescription?.trim() || '',
      featuredPosterUrl: formData.featuredPosterUrl?.trim() || '',
      startDate: formData.startDate || new Date().toISOString().slice(0, 10),
      startTime: formData.startTime || '09:00',
      endDate: formData.endDate || formData.startDate || new Date().toISOString().slice(0, 10),
      endTime: formData.endTime || '17:30',
      registrationUrl: formData.registrationUrl?.trim() || '/events',
      registrationButtonLabel: formData.registrationButtonLabel?.trim() || 'Register Now',
      createdById: user?.id || 'admin',
      createdByEmail: user?.email || 'admin@equipindianchurches.com',
    } as any);

    toast.success(
      editingId ? `Event "${saved.title}" updated successfully.` : `Event "${saved.title}" created & published.`,
      'Event Saved'
    );

    setTab('roster', null);
  };

  const getVenueName = (vId?: string, fallback?: string) => {
    if (!vId) return fallback || 'All India';
    const v = venues.find((x) => x.id === vId);
    return v ? `${v.name}, ${v.city}` : fallback || 'All India';
  };

  const getCategoryName = (cIds?: string[]) => {
    if (!cIds || !cIds.length) return 'General';
    const cat = categories.find((c) => c.id === cIds[0]);
    return cat ? cat.name : 'General';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0E1F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182541] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-[#094899]" />
            Events Hub & Assemblies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your entire church conference suite in one unified section: events roster, agendas, categories, faculty speakers, and physical venues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTab('editor', null)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#094899] hover:bg-[#07397b] text-white px-4 py-2.5 text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Unified Navigation Tabs (All adding items on ONE section) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 bg-white border border-[#D0E1F0] rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setTab('roster', null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events Roster ({stats.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('editor', editingId)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'editor'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{editingId ? 'Edit Event' : '+ Add New Event'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('categories', null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Categories & Tags ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('speakers', null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'speakers'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty & Speakers ({speakers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('organizers', null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'organizers'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organizers ({organizers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('venues', null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'venues'
              ? 'bg-[#094899] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#182541] hover:bg-[#F0F6FB]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Venues & Locations ({venues.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EVENTS ROSTER VIEW                                       */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl border border-[#D0E1F0] bg-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search custom events by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#F0F6FB] border border-[#D0E1F0] rounded-xl text-xs text-[#182541] focus:ring-2 focus:ring-[#094899] outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#F0F6FB] border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
              >
                <option value="all">All Statuses ({stats.total})</option>
                <option value="published">Published ({stats.published})</option>
                <option value="draft">Drafts ({stats.draft})</option>
                <option value="scheduled">Scheduled ({stats.scheduled})</option>
                <option value="archived">Archived ({stats.archived})</option>
                <option value="trash">Trash ({stats.trash})</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#F0F6FB] border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Events Table */}
          <div className="rounded-2xl border border-[#D0E1F0] bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#182541]">
                <thead className="bg-[#F0F6FB] border-b border-[#D0E1F0] text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Event Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Dates & Time</th>
                    <th className="py-3.5 px-4">Venue</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="w-10 h-10 text-slate-300" />
                          <p className="text-sm font-semibold">No custom events found matching filters.</p>
                          <button
                            type="button"
                            onClick={() => setTab('editor', null)}
                            className="mt-2 px-4 py-2 bg-[#094899] text-white text-xs font-bold rounded-xl"
                          >
                            + Create First Event
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-[#F0F6FB]/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5 max-w-sm">
                            {ev.featuredPosterUrl ? (
                              <img
                                src={ev.featuredPosterUrl}
                                alt={ev.title}
                                className="h-14 w-12 rounded-lg object-cover border border-[#D0E1F0] shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-12 rounded-lg bg-[#F0F6FB] border border-[#D0E1F0] flex items-center justify-center text-xs font-bold text-[#094899] shrink-0">
                                📅
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#182541] hover:text-[#094899] truncate text-sm">
                                <button
                                  type="button"
                                  onClick={() => setTab('editor', ev.id)}
                                  className="text-left hover:underline cursor-pointer"
                                >
                                  {ev.title}
                                </button>
                              </h4>
                              <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                                /{ev.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              ev.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ev.status === 'draft'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                          {getCategoryName(ev.categoryIds)}
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-600">
                          <div className="font-semibold text-[#182541]">{ev.startDate}</div>
                          <div className="text-[11px] text-slate-400">{ev.startTime} - {ev.endTime}</div>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-600 max-w-[160px] truncate">
                          {getVenueName(ev.venueId, ev.customVenueName)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setTab('editor', ev.id)}
                              className="px-2.5 py-1 rounded-lg border border-[#D0E1F0] hover:bg-[#F0F6FB] text-xs font-semibold text-[#182541] transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(ev)}
                              className="px-2.5 py-1 rounded-lg border border-[#D0E1F0] hover:bg-[#F0F6FB] text-xs font-semibold text-slate-600 transition"
                            >
                              {ev.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(ev.id)}
                              className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-[#F0F6FB] rounded-lg transition"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTrash(ev.id, ev.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CREATE / EDIT EVENT FORM                                 */}
      {/* ============================================================== */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSaveEvent} className="space-y-6">
          <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-serif text-xl font-bold text-[#182541]">
                {editingId ? `Editing Event: ${formData.title}` : 'Create New Custom Event'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab('roster', null)}
                  className="px-4 py-2 border border-[#D0E1F0] hover:bg-[#F0F6FB] text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel & Back to Roster
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. All India Pastors Conference (AIPC) 2026: Proclaiming Christ Faithfully"
                  className="w-full px-3.5 py-2.5 border border-[#D0E1F0] rounded-xl text-sm font-semibold text-[#182541] focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="aipc-2026 (auto-generated if empty)"
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-mono text-slate-600 focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Category
                </label>
                <select
                  value={formData.categoryIds?.[0] || ''}
                  onChange={(e) => setFormData({ ...formData, categoryIds: [e.target.value] })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] bg-white focus:ring-2 focus:ring-[#094899] outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime || '09:00'}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime || '17:30'}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Location
                </label>
                <select
                  value={formData.venueId || ''}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-semibold text-[#182541] bg-white focus:ring-2 focus:ring-[#094899] outline-none"
                >
                  <option value="">-- Select Configured Venue --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Venue Text (if not in list)
                </label>
                <input
                  type="text"
                  value={formData.customVenueName || ''}
                  onChange={(e) => setFormData({ ...formData, customVenueName: e.target.value })}
                  placeholder="e.g. Constitution Club of India, New Delhi"
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs text-[#182541] outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Featured Poster / Flyer Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={formData.featuredPosterUrl || ''}
                    onChange={(e) => setFormData({ ...formData, featuredPosterUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-mono text-slate-600 outline-none"
                  />
                  {formData.featuredPosterUrl && (
                    <img
                      src={formData.featuredPosterUrl}
                      alt="Flyer Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-[#D0E1F0]"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description (Shown on Home and Archive cards)
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief summary of the gathering..."
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs text-[#182541] outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Detailed Description / Agenda Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription || ''}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Full conference schedule, theological themes, registration eligibility..."
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs text-[#182541] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration / Delegate Link URL
                </label>
                <input
                  type="text"
                  value={formData.registrationUrl || ''}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="https://equipindianchurches.com/events or Google Form URL"
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs font-mono text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Button Label
                </label>
                <input
                  type="text"
                  value={formData.registrationButtonLabel || 'Register Now'}
                  onChange={(e) => setFormData({ ...formData, registrationButtonLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D0E1F0] rounded-xl text-xs text-[#182541] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('roster', null)}
                className="px-4 py-2 border border-[#D0E1F0] hover:bg-[#F0F6FB] text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {editingId ? 'Save Event' : 'Publish Event'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CATEGORIES & TAGS (Embedded on one page)                */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs">
          <AdminCategoriesPage />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: FACULTY & SPEAKERS (Embedded on one page)               */}
      {/* ============================================================== */}
      {activeTab === 'speakers' && (
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs">
          <AdminSpeakersPage />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ORGANIZERS & PARTNERS (Embedded on one page)            */}
      {/* ============================================================== */}
      {activeTab === 'organizers' && (
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs">
          <AdminOrganizersPage />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: VENUES & LOCATIONS (Embedded on one page)               */}
      {/* ============================================================== */}
      {activeTab === 'venues' && (
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs">
          <AdminVenuesPage />
        </div>
      )}
    </div>
  );
}
