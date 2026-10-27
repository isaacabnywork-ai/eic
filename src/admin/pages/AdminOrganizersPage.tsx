import { useState, useEffect, type FormEvent } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Globe, 
  Mail, 
  Phone, 
  X, 
  Check, 
  Calendar 
} from 'lucide-react';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { eventRepository } from '../db/repositories/eventRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { Organizer, CustomEvent } from '../db/types';

export function AdminOrganizersPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('create');

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizerEventCounts, setOrganizerEventCounts] = useState<Record<string, number>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Partial<Organizer> | null>(null);

  const reloadData = () => {
    const list = taxonomyRepository.getOrganizers();
    const allEvents: CustomEvent[] = eventRepository.getAllEvents();

    const counts: Record<string, number> = {};
    allEvents.forEach((ev: CustomEvent) => {
      ev.organizerIds?.forEach((oId: string) => {
        counts[oId] = (counts[oId] || 0) + 1;
      });
    });

    setOrganizers(list);
    setOrganizerEventCounts(counts);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenNew = () => {
    setEditingOrganizer({
      name: '',
      slug: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
      logoUrl: '',
      displayOrder: organizers.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organizer) => {
    setEditingOrganizer({ ...org });
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingOrganizer?.name?.trim()) {
      toast('Organizer name is required', 'error');
      return;
    }

    const slug = editingOrganizer.slug?.trim() || 
      editingOrganizer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    taxonomyRepository.saveOrganizer({
      id: editingOrganizer.id,
      name: editingOrganizer.name.trim(),
      slug,
      description: editingOrganizer.description?.trim() || '',
      contactEmail: editingOrganizer.contactEmail?.trim() || '',
      contactPhone: editingOrganizer.contactPhone?.trim() || '',
      websiteUrl: editingOrganizer.websiteUrl?.trim() || '',
      logoUrl: editingOrganizer.logoUrl?.trim() || '',
      displayOrder: Number(editingOrganizer.displayOrder) || 1,
    });

    toast(editingOrganizer.id ? 'Organizer updated' : 'Organizer created', 'success');
    setIsModalOpen(false);
    setEditingOrganizer(null);
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    const count = organizerEventCounts[id] || 0;
    const msg = count > 0 
      ? `"${name}" organizes ${count} event(s). Are you sure you want to delete this profile?`
      : `Delete organizer "${name}"?`;

    if (window.confirm(msg)) {
      taxonomyRepository.deleteOrganizer(id);
      toast('Organizer deleted', 'info');
      reloadData();
    }
  };

  const filteredOrganizers = organizers.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.contactEmail && o.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#094899]" />
            Event Organizers & Ministry Partners
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hosting institutions, church fellowships, seminaries, and publishing houses.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Organizer
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search organizers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredOrganizers.length} of {organizers.length} organizers
        </span>
      </div>

      {/* Organizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrganizers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            No organizers found matching search.
          </div>
        ) : (
          filteredOrganizers.map((org) => {
            const count = organizerEventCounts[org.id] || 0;
            return (
              <div 
                key={org.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {org.logoUrl ? (
                      <img 
                        src={org.logoUrl} 
                        alt={org.name} 
                        className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#094899] flex items-center justify-center font-bold text-base border border-blue-100 flex-shrink-0">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">{org.name}</h3>
                      <p className="text-xs text-slate-500 font-mono truncate">{org.slug}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-3">
                    {org.description || 'No description provided.'}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {org.contactEmail && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{org.contactEmail}</span>
                      </div>
                    )}
                    {org.contactPhone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{org.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {count} event{count === 1 ? '' : 's'}
                    </span>
                    {org.websiteUrl && (
                      <a 
                        href={org.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-[#094899] rounded transition-colors"
                        title="Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(org)}
                        className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Organizer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id, org.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Organizer"
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
      {isModalOpen && editingOrganizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#094899]" />
                {editingOrganizer.id ? 'Edit Organizer' : 'Add New Organizer'}
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
                  Organizer / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingOrganizer.name || ''}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, name: e.target.value })}
                  placeholder="e.g. Equip Indian Churches Ministries"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editingOrganizer.slug || ''}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, slug: e.target.value })}
                  placeholder="equip-indian-churches (auto-generated if empty)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={editingOrganizer.contactEmail || ''}
                    onChange={(e) => setEditingOrganizer({ ...editingOrganizer, contactEmail: e.target.value })}
                    placeholder="events@equipindianchurches.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingOrganizer.contactPhone || ''}
                    onChange={(e) => setEditingOrganizer({ ...editingOrganizer, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editingOrganizer.websiteUrl || ''}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, websiteUrl: e.target.value })}
                  placeholder="https://equipindianchurches.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={editingOrganizer.logoUrl || ''}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingOrganizer.description || ''}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, description: e.target.value })}
                  placeholder="About the organizing entity..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none resize-none"
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
                  Save Organizer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
