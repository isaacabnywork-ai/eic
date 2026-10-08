import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloseIcon } from '@/components/ui/Icons';
import { useBookmarks } from '@/lib/bookmarks';
import { itemPath } from '@/lib/routes';
import { site } from '@/config/site';

export function MobileLibraryView() {
  const { items: savedItems, removeItem } = useBookmarks();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="flex flex-col bg-[#070A0F] text-white min-h-screen pb-28 md:hidden">
      {/* 1. Subscription / Access Card matching Screenshot 2 */}
      <div className="flex flex-col items-center justify-center px-6 pt-10 pb-8 text-center">
        {/* Mobile Logo Mark */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg p-2.5">
          <img
            src={site.mobileLogoUrl}
            alt={site.name}
            className="h-full w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = site.mobileLogoFallback;
            }}
          />
        </div>

        {/* Headline */}
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white leading-tight">
          Subscribe to get full access
        </h2>

        {/* Subtitle */}
        <p className="mt-2.5 max-w-xs text-xs text-white/70 leading-relaxed">
          Join the Equip Indian Churches network for unlimited access to biblical sermons, theological articles, and study series delivered weekly.
        </p>

        {/* Subscribe Form / CTA matching Screenshot 2 */}
        {subscribed ? (
          <div className="mt-6 w-full rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-4 text-center">
            <p className="text-xs font-semibold text-emerald-400">
              ✓ You are subscribed to Equip Indian Churches updates!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-6 w-full space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#FF533D] focus:outline-none focus:ring-1 focus:ring-[#FF533D]"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF533D] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg active:scale-98 hover:brightness-105 transition cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        )}

        {/* Secondary Links matching Screenshot 2 */}
        <div className="mt-5 flex flex-col items-center gap-2 text-xs">
          <p className="text-white/60">
            Already a partner?{' '}
            <Link to="/articles" className="font-semibold text-[#FF533D] hover:underline">
              Explore Articles
            </Link>
          </p>
          <Link to="/series" className="text-white/45 hover:text-white/75 transition">
            Browse All Series & Themes
          </Link>
        </div>
      </div>

      {/* 2. Saved / Bookmarked Items Section */}
      <div className="border-t border-white/10 px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <span>Saved in Your Library</span>
            <span className="text-xs font-normal text-white/40">({savedItems.length})</span>
          </h3>
          {savedItems.length > 0 && (
            <span className="text-[11px] text-white/50">Stored locally</span>
          )}
        </div>

        {savedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-xs text-white/50">
            <p>You haven't saved any sermons or articles yet.</p>
            <p className="mt-1 text-[11px] text-white/40">
              Tap the bookmark icon on any message or video to save it here for offline reading.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
              >
                <Link
                  to={itemPath(item.type, item.slug)}
                  className="flex flex-1 items-center gap-3 min-w-0"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF533D] block">
                      {item.type}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-white line-clamp-1 group-hover:text-[#FF533D] transition-colors">
                      {item.title}
                    </h4>
                    {(item.speaker || item.authorName) && (
                      <p className="text-[10px] text-white/50 truncate">
                        {item.speaker || item.authorName}
                      </p>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item from library"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Quick Browse Grid */}
      <div className="mt-8 border-t border-white/10 px-4 pt-6">
        <h3 className="font-serif text-sm font-bold text-white mb-3">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/videos"
            className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80 hover:bg-white/10 transition"
          >
            Video Catalogue &rarr;
          </Link>
          <Link
            to="/sermons"
            className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80 hover:bg-white/10 transition"
          >
            Sermon Audio &rarr;
          </Link>
          <Link
            to="/authors"
            className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80 hover:bg-white/10 transition"
          >
            Preachers & Authors &rarr;
          </Link>
          <Link
            to="/events"
            className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80 hover:bg-white/10 transition"
          >
            Events & Conferences &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
