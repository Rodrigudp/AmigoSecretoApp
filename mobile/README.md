# Papelzinho para iOS e Android

Use Node 22.13 ou superior. Execute `npm ci` em `mobile/` e rode `npm run web` para abrir a prévia com dados fictícios. A suíte local usa `npm run lint`, `npm run typecheck` e `npm test`.

Para testar a API real, inicie um build nativo com `EXPO_PUBLIC_MOBILE_API=live` após a implantação dos endpoints. A prévia web usa memória e a API real tem CORS fechado. A credencial de cada grupo e papel fica no SecureStore nativo.

A abertura de links HTTPS em aparelhos depende de um build assinado e da associação do domínio via `assetlinks.json` e `apple-app-site-association`. O registro de avisos depende do identificador do projeto EAS e da permissão no aparelho. Use **Desativar avisos** na área pessoal para remover o registro deste aparelho no servidor.
