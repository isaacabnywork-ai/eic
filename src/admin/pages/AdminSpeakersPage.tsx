import { useState, useEffect, type FormEvent } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Globe, 
  X, 
  Check, 
  Calendar 
} from 'lucide-react';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { eventRepository } from '../db/repositories/eventRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { Speaker, CustomEvent, EventScheduleSession } from '../db/types';

function TwitterIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function AdminSpeakersPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('create');

  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakerEventCounts, setSpeakerEventCounts] = useState<Record<string, number>>({});

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<Speaker> | null>(null);

  const reloadData = () => {
    const list = taxonomyRepository.getSpeakers();
    const allEvents: CustomEvent[] = eventRepository.getAllEvents();

    const counts: Record<string, number> = {};
    allEvents.forEach((ev: CustomEvent) => {
      ev.speakerIds?.forEach((sId: string) => {
        counts[sId] = (counts[sId] || 0) + 1;
      });
      // also check schedules
      ev.schedules?.forEach((s: EventScheduleSession) => {
        s.speakerIds?.forEach((sId: string) => {
          counts[sId] = (counts[sId] || 0) + 1;
        });
      });
    });

    setSpeakers(list);
    setSpeakerEventCounts(counts);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenNew = () => {
    setEditingSpeaker({
      name: '',
      slug: '',
      designation: '',
      organization: '',
      biography: '',
      photoUrl: '',
      websiteUrl: '',
      socialTwitter: '',
      socialLinkedin: '',
      socialYoutube: '',
      displayOrder: speakers.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (speaker: Speaker) => {
    setEditingSpeaker({ ...speaker });
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker?.name?.trim()) {
      toast('Speaker name is required', 'error');
      return;
    }

    const slug = editingSpeaker.slug?.trim() || 
      editingSpeaker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    taxonomyRepository.saveSpeaker({
      id: editingSpeaker.id,
      name: editingSpeaker.name.trim(),
      slug,
      designation: editingSpeaker.designation?.trim() || '',
      organization: editingSpeaker.organization?.trim() || '',
      biography: editingSpeaker.biography?.trim() || '',
      photoUrl: editingSpeaker.photoUrl?.trim() || '',
      websiteUrl: editingSpeaker.websiteUrl?.trim() || '',
      socialTwitter: editingSpeaker.socialTwitter?.trim() || '',
      socialLinkedin: editingSpeaker.socialLinkedin?.trim() || '',
      socialYoutube: editingSpeaker.socialYoutube?.trim() || '',
      displayOrder: Number(editingSpeaker.displayOrder) || 1,
    });

    toast(editingSpeaker.id ? 'Speaker profile updated' : 'Speaker added successfully', 'success');
    setIsModalOpen(false);
    setEditingSpeaker(null);
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    const count = speakerEventCounts[id] || 0;
    const msg = count > 0 
      ? `"${name}" is associated with ${count} event session(s). Delete speaker profile?`
      : `Delete speaker "${name}"?`;

    if (window.confirm(msg)) {
      taxonomyRepository.deleteSpeaker(id);
      toast('Speaker removed', 'info');
      reloadData();
    }
  };

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#094899]" />
            Faculty & Guest Speakers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage keynote preachers, pastors, seminar instructors, and panel leaders.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Speaker
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, church, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredSpeakers.length} of {speakers.length} speakers
        </span>
      </div>

      {/* Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSpeakers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No speakers found matching your search.
          </div>
        ) : (
          filteredSpeakers.map((speaker) => {
            const count = speakerEventCounts[speaker.id] || 0;
            return (
              <div 
                key={speaker.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {speaker.photoUrl ? (
                      <img 
                        src={speaker.photoUrl} 
                        alt={speaker.name} 
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0 font-bold text-lg">
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">{speaker.name}</h3>
                      <p className="text-xs text-[#094899] font-medium truncate">{speaker.designation || 'Speaker'}</p>
                      <p className="text-xs text-slate-500 truncate">{speaker.organization || 'Equip Indian Churches'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-3">
                    {speaker.biography || 'No biography provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {count} event{count === 1 ? '' : 's'}
                    </span>
                    {speaker.websiteUrl && (
                      <a 
                        href={speaker.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {speaker.socialTwitter && (
                      <a 
                        href={speaker.socialTwitter} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-[#1DA1F2] rounded"
                        title="Twitter / X"
                      >
                        <TwitterIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(speaker)}
                        className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Speaker"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(speaker.id, speaker.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Speaker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Speaker Modal */}
      {isModalOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#094899]" />
                {editingSpeaker.id ? 'Edit Speaker Profile' : 'Add New Speaker'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSpeaker.name || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                    placeholder="e.g. Dr. Conrad Mbewe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.slug || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, slug: e.target.value })}
                    placeholder="conrad-mbewe (auto-generated if empty)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.designation || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, designation: e.target.value })}
                    placeholder="e.g. Pastor, Keynote Preacher"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Organization / Church
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.organization || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, organization: e.target.value })}
                    placeholder="e.g. Kabwata Baptist Church"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Photo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingSpeaker.photoUrl || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, photoUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                  {editingSpeaker.photoUrl && (
                    <img 
                      src={editingSpeaker.photoUrl} 
                      alt="Preview" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Biography
                </label>
                <textarea
                  rows={4}
                  value={editingSpeaker.biography || ''}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, biography: e.target.value })}
                  placeholder="Bio and ministry background..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editingSpeaker.websiteUrl || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, websiteUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Twitter / X
                  </label>
                  <input
                    type="url"
                    value={editingSpeaker.socialTwitter || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, socialTwitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    LinkedIn / YouTube
                  </label>
                  <input
                    type="url"
                    value={editingSpeaker.socialLinkedin || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, socialLinkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Speaker Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
