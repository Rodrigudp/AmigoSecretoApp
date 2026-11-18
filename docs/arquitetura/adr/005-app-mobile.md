# ADR-005 — App nativo para App Store e Play Store

- Status: Aceito (Orquestrador, 18/11/2026, a pedido do PO)
- Contexto: o PO quer o Papelzinho nas lojas (objetivo desde o início). O site segue no ar sem mudanças para o lançamento de 28/11.

## Decisão
1. **Expo (React Native + TypeScript)** em `mobile/` no mesmo repositório. Builds e envio às lojas pelo **EAS** (nuvem; não exige Mac).
2. **Mesmo backend.** O app não fala com o Supabase direto (AM-08). O Next.js expõe uma **API v1** (`/api/v1/...`) que chama os mesmos casos de uso de `src/application`. Contrato publicado antes do código.
3. **Credencial no app:** o token pessoal/organizador fica no **SecureStore** do aparelho e vai no header `Authorization: Bearer`, nunca em URL nem em log. Um grupo por credencial, como hoje.
4. **Links:** `https://papelzinho.app/g/…`, `/p/…` e `/admin/…` abrem o app quando instalado (App Links / Universal Links) e o site quando não.
5. **Valor nativo** (exigido pela Apple, guideline 4.2): notificação push quando o sorteio sair e lembrete antes do encontro; compartilhar pelo menu nativo; lista de desejos offline-first simples.
6. **Monetização no app:** AdMob no lugar do AdSense; afiliado Amazon só se as regras do programa permitirem uso em app (pesquisa APP-MON-01).
7. **Visual:** Estilo Notion adaptado a componentes nativos; textos do mesmo catálogo (`textos.md`).

## Alternativas descartadas
- Site embrulhado (Capacitor/TWA sem recursos nativos): alto risco de recusa na App Store.
- Reescrever o backend: desnecessário; os casos de uso já são independentes da tela.

## Consequências
- Contas de desenvolvedor do PO: Apple Developer Program (anual) e Google Play Console (taxa única); valores a confirmar nas lojas.
- Prazo realista: Play Store em teste interno ~3 semanas; App Store depende da análise da Apple.
