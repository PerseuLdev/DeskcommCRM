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
import { montarEscada } from "./escada";
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
      "A pessoa contou o caso, a conversa parou antes de marcar a consulta e ninguém voltou nela.",
    oQueDispara: "Um dia inteiro sem a pessoa responder, com a consulta ainda sem marcar.",
    pedeEtapa: false,
    handoffPolicy: "pause",
    gatilho: () => ({
      kind: "silence",
      params: { threshold_minutes: 24 * 60 },
      cancel_on_reply: true,
    }),
    grafo: montarEscada({
      prazoDeRespostaMs: 2 * DIA_MS,
      sim: { rotulo: "Quer marcar", padrao: "quero" },
      notaDeResposta: O_ATENDIMENTO_ASSUME,
      toques: [
        {
          rotulo: "Retoma a consulta",
          texto:
            "Oi! Ficamos de combinar o horário da sua consulta e a conversa parou por aqui. Quer que eu veja os horários livres?",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Pergunta o período",
          texto:
            "Passando de novo por aqui. Se ainda quiser marcar, me diz só o melhor período para você, manhã ou tarde, que eu procuro um horário.",
        },
        {
          esperaAntesMs: 4 * DIA_MS,
          rotulo: "Último toque",
          texto:
            "Esta é a última vez que eu apareço sobre isso. Se quiser retomar, é só me responder a qualquer momento. Se preferir deixar para mais para a frente, tudo bem também.",
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
            "Oi! Passando para saber se você conseguiu ler a proposta que enviamos. Ficou alguma dúvida? Pode perguntar por aqui.",
        },
        {
          esperaAntesMs: 4 * DIA_MS,
          rotulo: "Oferece conversar",
          texto:
            "Se quiser, posso pedir para o(a) advogado(a) conversar com você sobre os pontos da proposta. É só me dizer o melhor dia e horário.",
        },
        {
          esperaAntesMs: 7 * DIA_MS,
          rotulo: "Encerra e libera",
          texto:
            "Este é o último lembrete sobre a proposta. Se quiser seguir ou tirar qualquer dúvida, é só me responder. E se já resolveu de outra forma, me avisa que eu encerro por aqui.",
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
            "Oi! Vi que não conseguimos nos encontrar no horário de hoje. Acontece. Quer que eu veja outra data para a sua consulta?",
        },
        {
          esperaAntesMs: 2 * DIA_MS,
          rotulo: "Pede dia e período",
          texto:
            "Consigo encaixar você em outro horário. Me diz o dia da semana e o período que funcionam melhor para você.",
        },
        {
          esperaAntesMs: 5 * DIA_MS,
          rotulo: "Encerra o assunto",
          texto:
            "Se ainda quiser remarcar, é só me responder. Depois desta eu paro de lembrar, para não encher a sua caixa de mensagens.",
        },
      ],
    }),
  },
];
