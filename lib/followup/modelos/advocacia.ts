/**
 * MODELOS DE FOLLOW-UP DA ADVOCACIA — as três vezes em que quem procurou o
 * escritório some no meio do caminho: a triagem que parou, a proposta de
 * honorários sem resposta e a consulta a que a pessoa não veio.
 *
 * Mesmo desenho dos modelos de clínica (`montarEscada`): o que muda são os
 * textos, os prazos e o gatilho. Duas diferenças de propósito:
 *   • Os textos não falam de direito, chance de êxito nem valor — isso é do(a)
 *     advogado(a), na consulta, e a publicidade na advocacia é restrita (Provimento
 *     205/2021 do CFOAB). Cobra-se a resposta, não se vende o serviço.
 *   • Nenhum gatilho dispara para quem nunca falou com o escritório: todos partem
 *     de uma conversa que a PESSOA começou.
 */
import { montarCadencia, montarEscada } from "./escada";
import type { ModeloDeFollowup } from "./tipos";

const DIA_MS = 86_400_000;
const MIN_MS = 60_000;

const O_ATENDIMENTO_ASSUME = "O cliente respondeu — quem segue a conversa é a equipe do escritório.";

export const MODELOS_DE_ADVOCACIA: readonly ModeloDeFollowup[] = [
  {
    id: "advocacia-triagem-retomada",
    nicho: "advocacia",
    nome: "Triagem · retomar quem sumiu antes da consulta",
    jornada: "Triagem",
    resumo:
      "A pessoa contou o caso, a conversa parou antes de marcar a consulta e ninguém voltou nela. Dez toques ao longo de sete meses, espaçados cada vez mais, e uma cadência só por pessoa.",
    oQueDispara: "Um dia inteiro sem a pessoa responder, com a consulta ainda sem marcar.",
    pedeEtapa: false,
    handoffPolicy: "pause",
    gatilho: () => ({
      kind: "silence",
      // `max_enrollments_por_contato: 1`: a cadência roda UMA vez por pessoa. Sem o teto, quem
      // nunca responde continua "silenciosa" para sempre e a varredura recomeçaria os dez toques
      // do zero, de tempos em tempos, depois do último. Quem responde cancela a inscrição
      // (`cancel_on_reply`) e quem pede para parar de receber é bloqueado pela detecção de opt-out.
      params: { threshold_minutes: 24 * 60, max_enrollments_por_contato: 1 },
      cancel_on_reply: true,
    }),
    // Cadência: dia sim, dia não nos cinco primeiros toques (2 dias entre um e outro); depois 7, 14,
    // 30, 60 e 90 dias. Dez toques no total — o 180º dia e o 1 ano ficam de fora: a espera de um nó
    // vai até 90 dias e o teto de dez é o combinado. Tudo se ajusta no construtor, depois de instalar.
    //
    // Nome: "Oi {{primeiro_nome}}!" / "Olá {{primeiro_nome}}, …" — saudação ANTES da marcação e sem
    // vírgula entre as duas, porque a marcação sem valor some com o espaço à esquerda: sem nome sai
    // "Oi!" e "Olá, …", e não "Oi,!".
    grafo: montarCadencia({
      toques: [
        {
          rotulo: "Retoma a consulta",
          texto:
            "Oi {{primeiro_nome}}! A nossa conversa parou antes de combinarmos a consulta. Quer que eu veja os horários livres para você?",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Pergunta o período",
          texto:
            "Olá {{primeiro_nome}}, passando para ver se ficou alguma dúvida. Se ainda quiser marcar, me diz o melhor período, manhã ou tarde, que eu procuro um horário.",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Lembra que pode ser online",
          texto:
            "Oi {{primeiro_nome}}! A consulta pode ser presencial ou online, o que for mais fácil para você. Posso ver um horário?",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Abre para dúvidas",
          texto:
            "Olá {{primeiro_nome}}, ainda estou por aqui. Se tiver qualquer pergunta antes de marcar, pode mandar por esta conversa.",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Pergunta se ainda faz sentido",
          texto:
            "Oi {{primeiro_nome}}! Ainda faz sentido marcar a sua consulta? Se preferir não receber mais mensagens, é só me avisar.",
        },
        {
          esperaAntesMs: 7 * DIA_MS,
          rotulo: "Retoma depois de uma semana",
          texto:
            "Olá {{primeiro_nome}}, tudo bem? Se o assunto que você me contou ainda estiver em aberto, posso retomar de onde paramos e ver um horário.",
        },
        {
          esperaAntesMs: 14 * DIA_MS,
          rotulo: "Retoma depois de duas semanas",
          texto:
            "Oi {{primeiro_nome}}! Faz um tempo que a gente não se fala. Se a sua situação ainda precisa de orientação, é só me responder que eu retomo de onde paramos.",
        },
        {
          esperaAntesMs: 30 * DIA_MS,
          rotulo: "Retoma depois de um mês",
          texto:
            "Olá {{primeiro_nome}}, espero que esteja tudo bem. Se você ainda precisar de orientação, estou à disposição para marcar a consulta.",
        },
        {
          esperaAntesMs: 60 * DIA_MS,
          rotulo: "Deixa a porta aberta",
          texto:
            "Oi {{primeiro_nome}}! Só passando para deixar a porta aberta: se precisar de uma orientação, é só me chamar por aqui que eu vejo um horário para você.",
        },
        {
          esperaAntesMs: 90 * DIA_MS,
          rotulo: "Despedida",
          texto:
            "Olá {{primeiro_nome}}, esta é a minha última mensagem sobre isso, para não encher a sua caixa. Se um dia quiser retomar, é só me responder por aqui. Desejo tudo de bom.",
        },
      ],
    }),
  },

  {
    id: "advocacia-proposta-honorarios",
    nicho: "advocacia",
    nome: "Proposta · acompanhar os honorários enviados",
    jornada: "Proposta",
    resumo:
      "A consulta aconteceu, a proposta de honorários foi enviada e a pessoa não respondeu. O fluxo acompanha por duas semanas, sem pressionar.",
    oQueDispara: "O caso entrar na etapa do funil que você escolher (Consulta realizada, quando a proposta de honorários sai).",
    pedeEtapa: true,
    handoffPolicy: "pause",
    gatilho: ({ stageId }) => ({
      kind: "stage_change",
      params: { stage_id: stageId! },
      cancel_on_reply: true,
    }),
    grafo: montarEscada({
      prazoDeRespostaMs: 4 * DIA_MS,
      sim: { rotulo: "Quer seguir", padrao: "quero" },
      notaDeResposta: O_ATENDIMENTO_ASSUME,
      toques: [
        {
          // Três dias: quem recebe uma proposta de honorários lê, conversa em
          // casa e só então responde. Cobrar antes disso é falar por cima.
          esperaAntesMs: 3 * DIA_MS,
          rotulo: "Abre para dúvidas",
          texto:
            "Oi {{primeiro_nome}}! Passando para saber se você conseguiu ler a proposta que enviamos. Ficou alguma dúvida? Pode perguntar por aqui.",
        },
        {
          esperaAntesMs: 4 * DIA_MS,
          rotulo: "Oferece conversar",
          texto:
            "Olá {{primeiro_nome}}, se quiser, posso pedir para o(a) advogado(a) conversar com você sobre os pontos da proposta. É só me dizer o melhor dia e horário.",
        },
        {
          esperaAntesMs: 7 * DIA_MS,
          rotulo: "Encerra e libera",
          texto:
            "Oi {{primeiro_nome}}! Este é o último lembrete sobre a proposta. Se quiser seguir ou tirar qualquer dúvida, é só me responder. E se já resolveu de outra forma, me avisa que eu encerro por aqui.",
        },
      ],
    }),
  },

  {
    id: "advocacia-falta-remarcar",
    nicho: "advocacia",
    nome: "Falta · remarcar quem não veio à consulta",
    jornada: "Falta",
    resumo:
      "A falta foi confirmada na agenda e o horário ficou vago. O fluxo oferece outra data em vez de deixar a pessoa sumir.",
    oQueDispara: "Alguém confirmar na agenda que a pessoa não compareceu.",
    pedeEtapa: false,
    handoffPolicy: "pause",
    gatilho: () => ({ kind: "appointment_no_show", cancel_on_reply: true }),
    grafo: montarEscada({
      prazoDeRespostaMs: 2 * DIA_MS,
      sim: { rotulo: "Quer remarcar", padrao: "remarcar" },
      notaDeResposta: O_ATENDIMENTO_ASSUME,
      toques: [
        {
          // Duas horas, não na mesma hora: a falta costuma ser confirmada logo
          // depois do horário, e a pessoa pode estar a caminho.
          esperaAntesMs: 120 * MIN_MS,
          rotulo: "Oferece outra data",
          texto:
            "Oi {{primeiro_nome}}! Vi que não conseguimos nos encontrar no horário de hoje. Acontece. Quer que eu veja outra data para a sua consulta?",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Pede dia e período",
          texto:
            "Olá {{primeiro_nome}}, consigo encaixar você em outro horário. Me diz o dia da semana e o período que funcionam melhor para você.",
        },
        {
          esperaAntesMs: 5 * DIA_MS,
          rotulo: "Encerra o assunto",
          texto:
            "Oi {{primeiro_nome}}! Se ainda quiser remarcar, é só me responder. Depois desta eu paro de lembrar, para não encher a sua caixa de mensagens.",
        },
      ],
    }),
  },
];
