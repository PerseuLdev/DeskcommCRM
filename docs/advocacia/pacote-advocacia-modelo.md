# Pacote de implantação — Advocacia Modelo (EXEMPLO)

> Escritório **fictício** usado na fase de testes. Tudo marcado com ⚠️ é suposição de exemplo e
> precisa ser trocado pelos dados reais do escritório antes de publicar o agente.
> Plano de uso: [plano-dia-a-dia.md](plano-dia-a-dia.md). Acesso local: [acesso-teste.md](acesso-teste.md).

## 1. Negócio

| Campo | Valor |
|---|---|
| Nome | Advocacia Modelo ⚠️ |
| O que faz | Advocacia trabalhista, previdenciária, de família e do consumidor ⚠️ |
| Cidade / fuso | São Paulo (America/Sao_Paulo) ⚠️ |
| Não atende | criminal, tributário, empresarial ⚠️ |
| Horário | seg–sex, 9h–18h ⚠️ |
| Consulta inicial | presencial ou online, valor definido pelo escritório ⚠️ |

## 2. Funil "Novos casos" (aplicado)

| Etapa | Passo do agente |
|---|---|
| Novo contato | novo |
| Já respondi | contatado |
| Entendendo o caso | qualificando |
| Consulta marcada | qualificado |
| Proposta de honorários | negociando |
| Contratado | ganhou |
| Não contratou | perdeu |

- Vocabulário: Cliente / Caso / Contratado / Não contratou. O plural do negócio continua
  "Pedidos": a tela não expõe esse campo.
- Motivos de perda: Honorários acima do orçamento, Área não atendida, Sem retorno do cliente,
  Contratou outro advogado, Caso sem viabilidade, Procurou Defensoria Pública.
- Motivos de ganho: Indicação, Cliente antigo, Atendimento rápido, Especialidade na área.

## 3. Etiquetas

O CRM não tem tela para criar etiqueta antes de usar: ela nasce quando alguém (ou o agente) a
aplica num contato, conversa ou card, e daí aparece em Configurações › Tags. Usar exatamente estes
nomes: `trabalhista`, `familia`, `previdenciario`, `consumidor`, `urgente`, `indicacao`,
`cliente-antigo`.

## 4. FAQ (material "Perguntas frequentes do escritório")

```markdown
## Pergunta: Quais áreas o escritório atende?
## Resposta: Direito do trabalho, previdenciário (INSS), família (divórcio, pensão, guarda, inventário) e direito do consumidor. Não atendemos casos criminais, tributários ou empresariais.

## Pergunta: Como funciona a primeira consulta?
## Resposta: É uma conversa com um(a) advogado(a) para entender o seu caso e analisar os documentos. Pode ser presencial ou online. O valor e a duração são informados na hora de marcar.

## Pergunta: Vocês dizem se eu tenho direito pelo WhatsApp?
## Resposta: Não. Só o(a) advogado(a), com a análise do caso e dos documentos, pode orientar. Pelo WhatsApp a gente organiza as informações e marca a consulta.

## Pergunta: Quanto custam os honorários?
## Resposta: Depende do tipo de caso e do trabalho envolvido. O(a) advogado(a) apresenta uma proposta por escrito depois da consulta.

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
Cliente atual perguntando do processo, intimação, audiência, prazo ou prisão: passar para uma pessoa da equipe.
```

## 6. Follow-ups

| Fluxo | Gatilho | Passos |
|---|---|---|
| Triagem parada | silêncio de 1 dia, cancela ao responder | mensagem: "conseguiu ver os horários para a consulta?" → espera 2 dias → última mensagem → fim |
| Proposta sem resposta | entrada na etapa *Proposta de honorários* | espera 3 dias → "ficou alguma dúvida sobre a proposta?" → espera 4 dias → última tentativa → fim |
| Faltou à consulta | falta registrada na agenda | espera 1 dia → oferecer novo horário → fim |

## 7. Agente "Recepção"

- Modelos de teste: Claude Sonnet no atendimento; Claude Haiku nos auxiliares (roteador,
  follow-up). Os dois via OpenRouter, para ficar barato.
- Funil: Novos casos. Materiais: FAQ acima. Follow-ups: os três acima.
- Passagem para humano: padrão + "advogado", "doutor", "doutora", "intimação", "audiência",
  "prazo", "preso", "urgente".
- Prompt: seção 3.3 de [plano-dia-a-dia.md](plano-dia-a-dia.md), preenchido com os dados acima.

## 8. O que falta (e o que acontece enquanto falta)

| Falta | Efeito | Quem resolve |
|---|---|---|
| Chave OpenRouter em IA › Credenciais | agente não testa nem publica | você |
| Chave OpenAI | FAQ fica "esperando" e não é consultada; áudio do cliente não é transcrito | você (opcional) |
| WhatsApp conectado (QR em Conexões) | agente não publica | você, com o celular |
| Dados reais (⚠️) | agente responde com dados de exemplo | escritório |
