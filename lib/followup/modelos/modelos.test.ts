/**
 * O modelo que o validador recusa é o pior defeito possível deste catálogo: a
 * coluna `draft_graph` é `jsonb`, então o grafo inválido ENTRA no banco sem
 * erro e só quebra quando o dono da clínica abre o construtor — ou, pior, na
 * hora de publicar, com o paciente já esperando resposta.
 *
 * Por isso cada caso abaixo roda o validador DE VERDADE (`flowGraphSchema`,
 * `validateFlowForPublish`, `triggerConfigSchema`), nunca uma imitação.
 */
import { describe, expect, it } from "vitest";

import { triggerConfigSchema } from "@/lib/followup/api-schemas";
import { DICIONARIO } from "@/lib/i18n/dicionario";
import { flowGraphSchema } from "@/lib/followup/graph-schema";
import { validateFlowForPublish } from "@/lib/followup/validate-publish";

import { MODELOS_DE_FOLLOWUP, modeloPorId, modelosDoNicho } from "./index";
import { horizonteDoModeloMs, toquesDoModelo } from "./tipos";
import { renderizarTextoDeFollowup } from "@/lib/automation/texto-do-followup";

import { montarCadencia, montarEscada, rotuloDaEspera } from "./escada";

const ETAPA = "44444444-4444-4444-8444-444444444444";
const DIA_MS = 86_400_000;

