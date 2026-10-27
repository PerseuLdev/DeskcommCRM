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

### 3.2 Funil "Novos casos"

| Etapa | Passo do agente | O que significa |
|---|---|---|
| Novo contato | novo | Chegou mensagem, ninguém respondeu |
| Já respondi | contatado | Primeiro retorno dado |
| Entendendo o caso | qualificando | Triagem: área, o que aconteceu, quando, urgência |
| Consulta marcada | qualificado | Caso com perfil do escritório, consulta na agenda |
| Proposta de honorários | negociando | Consulta feita, proposta enviada |
| **Contratado** | ganhou | Contrato de honorários assinado |
| **Não contratou** | perdeu | Desistiu, fora da área, sem retorno (sempre com motivo) |

**Vocabulário do funil**: cliente = *cliente*, negócio = *caso*, ganhou = *contratado*,
perdeu = *não contratou*.

**Funil opcional "Clientes ativos"** (acompanhamento, não substitui o sistema processual):
Contratado → Documentos pendentes → Petição/medida em preparo → Em andamento → Audiência
marcada → Decisão/sentença → **Encerrado com êxito** (ganhou) / **Encerrado sem êxito** (perdeu).
Serve para o escritório enxergar no kanban em que fase está cada cliente.

**Etiquetas (Configurações › Etiquetas)**, uma por área: `trabalhista`, `família`,
`previdenciário`, `cível`, `consumidor`, `criminal`, `empresarial`, `tributário`. Mais `urgente`,
`indicação`, `cliente-antigo`. As etiquetas filtram inbox, funil e métricas por área.

### 3.3 Agentes e roteador

**Um agente "Recepção" resolve a maioria dos escritórios.** Com volume, um segundo agente:

| Intenção | Exemplos | Vai para |
|---|---|---|
| Caso novo | "fui demitido", "quero me divorciar", "negaram meu INSS" | Recepção (triagem) |
| Já sou cliente | "como está meu processo?", "falei com o Dr. X" | **Pessoa** (secretaria/advogado responsável) |
| Urgência | "fui preso", "tenho audiência amanhã", "recebi uma intimação" | **Pessoa, imediatamente** |
| Fallback | qualquer outra coisa | Recepção |

**Prompt da Recepção (preencher pelos campos em `{}`):**

```markdown
# Quem você é
Você atende quem procura {nome do escritório}, escritório de advocacia em {cidade} que atua em
{áreas, em uma frase}. Seu nome é {nome}. Muita gente chega preocupada; fale com calma e respeito.

# O que você faz primeiro
Entenda, uma pergunta por vez: qual é a situação, em poucas palavras; quando aconteceu; se já
existe processo ou prazo correndo (intimação, audiência marcada, notificação); cidade; se a pessoa
já foi cliente do escritório.

# Como você decide o próximo passo
- A situação é de uma área que o escritório atende: explique que o primeiro passo é uma consulta
  com um(a) advogado(a), ofereça horários e confirme nome completo e telefone.
- Existe prazo curto, prisão, audiência ou intimação: diga que uma pessoa da equipe vai falar
  agora e passe o atendimento.
- A área não é atendida pelo escritório: diga com educação e, se houver nos materiais, indique a
  OAB local ou a Defensoria Pública.

# Situações
- "Tenho direito a...?" / "Vou ganhar?": diga que só a análise do(a) advogado(a), com os
  documentos, responde isso, e ofereça a consulta.
- Honorários: o valor é definido na consulta conforme o caso; informe só o que está nos materiais.
- Pedido de documentos: pode orientar quais levar à consulta, conforme a lista dos materiais.

# Limites
Você não dá parecer jurídico, não diz se a pessoa tem ou não direito, não promete resultado nem
prazo de processo, não comenta processo de cliente.
Chama uma pessoa quando: urgência ou prazo, cliente atual perguntando do processo, reclamação,
pessoa muito abalada, menor de idade, pedido para falar com advogado específico.

# Estilo
Curto, uma pergunta por vez, sem juridiquês. Emoji: não.
```

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
  - 3 dias em *Proposta de honorários* sem resposta: "ficou alguma dúvida sobre a proposta?";
    7 dias: última tentativa e registrar o motivo da perda.
  - O lembrete da consulta é a **agenda**, não follow-up.
- **Agenda**: conectar o Google Agenda de cada advogado; tipos de compromisso: *Consulta
  inicial*, *Retorno*, *Reunião com cliente*. Audiências e prazos podem entrar como compromissos
  do advogado para aparecer no mesmo calendário.

### 3.5 Testar antes de publicar
Botão **Testar** do agente com estas mensagens; o agente só vai ao ar depois que todas
respondem como o escritório quer:
"fui demitido sem justa causa, tenho direito a quê?", "quanto custa a consulta?", "recebi uma
intimação para audiência amanhã", "sou cliente do Dr. {nome}, como está meu processo?",
"vocês fazem inventário?", um áudio de 1 minuto contando um caso.

---

## 4. Rotina diária

### Abertura — 8h00 (secretaria)
1. **Inbox**: atender primeiro as **passagens da IA → humano** que chegaram durante a noite
   (urgências e clientes atuais). Nenhuma passagem fica sem dono até as 9h.
2. **Agenda do dia**: confirmar as consultas de hoje; quem não confirmou recebe mensagem.
3. **Tarefas de hoje**: conferir o que vence hoje e avisar o advogado responsável.

### Início do expediente — 8h30 (advogados)
1. **Tarefas** filtradas por "minhas": prazos e providências do dia, por data de vencimento.
2. **Funil "Novos casos" › Consulta marcada**: ler o resumo da triagem que a IA deixou no lead
   antes de cada consulta; a pessoa não precisa contar a história de novo.

### Durante o dia
- **Depois de cada consulta**, no lead:
  - nota com o resumo do caso, a estratégia e os documentos que faltam;
  - etiqueta da área;
  - mover para *Proposta de honorários* e enviar a proposta;
  - tarefa "acompanhar proposta" para 3 dias (se não usar o follow-up automático).
- **Contrato assinado**: mover para *Contratado*. Se usar o funil *Clientes ativos*, criar o
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
- **Motivos de perda** em *Não contratou*: preço, área não atendida, sumiu, contratou outro.
- Distribuir casos novos sem responsável.

**Toda sexta (quem cuida da IA, 30 min)**
- Perguntas que a IA não soube responder: viram FAQ nova.
- Tempo de resposta e taxa de passagem para humano; consumo/custo de IA (**IA › Uso**).

**Todo mês**
- **Faturamento**: lançar honorários contratados e mensalidades de clientes de partido
  (lançamentos recorrentes); conferir o que entrou e o que está em aberto.
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
- **Sigilo**: cada advogado vê os clientes que o papel permite; nada de print de conversa fora do
  sistema; a auditoria registra os acessos.
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
| **Contrato de honorários e procuração** com assinatura | Envio do PDF pelo Inbox | Integração com assinatura eletrônica: assinou → move para *Contratado* |
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
