/**
 * Pure helpers for distributing budget shares (0–100) across a set of items.
 * Used by the geography and platform wizard steps. All functions return a new
 * array of shares aligned to the input order; callers map them back onto items.
 */

export interface ShareItem {
  share: number;
  locked?: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Scale all shares proportionally so they sum to 100. If all are 0, split equally. */
export function normalizeShares(items: ShareItem[]): number[] {
  if (items.length === 0) return [];
  const sum = items.reduce((s, i) => s + (i.share || 0), 0);
  if (sum === 0) return equalShares(items.length);
  return items.map((i) => round1((i.share / sum) * 100));
}

/** Equal split across n items. */
export function equalShares(n: number): number[] {
  if (n === 0) return [];
  return Array.from({ length: n }, () => round1(100 / n));
}

/**
 * Set one item's share and redistribute the remainder across the *unlocked*
 * others (proportionally to their current shares). Locked items keep their share.
 */
export function setShareAndRedistribute(
  items: ShareItem[],
  index: number,
  newShare: number
): number[] {
  const shares = items.map((i) => i.share || 0);
  const clamped = Math.max(0, Math.min(100, newShare));
  shares[index] = clamped;

  const redistributable = items
    .map((it, i) => ({ i, it }))
    .filter(({ i, it }) => i !== index && !it.locked);

  const lockedOtherTotal = items
    .filter((it, i) => i !== index && it.locked)
    .reduce((s, it) => s + (it.share || 0), 0);

  const remaining = Math.max(0, 100 - clamped - lockedOtherTotal);
  const currentRedistributableTotal = redistributable.reduce((s, { it }) => s + (it.share || 0), 0);

  if (redistributable.length > 0) {
    if (currentRedistributableTotal === 0) {
      const each = remaining / redistributable.length;
      redistributable.forEach(({ i }) => (shares[i] = round1(each)));
    } else {
      redistributable.forEach(({ i, it }) => {
        shares[i] = round1((it.share / currentRedistributableTotal) * remaining);
      });
    }
  }
  return shares;
}

export function sharesTotal(items: ShareItem[]): number {
  return round1(items.reduce((s, i) => s + (i.share || 0), 0));
}
