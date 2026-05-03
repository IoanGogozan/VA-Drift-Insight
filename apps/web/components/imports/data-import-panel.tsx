"use client";

import { useState, useTransition } from "react";
import { Database, RefreshCw } from "lucide-react";
import type { ImportRunSummary } from "@/lib/api";
import { runDemoDatasetImport } from "@/lib/client-api";
import { Button } from "../ui/button";

type DataImportPanelProps = {
  initialImportRuns: ImportRunSummary[];
};

export function DataImportPanel({ initialImportRuns }: DataImportPanelProps) {
  const [runs, setRuns] = useState(initialImportRuns);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const latestRun = runs[0] ?? null;

  function handleRunImport() {
    setError(null);

    startTransition(async () => {
      try {
        const run = await runDemoDatasetImport();
        setRuns((current) => [run, ...current].slice(0, 5));
      } catch {
        setError("Kunne ikke kjøre demoimport.");
      }
    });
  }

  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Dataimport</h2>
          <p className="mt-1 text-sm text-muted">Validerer demo-datasettet og lagrer importstatus i databasen.</p>
        </div>
        <Button type="button" onClick={handleRunImport} disabled={isPending}>
          {isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          {isPending ? "Kjører import..." : "Kjør demoimport"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-riskHigh">{error}</p> : null}

      {latestRun ? <ImportRunSummaryView run={latestRun} /> : <p className="mt-4 text-sm text-muted">Ingen importkjøringer ennå.</p>}
    </section>
  );
}

function ImportRunSummaryView({ run }: { run: ImportRunSummary }) {
  const warnings = run.validationErrors.filter((issue) => issue.severity === "warning");
  const errors = run.validationErrors.filter((issue) => issue.severity === "error");

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
      <div className="grid gap-3 sm:grid-cols-4">
        <ImportMetric label="Status" value={formatStatus(run.status)} />
        <ImportMetric label="Importerte rader" value={run.acceptedRows} />
        <ImportMetric label="Avviste rader" value={run.rejectedRows} />
        <ImportMetric label="Varighet" value={`${run.durationMs} ms`} />
      </div>
      <div className="border border-slate-200 bg-surface p-3">
        <p className="text-xs font-semibold uppercase text-muted">Validering</p>
        <p className="mt-1 text-sm text-ink">
          {errors.length} feil, {warnings.length} varsler
        </p>
        <ul className="mt-2 max-h-28 space-y-1 overflow-auto text-xs text-muted">
          {run.validationErrors.slice(0, 4).map((issue) => (
            <li key={issue.id}>
              <span className={issue.severity === "error" ? "font-semibold text-riskHigh" : "font-semibold text-riskMedium"}>
                {issue.severity === "error" ? "Feil" : "Varsel"}:
              </span>{" "}
              {issue.message}
            </li>
          ))}
          {run.validationErrors.length === 0 ? <li>Ingen valideringsavvik funnet.</li> : null}
        </ul>
      </div>
    </div>
  );
}

function ImportMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-slate-200 bg-surface p-3">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    completed: "Fullført",
    completed_with_warnings: "Varsler",
    completed_with_errors: "Feil"
  };

  return labels[status] ?? status;
}
