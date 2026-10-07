const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'short' });

export const formatDate = (iso: string | undefined): string => {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(+d) ? dateFmt.format(d) : '';
};
export const formatDateShort = (iso: string | undefined): string => {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(+d) ? shortFmt.format(d) : '';
};
export const dateParts = (iso: string | undefined): { day: string; month: string; year: string } => {
  const d = iso ? new Date(iso) : new Date(NaN);
  if (isNaN(+d)) return { day: '', month: '', year: '' };
  return { day: String(d.getDate()), month: monthFmt.format(d), year: String(d.getFullYear()) };
};

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');
