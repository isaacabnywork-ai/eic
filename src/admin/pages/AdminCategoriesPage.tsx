import { useState, useEffect, type FormEvent } from 'react';
import { 
  Tag, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  Check, 
  Palette, 
  Layers,
  Calendar
} from 'lucide-react';
import { taxonomyRepository } from '../db/repositories/taxonomyRepository';
import { eventRepository } from '../db/repositories/eventRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { EventCategory, EventTag, CustomEvent } from '../db/types';

const PRESET_COLORS = [
  '#094899', '#2563eb', '#0d9488', '#059669', 
  '#d97706', '#dc2626', '#7c3aed', '#db2777', 
  '#475569', '#1e293b'
];

export function AdminCategoriesPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('create');

  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Category Edit / Create Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<EventCategory> | null>(null);

  // Quick Tag Add
  const [newTagName, setNewTagName] = useState('');

  // Event counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

  const reloadData = () => {
    const cats = taxonomyRepository.getCategories();
    const tgs = taxonomyRepository.getTags();
    const allEvents: CustomEvent[] = eventRepository.getAllEvents();

    const catMap: Record<string, number> = {};
    const tagMap: Record<string, number> = {};

    allEvents.forEach((ev: CustomEvent) => {
      ev.categoryIds?.forEach((cId: string) => {
        catMap[cId] = (catMap[cId] || 0) + 1;
      });
      ev.tagIds?.forEach((tId: string) => {
        tagMap[tId] = (tagMap[tId] || 0) + 1;
      });
    });

    setCategories(cats);
    setTags(tgs);
    setCategoryCounts(catMap);
    setTagCounts(tagMap);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Category Actions
  const handleOpenNewCat = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      colorHex: '#094899',
      displayOrder: categories.length + 1,
    });
    setIsCatModalOpen(true);
  };

  const handleEditCat = (cat: EventCategory) => {
    setEditingCategory({ ...cat });
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      toast('Category name is required', 'error');
      return;
    }

    const slug = editingCategory.slug?.trim() || 
      editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    taxonomyRepository.saveCategory({
      id: editingCategory.id,
      name: editingCategory.name.trim(),
      slug,
      description: editingCategory.description?.trim() || '',
      colorHex: editingCategory.colorHex || '#094899',
      displayOrder: Number(editingCategory.displayOrder) || 1,
    });

    toast(editingCategory.id ? 'Category updated successfully' : 'Category created successfully', 'success');
    setIsCatModalOpen(false);
    setEditingCategory(null);
    reloadData();
  };

  const handleDeleteCat = (id: string, name: string) => {
    const count = categoryCounts[id] || 0;
    const confirmMsg = count > 0 
      ? `"${name}" is currently assigned to ${count} event(s). Are you sure you want to delete it?`
      : `Delete category "${name}"?`;

    if (window.confirm(confirmMsg)) {
      taxonomyRepository.deleteCategory(id);
      toast('Category deleted', 'info');
      reloadData();
    }
  };

  // Tag Actions
  const handleCreateTag = (e: FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    taxonomyRepository.saveTag(newTagName.trim());
    toast(`Tag "${newTagName.trim()}" created`, 'success');
    setNewTagName('');
    reloadData();
  };

  const handleDeleteTag = (id: string, name: string) => {
    if (window.confirm(`Delete tag "${name}"?`)) {
      taxonomyRepository.deleteTag(id);
      toast('Tag removed', 'info');
      reloadData();
    }
  };

  // Filtered lists
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#094899]" />
            Taxonomies & Categorization
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize events with structured categories, thematic badges, and search tags.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {activeTab === 'categories' ? (
              <button
                onClick={handleOpenNewCat}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-[#094899] text-[#094899]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'tags'
                ? 'border-[#094899] text-[#094899]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            Tags ({tags.length})
          </button>
        </div>

        {/* Search */}
        <div className="pb-3 relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
      </div>

      {/* Categories View */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Color & Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Assigned Events</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No categories found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span 
                              className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: cat.colorHex }}
                            />
                            <span className="font-semibold text-slate-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                          {cat.slug}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {cat.description || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {count}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-500">
                          {cat.displayOrder}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {canEdit && (
                              <>
                                <button
                                  onClick={() => handleEditCat(cat)}
                                  className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-slate-100 rounded-md transition-colors"
                                  title="Edit Category"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCat(cat.id, cat.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tags View */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Quick Add Tag Bar */}
          {canEdit && (
            <form onSubmit={handleCreateTag} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Tag className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter new tag name (e.g. 'Pastors Fellowship', 'Expository Preaching')..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#094899]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </form>
          )}

          {/* Tags Cloud / Grid */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#094899]" />
              Configured Tags ({filteredTags.length})
            </h3>
            {filteredTags.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No tags found.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {filteredTags.map((tag) => {
                  const count = tagCounts[tag.id] || 0;
                  return (
                    <div 
                      key={tag.id}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold">
                        {count}
                      </span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                          title="Delete Tag"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#094899]" />
                {editingCategory.id ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Theological Conference"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="theological-conference (auto-generated if empty)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Badge Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editingCategory.colorHex || '#094899'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, colorHex: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded border border-slate-200 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {PRESET_COLORS.map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, colorHex: clr })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          editingCategory.colorHex === clr ? 'scale-110 border-slate-900 ring-2 ring-slate-400' : 'border-white'
                        }`}
                        style={{ backgroundColor: clr }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingCategory.displayOrder || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Brief description of events that fall under this category..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
