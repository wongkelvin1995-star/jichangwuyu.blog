export interface SubscriptionEntry {
  id: string;
  brandName: string;
  planName: string;
  purchaseDate: string;
  paidAmount: number;
  cycleMonths: number;
  expiryDate: string;
  renewalReminderDate: string;
  notes: string;
}

export interface MonogatariProfile {
  bookmarks: string[];
  followedBrands: string[];
  readingHistory: Array<{ path: string; title: string; visitedAt: string }>;
  compareList: string[];
  notes: Array<{ id: string; title: string; body: string; updatedAt: string }>;
  subscriptions: SubscriptionEntry[];
}

const STORAGE_KEY = 'jichangwuyu_monogatari_profile_v1';

const defaultProfile: MonogatariProfile = {
  bookmarks: [],
  followedBrands: [],
  readingHistory: [],
  compareList: [],
  notes: [],
  subscriptions: [],
};

export function loadProfile(): MonogatariProfile {
  if (typeof window === 'undefined') return { ...defaultProfile };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProfile };
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProfile };
  }
}

export function saveProfile(profile: MonogatariProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function toggleBookmark(slug: string): boolean {
  const p = loadProfile();
  const exists = p.bookmarks.includes(slug);
  p.bookmarks = exists ? p.bookmarks.filter((s) => s !== slug) : [...p.bookmarks, slug];
  saveProfile(p);
  return !exists;
}

export function recordVisit(path: string, title: string): void {
  if (typeof window === 'undefined' || !path) return;
  const p = loadProfile();
  const filtered = p.readingHistory.filter((item) => item.path !== path);
  p.readingHistory = [{ path, title, visitedAt: new Date().toISOString().slice(0, 10) }, ...filtered].slice(0, 25);
  saveProfile(p);
}
