import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, KeyRound, Globe, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';
import { DEFAULT_ADMIN_PASSWORD } from '../db/seed';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useAdminToast();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const result = await login(usernameOrEmail, password);
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

  const handleQuickFillEmergency = () => {
    setUsernameOrEmail('admin@equipindianchurches.com');
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
            <h2 className="text-base font-bold text-[#182541]">Administrator Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your WordPress credentials to manage events and content.
            </p>
          </div>

          {/* WordPress SSO Notice */}
          <div className="rounded-xl border border-[#D0E1F0] bg-[#F0F6FB] p-3 text-xs text-[#182541] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#094899] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#094899] flex items-center gap-1.5">
                <span>WordPress Single Sign-On</span>
                <span className="inline-block px-1.5 py-0.2 bg-[#094899]/10 text-[#094899] text-[10px] font-bold rounded">LIVE</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Use the same username and password you use to log into <strong>admin.equipindianchurches.com</strong>.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#182541] block">
                WordPress Username or Email
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. equipindianchurches or admin@..."
                className="w-full rounded-xl border border-[#D0E1F0] bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#182541] placeholder-slate-400 focus:border-[#094899] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#094899]/20 transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#182541] block">
                  Password
                </label>
                <a
                  href="https://admin.equipindianchurches.com/wp-login.php?action=lostpassword"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-[#094899] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#D0E1F0] bg-slate-50/60 px-3.5 py-2.5 text-sm text-[#182541] placeholder-slate-400 focus:border-[#094899] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#094899]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-xl bg-[#094899] hover:bg-[#07397b] py-3 text-sm font-bold text-white transition-all shadow-md shadow-[#094899]/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Verifying with WordPress...'
              ) : (
                <>
                  <span>Sign In with WordPress</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Emergency Offline Access / Staging Demo */}
          <div className="mt-6 border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={handleQuickFillEmergency}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#094899] transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use local emergency backup account</span>
            </button>
          </div>
        </div>

        {/* Public site link */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#094899] font-medium transition">
            <Globe className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
