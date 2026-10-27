/**
 * A espera fixa passou a ser lida na unidade que a pessoa escreveria. O que NÃO pode mudar é o fio:
 * o nó continua gravando `duration_ms`, e `tests/e2e/followup-builder.spec.ts` continua achando o
 * campo de minutos pelo rótulo "Duração (minutos)".
 */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DICIONARIO } from "@/lib/i18n/dicionario";

import { WaitForm } from "./WaitForm";

const DIA_MS = 86_400_000;

beforeAll(() => {
  // Radix Select usa pointer capture e scrollIntoView; o jsdom não implementa nenhum dos dois.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

describe("WaitForm · unidade da espera", () => {
  it("2 dias abre como 2 em dias, e não como 2880 minutos", () => {
    render(<WaitForm config={{ mode: "fixed", duration_ms: 2 * DIA_MS }} onChange={() => {}} />);
    expect((screen.getByLabelText("Duração (dias)") as HTMLInputElement).value).toBe("2");
  });

  it("10 minutos continua no rótulo antigo — é por ele que o e2e acha o campo", () => {
    render(<WaitForm config={{ mode: "fixed", duration_ms: 10 * 60_000 }} onChange={() => {}} />);
    expect((screen.getByLabelText("Duração (minutos)") as HTMLInputElement).value).toBe("10");
  });

  it("editar em dias grava em milissegundos", () => {
    const onChange = vi.fn();
    render(<WaitForm config={{ mode: "fixed", duration_ms: 2 * DIA_MS }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Duração (dias)"), { target: { value: "7" } });
    expect(onChange).toHaveBeenLastCalledWith({ mode: "fixed", duration_ms: 7 * DIA_MS });
  });

  it("passou de 90 dias: não grava, e a pessoa vê o motivo", () => {
    const onChange = vi.fn();
    render(<WaitForm config={{ mode: "fixed", duration_ms: 2 * DIA_MS }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Duração (dias)"), { target: { value: "91" } });
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector("p.text-error-fg")).not.toBeNull();
  });

  it("trocar a unidade converte o número e mantém a mesma espera", async () => {
    const usuario = userEvent.setup({ delay: null });
    render(<WaitForm config={{ mode: "fixed", duration_ms: 2 * DIA_MS }} onChange={() => {}} />);
    await usuario.click(screen.getByLabelText("Unidade da espera"));
    await usuario.click(await screen.findByRole("option", { name: "horas" }));
    expect((screen.getByLabelText("Duração (horas)") as HTMLInputElement).value).toBe("48");
  });

  it("os textos novos têm espanhol — o varredor de tela não alcança chave dentro de ternário", () => {
    const chaves = [
      "Duração (dias)",
      "Duração (horas)",
      "Unidade da espera",
      "Cada espera vai de 5 minutos a 90 dias. Para esperar mais, use duas esperas seguidas.",
    ];
    expect(chaves.filter((c) => !DICIONARIO[c]?.es)).toEqual([]);
  });
});
