import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Car,
  Caravan,
  CloudSun,
  Plane,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatRange } from "@/lib/utils";
import { useTripStore } from "@/lib/store";
import {
  monthLabel,
  transportLabel,
  type TransportId,
} from "@/lib/trip-types";

const ICONS: Record<TransportId, typeof Car> = {
  motorhome: Caravan,
  plane: Plane,
  car: Car,
};

const TABS = [
  { id: "opcoes", label: "Opções" },
  { id: "clima", label: "Clima" },
  { id: "dinheiro", label: "Dinheiro" },
  { id: "tempo", label: "Tempo" },
  { id: "checklist", label: "Checklist" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Dossier() {
  const plan = useTripStore((s) => s.plan);
  const brief = useTripStore((s) => s.brief);
  const selectedOptionId = useTripStore((s) => s.selectedOptionId);
  const setSelectedOptionId = useTripStore((s) => s.setSelectedOptionId);
  const checked = useTripStore((s) => s.checked);
  const toggleChecked = useTripStore((s) => s.toggleChecked);
  const [tab, setTab] = useState<TabId>("opcoes");

  const option = useMemo(
    () => plan?.options.find((o) => o.id === selectedOptionId) ?? plan?.options[0],
    [plan, selectedOptionId],
  );

  const allItems = plan?.checklist.flatMap((g) => g.items) ?? [];
  const done = plan ? (checked[plan.id] ?? []) : [];
  const progress =
    allItems.length === 0 ? 0 : Math.round((done.length / allItems.length) * 100);

  if (!plan || !option) return null;

  const Icon = ICONS[brief.transport];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="stagger-in">
        <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
          {plan.kicker}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {plan.title}
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5" strokeWidth={1.7} />
            {transportLabel(brief.transport)}
          </span>
          <span>{brief.destination}</span>
          <span>{brief.days} dias</span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {brief.travelers}
          </span>
          <span>{monthLabel(brief.month)}</span>
        </p>
        <p className="mt-5 max-w-2xl text-base text-fg/85">{plan.summary}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          icon={CloudSun}
          label="Clima"
          value={`${Math.round(plan.climate.tempMinC)}–${Math.round(plan.climate.tempMaxC)}°C`}
          hint={plan.climate.season}
        />
        <Stat
          icon={Wallet}
          label="Estimativa"
          value={formatRange(plan.money.totalMin, plan.money.totalMax)}
          hint={plan.money.perPerson ? "por pessoa" : "grupo"}
        />
        <Stat
          icon={CalendarClock}
          label="Ida"
          value={plan.time.outbound}
          hint={plan.time.inbound}
        />
        <Stat
          icon={AlertTriangle}
          label="Lotação"
          value={plan.time.crowding}
          hint={plan.time.bookingLead}
        />
      </div>

      <div className="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          className="flex min-w-max gap-1 rounded-full bg-surface p-1 shadow-[var(--shadow-border)]"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-10 rounded-full px-4 text-sm font-medium transition-colors duration-150",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-fg",
              )}
            >
              {t.label}
              {t.id === "checklist" ? ` · ${progress}%` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {tab === "opcoes" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              {plan.options.map((opt) => {
                const selected = opt.id === option.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={cn(
                      "w-full rounded-xl bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out",
                      selected && "ring-2 ring-primary/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant={selected ? "default" : "muted"}>
                          {opt.tag}
                        </Badge>
                        <p className="mt-2 font-display text-xl font-medium tracking-tight">
                          {opt.name}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-sm tabular-nums text-muted">
                        {formatRange(opt.estimatedMin, opt.estimatedMax)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted">{opt.summary}</p>
                    {opt.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {opt.highlights.map((h) => (
                          <li
                            key={h}
                            className="text-sm text-fg/80 before:mr-2 before:text-muted before:content-['–']"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {opt.fit && (
                      <p className="mt-3 text-xs text-muted">{opt.fit}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
              <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                Dia a dia · {option.tag}
              </p>
              <ol className="mt-5 space-y-5">
                {option.days.map((day) => (
                  <li key={`${option.id}-${day.day}`} className="flex gap-4">
                    <div className="flex w-10 shrink-0 flex-col items-center">
                      <span className="font-mono text-sm tabular-nums text-primary">
                        {String(day.day).padStart(2, "0")}
                      </span>
                      <span className="mt-2 w-px flex-1 bg-border" />
                    </div>
                    <div className="min-w-0 pb-2">
                      <p className="font-medium">{day.title}</p>
                      <ul className="mt-1.5 space-y-1">
                        {day.activities.map((a) => (
                          <li key={a} className="text-sm text-muted">
                            {a}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs text-faint">
                        Pernoite · {day.overnight}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {tab === "clima" && (
          <Panel>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                  {plan.climate.season}
                </p>
                <p className="mt-2 font-display text-4xl font-medium tabular-nums tracking-tight">
                  {Math.round(plan.climate.tempMinC)}–{Math.round(plan.climate.tempMaxC)}°C
                </p>
              </div>
              <Badge variant="muted">{plan.climate.rain}</Badge>
            </div>
            <p className="mt-4 text-base text-fg/85">{plan.climate.notes}</p>
            <p className="mt-3 text-sm text-muted">{plan.climate.bestWindow}</p>
            {plan.climate.packing.length > 0 && (
              <>
                <Separator className="my-6" />
                <p className="text-sm font-medium">Mala para o clima</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {plan.climate.packing.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg bg-bg px-3 py-2.5 text-sm shadow-[var(--shadow-border)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        )}

        {tab === "dinheiro" && (
          <Panel>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
              {plan.money.perPerson ? "Por pessoa" : "Grupo inteiro"}
            </p>
            <p className="mt-2 font-display text-4xl font-medium tabular-nums tracking-tight">
              {formatRange(plan.money.totalMin, plan.money.totalMax)}
            </p>
            <ul className="mt-6 divide-y divide-border">
              {plan.money.breakdown.map((line) => (
                <li
                  key={line.item}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{line.item}</p>
                    {line.note && (
                      <p className="text-sm text-muted">{line.note}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-mono text-sm tabular-nums">
                    {formatRange(line.amountMin, line.amountMax)}
                  </p>
                </li>
              ))}
            </ul>
            {plan.money.savingTips.length > 0 && (
              <>
                <Separator className="my-6" />
                <p className="text-sm font-medium">Como gastar menos</p>
                <ul className="mt-3 space-y-2">
                  {plan.money.savingTips.map((tip) => (
                    <li key={tip} className="text-sm text-muted">
                      {tip}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        )}

        {tab === "tempo" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Mini title="Ida" body={plan.time.outbound} />
            <Mini title="Volta" body={plan.time.inbound} />
            <Mini title="Ritmo dos dias" body={plan.time.dailyPace} />
            <Mini title="Disponibilidade" body={plan.time.availability} />
            <Mini title="Antecedência" body={plan.time.bookingLead} />
            <Mini title="Lotação" body={plan.time.crowding} />
          </div>
        )}

        {tab === "checklist" && (
          <Panel>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                  Antes de partir
                </p>
                <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                  {done.length} de {allItems.length}
                </p>
              </div>
              <p className="font-mono text-sm tabular-nums text-muted">
                {progress}%
              </p>
            </div>
            <Progress value={progress} className="mt-4" />

            <div className="mt-8 space-y-8">
              {plan.checklist.map((group) => (
                <div key={group.category}>
                  <p className="mb-3 text-sm font-medium">{group.category}</p>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const on = done.includes(item.id);
                      return (
                        <li key={item.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-3 transition-colors duration-150 hover:bg-bg",
                              on && "opacity-60",
                            )}
                          >
                            <Checkbox
                              checked={on}
                              onCheckedChange={() =>
                                toggleChecked(plan.id, item.id)
                              }
                              className="mt-0.5"
                            />
                            <span className="min-w-0">
                              <span
                                className={cn(
                                  "block text-sm font-medium",
                                  on && "line-through",
                                )}
                              >
                                {item.label}
                              </span>
                              <span className="mt-0.5 block text-sm text-muted">
                                {item.why}
                                {item.timing ? ` · ${item.timing}` : ""}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {(plan.warnings.length > 0 || plan.localTips.length > 0) && tab === "opcoes" && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {plan.warnings.length > 0 && (
            <div className="rounded-xl bg-danger/10 p-5">
              <p className="text-sm font-medium text-danger">Atenção</p>
              <ul className="mt-2 space-y-1.5">
                {plan.warnings.map((w) => (
                  <li key={w} className="text-sm text-fg/85">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.localTips.length > 0 && (
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-sm font-medium">Quem já foi</p>
              <ul className="mt-2 space-y-1.5">
                {plan.localTips.map((t) => (
                  <li key={t} className="text-sm text-muted">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Voltar ao topo
        </Button>
      </div>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
      {children}
    </div>
  );
}

function Mini({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fg/85">{body || "—"}</p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CloudSun;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="min-h-28 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-1.5 text-muted">
        <Icon className="size-3.5" strokeWidth={1.7} />
        <span className="font-mono text-xs tracking-widest uppercase">
          {label}
        </span>
      </div>
      <p className="mt-2 truncate font-display text-xl font-medium tracking-tight">
        {value}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-muted">{hint}</p>
    </div>
  );
}
