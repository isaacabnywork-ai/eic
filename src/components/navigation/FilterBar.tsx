import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { contentTypes, taxonomies } from '@/config/content';
import type { ContentKey, TaxKey } from '@/config/content';
import { useFilterTerms } from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronDownIcon, CloseIcon, SearchIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';

interface FilterBarProps {
  type: ContentKey;
  state: {
    page: number;
    q: string;
    filters: Partial<Record<TaxKey, number>>;
  };
  onUpdate: (patch: Record<string, string | number | undefined>) => void;
  onClear: () => void;
  hasFilters: boolean;
  total?: number;
}

export function FilterBar({
  type,
  state,
  onUpdate,
  onClear,
  hasFilters,
  total,
}: FilterBarProps) {
  const cfg = contentTypes[type];
  const [searchTerm, setSearchTerm] = useState(state.q);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Sync debounced search to URL state
  useEffect(() => {
    if (debouncedSearch !== state.q) {
      onUpdate({ q: debouncedSearch || undefined });
    }
  }, [debouncedSearch, state.q, onUpdate]);

  // Sync state.q back if updated externally
  useEffect(() => {
    setSearchTerm(state.q);
  }, [state.q]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <SearchIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={`Search ${cfg.label.toLowerCase()}...`}
            aria-label={`Search ${cfg.label}`}
            className="h-11 w-full rounded-xl border border-line bg-surface-2/40 pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onUpdate({ q: undefined });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
              aria-label="Clear search text"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Taxonomy dropdowns: clean 2-column grid on mobile (< md), aligned inline flex on desktop (>= md) */}
        <div className="grid grid-cols-2 gap-2.5 w-full lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:gap-2.5">
          {cfg.taxonomies.map((taxKey) => (
            <TaxonomySelect
              key={taxKey}
              type={type}
              taxKey={taxKey}
              selectedId={state.filters[taxKey]}
              onChange={(id) => onUpdate({ [taxKey]: id })}
            />
          ))}

          {hasFilters && (
            <div className="col-span-2 lg:col-auto flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  onClear();
                }}
                className="w-full lg:w-auto text-xs font-semibold text-muted hover:text-ink cursor-pointer h-10"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary line if filters are active */}
      <div className="flex items-center justify-between text-xs text-muted px-1">
        {total !== undefined && (
          <p>
            Showing <span className="font-semibold text-ink">{total}</span>{' '}
            {total === 1 ? cfg.singular.toLowerCase() : cfg.label.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}

function TaxonomySelect({
  type,
  taxKey,
  selectedId,
  onChange,
}: {
  type: ContentKey;
  taxKey: TaxKey;
  selectedId?: number;
  onChange: (id?: number) => void;
}) {
  const taxConfig = taxonomies[taxKey];
  const { data: terms, isLoading } = useFilterTerms(type, taxKey);

  if (isLoading || !terms || terms.length === 0) return null;

  return (
    <div className="relative w-full lg:w-auto lg:min-w-[130px] lg:max-w-[185px]">
      <select
        value={selectedId || ''}
        onChange={(e) => {
          const val = e.target.value ? Number(e.target.value) : undefined;
          onChange(val);
        }}
        aria-label={`Filter by ${taxConfig.label}`}
        className="h-11 w-full rounded-xl border border-line bg-surface pl-3.5 pr-8 text-xs sm:text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer truncate shadow-2xs transition-colors hover:border-line/80"
      >
        <option value="">All {taxConfig.plural}</option>
        {terms.map((term) => (
          <option key={term.id} value={term.id}>
            {term.name} {term.count !== undefined ? `(${term.count})` : ''}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
