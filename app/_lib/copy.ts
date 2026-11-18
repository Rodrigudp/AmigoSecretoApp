/** Textos aprovados em docs/features/textos.md; as chaves preservam os IDs do catálogo. */
export const copy = {
  EXTRA: {
    stepsLabel: "Como funciona",
    upcoming: "Em breve",
    invalidHint: "Peça um novo link ao organizador.",
    personalRequired: "Link pessoal necessário",
    createErrorTitle: "Não foi possível criar o grupo",
    joinErrorTitle: "Não foi possível entrar",
    currencyPrefix: "até R$",
  },
  GLB_01: "Pular para o conteúdo",
  GLB_02: "Papelzinho",
  GLB_03: "Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha.",
  GLB_04: "Amigo secreto online — Papelzinho",
  GLB_05: "Página não encontrada",
  GLB_06: {
    text: "Confira o endereço ou volte para a página inicial.",
    action: "Voltar ao início",
  },
  GLB_07: "Carregando…",
  GLB_08: "Sem conexão no momento. Verifique a internet e tente de novo.",
  GLB_09: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  GLB_11: "✓ Link copiado!",
  GLB_12: "Não foi possível copiar. Toque no campo e copie o link.",
  HOM_01: { start: "Amigo secreto", end: "começa aqui." },
  HOM_02: "Organize a troca em dois minutos. Cada pessoa entra pelo convite, só com o nome.",
  HOM_03: ["Crie o grupo", "Envie o convite", "Faça o sorteio"],
  HOM_04: { title: "Criar grupo", help: "Os dados abaixo vão no convite." },
  HOM_05: { label: "Nome do grupo", placeholder: "Ex.: Família Silva" },
  HOM_06: { label: "Valor máximo do presente (R$)", placeholder: "Ex.: 50,00" },
  HOM_07: "Data da troca",
  HOM_08: { label: "Local da troca (opcional)", placeholder: "Ex.: Casa da Vó Maria" },
  HOM_09: { action: "Criar grupo", loading: "Criando…" },
  HOM_10: "Confira os campos destacados",
  HOM_11: "Escreva o nome do grupo (até 60 letras).",
  HOM_12: "Informe um valor maior que zero. Ex.: 50,00.",
  HOM_13: "Escolha uma data a partir de amanhã.",
  HOM_14: "Use até 120 letras no local.",
  HOM_15: "Este grupo já foi criado antes. Recarregue a página para criar outro.",
  HOM_16: "Não foi possível criar o grupo agora. Confira os dados e tente de novo.",
  CRI_01: "Grupo criado.",
  CRI_02: {
    title: "Link do convite",
    text: "Envie este link para as pessoas entrarem só com o nome.",
  },
  CRI_03: { copy: "Copiar link", share: "Compartilhar no WhatsApp" },
  CRI_04: {
    title: "Você também vai participar?",
    text: "Entre pelo convite com o seu nome para entrar no sorteio.",
    action: "Entrar no grupo",
  },
  CRI_05: "Guarde o seu link de organizador",
  CRI_06:
    "Este link abre o painel do grupo. Não compartilhe no grupo do WhatsApp: quem tiver o link pode tirar pessoas e fazer o sorteio.",
  CRI_07: {
    label: "Link de organizador",
    copy: "Copiar link",
    save: "Salvar no meu WhatsApp",
    open: "Abrir o painel",
  },
  CNV_01: "Você foi convidado",
  CNV_02: "Entre só com o seu nome. Sem cadastro e sem senha.",
  CNV_03: { label: "Como você se chama?", placeholder: "Ex.: Ana" },
  CNV_04: { action: "Entrar no grupo", loading: "Entrando…" },
  CNV_05: { resume: (name: string) => `Continuar como ${name}`, other: "Entrar com outro nome" },
  CNV_06: "Confira o campo destacado",
  CNV_07: "Escreva o seu nome.",
  CNV_08: "Use até 40 letras.",
  CNV_09: "Escreva o nome sem os símbolos < e >.",
  CNV_10: {
    title: "Link indisponível",
    text: "Este link é inválido ou não está mais disponível. Peça um novo link ao organizador.",
  },
  CNV_11: "O sorteio já foi realizado. As entradas estão encerradas. Fale com o organizador.",
  CNV_12: "Este grupo já está completo (100 pessoas). Fale com o organizador.",
  CNV_13: "Não foi possível entrar no grupo agora. Tente de novo em instantes.",
  PES_01: (name: string) => `Você entrou, ${name}.`,
  PES_02: "Guarde este link. É por ele que você verá quem tirou e a sua lista. Não compartilhe.",
  PES_03: {
    title: "Seu link pessoal",
    label: "Link pessoal",
    copy: "Copiar link",
    save: "Salvar no WhatsApp",
    open: "Ir para a minha área",
  },
  ARE_01: { group: (name: string) => `Grupo ${name}`, greeting: (name: string) => `Olá, ${name}.` },
  ARE_02: "O sorteio ainda não foi realizado.",
  ARE_03: "O sorteio já foi realizado. Veja abaixo quem você tirou.",
  ARE_04: {
    title: "Lista de desejos",
    text: "Em breve você poderá montar aqui a sua lista de desejos.",
    action: "Adicionar presente — em breve",
  },
  ARE_05: {
    title: "Meu amigo secreto",
    text: "Em breve o resultado aparecerá aqui, escondido até você tocar em revelar.",
  },
  ARE_06: {
    title: "Link indisponível",
    text: "Este link é inválido ou não está mais disponível. Peça um novo link ao organizador.",
  },
  ARE_07: "Abra o seu link pessoal para acessar esta área.",
  ADM_01: "Painel do organizador",
  ADM_02: "Entradas abertas",
  ADM_03: (date: string) => `Sorteio feito em ${date}`,
  ADM_04: {
    title: "Detalhes do grupo",
    date: "Data da troca",
    value: "Valor máximo",
    location: "Local",
    missing: "Não informado",
  },
  ADM_05: { title: "Link do convite", text: "Envie o convite para quem vai participar." },
  ADM_06: { copy: "Copiar link", share: "Compartilhar no WhatsApp" },
  ADM_07: {
    count: (n: number) => `Participantes (${n} de 100)`,
    joined: (date: string) => `Entrou em ${date}`,
  },
  ADM_08: "Ninguém entrou ainda. Envie o convite acima.",
  ADM_09: { text: "Remover", label: (name: string) => `Remover ${name}` },
  ADM_10: {
    confirm: (name: string) => `Remover ${name}? Essa pessoa não entrará no sorteio.`,
    cancel: "Cancelar",
    accept: "Sim, remover",
  },
  ADM_11: "Não foi possível remover agora. Tente de novo.",
  ADM_12: {
    title: "Sorteio",
    text: "Quando todos tiverem entrado, faça o sorteio. Cada pessoa vê só quem tirou.",
  },
  ADM_13: "Fazer o sorteio",
  ADM_14: "Para sortear, precisa de pelo menos 3 pessoas.",
  ADM_15:
    "✓ Sorteio feito! Cada pessoa já pode ver quem tirou pelo seu link pessoal. Por segurança, este painel não mostra os pares.",
  ADM_16: {
    title: "Link indisponível",
    text: "Este link é inválido ou não está mais disponível.",
    help: "Confira se copiou o endereço completo. Se perdeu o link, crie um novo grupo.",
    action: "Criar um novo grupo",
  },
  ADM_17: "Painel do organizador — Papelzinho",
  WPP_01: {
    intro: (name: string) => `Oi! Criei um amigo secreto no Papelzinho: *${name}* 🎁`,
    date: "Troca de presentes",
    value: "Valor máximo",
    location: "Local",
    action: "Entre pelo link, só com o seu nome:",
  },
  WPP_02: "Meu link pessoal do Papelzinho (guarde, não compartilhe):",
  WPP_03: "Meu link de organizador do Papelzinho (guarde, não compartilhe):",
  WPP_04: {
    title: (name: string) => `O sorteio do amigo secreto *${name}* foi feito! 🎁`,
    text: "Abra o link pessoal que você salvou ao entrar para ver quem você tirou. Não conte para ninguém!",
    date: "Troca de presentes",
  },
  OG_01: {
    title: (name: string) => `${name} — Papelzinho`,
    description: (name: string) =>
      `Você foi convidado para o amigo secreto '${name}'. Toque para entrar e dizer o seu nome.`,
  },
  OG_02: (name: string) => `Você foi convidado para o amigo secreto '${name}'.`,
  OG_03: "Este link é inválido ou não está mais disponível.",
  OG_04: "Papelzinho",
  OG_05: "Painel do organizador — Papelzinho",
  OG_06: "Amigo secreto online — Papelzinho",
  LEG: {
    updated: "18/11/2026",
    updatedLabel: "Última atualização:",
    pending: "A PREENCHER PELO RODRIGO",
    sobre: {
      title: "Sobre o Papelzinho",
      description: "Como o Papelzinho funciona e como o site se mantém.",
      sections: [
        {
          heading: "O que é",
          blocks: [
            {
              p: "O Papelzinho é um site gratuito para organizar a troca de presentes entre amigos e família.",
            },
            {
              p: "O organizador cria um grupo, compartilha o link no WhatsApp, cada pessoa entra só com o nome, monta a própria lista de desejos e, no dia marcado, descobre com sigilo quem tirou.",
            },
            {
              p: "Não é preciso criar conta nem senha. Ninguém vê o resultado do sorteio além da própria pessoa.",
            },
          ],
        },
        {
          heading: "Como o site se mantém",
          blocks: [
            {
              p: "Podemos exibir anúncios do Google AdSense e, em alguns links de produtos, usamos links de afiliado. Quando você compra por um desses links, a loja pode pagar uma comissão ao site, sem custo extra para você.",
            },
          ],
        },
      ],
    },
    privacidade: {
      title: "Política de privacidade do Papelzinho",
      description:
        "Quais dados o Papelzinho coleta, para quê, por quanto tempo e como você exerce seus direitos.",
      sections: [
        {
          heading: "Quem é o responsável pelos dados",
          blocks: [
            { p: "Controlador: A PREENCHER PELO RODRIGO. Contato: A PREENCHER PELO RODRIGO." },
          ],
        },
        {
          heading: "Quais dados coletamos",
          blocks: [
            {
              ul: [
                {
                  label: "Nome",
                  text: "que você digita ao entrar em um grupo (pode ser apelido).",
                },
                {
                  label: "Lista de desejos:",
                  text: "os itens, links opcionais e observações que você cadastra.",
                },
                {
                  label: "Dados técnicos de uso, de forma anônima:",
                  text: "por exemplo, que um grupo foi criado ou que um sorteio foi feito. Esses registros usam apenas números internos do sistema. Não guardamos e-mail, telefone, CPF, endereço ou localização.",
                },
                "Cookies (detalhados abaixo).",
              ],
            },
            { p: "Não pedimos e-mail, telefone, documentos ou dados de pagamento." },
          ],
        },
        {
          heading: "Para que usamos",
          blocks: [
            {
              ul: [
                "Fazer o sorteio e mostrar o resultado somente para quem tem o link pessoal.",
                "Mostrar a lista de desejos aos colegas do grupo.",
                "Medir, de forma agregada, quantos grupos e participantes usam o site.",
                "Exibir anúncios. Quando houver anúncios, pediremos o seu consentimento antes.",
              ],
            },
          ],
        },
        {
          heading: "Cookies",
          blocks: [
            {
              ul: [
                {
                  label: "Cookie estritamente necessário:",
                  text: "o cookie do seu link pessoal (ptk_). Ele mantém você conectado ao seu grupo durante a sessão. Sem ele o site não funciona, por isso não pedimos consentimento para ele.",
                },
              ],
            },
            {
              p: "Hoje o site não usa cookies de anúncio nem de medição de terceiros. Quando houver anúncios, vamos pedir o seu consentimento antes de usar qualquer cookie desse tipo.",
            },
          ],
        },
        {
          heading: "Compartilhamento e transferência internacional",
          blocks: [
            { p: "Compartilhamos dados apenas com os prestadores que mantêm o site:" },
            {
              ul: [
                {
                  label: "Hostinger (servidor do site, VPS):",
                  text: "pode processar dados fora do Brasil.",
                },
                {
                  label: "Supabase (banco de dados):",
                  text: "pode processar dados fora do Brasil.",
                },
                {
                  label: "Google AdSense (quando houver anúncios):",
                  text: "poderá receber dados técnicos para exibir anúncios, somente após o seu consentimento. Pode haver transferência internacional.",
                },
                {
                  label: "Lojas afiliadas:",
                  text: "quando você clica em um link de afiliado, você é redirecionado para a loja. Não enviamos seu nome nem sua lista de desejos a elas.",
                },
              ],
            },
          ],
        },
        {
          heading: "Links de afiliado",
          blocks: [
            {
              p: "Alguns links de produtos são links de afiliado. Ao clicar, a loja registra o clique com o identificador do programa de afiliados.",
            },
          ],
        },
        {
          heading: "Por quanto tempo guardamos",
          blocks: [
            {
              ul: [
                "Os dados do grupo, incluindo nomes e listas de desejos, são apagados 60 dias após a data da troca.",
                'Depois disso, ficam apenas contadores anônimos do histórico (por grupo e tipo de ação, como "grupo criado" ou "sorteio feito"). Esses contadores não contêm nome, lista de desejos nem qualquer identificador de pessoa, por isso não são apagados junto com o grupo.',
              ],
            },
          ],
        },
        {
          heading: "Seus direitos (LGPD)",
          blocks: [
            {
              p: "Você pode pedir acesso, correção, exclusão ou revogação do consentimento a qualquer momento.",
            },
            {
              ul: [
                {
                  label: "Sem e-mail e sem login:",
                  text: "para editar a sua lista de desejos, use o seu link pessoal. Para sair ou ser removido de um grupo, peça ao organizador antes do sorteio. Não enviamos links secretos por e-mail.",
                },
                {
                  label: "Pedidos pelo contato:",
                  text: "escreva para A PREENCHER PELO RODRIGO. Respondemos em até 15 dias.",
                },
              ],
            },
          ],
        },
      ],
    },
    termos: {
      title: "Termos de uso do Papelzinho",
      description: "Regras de uso do Papelzinho.",
      sections: [
        {
          heading: "Regras gerais",
          blocks: [
            {
              ol: [
                {
                  label: "Uso.",
                  text: "O site serve para organizar trocas de presentes entre pessoas que se conhecem. É gratuito.",
                },
                {
                  label: "Idade.",
                  text: "O uso do site é permitido a partir de 18 anos. Pessoas menores de idade só podem usar o site com supervisão de um responsável, que concorda com estes termos e com a política de privacidade.",
                },
                {
                  label: "Responsabilidade do organizador.",
                  text: "O organizador é responsável pelo grupo que cria e pelos convites que envia.",
                },
                {
                  label: "Conteúdo.",
                  text: "Quem cadastra itens na lista de desejos é responsável pelo que escreve e pelos links que inclui.",
                },
                {
                  label: "Afiliados e anúncios.",
                  text: "O site pode exibir anúncios e links de afiliado. A compra é feita diretamente na loja, que responde pelo produto, pela entrega e pela troca.",
                },
                {
                  label: "Disponibilidade.",
                  text: "Fazemos o possível para manter o site no ar, mas não garantimos funcionamento sem interrupções.",
                },
                {
                  label: "Alterações.",
                  text: "Podemos atualizar estes termos. A data de atualização fica no topo da página.",
                },
                { label: "Foro.", text: "Aplica-se a lei brasileira." },
              ],
            },
          ],
        },
      ],
    },
    contato: {
      title: "Fale com a gente",
      description: "Como falar com o time do Papelzinho sobre dúvidas, sugestões e dados pessoais.",
      siteLabel: "Site:",
      sections: [
        {
          heading: "Canais",
          blocks: [
            {
              p: "Dúvidas e sugestões: escreva para A PREENCHER PELO RODRIGO. Respondemos em até 5 dias úteis.",
            },
            {
              p: "Pedidos sobre seus dados pessoais: respondemos em até 15 dias, conforme a política de privacidade.",
            },
          ],
        },
      ],
    },
  },
} as const;
