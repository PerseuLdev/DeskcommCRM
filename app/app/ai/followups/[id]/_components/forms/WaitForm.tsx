"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { waitConfigSchema } from "@/lib/followup/graph-schema";
import { MODOS_DE_ESPERA, opcoes } from "@/lib/followup/vocabulario";
import { useT } from "@/hooks/i18n/useT";

import {
  paraMinutos,
  unidadeNatural,
  valorNaUnidade,
  type UnidadeDeEspera,
} from "@/lib/followup/unidade-da-espera";

import { msToMin, minToMs, type ConfigOf } from "./shared";

export function WaitForm({
  config,
  onChange,
}: {
  config: ConfigOf<"wait">;
  onChange: (c: ConfigOf<"wait">) => void;
}) {
  const t = useT();
  const [mode, setMode] = useState<"fixed" | "smart">(config.mode);
  const [durationMin, setDurationMin] = useState(
    config.mode === "fixed" ? msToMin(config.duration_ms) : 10,
  );
  // A espera fixa se lê na unidade que a pessoa escreveria (2 dias, e não 2880 minutos); o
  // `durationMin` segue sendo a fonte da verdade, e o que vai ao fio é sempre ms.
  const [unidade, setUnidade] = useState<UnidadeDeEspera>(
    unidadeNatural(config.mode === "fixed" ? msToMin(config.duration_ms) : 10),
  );
  const [minMin, setMinMin] = useState(config.mode === "smart" ? msToMin(config.min_ms) : 5);
  const [maxMin, setMaxMin] = useState(config.mode === "smart" ? msToMin(config.max_ms) : 60);
  const [guidance, setGuidance] = useState(config.mode === "smart" ? (config.guidance ?? "") : "");
  const [error, setError] = useState<string | null>(null);

  const commit = (next: {
    mode: "fixed" | "smart";
    durationMin: number;
    minMin: number;
    maxMin: number;
    guidance: string;
  }) => {
    const candidate =
      next.mode === "fixed"
        ? { mode: "fixed" as const, duration_ms: minToMs(next.durationMin) }
        : {
            mode: "smart" as const,
            min_ms: minToMs(next.minMin),
            max_ms: minToMs(next.maxMin),
            ...(next.guidance.trim() ? { guidance: next.guidance } : {}),
          };
    const parsed = waitConfigSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("Configuração inválida."));
      return;
    }
    setError(null);
    onChange(parsed.data);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="wait-mode">{t("Como calcular a espera")}</Label>
        <Select
          value={mode}
          onValueChange={(v) => {
            const next = v as "fixed" | "smart";
            setMode(next);
            commit({ mode: next, durationMin, minMin, maxMin, guidance });
          }}
        >
          <SelectTrigger id="wait-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {opcoes(MODOS_DE_ESPERA).map(({ valor, rotulo }) => (
              <SelectItem key={valor} value={valor}>
                {t(rotulo)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === "fixed" ? (
        <div className="space-y-2">
          <Label htmlFor="wait-duration">
            {unidade === "days"
              ? t("Duração (dias)")
              : unidade === "hours"
                ? t("Duração (horas)")
                : t("Duração (minutos)")}
          </Label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              id="wait-duration"
              type="number"
              min={unidade === "minutes" ? 5 : undefined}
              step={1}
              value={valorNaUnidade(durationMin, unidade)}
              onChange={(e) => {
                const v = paraMinutos(Number(e.target.value), unidade);
                setDurationMin(v);
                commit({ mode, durationMin: v, minMin, maxMin, guidance });
              }}
            />
            <Select value={unidade} onValueChange={(v) => setUnidade(v as UnidadeDeEspera)}>
              <SelectTrigger aria-label={t("Unidade da espera")} className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">{t("minutos")}</SelectItem>
                <SelectItem value="hours">{t("horas")}</SelectItem>
                <SelectItem value="days">{t("dias")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Cada espera vai de 5 minutos a 90 dias. Para esperar mais, use duas esperas seguidas.")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="wait-min">{t("Mínimo (min)")}</Label>
              <Input
                id="wait-min"
                type="number"
                min={5}
                value={minMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMinMin(v);
                  commit({ mode, durationMin, minMin: v, maxMin, guidance });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wait-max">{t("Máximo (min)")}</Label>
              <Input
                id="wait-max"
                type="number"
                min={5}
                value={maxMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaxMin(v);
                  commit({ mode, durationMin, minMin, maxMin: v, guidance });
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wait-guidance">{t("Orientação (opcional)")}</Label>
            <Textarea
              id="wait-guidance"
              maxLength={500}
              value={guidance}
              onChange={(e) => {
                setGuidance(e.target.value);
                commit({ mode, durationMin, minMin, maxMin, guidance: e.target.value });
              }}
            />
          </div>
        </>
      )}
      {error && <p className="text-xs text-error-fg">{error}</p>}
    </div>
  );
}
