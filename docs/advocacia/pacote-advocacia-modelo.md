# Pacote de implantação — Advocacia Modelo (EXEMPLO)

> Escritório **fictício** usado na fase de testes. Tudo marcado com ⚠️ é suposição de exemplo e
> precisa ser trocado pelos dados reais do escritório antes de publicar o agente.
>
> **A fonte é o modelo de advocacia do produto**, em
> [`.agents/skills/deskcomm-cliente-novo/references/nichos.md`](../../.agents/skills/deskcomm-cliente-novo/references/nichos.md)
> (seção "Escritório de advocacia"). Este arquivo só preenche aquele modelo com os dados da
> Advocacia Modelo e acrescenta o que ele não traz (FAQ, memória, motivos, etiquetas). Quando o
> modelo do produto mudar, ele vence; atualize este arquivo a partir dele.
>
> Plano de uso: [plano-dia-a-dia.md](plano-dia-a-dia.md). Prompt: [prompt-recepcao.md](prompt-recepcao.md).

## 1. Negócio

| Campo | Valor |
|---|---|
| Nome | Advocacia Modelo ⚠️ |
| O que faz | Advocacia trabalhista, previdenciária, de família e do consumidor ⚠️ |
| Cidade / fuso | São Paulo (America/Sao_Paulo) ⚠️ |
| Não atende | criminal, tributário, empresarial ⚠️ |
| Horário | seg–sex, 9h–18h ⚠️ |
| Consulta inicial | presencial ou online, valor definido pelo escritório ⚠️ |

## 2. Funil "Consultas"

| Etapa | Passo do agente |
|---|---|
| Novo contato | novo |
| Já respondi | contatado |
| Entendendo o caso | qualificando |
| Consulta agendada | qualificado |
| Consulta realizada | negociando (a proposta de honorários sai aqui) |
| Contrato assinado | ganhou |
| Não avançou | perdeu |

- Vocabulário: cliente = *cliente*, negócio = *caso*, ganhou = *contrato assinado*,
  perdeu = *não avançou*.
- Campos personalizados do caso (Configurações › Funis): `area_direito` (lista: Trabalhista,
  Previdenciário, Família, Consumidor ⚠️), `urgencia` (lista: Alta/Média/Baixa),
  `numero_processo` (texto, se já houver processo aberto). Um campo de data (ex. prazo
  processual) pode virar alerta pelo gatilho de campo de data do funil.
- Motivos de perda: Honorários acima do orçamento, Área não atendida, Sem retorno do cliente,
  Contratou outro advogado, Caso sem viabilidade, Procurou Defensoria Pública.
- Motivos de ganho: Indicação, Cliente antigo, Atendimento rápido, Especialidade na área.

> O banco local de testes ainda tem o funil antigo "Novos casos". Ajuste-o pela tela para as
> etapas acima (ou crie "Consultas" e arquive o antigo).

## 3. Etiquetas

A etiqueta nasce quando alguém (ou o agente) a aplica num contato, conversa ou card, e daí aparece
em Configurações › Tags. Usar exatamente estes nomes: `trabalhista`, `familia`, `previdenciario`,
`consumidor`, `urgente`, `indicacao`, `cliente-antigo`.

## 4. FAQ (material "Perguntas frequentes do escritório")

```markdown
## Pergunta: Quais áreas o escritório atende?
## Resposta: Direito do trabalho, previdenciário (INSS), família (divórcio, pensão, guarda, inventário) e direito do consumidor. Não atendemos casos criminais, tributários ou empresariais.

## Pergunta: Como funciona a primeira consulta?
## Resposta: É uma conversa com um(a) advogado(a) para entender o seu caso e analisar os documentos. Pode ser presencial ou online. O valor e a duração são informados na hora de marcar.

## Pergunta: Vocês dizem se eu tenho direito pelo WhatsApp?
## Resposta: Não. Só o(a) advogado(a), com a análise do caso e dos documentos, pode orientar. Pelo WhatsApp a gente organiza as informações e marca a consulta.

## Pergunta: Quanto custam os honorários?
## Resposta: Depende do tipo de caso e do trabalho envolvido. O(a) advogado(a) apresenta uma proposta por escrito depois da consulta. A cobrança pode ser fixa, por êxito ou mista.

## Pergunta: Que documentos levo para um caso trabalhista?
## Resposta: Documento com foto, carteira de trabalho (física ou digital), holerites, termo de rescisão (se houver), extrato do FGTS e qualquer mensagem, e-mail ou foto que ajude a contar o que aconteceu.

## Pergunta: Que documentos levo para um caso de INSS?
## Resposta: Documento com foto, CPF, comprovante de endereço, extrato do CNIS (pelo Meu INSS), carta de indeferimento (se houver), laudos e exames médicos (para benefício por incapacidade).

## Pergunta: Que documentos levo para um caso de família?
## Resposta: Documento com foto, certidão de casamento ou de nascimento dos filhos, comprovante de renda e, se for o caso, lista dos bens.

## Pergunta: Que documentos levo para um problema com empresa (consumidor)?
## Resposta: Documento com foto, nota fiscal ou contrato, protocolos de atendimento, prints de conversas e comprovantes de pagamento.

## Pergunta: Recebi uma intimação ou tenho audiência marcada. O que faço?
## Resposta: Avise agora por aqui com a data da audiência ou do prazo. Uma pessoa da equipe vai falar com você o quanto antes.

## Pergunta: Já sou cliente. Como sei como está meu processo?
## Resposta: Peça por aqui que a equipe do escritório consulta o andamento e responde.

## Pergunta: Qual o horário de atendimento?
## Resposta: Segunda a sexta, das 9h às 18h. Mensagens fora do horário são respondidas no próximo dia útil.
```

