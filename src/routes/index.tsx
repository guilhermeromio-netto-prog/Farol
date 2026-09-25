import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefing } from "@/components/briefing";
import { Dossier } from "@/components/dossier";
import { LoadingPlan } from "@/components/loading-plan";
import { SiteHeader } from "@/components/site-header";
import { useTripStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const view = useTripStore((s) => s.view);

  useEffect(() => {
    useTripStore.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />
      {view === "loading" ? (
        <LoadingPlan />
      ) : view === "plan" ? (
        <Dossier />
      ) : (
        <Briefing />
      )}
    </div>
  );
}