describe("catálogo de modelos de follow-up", () => {
  it("tem as quatro jornadas de clínica, com id e nome únicos", () => {
    const clinica = modelosDoNicho("clinica");
    expect(clinica.map((m) => m.jornada)).toEqual(["Consulta", "Exame", "Cirurgia", "Falta"]);
    expect(modelosDoNicho("advocacia").map((m) => m.jornada)).toEqual([
      "Triagem",
      "Proposta",
      "Falta",
    ]);
    expect(new Set(MODELOS_DE_FOLLOWUP.map((m) => m.id)).size).toBe(MODELOS_DE_FOLLOWUP.length);
    // `followup_flow_pointers` tem `unique (organization_id, name)`: dois
    // modelos com o mesmo nome fariam o segundo bater 23505 na mesma org.
    expect(new Set(MODELOS_DE_FOLLOWUP.map((m) => m.nome)).size).toBe(MODELOS_DE_FOLLOWUP.length);
  });

  it("acha modelo por id e não inventa o que não existe", () => {
    expect(modeloPorId("clinica-exame-marcar")?.jornada).toBe("Exame");
    expect(modeloPorId("nao-existe")).toBeUndefined();
  });

  describe.each(MODELOS_DE_FOLLOWUP.map((m) => [m.id, m] as const))("%s", (_id, modelo) => {
    it("o grafo passa no schema que o banco e o construtor usam", () => {
      const parsed = flowGraphSchema.safeParse(modelo.grafo);
      expect(parsed.success ? null : parsed.error.issues).toBeNull();
    });

    it("o grafo é PUBLICÁVEL — nenhuma saída solta, nenhum nó sem fim", () => {
      const r = validateFlowForPublish(modelo.grafo);
      expect(r.ok ? [] : r.errors).toEqual([]);
    });

    it("o gatilho que ele monta é um `trigger_config` válido e cancela na resposta", () => {
      const cfg = modelo.gatilho({ stageId: ETAPA });
      const parsed = triggerConfigSchema.safeParse(cfg);
      expect(parsed.success ? null : parsed.error.issues).toBeNull();
      // A regra do arquivo de clínica: respondeu, o atendimento assume.
      expect(parsed.success && parsed.data.cancel_on_reply).toBe(true);
    });

    it("`pedeEtapa` é exatamente quem usa gatilho de etapa — senão a tela não pergunta e o publish recusa", () => {
      const cfg = modelo.gatilho({ stageId: ETAPA });
      expect(cfg.kind === "stage_change").toBe(modelo.pedeEtapa);
    });

    it("o gatilho tem motor vivo — publicar um kind sem motor deixa fluxo morto com cara de vivo", () => {
      // Mesma lista que `app/api/v1/ai/followup-flows/[id]/publish/route.ts`
      // aplica como allowlist. Um modelo fora dela instala e nunca dispara.
      expect(["manual", "webhook", "silence", "stage_change", "case_opened", "appointment_no_show", "lead_created"]).toContain(
        modelo.gatilho({ stageId: ETAPA }).kind,
      );
    });

    it("nenhum texto interpola campo da ficha — é o que impede dado sensível de vazar na mensagem", () => {
      // Clínica não interpola NADA (dado de saúde). Advocacia interpola só o primeiro nome, a
      // pedido de quem opera: o que NÃO entra, em nenhum nicho, é campo da ficha, assunto ou caso.
      const permitidas = modelo.nicho === "advocacia" ? new Set(["primeiro_nome"]) : new Set<string>();
      for (const no of modelo.grafo.nodes) {
        if (no.type !== "action") continue;
        expect(no.config.mode).toBe("text");
        const corpo = no.config.mode === "text" ? no.config.body : "";
        const usadas = [...corpo.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]);
        expect(usadas.filter((u) => !permitidas.has(u!))).toEqual([]);
        expect(corpo.trim().length).toBeGreaterThan(20);
      }
    });

    it("é acíclico — o cálculo do horizonte percorre o grafo e dependeria disso para terminar", () => {
      const saidas = new Map<string, string[]>();
      for (const e of modelo.grafo.edges) {
        saidas.set(e.source, [...(saidas.get(e.source) ?? []), e.target]);
      }
      const visitando = new Set<string>();
      const pronto = new Set<string>();
      const temCiclo = (id: string): boolean => {
        if (visitando.has(id)) return true;
        if (pronto.has(id)) return false;
        visitando.add(id);
        const achou = (saidas.get(id) ?? []).some(temCiclo);
        visitando.delete(id);
        pronto.add(id);
        return achou;
      };
      expect(modelo.grafo.nodes.some((n) => temCiclo(n.id))).toBe(false);
    });

    it("conta os toques e o horizonte a partir do grafo", () => {
      expect(toquesDoModelo(modelo.grafo)).toBeGreaterThanOrEqual(3);
      expect(horizonteDoModeloMs(modelo.grafo)).toBeGreaterThan(0);
    });
  });

  it("o que a galeria mostra tem espanhol — a chave é dinâmica e nenhum varredor a alcança", () => {
    // `t(modelo.resumo)` é chave DINÂMICA: o varredor de AST de
    // `i18n-espanhol-cobre-a-tela` só enxerga literal, então um modelo novo
    // entraria na tela em português para quem escolheu espanhol, sem nada
    // reprovar. O nome do modelo fica de fora de propósito — ele vira o `name`
    // do ponteiro no banco, e nome de registro não se traduz.
    const semEspanhol = MODELOS_DE_FOLLOWUP.flatMap((m) =>
      [m.jornada, m.resumo, m.oQueDispara].filter((texto) => !DICIONARIO[texto]?.es),
    );
    expect(semEspanhol).toEqual([]);
  });

  it("a cirurgia acompanha por semanas e a falta por dias — o prazo É o modelo", () => {
    const cirurgia = modeloPorId("clinica-cirurgia-decisao")!;
    const falta = modeloPorId("clinica-falta-remarcar")!;
    expect(horizonteDoModeloMs(cirurgia.grafo)).toBeGreaterThan(60 * DIA_MS);
    expect(horizonteDoModeloMs(falta.grafo)).toBeLessThan(15 * DIA_MS);
  });
});

describe("escada de toques", () => {
  it("liga as três saídas de todo nó de resposta — é o que o publish cobra", () => {
    const grafo = montarEscada({
      prazoDeRespostaMs: 2 * DIA_MS,
      sim: { rotulo: "Topou", padrao: "quero" },
      notaDeResposta: "nota",
      toques: [
        { rotulo: "um", texto: "primeiro toque do fluxo, com texto de verdade" },
        { esperaAntesMs: DIA_MS, rotulo: "dois", texto: "segundo toque do fluxo, com texto de verdade" },
      ],
    });
    const saidasDaPrimeira = grafo.edges.filter((e) => e.source === "resposta-1");
    expect(saidasDaPrimeira.map((e) => e.condition).sort((a, b) => a.type.localeCompare(b.type))).toEqual([
      { type: "always" },
      { type: "branch", branch_id: "topou" },
      { type: "branch", branch_id: "no_reply" },
    ]);
    // "sem resposta" do toque 1 tem de cair no degrau seguinte, não num fim:
    // a escada que não anda manda uma mensagem só e se chama de sequência.
    expect(saidasDaPrimeira.find((e) => e.condition.type === "branch" && e.condition.branch_id === "no_reply")?.target)
      .toBe("espera-2");
    expect(validateFlowForPublish(grafo).ok).toBe(true);
  });

  it("escreve a espera em dias e horas, nunca em milissegundos", () => {
    expect(rotuloDaEspera(DIA_MS)).toBe("Espera 1 dia");
    expect(rotuloDaEspera(21 * DIA_MS)).toBe("Espera 21 dias");
    expect(rotuloDaEspera(2 * 3_600_000)).toBe("Espera 2 horas");
  });
});

