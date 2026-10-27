import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { eventRepository } from '../db/repositories/eventRepository';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { auditRepository } from '../db/repositories/auditRepository';
import { adminDb } from '../db/storage';
import type { CustomEvent, AuditLog } from '../db/types';
import { Calendar, Users, MapPin, Plus, ArrowRight, Activity, Clock } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#182541] via-[#094899] to-[#182541] text-white shadow-sm border border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Equip Indian Churches custom administration console. Managing independent conferences, navigation menus, and public event schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/events?tab=editor"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-[#F0F6FB] px-4 py-2.5 text-xs font-bold text-[#182541] shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-[#094899]" />
            <span>Create Event</span>
          </Link>
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition"
          >
            <span>Events Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-5 rounded-2xl border border-[#D0E1F0] bg-white shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Custom Events</p>
          <p className="text-3xl font-black text-[#182541] mt-1.5">{stats.total}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="text-emerald-700 font-bold">{stats.published} Published</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">{stats.draft} Drafts</span>
          </div>
        </div>

        {/* Upcoming Assemblies */}
        <div className="p-5 rounded-2xl border border-[#D0E1F0] bg-white shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Upcoming Events</p>
          <p className="text-3xl font-black text-[#094899] mt-1.5">{stats.upcoming}</p>
          <div className="mt-2.5 text-xs text-slate-500 font-medium">
            <span>{stats.expired} past gatherings</span>
          </div>
        </div>

        {/* Categories & Taxonomies */}
        <div className="p-5 rounded-2xl border border-[#D0E1F0] bg-white shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Categories & Tags</p>
          <p className="text-3xl font-black text-[#182541] mt-1.5">{categoriesCount}</p>
          <div className="mt-2.5 text-xs text-slate-500 font-medium">
            <Link to="/admin/events?tab=categories" className="text-[#094899] hover:underline font-semibold">
              Manage taxonomies →
            </Link>
          </div>
        </div>

        {/* Speakers & Faculty */}
        <div className="p-5 rounded-2xl border border-[#D0E1F0] bg-white shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Faculty & Speakers</p>
          <p className="text-3xl font-black text-[#182541] mt-1.5">{speakersCount}</p>
          <div className="mt-2.5 text-xs text-slate-500 font-medium">
            <span>{venuesCount} configured venues</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Upcoming Events Table */}
        <div className="lg:col-span-8 rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#182541]">Active Custom Events</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live and scheduled events displayed on the public website</p>
            </div>
            <Link to="/admin/events" className="text-xs font-bold text-[#094899] hover:underline">
              View All ({stats.total}) →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active events yet. Click "Create Event" to schedule your first gathering.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {ev.featuredPosterUrl ? (
                      <img
                        src={ev.featuredPosterUrl}
                        alt={ev.title}
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-[#F0F6FB] border border-[#D0E1F0] flex items-center justify-center text-[#094899] font-bold text-xs shrink-0">
                        📅
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#182541] truncate hover:text-[#094899]">
                        <Link to={`/admin/events?tab=editor&id=${ev.id}`}>{ev.title}</Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {ev.startDate || 'Upcoming'}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{ev.customVenueName || 'All India'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {ev.status}
                    </span>
                    <Link
                      to={`/admin/events?tab=editor&id=${ev.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[#D0E1F0] hover:bg-[#F0F6FB] text-xs font-semibold text-[#182541] transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Links & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#182541]">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/admin/events?tab=editor"
                className="flex items-center justify-between p-3 rounded-xl border border-[#D0E1F0] bg-[#F0F6FB]/70 hover:bg-[#F0F6FB] hover:border-[#094899]/30 text-xs font-bold text-[#182541] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#094899]" />
                  <span>Create New Event</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/admin/events?tab=speakers"
                className="flex items-center justify-between p-3 rounded-xl border border-[#D0E1F0] bg-[#F0F6FB]/70 hover:bg-[#F0F6FB] hover:border-[#094899]/30 text-xs font-bold text-[#182541] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#094899]" />
                  <span>Manage Speakers</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/admin/events?tab=venues"
                className="flex items-center justify-between p-3 rounded-xl border border-[#D0E1F0] bg-[#F0F6FB]/70 hover:bg-[#F0F6FB] hover:border-[#094899]/30 text-xs font-bold text-[#182541] transition"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#094899]" />
                  <span>Manage Venues</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/admin/menus/header"
                className="flex items-center justify-between p-3 rounded-xl border border-[#D0E1F0] bg-[#F0F6FB]/70 hover:bg-[#F0F6FB] hover:border-[#094899]/30 text-xs font-bold text-[#182541] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span>🧭</span>
                  <span>Header Navigation</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Audit Logs Card */}
          <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-base font-bold text-[#182541] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#094899]" />
                Recent Logs
              </h3>
              <Link to="/admin/activity" className="text-xs font-semibold text-[#094899] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[#182541] truncate">{log.action}</p>
                    <p className="text-[11px] text-slate-500 truncate">{log.entityTitle || log.userEmail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
