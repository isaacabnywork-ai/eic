import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import { DEFAULT_ADMIN_PASSWORD } from '../db/seed';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAdminToast();

  const [email, setEmail] = useState('admin@equipindianchurches.com');
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/admin';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back to EIC Admin Console.', 'Signed In');
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F6FB] p-4 text-[#182541] font-sans selection:bg-[#094899] selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#182541] text-white font-black text-xl shadow-lg shadow-[#182541]/15 border border-[#D0E1F0]">
            EIC
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#182541]">
            Equip Indian Churches
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#094899]">
            Custom Administrative Console
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#182541]">Administrator Login</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your authorized staff credentials to continue.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#182541] block">Staff Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@equipindianchurches.com"
                className="w-full rounded-xl border border-[#D0E1F0] bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#182541] placeholder-slate-400 focus:border-[#094899] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#094899]/20 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#182541] block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#D0E1F0] bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#182541] placeholder-slate-400 focus:border-[#094899] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#094899]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-xl bg-[#094899] hover:bg-[#07397b] py-3 text-sm font-bold text-white transition-all shadow-md shadow-[#094899]/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Verifying Session...' : 'Sign In to Console →'}
            </button>
          </form>

          {/* Staging Quick Demo Credentials Switcher */}
          <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
              Staging Demo Quick-Fill Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@equipindianchurches.com')}
                className="rounded-lg border border-[#D0E1F0] bg-slate-50 p-2 text-left hover:border-[#094899] hover:bg-white transition cursor-pointer"
              >
                <p className="font-bold text-[#182541]">Super Admin</p>
                <p className="text-[10px] text-slate-500">admin@...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('events@equipindianchurches.com')}
                className="rounded-lg border border-[#D0E1F0] bg-slate-50 p-2 text-left hover:border-[#094899] hover:bg-white transition cursor-pointer"
              >
                <p className="font-bold text-[#182541]">Event Manager</p>
                <p className="text-[10px] text-slate-500">events@...</p>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center pt-1 font-mono">
              Default password: <span className="text-[#094899] font-bold">{DEFAULT_ADMIN_PASSWORD}</span>
            </p>
          </div>
        </div>

        {/* Public site link */}
        <div className="text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-[#094899] font-medium transition">
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
