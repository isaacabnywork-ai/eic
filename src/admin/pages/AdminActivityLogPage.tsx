import { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Info, 
  X 
} from 'lucide-react';
import { auditRepository } from '../db/repositories/auditRepository';
import type { AuditLog } from '../db/types';

export function AdminActivityLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const reloadData = () => {
    setLogs(auditRepository.getAll(300));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesEntity = selectedEntity === 'all' || log.entity === selectedEntity;
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityTitle && log.entityTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEntity && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'User Email', 'Action', 'Entity', 'Entity ID', 'Entity Title', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.userEmail,
      l.action,
      l.entity,
      l.entityId || '',
      `"${(l.entityTitle || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eic-admin-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('failed')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('create') || action.includes('upload')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('update') || action.includes('publish')) return 'bg-blue-100 text-[#094899] border-blue-200';
    if (action.includes('login') || action.includes('logout')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#094899]" />
            Administrative Audit Trail & Activity Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete tamper-resistant timeline of user logins, content mutations, and administrative actions.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV Audit Log
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by user, action, or event title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#094899]"
          >
            <option value="all">All Modules</option>
            <option value="event">Events</option>
            <option value="category">Categories</option>
            <option value="tag">Tags</option>
            <option value="speaker">Speakers</option>
            <option value="organizer">Organizers</option>
            <option value="venue">Venues</option>
            <option value="menu">Navigation Menus</option>
            <option value="user">User Accounts</option>
            <option value="auth">Authentication</option>
            <option value="media">Media</option>
            <option value="settings">Settings</option>
            <option value="database">Database Operations</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module / Entity</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                      {log.userEmail}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {log.entity}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-800 max-w-xs truncate font-medium">
                      {log.entityTitle || log.entityId || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setActiveLog(log)}
                          className="text-xs text-[#094899] hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#094899]" />
                Audit Record Details
              </h3>
              <button onClick={() => setActiveLog(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 block uppercase">Action</span>
                  <p className="font-bold text-slate-900 font-mono mt-0.5">{activeLog.action}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase">Timestamp</span>
                  <p className="font-medium text-slate-900 mt-0.5">{new Date(activeLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase">Operator</span>
                  <p className="font-medium text-slate-900 mt-0.5">{activeLog.userEmail}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase">Entity ID</span>
                  <p className="font-mono text-slate-700 mt-0.5 truncate">{activeLog.entityId || 'N/A'}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 text-xs block uppercase mb-1.5">
                  Payload & Mutated Attributes
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(activeLog.details, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLog(null)}
                  className="px-4 py-1.5 bg-[#094899] hover:bg-[#07397b] text-white text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
