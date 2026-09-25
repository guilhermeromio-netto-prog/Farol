import { useEffect, useState } from "react";
import { FarolMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/lib/store";
import { transportLabel } from "@/lib/trip-types";

const LINES = [
  "Cruzando mapas e ventos",
  "Medindo km e orçamento",
  "Olhando o céu da estação",
  "Montando o checklist de partida",
  "Comparando as três rotas",
];

export function LoadingPlan() {
  const brief = useTripStore((s) => s.brief);
  const setView = useTripStore((s) => s.setView);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % LINES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <FarolMark className="size-12" />
      <p className="mt-6 font-mono text-xs tracking-[0.22em] text-muted uppercase">
        {brief.destination} · {transportLabel(brief.transport)} · {brief.days}{" "}
        dias
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        {LINES[i]}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        O farol está montando opções, clima, custo e o que não pode faltar
        antes de sair.
      </p>
      <div className="mt-10 w-full max-w-sm space-y-3">
        <div className="h-16 rounded-xl shimmer" />
        <div className="h-16 rounded-xl shimmer" />
        <div className="h-16 rounded-xl shimmer" />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="mt-8"
        onClick={() => setView("brief")}
      >
        Voltar ao briefing
      </Button>
    </div>
  );
}
