import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { useBookmarks } from '@/lib/bookmarks';
import { itemPath } from '@/lib/routes';
import { CloseIcon } from '@/components/ui/Icons';
import { MobileLibraryView } from '@/components/mobile/MobileLibraryView';

export function LibraryPage() {
  const { items: savedItems, removeItem } = useBookmarks();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      <SeoHead
        title="Ministry Library & Saved Resources"
        description="Access your saved articles, sermons, video teachings, and newsletter subscription on Equip Indian Churches."
        path="/library"
      />

      {/* Mobile Stream View */}
      <MobileLibraryView />

      {/* Desktop Editorial View */}
      <div className="hidden md:block">
        <PageHeader
          title="Your Ministry Library"
          eyebrow="SAVED RESOURCES"
          description="Saved sermons, articles, and teaching resources for pastoral study and spiritual nourishment."
        />

        <div className="container-page py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Saved Items */}
            <div className="col-span-12 lg:col-span-8">
              <h2 className="font-serif text-xl font-bold text-ink mb-4 flex items-center justify-between">
                <span>Saved Resources ({savedItems.length})</span>
              </h2>

              {savedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center text-muted">
                  <p className="text-base">No saved resources yet.</p>
                  <p className="mt-1 text-sm">
                    Click the bookmark icon on any sermon or article to save it here for future study.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition"
                  >
                    Browse Homepage
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col rounded-xl border border-line bg-surface p-4 shadow-xs hover:shadow-md transition"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="aspect-video w-full rounded-lg object-cover mb-3"
                        />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text">
                        {item.type}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-ink line-clamp-2 mt-1">
                        <Link to={itemPath(item.type, item.slug)} className="hover:text-accent-text">
                          {item.title}
                        </Link>
                      </h3>
                      {(item.speaker || item.authorName) && (
                        <p className="mt-1 text-xs text-muted truncate">
                          {item.speaker || item.authorName}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-3 text-[11px] text-red-500 hover:underline flex items-center gap-1 self-start cursor-pointer"
                      >
                        <CloseIcon size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Newsletter box */}
            <div className="col-span-12 lg:col-span-4">
              <div className="rounded-2xl border border-line bg-surface-2 p-6">
                <h3 className="font-serif text-lg font-bold text-ink">
                  Subscribe for Updates
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-body">
                  Receive the latest articles, video teachings, and pastoral book reviews straight to your inbox every week.
                </p>

                {subscribed ? (
                  <p className="mt-4 text-xs font-semibold text-emerald-600">
                    ✓ You are subscribed to our newsletter!
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email) setSubscribed(true);
                    }}
                    className="mt-4 space-y-3"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white hover:bg-primary-dark transition cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
