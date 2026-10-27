# Plano de uso diário — DeskcommCRM numa advocacia

> Como um escritório de advocacia opera o dia a dia no DeskcommCRM: do primeiro "oi" no WhatsApp
> até o contrato assinado e o cliente acompanhado. Escrito sobre o que o produto **já tem hoje**;
> o que falta para advocacia está separado no fim (seção 7), com o paliativo de cada lacuna.

---

## 1. A ideia em uma frase

O CRM cuida da **captação e do relacionamento** (atendimento no WhatsApp, triagem do caso,
consulta, proposta de honorários, contrato, comunicação com o cliente). Ele **não é** um software
jurídico de processos: número CNJ, prazos processuais e intimações continuam no sistema que o
escritório já usa, ou vão para tarefas no CRM até existir um módulo próprio (seção 7).

---

## 2. Papéis no escritório

| Papel | Quem costuma ser | O que faz no CRM |
|---|---|---|
| **Agente de IA "Recepção"** | IA | Atende 24 h, faz a triagem do caso, agenda a consulta, passa para uma pessoa quando precisa |
| **Secretaria / recepção** | 1–2 pessoas | Fila de passagens da IA, agenda, confirmações, documentos, cobranças simples |
| **Advogado(a) responsável** | Cada advogado | Consultas, notas do caso, proposta de honorários, tarefas e prazos dos seus clientes |
| **Sócio(a) / gestor(a)** | Sócio administrador | Métricas, financeiro, revisão do agente, distribuição de casos por área |

Cada pessoa entra com o próprio usuário (**Equipe › Convidar**) e só vê o que o papel permite.

---

## 3. Configuração inicial (uma vez, ~1 semana)

A ordem importa: cada passo depende do anterior.

### 3.1 Canal e IA
1. **Conexões**: conectar o número de WhatsApp do escritório (status `WORKING`).
2. **IA › Credenciais**: cadastrar a chave do provedor de IA e a da OpenAI (sem ela a base de
   conhecimento não indexa e o áudio do cliente não é transcrito; cliente de escritório manda
   muito áudio).
3. **IA › Provedores**: modelo barato para os auxiliares (roteador, follow-up), modelo bom com
   ferramentas para o atendimento.

### 3.2 Funil "Consultas"

Etapas, vocabulário e campos seguem o modelo de advocacia do produto
([`nichos.md`](../../.agents/skills/deskcomm-cliente-novo/references/nichos.md), seção
"Escritório de advocacia"); o preenchido para a Advocacia Modelo está em
[pacote-advocacia-modelo.md](pacote-advocacia-modelo.md), seção 2.

| Etapa | Passo do agente | O que significa |
|---|---|---|
| Novo contato | novo | Chegou mensagem, ninguém respondeu |
| Já respondi | contatado | Primeiro retorno dado |
| Entendendo o caso | qualificando | Triagem: área, o que aconteceu, quando, urgência |
| Consulta agendada | qualificado | Caso com perfil do escritório, consulta na agenda |
| Consulta realizada | negociando | Consulta feita, proposta de honorários enviada |
| **Contrato assinado** | ganhou | Contrato de honorários assinado |
| **Não avançou** | perdeu | Desistiu, fora da área, sem retorno (sempre com motivo) |

**Vocabulário do funil**: cliente = *cliente*, negócio = *caso*, ganhou = *contrato assinado*,
perdeu = *não avançou*.

**Campos do caso**: `area_direito` (lista com as áreas atendidas), `urgencia` (Alta/Média/Baixa),
`numero_processo` (texto, se já houver processo aberto).

**Funil opcional "Clientes ativos"** (acompanhamento, não substitui o sistema processual):
Contrato assinado → Documentos pendentes → Petição/medida em preparo → Em andamento → Audiência
marcada → Decisão/sentença → **Encerrado com êxito** (ganhou) / **Encerrado sem êxito** (perdeu).
Um negócio ganho pode abrir sozinho o card de continuação nesse funil.

**Etiquetas**, uma por área: `trabalhista`, `familia`, `previdenciario`, `consumidor` (mais as que
o escritório atender). Mais `urgente`, `indicacao`, `cliente-antigo`. Filtram inbox, funil e
relatórios por área.

### 3.3 Agentes e roteador

**Um agente "Recepção" resolve escritório de uma área só.** Com mais de uma área, o modelo do
produto recomenda o **Roteador de Intenção**: um agente por área, cada um com prompt e tipo de
atendimento próprios. Para a fase de testes da Advocacia Modelo, um agente só.

