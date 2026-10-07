import { Link } from 'react-router-dom';
import type { Person } from '@/api/types';
import { authorPath } from '@/lib/routes';
import { UserIcon } from '@/components/ui/Icons';

interface AuthorCardProps {
  person: Person;
}

export function AuthorCard({ person }: AuthorCardProps) {
  const href = authorPath(person.id);

  return (
    <article className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-card">
      {/* Avatar */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary-soft text-link">
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserIcon size={24} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link to={href} className="text-ink hover:text-link">
            {person.name}
          </Link>
        </h3>

        {person.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {person.description}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted">Contributor & Teacher</p>
        )}

        <div className="mt-3">
          <Link
            to={href}
            className="text-xs font-semibold text-link hover:underline"
          >
            View contributions →
          </Link>
        </div>
      </div>
    </article>
  );
}