describe("advocacia · triagem em cadência longa", () => {
  const triagem = modeloPorId("advocacia-triagem-retomada")!;
  const esperasEmDias = triagem.grafo.nodes.flatMap((n) =>
    n.type === "wait" && n.config.mode === "fixed" ? [n.config.duration_ms / DIA_MS] : [],
  );
  const textos = triagem.grafo.nodes.flatMap((n) =>
    n.type === "action" && n.config.mode === "text" ? [n.config.body] : [],
  );

  it("manda dez mensagens: dia sim, dia não nas cinco primeiras, depois 7, 14, 30, 60 e 90 dias", () => {
    expect(toquesDoModelo(triagem.grafo)).toBe(10);
    // Nove esperas: o primeiro toque sai quando o silêncio de 24 h é detectado, sem espera própria.
    expect(esperasEmDias).toEqual([2, 2, 2, 2, 7, 14, 30, 60, 90]);
  });

  it("nenhuma espera passa de 90 dias — o teto do nó; intervalo maior se faz encadeando", () => {
    expect(Math.max(...esperasEmDias)).toBeLessThanOrEqual(90);
  });

  it("a cadência roda uma vez por pessoa: sem o teto, a varredura recomeçaria os dez toques depois do último", () => {
    const cfg = triagem.gatilho({});
    expect(cfg.kind).toBe("silence");
    expect(cfg.kind === "silence" && cfg.params.max_enrollments_por_contato).toBe(1);
    expect(cfg.cancel_on_reply).toBe(true);
  });

  it("dá folga para a pessoa acrescentar toques no construtor — 15 toques ainda publicam", () => {
    const extra = Array.from({ length: 15 }, (_, i) => ({
      ...(i > 0 ? { esperaAntesMs: 2 * DIA_MS } : {}),
      rotulo: `toque ${i + 1}`,
      texto: "mensagem de teste com mais de vinte caracteres",
    }));
    const r = validateFlowForPublish(montarCadencia({ toques: extra }));
    expect(r.ok ? [] : r.errors).toEqual([]);
  });

  it("todo texto abre com saudação e o primeiro nome, e muda de abertura de um toque para o outro", () => {
    for (const texto of textos) expect(texto).toMatch(/^(Oi|Olá) \{\{primeiro_nome\}\}/);
    expect(new Set(textos).size).toBe(textos.length);
    // Duas saudações seguidas iguais com o mesmo corpo seriam o "Entendi, nome" de novo.
    expect(new Set(textos.map((t) => t.split("{{primeiro_nome}}")[1]!.slice(0, 20))).size).toBeGreaterThan(5);
  });

  it("com nome, o nome entra; sem nome, a frase continua inteira — nunca `Oi,!` nem marcação crua", () => {
    for (const modelo of modelosDoNicho("advocacia")) {
      for (const no of modelo.grafo.nodes) {
        if (no.type !== "action" || no.config.mode !== "text") continue;
        const comNome = renderizarTextoDeFollowup(no.config.body, { contact: { name: "Perseu Silva" } });
        expect(comNome).toMatch(/^(Oi|Olá) Perseu\b/);
        expect(comNome).not.toContain("{{");

        const semNome = renderizarTextoDeFollowup(no.config.body, { contact: { name: null } });
        expect(semNome).not.toContain("{{");
        expect(semNome).toMatch(/^(Oi|Olá)[!,] /);
        expect(semNome).not.toMatch(/,!|\s,|\s{2}/);
      }
    }
  });
});
