import { useState, useEffect, type FormEvent } from 'react';
import { 
  Navigation, 
  Plus, 
  Trash2, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  CornerDownRight, 
  HelpCircle 
} from 'lucide-react';
import { menuRepository } from '../db/repositories/menuRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { CustomMenuItem } from '../db/types';

export function AdminHeaderMenuPage() {
  const { toast } = useAdminToast();
  const { can } = useAdminAuth();
  const canEdit = can('edit');

  const [items, setItems] = useState<CustomMenuItem[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [lastSavedBy, setLastSavedBy] = useState<string>('');

  // New item modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentTargetId, setParentTargetId] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemTarget, setItemTarget] = useState<'_self' | '_blank'>('_self');

  const loadMenu = () => {
    const config = menuRepository.getHeaderMenu();
    setItems(JSON.parse(JSON.stringify(config.items)));
    setLastSaved(config.updatedAt);
    setLastSavedBy(config.updatedBy);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleSave = () => {
    menuRepository.saveHeaderMenu(items);
    toast('Custom header navigation saved successfully', 'success');
    loadMenu();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleToggleEnabled = (id: string) => {
    const toggleInList = (list: CustomMenuItem[]): CustomMenuItem[] => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, isEnabled: !item.isEnabled };
        }
        if (item.children) {
          return { ...item, children: toggleInList(item.children) };
        }
        return item;
      });
    };
    setItems(toggleInList(items));
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm('Delete this menu item?')) return;
    const deleteFromList = (list: CustomMenuItem[]): CustomMenuItem[] => {
      return list
        .filter(item => item.id !== id)
        .map(item => item.children ? { ...item, children: deleteFromList(item.children) } : item);
    };
    setItems(deleteFromList(items));
  };

  const handleOpenAddModal = (parentId: string | null = null) => {
    setParentTargetId(parentId);
    setItemLabel('');
    setItemUrl('');
    setItemTarget('_self');
    setIsModalOpen(true);
  };

  const handleCreateItem = (e: FormEvent) => {
    e.preventDefault();
    if (!itemLabel.trim() || !itemUrl.trim()) {
      toast('Both label and URL are required', 'error');
      return;
    }

    const newItem: CustomMenuItem = {
      id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: itemLabel.trim(),
      url: itemUrl.trim(),
      target: itemTarget,
      isEnabled: true,
      displayOrder: 99,
      children: [],
    };

    if (parentTargetId) {
      // Add as child
      const addToParent = (list: CustomMenuItem[]): CustomMenuItem[] => {
        return list.map(item => {
          if (item.id === parentTargetId) {
            return {
              ...item,
              children: [...(item.children || []), newItem],
            };
          }
          if (item.children) {
            return { ...item, children: addToParent(item.children) };
          }
          return item;
        });
      };
      setItems(addToParent(items));
      toast(`Added sub-item under parent`, 'success');
    } else {
      // Add as top-level
      setItems([...items, newItem]);
      toast('Added top-level menu item', 'success');
    }

    setIsModalOpen(false);
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
            <Navigation className="w-7 h-7 text-[#094899]" />
            Header Navigation Menu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build and reorder custom navigation links and multi-level dropdowns for the public website.
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
              onClick={() => handleOpenAddModal(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 text-[#094899]" />
              Add Top Link
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Menu Changes
            </button>
          </div>
        )}
      </div>

      {/* Isolation Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#094899] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Independent Menu Storage:</span> Changes configured here are stored strictly in the custom administration database. They do not alter or delete WordPress wp_terms or nav_menu posts, ensuring the main WordPress headless menu remains protected.
        </div>
      </div>

      {/* Menu Tree */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <span>Navigation Item & Destination</span>
          <span>Actions & Hierarchy</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No navigation items configured. Click "Add Top Link" to add your first menu item.
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="p-3 hover:bg-slate-50/50 transition-colors space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${item.isEnabled ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {item.label}
                      </span>
                      {item.target === '_blank' && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          External <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {!item.isEnabled && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 truncate mt-0.5">{item.url}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(item.id)}
                        className="p-1.5 text-slate-400 hover:text-[#094899] hover:bg-blue-50 rounded transition-colors"
                        title="Add Dropdown Sub-item"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleEnabled(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title={item.isEnabled ? 'Disable Link' : 'Enable Link'}
                      >
                        {item.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Nested Children */}
              {item.children && item.children.length > 0 && (
                <div className="ml-9 pl-4 border-l-2 border-slate-200 space-y-2 pt-1">
                  {item.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div>
                          <span className={`text-xs font-semibold ${child.isEnabled ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                            {child.label}
                          </span>
                          <p className="text-[11px] font-mono text-slate-400 truncate">{child.url}</p>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleEnabled(child.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title={child.isEnabled ? 'Disable' : 'Enable'}
                          >
                            {child.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(child.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Meta Footer */}
      <div className="text-xs text-slate-400 flex items-center justify-between px-1">
        <span>Last updated: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</span>
        <span>Modified by: {lastSavedBy || 'Default System'}</span>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#094899]" />
                {parentTargetId ? 'Add Sub-Menu Link' : 'Add Top-Level Link'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Menu Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  placeholder="e.g. Conferences & Seminars"
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
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  placeholder="e.g. /events or https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link Target
                </label>
                <select
                  value={itemTarget}
                  onChange={(e) => setItemTarget(e.target.value as '_self' | '_blank')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#094899] outline-none"
                >
                  <option value="_self">Same Tab (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
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
