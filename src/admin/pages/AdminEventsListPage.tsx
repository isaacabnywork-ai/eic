import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventRepository } from '../db/repositories/eventRepository';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { adminDb } from '../db/storage';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { CustomEvent, EventStatus } from '../db/types';

export function AdminEventsListPage() {
  const toast = useAdminToast();
  const { can } = useAdminAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = taxonomyRepository.getCategories();
  const venues = taxonomyRepository.getVenues();

  const loadEvents = () => {
    const res = eventRepository.getAll({
      search,
      status: statusFilter,
      categoryId: categoryFilter,
      page,
      perPage: 10,
    });
    setEvents(res.items);
    setTotalPages(res.totalPages);
    setTotalCount(res.total);
  };

  useEffect(() => {
    loadEvents();
    return adminDb.subscribe(loadEvents);
  }, [search, statusFilter, categoryFilter, page]);

  const handleDuplicate = (id: string) => {
    const dup = eventRepository.duplicate(id);
    if (dup) {
      toast.success(`Duplicated "${dup.title}" as draft.`, 'Event Duplicated');
    }
  };

  const handleStatusToggle = (ev: CustomEvent) => {
    const nextStatus: EventStatus = ev.status === 'published' ? 'draft' : 'published';
    eventRepository.setStatus(ev.id, nextStatus);
    toast.success(`Event status changed to ${nextStatus}.`, 'Status Updated');
  };

  const handleTrash = (id: string, title: string) => {
    if (confirm(`Move "${title}" to Trash?`)) {
      eventRepository.moveToTrash(id);
      toast.info(`Moved "${title}" to Trash.`, 'Event Trashed');
    }
  };

  const handleRestore = (id: string, title: string) => {
    eventRepository.restoreFromTrash(id);
    toast.success(`Restored "${title}" to Drafts.`, 'Event Restored');
  };

  const handleDeletePermanent = (id: string, title: string) => {
    if (confirm(`PERMANENTLY delete "${title}"? This cannot be undone.`)) {
      eventRepository.permanentlyDelete(id);
      toast.warning(`Deleted "${title}" permanently.`, 'Event Deleted');
    }
  };

  const getVenueName = (vId?: string, fallback?: string) => {
    if (!vId) return fallback || 'All India';
    const v = venues.find((x) => x.id === vId);
    return v ? `${v.name}, ${v.city}` : fallback || 'All India';
  };

  const getCategoryName = (cIds: string[]) => {
    if (!cIds || !cIds.length) return 'General';
    const cat = categories.find((c) => c.id === cIds[0]);
    return cat ? cat.name : 'General';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Custom Events Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, schedule, and publish independent conferences, seminars, and ministerial roundtables.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition shadow-md shadow-amber-500/20"
        >
          <span>+</span>
          <span>Add Custom Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-[#0B111E] p-3 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search custom events by title, slug, or details..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All Statuses (Active)</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="trash">Trash (Recycle Bin)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
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
      <div className="rounded-2xl border border-slate-800 bg-[#0B111E] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A0F] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No custom events found matching current filters.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-900/50 transition">
                    {/* Event details with thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 max-w-sm">
                        <img
                          src={ev.featuredPosterUrl}
                          alt={ev.title}
                          className="h-12 w-16 object-cover rounded-lg border border-slate-700 bg-slate-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/events/${ev.id}/edit`}
                            className="font-serif text-sm font-bold text-white hover:text-amber-400 truncate block transition"
                          >
                            {ev.title}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-mono truncate block">
                            /{ev.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          ev.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ev.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : ev.status === 'trash'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                      {getCategoryName(ev.categoryIds)}
                    </td>

                    {/* Start & End Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-200">{ev.startDate}</p>
                      <p className="text-[10px] text-slate-500">
                        {ev.startTime} - {ev.endTime}
                      </p>
                    </td>

                    {/* Venue */}
                    <td className="py-3.5 px-4 max-w-[160px] truncate text-slate-300">
                      {getVenueName(ev.venueId, ev.customVenueName)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {ev.status !== 'trash' ? (
                          <>
                            <Link
                              to={`/admin/events/${ev.id}/edit`}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition font-semibold"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleStatusToggle(ev)}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition font-semibold"
                            >
                              {ev.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(ev.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition"
                              title="Duplicate Event"
                            >
                              Duplicate
                            </button>

                            {can('delete') && (
                              <button
                                type="button"
                                onClick={() => handleTrash(ev.id, ev.title)}
                                className="px-2.5 py-1 rounded-lg border border-rose-900/50 hover:bg-rose-950/50 text-rose-400 transition"
                                title="Trash Event"
                              >
                                Trash
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(ev.id, ev.title)}
                              className="px-2.5 py-1 rounded-lg border border-emerald-700 bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 transition font-bold"
                            >
                              Restore
                            </button>

                            {can('delete') && (
                              <button
                                type="button"
                                onClick={() => handleDeletePermanent(ev.id, ev.title)}
                                className="px-2.5 py-1 rounded-lg border border-rose-800 bg-rose-950/60 text-rose-300 hover:text-rose-100 transition font-bold"
                              >
                                Delete Forever
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 bg-[#070A0F] border-t border-slate-800 text-xs text-slate-400">
          <p>
            Showing {events.length} of {totalCount} events
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              ← Prev
            </button>
            <span className="px-2 text-slate-500 font-bold">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
