import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { eventRepository } from '../db/repositories/eventRepository';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { auditRepository } from '../db/repositories/auditRepository';
import { adminDb } from '../db/storage';
import type { CustomEvent, AuditLog } from '../db/types';

export function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState(eventRepository.getStats());
  const [upcomingEvents, setUpcomingEvents] = useState<CustomEvent[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [speakersCount, setSpeakersCount] = useState(0);
  const [venuesCount, setVenuesCount] = useState(0);

  const loadData = () => {
    setStats(eventRepository.getStats());
    const { items } = eventRepository.getAll({ status: 'published', perPage: 5 });
    setUpcomingEvents(items);
    setRecentLogs(auditRepository.getAll(6));
    setCategoriesCount(taxonomyRepository.getCategories().length);
    setSpeakersCount(taxonomyRepository.getSpeakers().length);
    setVenuesCount(taxonomyRepository.getVenues().length);
  };

  useEffect(() => {
    loadData();
    return adminDb.subscribe(loadData);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E1626] to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Equip Indian Churches custom administration panel. Managing independent events, menus, and configurations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition shadow-md shadow-amber-500/20"
          >
            <span>+</span>
            <span>Create Event</span>
          </Link>
          <Link
            to="/admin/menus/header"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition"
          >
            <span>Edit Header Menu</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Events */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B111E] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Custom Events</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{stats.total}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="text-emerald-400 font-bold">{stats.published} Published</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{stats.draft} Drafts</span>
          </div>
        </div>

        {/* Upcoming Assemblies */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B111E] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Events</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5">{stats.upcoming}</p>
          <div className="mt-2 text-[10px] text-slate-500">
            <span>{stats.expired} past/concluded events</span>
          </div>
        </div>

        {/* Categories & Tags */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B111E] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Event Categories</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{categoriesCount}</p>
          <div className="mt-2 text-[10px] text-slate-500">
            <Link to="/admin/categories" className="text-amber-400 hover:underline">
              Manage taxonomies →
            </Link>
          </div>
        </div>

        {/* Speakers & Faculty */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B111E] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Faculty & Speakers</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{speakersCount}</p>
          <div className="mt-2 text-[10px] text-slate-500">
            <span>{venuesCount} configured venues</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Upcoming Events Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#0B111E] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Active Custom Events</h2>
              <p className="text-xs text-slate-400">Live and scheduled events stored in the custom admin database</p>
            </div>
            <Link to="/admin/events" className="text-xs font-semibold text-amber-400 hover:underline">
              View All ({stats.total}) →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No published events yet. Click "Create Event" to schedule your first assembly.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={ev.featuredPosterUrl}
                      alt={ev.title}
                      className="h-14 w-20 object-cover rounded-lg bg-slate-900 border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ev.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {ev.startDate}
                        </span>
                      </div>
                      <h3 className="font-serif text-sm font-bold text-white truncate mt-1">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {ev.customVenueName || 'All India Gathering'} • {ev.isFree ? 'Free Admission' : `₹${ev.price || 0}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/admin/events/${ev.id}/edit`}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-500 transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Actions & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B111E] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Administrative Shortcuts</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/events/new"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                <span>➕ Add New Custom Event</span>
                <span>→</span>
              </Link>
              <Link
                to="/admin/menus/header"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                <span>🧭 Configure Header Menu</span>
                <span>→</span>
              </Link>
              <Link
                to="/admin/menus/footer"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                <span>📑 Configure Footer Menu</span>
                <span>→</span>
              </Link>
              <Link
                to="/admin/media"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                <span>🖼️ Media Library</span>
                <span>→</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-white transition"
              >
                <span>⚙️ System Preferences</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Audit Logs Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B111E] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Admin Activity</h3>
              <Link to="/admin/activity" className="text-[11px] text-amber-400 hover:underline">
                All Logs →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono text-amber-300 font-bold">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 font-medium truncate mt-0.5">
                    {log.entityTitle || log.entity}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{log.userEmail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
