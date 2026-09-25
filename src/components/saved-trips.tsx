import { useEffect, useState } from "react";
import { Car, Caravan, Plane, Trash2 } from "lucide-react";
import { useTripStore } from "@/lib/store";
import { transportLabel, type TransportId } from "@/lib/trip-types";

const ICONS: Record<TransportId, typeof Car> = {
  motorhome: Caravan,
  plane: Plane,
  car: Car,
};

export function SavedTrips() {
  const saved = useTripStore((s) => s.saved);
  const loadSaved = useTripStore((s) => s.loadSaved);
  const removeSaved = useTripStore((s) => s.removeSaved);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || saved.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-8">
      <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
        Cadernos guardados
      </p>
      <ul className="mt-4 space-y-2">
        {saved.map((trip) => {
          const Icon = ICONS[trip.brief.transport];
          return (
            <li key={trip.id}>
              <div className="flex items-stretch gap-1">
                <button
                  type="button"
                  onClick={() => loadSaved(trip.id)}
                  className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-lg bg-surface px-3.5 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {trip.plan.title}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {trip.brief.destination} ·{" "}
                      {transportLabel(trip.brief.transport)} ·{" "}
                      {trip.brief.days} dias
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Remover"
                  onClick={() => removeSaved(trip.id)}
                  className="flex size-16 shrink-0 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
