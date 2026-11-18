# Papelzinho para iOS e Android

Use Node 22.13 ou superior. Execute `npm ci` em `mobile/` e rode `npm run web` para abrir a prévia com dados fictícios. A suíte local usa `npm run lint`, `npm run typecheck` e `npm test`.

## Expo Web com o Next local

Com o Next e o Supabase local já em execução, abra o Expo em loopback. Exemplo em PowerShell, a partir de `mobile/`:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://127.0.0.1:3000"
$env:EXPO_PUBLIC_MOBILE_API = "live"
npm run web -- --localhost
```

Use grupos e credenciais fictícios. O Metro encaminha `/api/v1` para o Next local na mesma origem da interface, preservando o CORS da API. O acesso de teste fica no `sessionStorage` da aba e usa um espaço separado para cada endereço local. O modo web publicado usa dados fictícios.

## Builds nativos

Os perfis `preview` e `production` usam a API real. Para testar o Next local no perfil de desenvolvimento, ative `EXPO_PUBLIC_MOBILE_API=live` no Metro e mantenha o endereço local. Para o emulador Android, use `adb reverse tcp:3000 tcp:3000` ou configure `http://10.0.2.2:3000`. No aparelho, as credenciais ficam no SecureStore.

A abertura de links HTTPS em aparelhos depende de um build assinado e da associação do domínio via `assetlinks.json` e `apple-app-site-association`. O registro de avisos depende do identificador do projeto EAS e da permissão no aparelho. Use **Desativar avisos** na área pessoal para remover o registro deste aparelho no servidor.

Consulte o [checklist de release](../docs/ops/app-release.md).
