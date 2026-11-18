import { createServerClient } from "@/src/infrastructure/supabase/client";
import { authorized, metrics } from "./metrics";

const headers = {
  "Cache-Control": "no-store, private",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Type": "text/html; charset=utf-8",
};

export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"), process.env.OWNER_PANEL_SECRET)) {
    return new Response("Acesso restrito", {
      status: 401,
      headers: { ...headers, "WWW-Authenticate": 'Basic realm="Papelzinho"' },
    });
  }
  const client = createServerClient();
  const results = await Promise.all(
    ["group_created", "participant_joined", "affiliate_click"].map((type) =>
      client.from("events").select("id", { count: "exact", head: true }).eq("type", type)
    )
  );
  if (results.some((result) => result.error || result.count === null)) {
    return new Response("Não foi possível carregar as métricas.", { status: 503, headers });
  }
  const [groups, joins, clicks] = results.map((result) => result.count!);
  const m = metrics(groups, joins, clicks);
  return new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel do dono — Papelzinho</title><meta name="robots" content="noindex,nofollow"><style>@font-face{font-family:Inter;src:url(/fonts/inter-latin.woff2) format("woff2");font-weight:400 700;font-display:swap}*{box-sizing:border-box}body{font:18px/1.55 Inter,system-ui,sans-serif;color:#211f1d;background:#f6f5f4;margin:0}main{max-width:608px;margin:3rem auto;padding:28px;background:#fff;border:1px solid #dedbd7;border-radius:12px}h1{font-size:30px;line-height:1.2}dl{margin:2rem 0}dt{font-weight:600}dd{margin:0 0 1.5rem;font-size:24px}p{font-size:16px} @media(max-width:600px){main{margin:32px 20px;padding:20px}}</style></head><body><main><h1>Papelzinho · Painel do dono</h1><p>Totais anônimos acumulados</p><dl><dt>Entradas de participantes</dt><dd>${m.joins.toLocaleString("pt-BR")}</dd><dt>Média de inscrições por grupo</dt><dd>${m.perGroup}</dd><dt>Percentual de convidados que entram</dt><dd>Indisponível no MVP</dd><dt>Percentual de organizadores que foram participantes</dt><dd>Indisponível no MVP</dd><dt>Cliques em afiliado por inscrição</dt><dd>Indisponível até a integração de afiliados</dd></dl><p>Uma pessoa pode se inscrever em mais de um grupo: inscrições não são pessoas únicas. A conversão de convites não tem denominador; por privacidade, não identificamos organizadores entre grupos.</p><p>Após 60 dias, o grupo é apagado e os eventos perdem seu vínculo com ele. Os totais anônimos permanecem; as médias são globais.</p></main></body></html>`,
    { headers }
  );
}
