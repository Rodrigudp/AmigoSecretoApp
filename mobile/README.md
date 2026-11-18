# Papelzinho para iOS e Android

Use Node 22.13 ou superior. Execute `npm ci` em `mobile/` e rode `npm run web` para abrir a prévia Expo Web. A suíte local usa `npm run lint`, `npm run typecheck` e `npm test`.

Os links HTTPS em `/g/*`, `/p/*` e `/admin/*` apontam para as telas provisórias. A abertura em aparelhos exige um build nativo assinado e a associação do domínio via `assetlinks.json` e `apple-app-site-association` no site. As rotas de prévia usam dados locais até o APP-API-01. A credencial é reservada ao SecureStore nativo, indisponível na prévia web.