⚠️ Trocar horário, áreas e informações da consulta pelos dados reais.

## 5. Memória da organização (regras da casa)

```
O escritório atende direito do trabalho, previdenciário, família e consumidor.
O escritório não atende criminal, tributário nem empresarial; nesses casos, indicar a OAB local ou a Defensoria Pública.
Horário de atendimento: segunda a sexta, 9h às 18h.
Ninguém do escritório dá parecer, chance de êxito ou valor de causa por WhatsApp; isso é só na consulta.
Honorários só são apresentados pelo(a) advogado(a), em proposta escrita depois da consulta.
Sigilo profissional: nunca peça documento sensível por aqui; isso é na consulta.
```

## 6. Follow-ups

Os três modelos estão em `lib/followup/modelos/advocacia.ts` e aparecem como modelos prontos em
IA › Follow-ups. Todas as mensagens abrem com saudação e o primeiro nome ("Oi Perseu!"); contato
sem nome recebe "Oi!".

| Fluxo | Gatilho | Passos |
|---|---|---|
| Triagem parada | 24 h sem o cliente responder; roda **uma vez por pessoa**; cancela ao responder | **10 mensagens**: a 1ª quando o silêncio completa 24 h; depois 2, 2, 2 e 2 dias (dia sim, dia não); depois 7, 14, 30, 60 e 90 dias. A 10ª é a despedida |
| Faltou à consulta | falta registrada na agenda | espera 2 horas → oferecer novo horário → espera 2 dias → pedir dia e período → espera 5 dias → última tentativa → fim |
| Proposta sem resposta | entrada na etapa *Consulta realizada* | espera 3 dias → "ficou alguma dúvida sobre a proposta?" → espera 4 dias → oferecer conversa com o advogado → espera 7 dias → último lembrete → fim |

**Quando a Triagem para:** depois da 10ª mensagem; quando a pessoa **responde qualquer coisa** (a
inscrição é cancelada e quem atende assume); e quando ela pede para não receber mais mensagens (a
detecção de "parar" bloqueia o contato). Como roda uma vez por pessoa, o fim da cadência não
recomeça outra.

**Ajustar pela tela:** em IA › Follow-ups, abra o fluxo, clique numa caixa de *espera* e troque o
valor e a unidade (minutos, horas ou dias). O texto de cada mensagem se edita na caixa de
mensagem; "Uma vez por pessoa" fica no gatilho. Cada espera vai de 5 minutos a **90 dias**: para
180 dias ou 1 ano, ponha duas ou mais esperas seguidas. O caminho tem teto de 30 passos (mensagem
+ espera), então cabem uns 15 toques.

⚠️ O combinado era "180 dias e 1 ano" depois do 90, mas também "parar depois de 10". As duas coisas
não cabem juntas (a cadência listada tem 12 toques), então o modelo vem com 10. Para ter os 12,
acrescente os dois toques no fim e uma espera extra antes do 12º.

O lembrete da consulta é a **agenda**, não follow-up.

## 7. Agente "Recepção"

- Modelos de teste: Claude Sonnet no atendimento; Claude Haiku nos auxiliares (roteador,
  follow-up). Os dois via OpenRouter, para ficar barato.
- Funil: Consultas. Materiais: FAQ acima. Follow-ups: os três acima.
- Prompt: [prompt-recepcao.md](prompt-recepcao.md).
- **Passar para uma pessoa:**
  - Palavras de passagem: **só as do padrão** ("falar com humano", "atendente", "pessoa real").
    Não acrescente "advogado", "processo", "audiência" etc.: neste nicho são o vocabulário normal
    do cliente, e quase toda conversa passaria para humano.
  - **Desligue** o interruptor "Passar para uma pessoa quando o cliente falar de assunto jurídico
    (Procon, advogado, processo)" no cartão "Passar para uma pessoa" (só admin muda). Urgência,
    prazo e cliente atual continuam passando, porque o prompt manda chamar a equipe nesses casos,
    e o pedido explícito de pessoa segue valendo.
- Capacidades: pacote *vender* (agenda, conhecimento, notas e funil) **+ "casos" ligada**, para
  que urgência alta abra fila humana de verdade.
- Agenda: um **tipo de atendimento por área** (Agenda › Tipos de atendimento), cada um com o
  advogado daquela área como responsável padrão. O agente não escolhe advogado pelo nome: ele casa
  a área diagnosticada com o tipo de atendimento.
- **Mais de uma área:** em produção, o modelo do produto recomenda o **Roteador de Intenção**,
  com um agente por área (prompt e tipo de atendimento próprios). Na fase de testes, um agente
  "Recepção" só para as quatro áreas.

## 8. Avisar o escritório antes de publicar

- **Sigilo entre áreas:** qualquer atendente ou gerente com acesso ao funil "Consultas" vê os
  casos de todas as áreas. Não existe hoje permissão por funil.
- **OAB:** o Provimento 205/2021 e o Código de Ética restringem captação e proíbem prometer
  resultado. O prompt já evita isso, mas o advogado responsável revisa o texto final; o CRM não
  valida conteúdo jurídico.
- **Honorários:** o módulo opcional Honorários (Administração › Módulos) registra o contrato
  (fixo, êxito ou misto) e as parcelas, e deixa o agente consultá-los.

## 9. O que falta (e o que acontece enquanto falta)

| Falta | Efeito | Quem resolve |
|---|---|---|
| Chave OpenRouter em IA › Credenciais | agente não testa nem publica | você |
| Chave OpenAI | FAQ fica "esperando" e não é consultada; áudio do cliente não é transcrito | você (opcional) |
| WhatsApp conectado (QR em Conexões) | agente não publica | você, com o celular |
| Dados reais (⚠️) | agente responde com dados de exemplo | escritório |
