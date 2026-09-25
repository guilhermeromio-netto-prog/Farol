import { ArrowLeft, Plus } from "lucide-react";
import { FarolMark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/lib/store";

export function SiteHeader() {
  const view = useTripStore((s) => s.view);
  const plan = useTripStore((s) => s.plan);
  const setView = useTripStore((s) => s.setView);
  const resetBrief = useTripStore((s) => s.resetBrief);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <button
          type="button"
          className="flex items-center gap-2.5 text-fg"
          onClick={() => setView("brief")}
        >
          <FarolMark className="size-7" />
          <span className="font-display text-lg font-medium tracking-tight">
            Farol
          </span>
        </button>
        <div className="flex items-center gap-2">
          {view === "plan" && plan ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("brief")}
                className="hidden sm:inline-flex"
              >
                <ArrowLeft />
                Briefing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetBrief()}
              >
                <Plus />
                Nova viagem
              </Button>
            </>
          ) : plan && view === "brief" ? (
            <Button variant="outline" size="sm" onClick={() => setView("plan")}>
              Último roteiro
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
