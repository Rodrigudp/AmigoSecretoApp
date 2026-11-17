# ADR-001: Next.js + Supabase + Vercel

- **Status:** aceita
- **Data:** 2026-11-17
- **Autor:** Orquestrador (decisão do Product Owner)

## Contexto
MVP em 10 dias, pico de tráfego concentrado em dezembro, custo quase zero fora da temporada (RNF06, RNF07),
prévia de link no WhatsApp (RNF09) e SEO para os próximos anos.

## Decisão
Next.js (App Router, TypeScript) na Vercel, com Supabase Postgres como banco.

## Alternativas consideradas
- Next.js na VPS própria — mais controle, mas exige cuidar de escala no pico.
- HTML/JS puro + Supabase — sem renderização no servidor para Open Graph e SEO.

## Consequências
- Positivas: escala automática, deploy por PR, plano gratuito cobre o MVP, o PO já conhece Supabase.
- Negativas: dependência de dois provedores; limites do plano gratuito precisam de monitoramento.