- **Prompt**: o do modelo do produto, preenchido em [prompt-recepcao.md](prompt-recepcao.md).
- **Passar para uma pessoa**: palavras de passagem **só as do padrão**. Não acrescente
  "advogado", "processo", "audiência": são o vocabulário normal do cliente e quase toda conversa
  passaria. **Desligue** o interruptor "Passar para uma pessoa quando o cliente falar de assunto
  jurídico". Quem passa para humano é o prompt (urgência de prazo, risco, pedido de advogado) e o
  pedido explícito de pessoa, que segue sempre ligado.
- **Capacidade "casos" ligada**: é o que faz urgência alta abrir fila humana de verdade.
- **Agenda por área**: um tipo de atendimento por área, com o advogado da área como responsável
  padrão. O agente não escolhe advogado pelo nome; casa a área com o tipo de atendimento.

### 3.4 Base de conhecimento, memória e follow-ups

- **IA › Conhecimento (FAQ e documentos)**: áreas atendidas e não atendidas; como funciona a
  consulta (presencial/online, duração, se é paga); documentos para levar por área (trabalhista:
  CTPS, holerites, TRCT; previdenciário: CNIS, laudos; família: certidões); endereço,
  estacionamento, horário; formas de pagamento dos honorários.
- **IA › Memória (regras da casa)**: horário de atendimento; quem atende cada área; "não atendemos
  {área}"; "urgência criminal fora do horário: {telefone de plantão}".
- **IA › Follow-ups** (publicar e ligar no agente, no campo *follow-ups que arma*):
  - silêncio de 24 h em *Entendendo o caso*: "conseguiu ver os horários para a consulta?";
  - consulta marcada e falta (no-show): oferecer novo horário no dia seguinte;
  - 3 dias em *Consulta realizada* sem resposta à proposta: "ficou alguma dúvida sobre a
    proposta?"; 7 dias: última tentativa e registrar o motivo da perda.
  - O lembrete da consulta é a **agenda**, não follow-up.
- **Agenda**: conectar o Google Agenda de cada advogado; tipos de compromisso: *Consulta
  inicial*, *Retorno*, *Reunião com cliente*. Audiências e prazos podem entrar como compromissos
  do advogado para aparecer no mesmo calendário.

### 3.5 Testar antes de publicar
Botão **Testar** do agente com as mensagens de [prompt-recepcao.md](prompt-recepcao.md), mais um
áudio de 1 minuto contando um caso. O agente só vai ao ar depois que todas respondem como o
escritório quer.

---

## 4. Rotina diária

### Abertura — 8h00 (secretaria)
1. **Inbox**: atender primeiro as **passagens da IA → humano** que chegaram durante a noite
   (urgências e clientes atuais). Nenhuma passagem fica sem dono até as 9h.
2. **Agenda do dia**: confirmar as consultas de hoje; quem não confirmou recebe mensagem.
3. **Tarefas de hoje**: conferir o que vence hoje e avisar o advogado responsável.

### Início do expediente — 8h30 (advogados)
1. **Tarefas** filtradas por "minhas": prazos e providências do dia, por data de vencimento.
2. **Funil "Consultas" › Consulta agendada**: ler o resumo da triagem que a IA deixou no lead
   antes de cada consulta; a pessoa não precisa contar a história de novo.

### Durante o dia
- **Depois de cada consulta**, no lead:
  - nota com o resumo do caso, a estratégia e os documentos que faltam;
  - etiqueta da área;
  - mover para *Consulta realizada* e enviar a proposta de honorários;
  - tarefa "acompanhar proposta" para 3 dias (se não usar o follow-up automático).
- **Contrato assinado**: mover para *Contrato assinado* e, com o módulo Honorários, registrar o
  contrato e as parcelas. Se usar o funil *Clientes ativos*, criar o
  cartão lá e as tarefas iniciais (procuração, documentos, petição).
- **Cliente perguntando do processo**: responder pelo Inbox com o andamento consultado no sistema
  processual e registrar nota no contato. Assim, quem atender depois sabe o que foi dito.
- **Respostas rápidas (Templates)** para o que se repete: lista de documentos por área, endereço,
  "recebemos seus documentos", "sua audiência foi marcada para...".

### Fechamento — 17h30
- **Secretaria**: Inbox sem conversa aberta sem dono; consultas de amanhã confirmadas.
- **Advogados**: tarefas de amanhã revisadas; o que não foi feito hoje é reagendado, nunca
  esquecido.
- **Quem cuida da IA** (10 min): **IA › Execuções**, procurar respostas vetadas ou passagens
  estranhas e anotar o que ajustar no prompt ou na base.

---

## 5. Rotina semanal e mensal

**Toda segunda (sócio/gestor, 30 min)**
- **Métricas**: novos contatos da semana, quantos viraram consulta, quantos viraram contrato,
  por área (etiqueta) e por origem (indicação, Instagram, Google).
