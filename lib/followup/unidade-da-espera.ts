/**
 * A UNIDADE EM QUE A PESSOA LÊ A ESPERA DE UM NÓ.
 *
 * O fio guarda a espera em milissegundos e o formulário a editava em MINUTOS: "2 dias" era
 * `2880` e "90 dias" era `129600`. Quem ajusta uma cadência longa pensa em dias. Aqui mora só a
 * conversa entre as duas línguas — o valor gravado continua o mesmo, em ms, e o schema
 * (`waitConfigSchema`: 5 min a 90 dias) continua sendo quem recusa o que não cabe.
 */
export const UNIDADES_DE_ESPERA = ["minutes", "hours", "days"] as const;
export type UnidadeDeEspera = (typeof UNIDADES_DE_ESPERA)[number];

/** Quantos minutos vale uma unidade. */
export const MINUTOS_POR_UNIDADE: Record<UnidadeDeEspera, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
};

/**
 * A maior unidade que divide a espera SEM RESTO — a que a pessoa escreveria: 2880 min é "2 dias",
 * 90 min é "90 minutos" (e não "1,5 hora"), 0 e valor inválido caem em minutos.
 */
export function unidadeNatural(minutos: number): UnidadeDeEspera {
  if (!Number.isFinite(minutos) || minutos <= 0) return "minutes";
  if (minutos % MINUTOS_POR_UNIDADE.days === 0) return "days";
  if (minutos % MINUTOS_POR_UNIDADE.hours === 0) return "hours";
  return "minutes";
}

/** O número que a pessoa vê no campo: a espera em minutos, na unidade escolhida (até 2 casas). */
export function valorNaUnidade(minutos: number, unidade: UnidadeDeEspera): number {
  return Math.round((minutos / MINUTOS_POR_UNIDADE[unidade]) * 100) / 100;
}

/** O que a pessoa digitou, de volta em minutos — a moeda interna do formulário. */
export function paraMinutos(valor: number, unidade: UnidadeDeEspera): number {
  return Math.round(valor * MINUTOS_POR_UNIDADE[unidade]);
}
