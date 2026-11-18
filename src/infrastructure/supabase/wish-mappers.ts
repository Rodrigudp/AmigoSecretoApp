import type { AffiliateStore, ProductLink, WishItem } from "../../application/ports";

export function toProductLink(row: {
  url: string | null;
  affiliate_url: string | null;
  store: string | null;
}): ProductLink | null {
  if (row.affiliate_url && (row.store === "amazon" || row.store === "mercadolivre")) {
    return { href: row.affiliate_url, affiliate: true, store: row.store as AffiliateStore };
  }
  if (row.url) return { href: row.url, affiliate: false, store: null };
  return null;
}

export function toWishItem(row: {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  affiliate_url: string | null;
  store: string | null;
}): WishItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    note: row.note,
    productLink: toProductLink(row),
  };
}
