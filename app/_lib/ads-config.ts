/** The publisher ID is public, but must be exactly the AdSense publisher format. */
export function publisherId(value: string | undefined): string | null {
  return /^pub-\d{16}$/.test(value ?? "") ? value! : null;
}
