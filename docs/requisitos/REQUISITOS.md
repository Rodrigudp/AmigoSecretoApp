# Requisitos — Amigo Secreto (MVP)

Documento completo e editável: https://claude.ai/artifact/UgvsBsRnMfaty74ig7dErG
Esta cópia é a referência dos agentes. Mudanças só com aprovação do Product Owner (Rodrigo).

## Visão
Web app (PWA) de amigo secreto: o organizador cria o grupo, compartilha um link no WhatsApp, cada participante entra
só com o nome, monta a lista de desejos e vê, com sigilo, quem tirou. Receita: anúncios (AdSense) e links de afiliado.
Lançamento: **28/11/2026**. Meta: **10 mil participantes únicos até 25/12/2026**.

## Requisitos funcionais
| ID | Requisito | Ator | Prioridade | Agente dono |
| --- | --- | --- | --- | --- |
| RF01 | Criar grupo com nome, valor máximo, data e local da troca | Organizador | Alta | Feature Grupos |
| RF02 | Gerar link de convite e botão "Compartilhar no WhatsApp" | Organizador | Alta | Feature Grupos |
| RF03 | Entrar no grupo pelo link informando apenas o nome | Participante | Alta | Feature Participantes |
| RF04 | Link pessoal de acesso por participante, sem senha | Sistema | Alta | Feature Participantes |
| RF05 | CRUD da lista de desejos (nome, link opcional, observação) | Participante | Alta | Feature Lista de desejos |
| RF06 | Ver participantes e quantos já entraram | Organizador | Alta | Feature Grupos |
| RF07 | Remover participante antes do sorteio | Organizador | Alta | Feature Grupos |
| RF08 | Realizar o sorteio | Organizador | Alta | Feature Sorteio |
| RF09 | Ver quem tirou e a lista de desejos dessa pessoa | Participante | Alta | Feature Sorteio |
| RF10 | Converter links de produtos em links de afiliado | Sistema | Alta | Feature Lista de desejos |
| RF11 | Refazer o sorteio, invalidando o anterior | Organizador | Média | Feature Sorteio |
| RF12 | Sugestões de presente dentro do valor máximo | Sistema | Média | Feature Lista de desejos |
| RF13 | Contagem regressiva até a troca | Participante | Baixa | Feature Monetização |
| RF14 | Painel do dono com grupos, participantes e cliques | Dono do produto | Média | Feature Monetização |

## Regras de negócio
| ID | Regra |
| --- | --- |
| RN01 | Sorteio exige no mínimo 3 participantes. |
| RN02 | Ninguém tira a si mesmo; todos tiram e são tirados exatamente uma vez. |
| RN03 | O resultado só aparece pelo link pessoal; o organizador não vê os pares. |
| RN04 | Após o sorteio, ninguém novo entra; incluir alguém exige refazer o sorteio. |
| RN05 | Refazer o sorteio avisa a todos que o resultado anterior foi invalidado. |
| RN06 | Só o organizador (link admin) edita o grupo, remove pessoas e sorteia. |
| RN07 | Nomes repetidos recebem sufixo ("Ana", "Ana 2"). |
| RN08 | Dados apagados 60 dias após a data da troca. |
| RN09 | Limite de 100 participantes por grupo. |

## Requisitos não funcionais
| ID | Categoria | Requisito |
| --- | --- | --- |
| RNF01 | Usabilidade | Mobile first; criar grupo < 2 min; entrar < 30 s |
| RNF02 | Desempenho | LCP < 2 s em 4G; anúncios carregam depois do conteúdo |
| RNF03 | Segurança | Tokens aleatórios ≥ 128 bits; HTTPS |
| RNF04 | Segurança | Sorteio no servidor; cliente nunca recebe pares de outros |
| RNF05 | Privacidade | Só nome e lista de desejos; política de privacidade e aviso de cookies |
| RNF06 | Disponibilidade | Hospedagem que escala sozinha no pico |
| RNF07 | Custo | Infra fora da temporada < R$ 30/mês |
| RNF08 | Compatibilidade | Navegadores internos do WhatsApp e Instagram, Chrome, Safari |
| RNF09 | Compartilhamento | Prévia Open Graph no WhatsApp |
| RNF10 | Acessibilidade | WCAG AA, legível para idosos |

## Histórias de usuário (resumo)
- **HU01** Criar grupo e receber link de convite + link admin separado. (RF01, RF02)
- **HU02** Entrar só com nome e receber link pessoal; grupo fechado após sorteio. (RF03, RF04, RN04)
- **HU03** Montar lista de desejos; links Amazon/Mercado Livre viram afiliado. (RF05, RF10)
- **HU04** Sortear com ≥ 3 pessoas; organizador vê só "sorteio realizado". (RF06, RF08, RN01, RN03)
- **HU05** Ver resultado escondido até tocar em "revelar"; ninguém tira a si mesmo. (RF09, RN02)

## Fora do MVP
Restrições de sorteio, chat anônimo, login Google, Amigo Chocolate, app nas lojas, notificações.
