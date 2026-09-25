import { useState, type FormEvent } from "react";
import { Car, Caravan, Plane, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "@/components/chip";
import { SavedTrips } from "@/components/saved-trips";
import { cn } from "@/lib/utils";
import { planTrip } from "@/lib/plan-trip";
import { useTripStore } from "@/lib/store";
import {
  ACTIVITIES,
  BUDGETS,
  DESTINATION_HINTS,
  DURATIONS,
  MONTHS,
  PACES,
  TRANSPORTS,
  type ActivityId,
  type TransportId,
} from "@/lib/trip-types";

const ICONS: Record<TransportId, typeof Car> = {
  motorhome: Caravan,
  plane: Plane,
  car: Car,
};

function StepIndex({ n }: { n: string }) {
  return (
    <span className="font-mono text-xs tracking-widest text-muted uppercase">
      {n}
    </span>
  );
}

export function Briefing() {
  const brief = useTripStore((s) => s.brief);
  const setBrief = useTripStore((s) => s.setBrief);
  const setPlan = useTripStore((s) => s.setPlan);
  const setView = useTripStore((s) => s.setView);
  const [busy, setBusy] = useState(false);

  const toggleActivity = (id: ActivityId) => {
    const has = brief.activities.includes(id);
    const next = has
      ? brief.activities.filter((a) => a !== id)
      : [...brief.activities, id];
    setBrief({ activities: next });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brief.destination.trim()) {
      toast.error("Para onde você quer ir?");
      return;
    }
    setBusy(true);
    setView("loading");
    try {
      const result = await planTrip({
        data: brief,
        signal: AbortSignal.timeout(100_000),
      });
      if (!result.ok) {
        toast.error(result.error);
        setView("brief");
        return;
      }
      setPlan(result.plan, brief);
    } catch (err) {
      const aborted =
        err instanceof Error &&
        (err.name === "TimeoutError" || err.name === "AbortError");
      toast.error(
        aborted
          ? "Demorou demais. Tente de novo com o briefing um pouco mais curto."
          : "Não deu para montar agora. Tente de novo.",
      );
      setView("brief");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 sm:pt-14">
      <div className="stagger-in">
        <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
          Caderno de bordo
        </p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl">
          Monte o briefing.
          <span className="block text-muted">O farol monta o resto.</span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted">
          Destino, como você vai e o que quer viver. Devolvemos opções de
          roteiro com clima, custo, tempo, disponibilidade e um checklist de
          partida.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <StepIndex n="01 · Destino" />
          </div>
          <label className="sr-only" htmlFor="destination">
            Para onde você quer ir
          </label>
          <Input
            id="destination"
            value={brief.destination}
            onChange={(e) => setBrief({ destination: e.target.value })}
            placeholder="Chapada dos Veadeiros, Lisboa, a Ruta 40…"
            autoComplete="off"
            className="h-12 text-lg"
          />
          <div className="flex flex-wrap gap-2">
            {DESTINATION_HINTS.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => setBrief({ destination: hint })}
                className={cn(
                  "min-h-11 rounded-full px-3.5 text-sm shadow-[var(--shadow-border)] transition-[background-color,color] duration-150",
                  brief.destination === hint
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-fg/80 hover:text-fg",
                )}
              >
                {hint}
              </button>
            ))}
          </div>
          <div className="pt-2">
            <label
              htmlFor="origin"
              className="mb-2 block text-sm font-medium text-muted"
            >
              De onde você sai
            </label>
            <Input
              id="origin"
              value={brief.origin}
              onChange={(e) => setBrief({ origin: e.target.value })}
              placeholder="São Paulo, Curitiba, porto de origem…"
              autoComplete="off"
            />
          </div>
        </section>

        <section className="space-y-3">
          <StepIndex n="02 · Como você vai" />
          <div
            role="radiogroup"
            aria-label="Meio de transporte"
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {TRANSPORTS.map((t) => {
              const Icon = ICONS[t.id];
              const selected = brief.transport === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setBrief({ transport: t.id })}
                  className={cn(
                    "flex min-h-24 items-start gap-3 rounded-xl bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform,background-color] duration-150 ease-out active:scale-[0.98] sm:flex-col sm:gap-4",
                    selected && "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      selected ? "text-primary-foreground" : "text-primary",
                    )}
                    strokeWidth={1.6}
                  />
                  <span>
                    <span className="block font-medium">{t.label}</span>
                    <span
                      className={cn(
                        "mt-1 block text-sm",
                        selected
                          ? "text-primary-foreground/75"
                          : "text-muted",
                      )}
                    >
                      {t.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <StepIndex n="03 · O que você quer viver" />
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <Chip
                key={a.id}
                selected={brief.activities.includes(a.id)}
                onClick={() => toggleActivity(a.id)}
              >
                {a.label}
              </Chip>
            ))}
          </div>
          <Textarea
            value={brief.wish}
            onChange={(e) => setBrief({ wish: e.target.value })}
            placeholder="Conta com suas palavras: ver o pôr do sol, viajar com criança, evitar estrada de terra, comer o que for local…"
            rows={4}
          />
        </section>

        <section className="space-y-5">
          <StepIndex n="04 · Tempo, gente e dinheiro" />

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Dias de viagem</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Chip
                  key={d}
                  selected={brief.days === d}
                  onClick={() => setBrief({ days: d })}
                >
                  {d} dias
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Viajantes</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Chip
                  key={n}
                  selected={brief.travelers === n}
                  onClick={() => setBrief({ travelers: n })}
                  className="min-w-11"
                >
                  {n}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Ritmo</p>
            <div className="flex flex-wrap gap-2">
              {PACES.map((p) => (
                <Chip
                  key={p.id}
                  selected={brief.pace === p.id}
                  onClick={() => setBrief({ pace: p.id })}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">
              Orçamento do grupo
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BUDGETS.map((b) => {
                const selected = brief.budget === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBrief({ budget: b.id })}
                    className={cn(
                      "flex min-h-16 flex-col items-start justify-center rounded-lg px-3.5 py-2 text-left shadow-[var(--shadow-border)] transition-[background-color,color] duration-150",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface hover:shadow-[var(--shadow-border-hover)]",
                    )}
                  >
                    <span className="text-sm font-medium">{b.label}</span>
                    <span
                      className={cn(
                        "text-xs",
                        selected
                          ? "text-primary-foreground/70"
                          : "text-muted",
                      )}
                    >
                      {b.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">Quando</p>
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m) => (
                <Chip
                  key={m.id}
                  selected={brief.month === m.id}
                  onClick={() => setBrief({ month: m.id })}
                  className="min-w-14"
                >
                  {m.label}
                </Chip>
              ))}
            </div>
          </div>
        </section>

        <div className="h-2" />
      </form>

      <SavedTrips />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/90 px-4 pb-10 pt-3 backdrop-blur-md sm:px-6 sm:pb-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="hidden min-w-0 flex-1 truncate text-sm text-muted sm:block">
            {brief.destination.trim()
              ? `${brief.destination} · ${TRANSPORTS.find((t) => t.id === brief.transport)?.label} · ${brief.days} dias`
              : "Preencha o destino para acender o farol"}
          </p>
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={(e) => {
              void onSubmit(e as unknown as FormEvent);
            }}
          >
            Montar o roteiro
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
