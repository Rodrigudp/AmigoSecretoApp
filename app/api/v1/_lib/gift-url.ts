/** The mobile app opens external HTTPS URLs without the Amazon affiliate tag. */
export function originalGiftUrl(value: string | null): string | null {
  if (!value || !URL.canParse(value)) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") return null;
  if (/^(www\.)?amazon\.com\.br$/.test(url.hostname) && url.searchParams.has("tag")) {
    url.searchParams.delete("tag");
    return url.href;
  }
  return value;
}
