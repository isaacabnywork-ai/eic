import { useState, useEffect, type FormEvent } from 'react';
import { 
  Columns, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  X
} from 'lucide-react';
import { menuRepository } from '../db/repositories/menuRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { CustomFooterGroup } from '../db/types';

export function AdminFooterMenuPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('edit');

  const [groups, setGroups] = useState<CustomFooterGroup[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [lastSavedBy, setLastSavedBy] = useState<string>('');

  // Link Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState<'_self' | '_blank'>('_self');

  // Column Modal
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [columnHeading, setColumnHeading] = useState('');

  const loadMenu = () => {
    const config = menuRepository.getFooterMenu();
    setGroups(JSON.parse(JSON.stringify(config.groups)));
    setLastSaved(config.updatedAt);
    setLastSavedBy(config.updatedBy);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleSave = () => {
    menuRepository.saveFooterMenu(groups);
    toast('Footer menu configuration saved successfully', 'success');
    loadMenu();
  };

  const handleAddColumn = (e: FormEvent) => {
    e.preventDefault();
    if (!columnHeading.trim()) return;

    const newGroup: CustomFooterGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      heading: columnHeading.trim(),
      displayOrder: groups.length + 1,
      links: [],
    };

    setGroups([...groups, newGroup]);
    setIsColModalOpen(false);
    setColumnHeading('');
    toast(`Added column "${newGroup.heading}"`, 'success');
  };

  const handleDeleteColumn = (groupId: string, heading: string) => {
    if (window.confirm(`Delete footer column "${heading}" and all its links?`)) {
      setGroups(groups.filter(g => g.id !== groupId));
      toast('Footer column deleted', 'info');
    }
  };

  const handleOpenAddLink = (groupId: string) => {
    setTargetGroupId(groupId);
    setLinkLabel('');
    setLinkUrl('');
    setLinkTarget('_self');
    setIsLinkModalOpen(true);
  };

  const handleCreateLink = (e: FormEvent) => {
    e.preventDefault();
    if (!linkLabel.trim() || !linkUrl.trim() || !targetGroupId) return;

    const newLink = {
      id: `flink-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: linkLabel.trim(),
      url: linkUrl.trim(),
      target: linkTarget,
      isEnabled: true,
      displayOrder: 99,
    };

    setGroups(groups.map(g => {
      if (g.id === targetGroupId) {
        return {
          ...g,
          links: [...g.links, newLink],
        };
      }
      return g;
    }));

    setIsLinkModalOpen(false);
    toast('Link added to footer group', 'success');
  };

  const handleDeleteLink = (groupId: string, linkId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: g.links.filter(l => l.id !== linkId),
        };
      }
      return g;
    }));
  };

  const handleToggleLink = (groupId: string, linkId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: g.links.map(l => l.id === linkId ? { ...l, isEnabled: !l.isEnabled } : l),
        };
      }
      return g;
    }));
  };

  const handleReset = () => {
    if (window.confirm('Discard unsaved changes and reload from database?')) {
      loadMenu();
      toast('Reloaded saved configuration', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Columns className="w-7 h-7 text-[#094899]" />
            Footer Navigation & Link Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure multi-column footer navigation, ministry resource directories, and copyright links.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Reset
            </button>
            <button
              onClick={() => setIsColModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 text-[#094899]" />
              Add Column Group
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Footer Menu
            </button>
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#094899] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">WordPress Safety:</span> These footer link columns are rendered independently by the custom application layout, keeping the original WordPress theme functions intact.
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {groups.map((group, gIdx) => (
          <div 
            key={group.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Column Header */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {gIdx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm truncate" title={group.heading}>
                    {group.heading}
                  </h3>
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleDeleteColumn(group.id, group.heading)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Links List */}
              <div className="p-3 space-y-2">
                {group.links.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No links in this column.</p>
                ) : (
                  group.links.map((link) => (
                    <div 
                      key={link.id}
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${link.isEnabled ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                            {link.label}
                          </span>
                          {link.target === '_blank' && (
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{link.url}</p>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleLink(group.id, link.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title={link.isEnabled ? 'Disable' : 'Enable'}
                          >
                            {link.isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(group.id, link.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column Bottom Action */}
            {canEdit && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                <button
                  type="button"
                  onClick={() => handleOpenAddLink(group.id)}
                  className="w-full py-1.5 px-3 border border-dashed border-slate-300 hover:border-[#094899] hover:bg-blue-50/40 text-slate-600 hover:text-[#094899] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Link
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meta Footer */}
      <div className="text-xs text-slate-400 flex items-center justify-between px-1">
        <span>Last updated: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</span>
        <span>Modified by: {lastSavedBy || 'Default System'}</span>
      </div>

      {/* Add Column Modal */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Columns className="w-5 h-5 text-[#094899]" />
                Add Column Heading
              </h3>
              <button onClick={() => setIsColModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddColumn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Column Title
                </label>
                <input
                  type="text"
                  required
                  value={columnHeading}
                  onChange={(e) => setColumnHeading(e.target.value)}
                  placeholder="e.g. Recommended Ministries"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsColModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Create Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#094899]" />
                Add Footer Link
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLink} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="e.g. Theological Library"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Destination URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. /library or https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target
                </label>
                <select
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value as '_self' | '_blank')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#094899] outline-none"
                >
                  <option value="_self">Same Window (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
