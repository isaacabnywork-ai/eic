import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Database, 
  Globe, 
  Clock, 
  Coins, 
  Mail, 
  HelpCircle 
} from 'lucide-react';
import { settingsRepository } from '../db/repositories/settingsRepository';
import { adminDb } from '../db/storage';
import { useAdminToast } from '../context/AdminToastContext';
import type { ApplicationSettings } from '../db/types';

export function AdminSettingsPage() {
  const { toast } = useAdminToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<ApplicationSettings>(settingsRepository.getSettings());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(settingsRepository.getSettings());
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = settingsRepository.updateSettings({
        defaultTimezone: settings.defaultTimezone,
        defaultCurrency: settings.defaultCurrency,
        defaultCurrencySymbol: settings.defaultCurrencySymbol,
        defaultRegistrationLabel: settings.defaultRegistrationLabel,
        supportEmail: settings.supportEmail,
        eventsPerPage: Number(settings.eventsPerPage) || 12,
        enablePublicCustomEvents: settings.enablePublicCustomEvents,
        enablePublicCustomMenus: settings.enablePublicCustomMenus,
        autoArchivePastEvents: settings.autoArchivePastEvents,
      });
      setSettings(updated);
      toast('Application preferences saved successfully', 'success');
    } catch {
      toast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    try {
      const jsonStr = adminDb.exportJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eic-admin-database-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Database backup exported to JSON file', 'success');
    } catch {
      toast('Failed to export backup', 'error');
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        const ok = adminDb.importJson(content);
        if (ok) {
          toast('Database restored successfully from backup', 'success');
          setSettings(settingsRepository.getSettings());
        } else {
          toast('Invalid backup format. Import rejected.', 'error');
        }
      } catch {
        toast('Failed to parse backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFactoryReset = () => {
    const prompt1 = window.confirm(
      'WARNING: Are you sure you want to reset the custom admin database? All modified events, menus, and custom media will be replaced with initial seed data.'
    );
    if (!prompt1) return;

    const prompt2 = window.prompt('Type RESET to confirm irreversible factory reset:');
    if (prompt2 === 'RESET') {
      adminDb.resetToSeed();
      toast('Database reset to initial factory seed', 'info');
      setSettings(settingsRepository.getSettings());
    } else {
      toast('Reset cancelled', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-[#094899]" />
            Application Configuration & System Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage global defaults, localization, currency parameters, and database backup snapshots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Localization & General */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#094899]" />
            <h2 className="text-sm font-bold text-slate-900">Regional & Localization Defaults</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Default Application Timezone
              </label>
              <select
                value={settings.defaultTimezone}
                onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#094899] outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST - UTC+4)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</option>
                <option value="America/New_York">America/New_York (EST - UTC-5)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Standardizes event schedules, session agendas, and countdown tickers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Administrative Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Destination for event delegate inquiries and registration alerts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                Default Currency Code
              </label>
              <input
                type="text"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                placeholder="INR"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                Default Currency Symbol
              </label>
              <input
                type="text"
                value={settings.defaultCurrencySymbol}
                onChange={(e) => setSettings({ ...settings, defaultCurrencySymbol: e.target.value })}
                placeholder="₹"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Registration Button Label
              </label>
              <input
                type="text"
                value={settings.defaultRegistrationLabel}
                onChange={(e) => setSettings({ ...settings, defaultRegistrationLabel: e.target.value })}
                placeholder="Register Now"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Public Events Display Pagination Limit
              </label>
              <input
                type="number"
                min={4}
                max={48}
                value={settings.eventsPerPage}
                onChange={(e) => setSettings({ ...settings, eventsPerPage: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#094899]" />
            <h2 className="text-sm font-bold text-slate-900">Module Visibility & Automated Rules</h2>
          </div>

          <div className="p-6 divide-y divide-slate-100">
            <div className="py-3 first:pt-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Display Custom Events on Public Site</p>
                <p className="text-xs text-slate-500">Allow published custom events to render in public event feeds.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePublicCustomEvents}
                onChange={(e) => setSettings({ ...settings, enablePublicCustomEvents: e.target.checked })}
                className="w-4 h-4 text-[#094899] rounded border-slate-300 focus:ring-[#094899]"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Enable Custom Header Navigation Override</p>
                <p className="text-xs text-slate-500">Use custom navigation hierarchy in place of static menu links.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePublicCustomMenus}
                onChange={(e) => setSettings({ ...settings, enablePublicCustomMenus: e.target.checked })}
                className="w-4 h-4 text-[#094899] rounded border-slate-300 focus:ring-[#094899]"
              />
            </div>

            <div className="py-3 last:pb-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Automatically Archive Concluded Events</p>
                <p className="text-xs text-slate-500">Moves past events from 'published' to 'archived' when end date passes.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoArchivePastEvents}
                onChange={(e) => setSettings({ ...settings, autoArchivePastEvents: e.target.checked })}
                className="w-4 h-4 text-[#094899] rounded border-slate-300 focus:ring-[#094899]"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Database Maintenance & Backups */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#094899]" />
          <h2 className="text-sm font-bold text-slate-900">Data Management & Disaster Recovery</h2>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            All custom administration records are maintained in an independent application storage engine.
            You can export complete snapshot JSON backups for archival, import backups to restore state,
            or reset the database back to clean seed data.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON Database Snapshot
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Import Backup Snapshot
            </button>

            <button
              type="button"
              onClick={handleFactoryReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Factory Reset Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