- **Motivos de perda** em *Não avançou*: preço, área não atendida, sumiu, contratou outro.
- Distribuir casos novos sem responsável.

**Toda sexta (quem cuida da IA, 30 min)**
- Perguntas que a IA não soube responder: viram FAQ nova.
- Tempo de resposta e taxa de passagem para humano; consumo/custo de IA (**IA › Uso**).

**Todo mês**
- **Honorários / Faturamento**: conferir as parcelas de honorários (módulo Honorários) e lançar
  as mensalidades de clientes de partido (lançamentos recorrentes); conferir o que entrou e o que
  está em aberto.
- **LGPD › Solicitações**: responder pedidos de acesso/exclusão de dados dentro do prazo.
- **Auditoria**: conferir acessos e quem mudou o quê (escritório com sigilo precisa disso).
- Revisar o prompt do agente com base nas execuções do mês (rascunho → testar → publicar).

---

## 6. Ética da OAB e LGPD: regras que o escritório configura e respeita

Esta seção não é parecer. O escritório deve validar com o Código de Ética e Disciplina e com o
**Provimento 205/2021 do CFOAB** (publicidade na advocacia).

- **A IA não advoga.** Ela faz triagem e agenda; parecer, chance de êxito e estratégia são só do
  advogado. Isso está nos *Limites* do prompt e é testado antes de publicar.
- **Sem promessa de resultado**, sem "garantimos", sem prazo de processo.
- **Campanhas em massa só para quem já é cliente** (comunicados, mudança de endereço, recesso).
  Disparo e prospecção ativa para quem nunca procurou o escritório podem caracterizar captação
  indevida: deixar **Prospecção** e **Campanhas** fora do uso comercial.
- **Honorários**: tratar na consulta e na proposta individual, não em mensagem de divulgação.
- **Sigilo**: o CRM ainda não separa casos por área (quem acessa o funil vê todos), então avise o
  escritório antes de publicar; nada de print de conversa fora do sistema; a auditoria registra
  os acessos.
- **Dados sensíveis (LGPD)**: saúde (previdenciário), antecedentes (criminal) e dados de menores
  (família) aparecem no WhatsApp. Pedir só o necessário na triagem, documentos completos na
  consulta, e usar o fluxo de LGPD do produto para pedidos de titulares.

---

## 7. O que o CRM ainda não cobre para advocacia (e o paliativo)

| Lacuna | Paliativo hoje | Solução de verdade |
|---|---|---|
| **Processos** (nº CNJ, vara, partes, polo) | Nota fixa no contato + funil *Clientes ativos* | Módulo de processos no núcleo deste fork (tabela, tela, vínculo com contato) |
| **Prazos processuais** (dias úteis, feriados forenses) | Tarefa com data e responsável, lançada à mão | Cálculo de prazo no módulo de processos |
| **Intimações e publicações** (DJe, PJe) | Continua no sistema atual do escritório | Integração com um serviço de monitoramento, criando tarefa automaticamente |
| **Contrato de honorários** (fixo, êxito, misto) e parcelas | **Já existe**: módulo opcional Honorários (Administração › Módulos) | — |
| **Procuração e contrato com assinatura eletrônica** | Envio do PDF pelo Inbox; campo de arquivo no caso guarda o documento | Integração com assinatura eletrônica: assinou → move para *Contrato assinado* |
| **Sigilo entre áreas** (permissão por funil) | Avisar o escritório; um funil por área se precisar separar | Permissão por funil no produto |
| **Controle de horas** (timesheet) | Fora do CRM | Lançamento de horas por caso |
| **Portal do cliente** ("como está meu processo") | Secretaria responde no Inbox | Agente com leitura do módulo de processos responde sozinho |

Uma **extensão** do Deskcomm não resolve essas lacunas: hoje ela não cria tabela, tela nem
ferramenta de IA. O módulo de processos e prazos é a primeira peça de código que faz deste fork
um "CRM de advocacia".

---

## 8. Implantação em fases

| Quando | O quê | Pronto quando |
|---|---|---|
| **Semana 1** | Seção 3: canal, IA, funil, etiquetas, agenda, base e memória | Agente responde certo às 6 mensagens de teste |
| **Semana 2** | Piloto: IA atende só fora do horário; equipe usa Inbox, tarefas e funil no expediente | Toda conversa da semana tem dono e etapa |
| **Semanas 3–4** | IA atende o dia todo; follow-ups publicados; rotina diária (seção 4) valendo | Nenhuma passagem espera mais de 1 h no expediente |
| **Mês 2** | Rotina semanal/mensal; primeira revisão do prompt por dados; decidir o módulo de processos | Métricas de conversão por área disponíveis para o sócio |
