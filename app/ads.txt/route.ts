import { publisherId } from "@/app/_lib/ads-config";

export function GET(request: Request) {
  void request.headers.get("host");
  const id = publisherId(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  if (!id) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
