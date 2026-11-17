# ADR-002: Acesso por capability URL, sem login

- **Status:** aceita
- **Data:** 2026-11-17
- **Autor:** Orquestrador + Segurança & LGPD

## Contexto
Participantes não querem criar conta nem senha (personas Seu João e Carla). O link é compartilhado pelo WhatsApp.

## Decisão
Três tipos de link com token aleatório de 128 bits ou mais (base64url): **convite** (público para o grupo),
**pessoal** (um por participante) e **admin** (só o organizador). Tokens pessoal e admin são guardados apenas como hash SHA-256.

## Alternativas consideradas
- Login com Google — atrito alto para o público-alvo; fica para versão futura.
- Código numérico curto — fácil de adivinhar por força bruta.

## Consequências
- Positivas: entrada em menos de 30 s (RNF01), sem dado pessoal além do nome (RNF05).
- Negativas: quem tiver o link pessoal vê o resultado; perder o link exige reenvio pelo organizador.
  Mitigação: `Referrer-Policy: no-referrer`, `noindex` nas páginas com token, rate limit por IP.
