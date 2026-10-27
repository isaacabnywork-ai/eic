import { useState, useEffect, type FormEvent } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Search, 
  X 
} from 'lucide-react';
import { authRepository } from '../db/repositories/authRepository';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminUser, AdminRole } from '../db/types';

const ROLES_META: Record<AdminRole, { label: string; color: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'Unrestricted access to all modules, users, security & database snapshots',
  },
  administrator: {
    label: 'Administrator',
    color: 'bg-blue-100 text-[#094899] border-blue-200',
    desc: 'Full administrative control over events, taxonomies, menus & settings',
  },
  event_manager: {
    label: 'Event Manager',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Create and publish events, manage speakers, venues & partners',
  },
  editor: {
    label: 'Editor',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'Author and modify draft/pending events and taxonomies',
  },
  read_only: {
    label: 'Read-Only Staff',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    desc: 'Audit view access to event rosters, agendas and logs without write access',
  },
};

export function AdminUsersPage() {
  const { toast } = useAdminToast();
  const { user: currentUser } = useAdminAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('event_manager');
  const [newPassword, setNewPassword] = useState('');

  // Reset Password Modal
  const [resetTargetUser, setResetTargetUser] = useState<AdminUser | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');

  const reloadData = () => {
    setUsers(authRepository.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast('Please fill all required fields', 'error');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      toast('An admin account with this email already exists', 'error');
      return;
    }

    try {
      await authRepository.createUser({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        passwordPlain: newPassword.trim(),
      });
      toast(`User account for "${newName}" created successfully`, 'success');
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      reloadData();
    } catch {
      toast('Failed to create user account', 'error');
    }
  };

  const handleToggleStatus = (targetUser: AdminUser) => {
    if (targetUser.id === currentUser?.id) {
      toast('You cannot deactivate your own administrative account', 'error');
      return;
    }
    const updatedStatus = !targetUser.isActive;
    authRepository.updateUser(targetUser.id, { isActive: updatedStatus });
    toast(`Account for ${targetUser.name} ${updatedStatus ? 'enabled' : 'disabled'}`, 'info');
    reloadData();
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetNewPassword.trim()) return;

    try {
      await authRepository.resetPassword(resetTargetUser.id, resetNewPassword.trim());
      toast(`Password for ${resetTargetUser.name} reset successfully`, 'success');
      setResetTargetUser(null);
      setResetNewPassword('');
    } catch {
      toast('Failed to reset password', 'error');
    }
  };

  const handleDeleteUser = (targetUser: AdminUser) => {
    if (targetUser.id === currentUser?.id) {
      toast('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user account "${targetUser.name}" (${targetUser.email})?`)) {
      try {
        authRepository.deleteUser(targetUser.id);
        toast('User account removed', 'info');
        reloadData();
      } catch (err: unknown) {
        toast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#094899]" />
            Administrator Accounts & Role Access
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage admin users, assign granular RBAC roles, and regulate access credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Administrator
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#094899]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredUsers.length} of {users.length} accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No administrator accounts match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleMeta = ROLES_META[u.role] || ROLES_META.read_only;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#094899]/10 text-[#094899] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleMeta.color}`}>
                          {roleMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            u.isActive 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isSelf ? 'You cannot disable your own account' : 'Click to toggle status'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetUser(u);
                              setResetNewPassword('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* RBAC Reference Cards */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Role-Based Access Matrix (Strict Principle of Least Privilege)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(ROLES_META).map(([key, meta]) => (
            <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mb-1.5 ${meta.color}`}>
                {meta.label}
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">{meta.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#094899]" />
                Create Administrator Account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Bunyan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@equipindianchurches.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Administrative Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#094899] outline-none"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="administrator">Administrator</option>
                  <option value="event_manager">Event Manager</option>
                  <option value="editor">Editor</option>
                  <option value="read_only">Read-Only Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#094899] hover:bg-[#07397b] text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Reset Password
              </h3>
              <button onClick={() => setResetTargetUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Enter a new secure password for <strong className="text-slate-900">{resetTargetUser.name}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#094899] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
