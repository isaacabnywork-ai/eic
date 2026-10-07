import { wpGet, ApiError } from './client';
import { normalizePersonRaw } from './people';
import type { Page, Person, UserParams } from './types';

const USER_FIELDS = 'id,name,slug,description,avatar_urls,link';

/** Authors / speakers (WordPress users who have published content). */
export async function fetchUsers(params: UserParams = {}): Promise<Page<Person>> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const { data, total, totalPages } = await wpGet<Record<string, unknown>[]>(
    '/wp/v2/users',
    { per_page: perPage, page, search: params.search, orderby: 'name', order: 'asc', _fields: USER_FIELDS },
    { page, perPage },
  );
  return {
    items: data.map(normalizePersonRaw).filter((p): p is Person => !!p),
    total,
    totalPages,
    page,
  };
}

export async function fetchUser(id: number): Promise<Person | null> {
  try {
    const { data } = await wpGet<Record<string, unknown>>(`/wp/v2/users/${id}`, { _fields: USER_FIELDS });
    return normalizePersonRaw(data) ?? null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 401 || e.status === 403)) return null;
    throw e;
  }
}
