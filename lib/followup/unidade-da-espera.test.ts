import { describe, expect, it } from "vitest";

import { waitConfigSchema } from "./graph-schema";
import { paraMinutos, unidadeNatural, valorNaUnidade } from "./unidade-da-espera";

describe("unidade da espera", () => {
  it("escolhe a maior unidade que divide sem resto — 2 dias é dias, 90 minutos continua minutos", () => {
    expect(unidadeNatural(2 * 1440)).toBe("days");
    expect(unidadeNatural(90 * 1440)).toBe("days");
    expect(unidadeNatural(3 * 60)).toBe("hours");
    expect(unidadeNatural(36 * 60)).toBe("hours");
    expect(unidadeNatural(90)).toBe("minutes");
    expect(unidadeNatural(10)).toBe("minutes");
  });

  it("valor inválido cai em minutos, nunca em exceção", () => {
    expect(unidadeNatural(0)).toBe("minutes");
    expect(unidadeNatural(-5)).toBe("minutes");
    expect(unidadeNatural(Number.NaN)).toBe("minutes");
  });

  it("mostra e devolve o número na unidade escolhida", () => {
    expect(valorNaUnidade(2880, "days")).toBe(2);
    expect(valorNaUnidade(2880, "hours")).toBe(48);
    expect(valorNaUnidade(90, "hours")).toBe(1.5);
    expect(paraMinutos(2, "days")).toBe(2880);
    expect(paraMinutos(1.5, "hours")).toBe(90);
    expect(paraMinutos(30, "minutes")).toBe(30);
  });

  it("ida e volta: cada espera da cadência de advocacia sobrevive à conversão", () => {
    for (const dias of [2, 7, 14, 30, 60, 90]) {
      const minutos = dias * 1440;
      const unidade = unidadeNatural(minutos);
      expect(paraMinutos(valorNaUnidade(minutos, unidade), unidade)).toBe(minutos);
    }
  });

  it("o teto do schema continua valendo: 90 dias passa, 91 não — quem recusa é o schema, não esta conversa", () => {
    const ms = (dias: number) => paraMinutos(dias, "days") * 60_000;
    expect(waitConfigSchema.safeParse({ mode: "fixed", duration_ms: ms(90) }).success).toBe(true);
    expect(waitConfigSchema.safeParse({ mode: "fixed", duration_ms: ms(91) }).success).toBe(false);
  });
});
