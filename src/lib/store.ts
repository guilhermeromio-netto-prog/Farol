import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultBrief,
  type SavedTrip,
  type TripBrief,
  type TripPlan,
} from "@/lib/trip-types";

type View = "brief" | "loading" | "plan";

type TripStore = {
  brief: TripBrief;
  plan: TripPlan | null;
  view: View;
  selectedOptionId: string | null;
  saved: SavedTrip[];
  checked: Record<string, string[]>;
  setBrief: (patch: Partial<TripBrief>) => void;
  resetBrief: () => void;
  setView: (view: View) => void;
  setPlan: (plan: TripPlan, brief: TripBrief) => void;
  setSelectedOptionId: (id: string | null) => void;
  toggleChecked: (tripId: string, itemId: string) => void;
  loadSaved: (id: string) => void;
  removeSaved: (id: string) => void;
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      brief: defaultBrief(),
      plan: null,
      view: "brief",
      selectedOptionId: null,
      saved: [],
      checked: {},
      setBrief: (patch) =>
        set((s) => ({ brief: { ...s.brief, ...patch } })),
      resetBrief: () =>
        set({
          brief: defaultBrief(),
          view: "brief",
          plan: null,
          selectedOptionId: null,
        }),
      setView: (view) => set({ view }),
      setPlan: (plan, brief) => {
        const savedEntry: SavedTrip = {
          id: plan.id,
          brief,
          plan,
          checked: get().checked[plan.id] ?? [],
        };
        const rest = get().saved.filter((t) => t.id !== plan.id);
        set({
          plan,
          brief,
          view: "plan",
          selectedOptionId: plan.options[0]?.id ?? null,
          saved: [savedEntry, ...rest].slice(0, 12),
        });
      },
      setSelectedOptionId: (id) => set({ selectedOptionId: id }),
      toggleChecked: (tripId, itemId) => {
        const current = get().checked[tripId] ?? [];
        const next = current.includes(itemId)
          ? current.filter((x) => x !== itemId)
          : [...current, itemId];
        set({
          checked: { ...get().checked, [tripId]: next },
          saved: get().saved.map((t) =>
            t.id === tripId ? { ...t, checked: next } : t,
          ),
        });
      },
      loadSaved: (id) => {
        const found = get().saved.find((t) => t.id === id);
        if (!found) return;
        set({
          plan: found.plan,
          brief: found.brief,
          view: "plan",
          selectedOptionId: found.plan.options[0]?.id ?? null,
        });
      },
      removeSaved: (id) =>
        set((s) => ({
          saved: s.saved.filter((t) => t.id !== id),
          plan: s.plan?.id === id ? null : s.plan,
          view: s.plan?.id === id ? "brief" : s.view,
        })),
    }),
    {
      name: "farol-trips",
      skipHydration: true,
      partialize: (s) => ({
        saved: s.saved,
        checked: s.checked,
      }),
    },
  ),
);
