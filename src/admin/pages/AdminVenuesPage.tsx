import { useState, useEffect, type FormEvent } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  X, 
  Check, 
  Calendar,
  Users 
} from 'lucide-react';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { eventRepository } from '../db/repositories/eventRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { Venue, CustomEvent } from '../db/types';

export function AdminVenuesPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('create');

  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [venueEventCounts, setVenueEventCounts] = useState<Record<string, number>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Partial<Venue> | null>(null);

  const reloadData = () => {
    const list = taxonomyRepository.getVenues();
    const allEvents: CustomEvent[] = eventRepository.getAllEvents();

    const counts: Record<string, number> = {};
    allEvents.forEach((ev: CustomEvent) => {
      if (ev.venueId) {
        counts[ev.venueId] = (counts[ev.venueId] || 0) + 1;
      }
    });

    setVenues(list);
    setVenueEventCounts(counts);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenNew = () => {
    setEditingVenue({
      name: '',
      slug: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      mapUrl: '',
      capacity: 500,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue({ ...venue });
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingVenue?.name?.trim()) {
      toast('Venue name is required', 'error');
      return;
    }

    const slug = editingVenue.slug?.trim() || 
      editingVenue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    taxonomyRepository.saveVenue({
      id: editingVenue.id,
      name: editingVenue.name.trim(),
      slug,
      address: editingVenue.address?.trim() || '',
      city: editingVenue.city?.trim() || '',
      state: editingVenue.state?.trim() || '',
      country: editingVenue.country?.trim() || 'India',
      postalCode: editingVenue.postalCode?.trim() || '',
      mapUrl: editingVenue.mapUrl?.trim() || '',
      capacity: Number(editingVenue.capacity) || undefined,
    });

    toast(editingVenue.id ? 'Venue updated successfully' : 'Venue added successfully', 'success');
    setIsModalOpen(false);
    setEditingVenue(null);
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    const count = venueEventCounts[id] || 0;
    const msg = count > 0 
      ? `"${name}" is associated with ${count} event(s). Delete venue?`
      : `Delete venue "${name}"?`;

    if (window.confirm(msg)) {
      taxonomyRepository.deleteVenue(id);
      toast('Venue deleted', 'info');
      reloadData();
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-[#094899]" />
            Venues & Physical Locations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage convention centres, local church auditoriums, and seminar halls across India.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Venue
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search venues by name, city, state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredVenues.length} of {venues.length} venues
        </span>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No venues found matching search.
          </div>
        ) : (
          filteredVenues.map((venue) => {
            const count = venueEventCounts[venue.id] || 0;
            return (
              <div 
                key={venue.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{venue.name}</h3>
                      <p className="text-xs font-semibold text-[#094899] mt-0.5">
                        {venue.city}{venue.state ? `, ${venue.state}` : ''}
                      </p>
                    </div>
                    {venue.capacity && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        <Users className="w-3 h-3 text-slate-400" />
                        {venue.capacity.toLocaleString()} seats
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    {venue.address}
                    {venue.postalCode ? ` - ${venue.postalCode}` : ''}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {count} event{count === 1 ? '' : 's'}
                    </span>
                    {venue.mapUrl && (
                      <a 
                        href={venue.mapUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#094899] hover:underline"
                      >
                        Google Map
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(venue)}
                        className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Venue"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(venue.id, venue.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Venue"
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

      {/* Modal */}
      {isModalOpen && editingVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#094899]" />
                {editingVenue.id ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Venue Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingVenue.name || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                  placeholder="e.g. St. Andrew's Auditorium"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Street Address
                </label>
                <textarea
                  rows={2}
                  value={editingVenue.address || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                  placeholder="Street name, landmark, locality..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVenue.city || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editingVenue.state || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Postal / PIN Code
                  </label>
                  <input
                    type="text"
                    value={editingVenue.postalCode || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, postalCode: e.target.value })}
                    placeholder="e.g. 400050"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={editingVenue.capacity || ''}
                    onChange={(e) => setEditingVenue({ ...editingVenue, capacity: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 800"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Google Maps URL / Embed Link
                </label>
                <input
                  type="url"
                  value={editingVenue.mapUrl || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
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
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
