import { useState, useEffect } from 'react';
import type { ContentItem } from '@/api/types';
import type { ContentKey } from '@/config/content';

const STORAGE_KEY = 'eic_saved_library_items';

export interface SavedItem {
  id: string | number;
  slug: string;
  type: ContentKey;
  title: string;
  image?: string;
  speaker?: string;
  authorName?: string;
  savedAt: number;
}

export function getSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavedItem(item: ContentItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getSavedItems();
    const existingIndex = current.findIndex((x) => String(x.id) === String(item.id) || x.slug === item.slug);
    
    let updated: SavedItem[];
    let wasAdded = false;

    if (existingIndex >= 0) {
      updated = current.filter((_, idx) => idx !== existingIndex);
      wasAdded = false;
    } else {
      const newItem: SavedItem = {
        id: item.id,
        slug: item.slug,
        type: item.type,
        title: item.title,
        image: item.image?.src,
        speaker: item.speaker,
        authorName: item.author?.name,
        savedAt: Date.now(),
      };
      updated = [newItem, ...current];
      wasAdded = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('eic-library-change'));
    return wasAdded;
  } catch {
    return false;
  }
}

export function isItemSaved(idOrSlug: string | number): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSavedItems();
  return current.some((x) => String(x.id) === String(idOrSlug) || x.slug === String(idOrSlug));
}

export function useBookmarks() {
  const [items, setItems] = useState<SavedItem[]>(getSavedItems());

  useEffect(() => {
    const handleUpdate = () => setItems(getSavedItems());
    window.addEventListener('eic-library-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('eic-library-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    items,
    count: items.length,
    toggle: toggleSavedItem,
    isSaved: isItemSaved,
    removeItem: (idOrSlug: string | number) => {
      const updated = items.filter((x) => String(x.id) !== String(idOrSlug) && x.slug !== String(idOrSlug));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      window.dispatchEvent(new Event('eic-library-change'));
    },
  };
}
