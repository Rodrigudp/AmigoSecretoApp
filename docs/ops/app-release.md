# Checklist de release do app Papelzinho

## Preparar o build

- [ ] **14 DevOps:** gerar o perfil `preview` para iOS e Android. Conferir instalação, identificador `app.papelzinho`, versão `1.0.0`, build iOS `1` e código Android `1`. Após o primeiro envio, aumentar os números locais antes de reenviar às lojas.
- [ ] **14 DevOps:** conferir que `preview` e `production` usam a API real em `https://papelzinho.app`. Usar grupos de teste identificados para o aceite. O perfil `development` aponta para o Next local.
- [ ] **14 DevOps:** conferir a associação do domínio aos identificadores e certificados dos builds assinados. Seguir o [guia das lojas](app-lojas.md).

## Testar em iPhone e Android

| Responsável | Verificação | Aceite |
| --- | --- | --- |
| 13 QA | Deep links com app fechado, em execução e ausente | Convite, acesso pessoal e painel abrem o destino certo. Sem app instalado, abrem o site. Link inválido ou expirado mostra orientação. |
| 13 QA e 15 Segurança | SecureStore | Dois grupos e os dois papéis seguem acessíveis após fechar e reabrir o app. A mesma conta mantém os acessos separados. Credenciais ficam fora dos logs e das URLs da API. |
| 13 QA e 14 DevOps | Push concedido, negado e revogado | Permitir registra o aparelho. Negar preserva o acesso ao grupo. Desativar remove apenas o registro deste aparelho. Com push configurado, confirmar entrega do sorteio e lembrete, e abertura com resultado fechado. |
| 13 QA e 16 Designer | Calendário, teclado e escala de fonte | Escolher ou digitar uma data em dd/mm/yyyy. Conferir teclado numérico para valor, foco no primeiro erro e campos visíveis durante a digitação. Aumentar o texto do sistema e conferir leitura, rolagem e alvos de toque. |
| 13 QA e 16 Designer | TalkBack e VoiceOver | Conferir ordem de leitura, nome e estado dos controles, foco em títulos e confirmações, retorno ao cancelar e anúncio de erro e sucesso. |
| 13 QA | Fluxo completo e lista offline | Criar, entrar, salvar, editar e apagar presentes, remover participante e sortear. Editar a lista própria em modo avião, reconectar e confirmar sincronização. Revelar apenas online e confirmar que o resultado fecha ao navegar ou colocar o app em segundo plano. |

O 13 QA registra commit, perfil, versão do sistema e resultado por aparelho. O 00 Orquestrador decide a liberação com esses registros e o CI da versão.

## Bloqueios conhecidos

- **Contas Apple Developer e Google Play Console.** O PO precisa concluir cadastro e conceder acesso para assinatura, testes nas lojas e submissão. O 14 DevOps valida as credenciais de assinatura e os arquivos de associação após os acessos.
- **Conta e projeto Expo/EAS.** O PO precisa disponibilizar o projeto correto. O 14 DevOps configura assinatura, builds e credenciais nativas de push.
- **`EXPO_ACCESS_TOKEN`.** A entrega de avisos depende do segredo do servidor vinculado à conta Expo. O 14 DevOps valida o envio somente após a configuração descrita em [Push do app nativo](vps.md). O segredo fica no servidor.
