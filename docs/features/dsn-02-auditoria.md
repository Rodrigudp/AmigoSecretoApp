# Auditoria visual Estilo Notion — DSN-02

Dono: 16 Designer · Para: 11 Front-end · Base: `main` em 16f5958 · Data: 18/11/2026.
Prints em `docs/features/dsn-02-prints/` (`<tela>-360.png` e `<tela>-1280.png`, página inteira).

## Como foi feito
- App local (`next dev`) com dados de exemplo; a área do participante e o painel `/admin/demo-admin-token` leem dados de exemplo, então avaliei **layout, não dados**.
- Convite, "grupo criado" e link pessoal dependem do banco, que não existe neste ambiente. Renderizei os mesmos componentes com dados de exemplo numa página descartável (não vai ao PR). Os estados de erro foram forçados enviando o formulário vazio.
- Medição automática em 360 e 1280 px (home, convite indisponível, área, painel, painel inválido, 404): **nenhum texto abaixo de 16 px e nenhuma rolagem horizontal**.
- **Não verifiquei** nesta rodada: contraste medido (uso a tabela calculada do design-system §2.2), ordem de foco por teclado, leitor de tela, e a tela de convite com banco real.

## Veredito
Padrão Estilo Notion aplicado com consistência: fundo quente, cartões brancos sem sombra, azul nas ações, pêssego e amarelo nos destaques, Inter e Source Serif 4, logo oficial no topo, alvos ≥ 48 px. **Sem bloqueio para o lançamento.** Há 3 correções de prioridade alta e 7 menores.

## Telas auditadas

| Tela | Prints | Resultado |
| --- | --- | --- |
| Início `/` | home, home-erro | ✓ hierarquia clara; ⚠ A-06 |
| Grupo criado | criado | ⚠ A-01, A-04, A-05 |
| Convite `/g/…` | convite, convite-retorno, convite-erro | ✓ visual; ⚠ A-07 |
| Link pessoal | link-pessoal | ⚠ A-01, A-02 |
| Área do participante | area-sorteado, link-pessoal-invalido (mostra a área com dados de exemplo) | ⚠ A-08 |
| Painel `/admin/…` | admin, admin-invalido | ⚠ A-01, A-03, A-09 |
| 404 e painel inválido | nao-encontrada, admin-invalido | ✓ (o "Link indisponível" do convite foi visto em 360 px, mas o print foi sobrescrito; o texto está em textos.md CNV-10) |

## Correções propostas (cartões para o 11 Front-end)

| ID | Prio. | Onde | Problema | Correção |
| --- | --- | --- | --- | --- |
| A-01 | Alta | `CopyField` (convite, link pessoal, organizador, painel) | A linha de aviso "Link copiado" reserva 24 px vazios sob o botão: o espaço entre "Copiar" e o botão seguinte fica ~44 px, o dobro dos outros. | Tirar a altura reservada; mostrar o aviso dentro do próprio botão ("✓ Copiado") e com `aria-live`. Tratar falha: GLB-12. |
| A-02 | Alta | Link pessoal | O botão azul (principal) é "Salvar no WhatsApp"; o principal da tela deveria ser "Ir para a minha área" (design-system §5.4). Hoje a ação principal fica fora do cartão, cinza-azulada. | Inverter: "Ir para a minha área" `primary`; "Salvar no WhatsApp" `secondary`. |
| A-03 | Alta | Painel | (a) "Fazer o sorteio" está azul e ativo com 3+ pessoas, mas não faz nada; (b) o selo "Aberto para inscrições" some: fundo `primary-soft` sobre o cabeçalho `primary-soft`, e fica deslocado a 12 px da margem em 360 px. | (a) deixar desabilitado com a nota "Em breve" até a SRT-03 ligar a ação, depois pedir confirmação ("Fazer o sorteio agora? Não dá para desfazer.", texto final na DSN-04); (b) selo branco com borda `line`, alinhado à esquerda do título. |
| A-04 | Média | Grupo criado | O botão do WhatsApp é `primary` no cartão do convite, mas o cartão de organizador tem 3 botões iguais (`secondary`) empilhados; em 1280 px os `secondary` ficam largos e o `primary` fica estreito, sem regra. | Regra única: dentro de cartão, botões em largura total até 640 px e largura automática depois, alinhados; no máximo um `primary` por tela. |
| A-05 | Média | Grupo criado | O cartão "Atenção" é longo (~570 px de altura em 360 px) e o aviso importante fica no meio. | Texto de CRI-06 (mais curto); link do organizador abaixo do aviso, botão "Abrir o painel" como `primary` do cartão. |
| A-06 | Baixa | Início | O campo de data mostra `mm/dd/yyyy` quando o aparelho está em inglês. | Pôr dica "Ex.: 24/12/2026" abaixo do rótulo (hint do `Input`). Não é bug do app. |
| A-07 | Média | Convite e início (erro) | O resumo de erro repete o erro do campo ("Não foi possível entrar" + "Confira…" + mensagem do campo): 3 mensagens no 360 px, o campo desce ~130 px. | Mostrar só título curto "Confira o campo destacado" (CNV-06/HOM-10) e levar o foco ao primeiro campo com erro. Erro de servidor mantém o cartão completo. |
| A-08 | Média | Área do participante | O cabeçalho mostra só o grupo; o wireframe §5.5 mostra data do encontro e valor máximo, que a pessoa precisa para comprar o presente. Metade da tela fica vazia. | Acrescentar "Encontro em 24/12/2026 · até R$ 50,00" e local ao cabeçalho; esqueleto de "Lista de desejos" já com botão desabilitado "Adicionar presente — em breve". |
| A-09 | Baixa | Painel | Títulos em Title Case ("Link do Convite", "Detalhes do Grupo", "Sorteio dos Pares") contra frase normal no resto do app. | Aplicar o guia de voz (regra 7); ver textos.md §7. |
| A-10 | Média | Todas | Não há rodapé "Privacidade · Termos" (design-system §4); LGPD exige acesso fácil ao aviso. | Rodapé simples no layout; links apontam para páginas do 15 Segurança (pode ficar sem link até existirem — decisão do Orquestrador). |

Cartões sugeridos (cada um < 400 linhas): **FE-DSN-1** = A-01+A-02+A-04 (componentes); **FE-DSN-2** = A-03+A-08+A-09 (painel e área); **FE-DSN-3** = A-05+A-07 (textos do fluxo); **FE-DSN-4** = A-06+A-10. Os textos de cada um estão em `textos.md` (DSN-03 aplica os textos; sugiro unir FE-DSN-3 à DSN-03).

## Pontos fortes (manter)
- Cabeçalhos de cor por função: azul claro = organizador/participante, amarelo = convite, verde = sucesso.
- Erro sempre com ícone ⚠ e texto, nunca só cor.
- Título do início com destaque pêssego e fonte serifada no apoio: dá a personalidade sem peso.
- Painel em 1280 px com duas colunas, `max-w-6xl`, bem aproveitado.
