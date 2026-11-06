import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/AdminToastContext';

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F6FB] p-4 text-[#182541] font-sans selection:bg-[#094899] selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <img
              src="/eic-logo-dark.png"
              alt="Equip Indian Churches Logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-[#D0E1F0] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-[#182541]">Administrator Sign In</h2>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#182541] block">
                Username or Email
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter email or username"
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
