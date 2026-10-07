import { Link } from 'react-router-dom';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'outline' | 'navy' | 'ghost' | 'light' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none whitespace-nowrap cursor-pointer';

const variants: Record<Variant, string> = {
  // Primary CTA: Gold background + navy text
  primary: 'bg-accent text-accent-ink hover:brightness-105 active:scale-[0.99] shadow-subtle',
  accent: 'bg-accent text-accent-ink hover:brightness-105 active:scale-[0.99] shadow-subtle',
  // Secondary CTA: Transparent/white background + navy text + subtle border
  secondary: 'border border-line bg-surface text-ink hover:border-ink/40 hover:bg-surface-2',
  outline: 'border border-line bg-surface text-ink hover:border-ink/40 hover:bg-surface-2',
  // Navy: Deep Navy background with crisp white text
  navy: 'bg-primary text-primary-ink hover:bg-primary-hover active:scale-[0.99] shadow-subtle',
  ghost: 'text-ink hover:bg-surface-2',
  light: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs tracking-wide',
  md: 'h-10.5 px-4.5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra?: string) =>
  cn(base, variants[variant], sizes[size], extra);

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/** Internal route link, or a plain <a> (new tab) when `external`. */
export function LinkButton({
  to,
  external,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & { to: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={to} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  );
}
