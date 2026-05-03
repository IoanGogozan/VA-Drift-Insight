"use client";

import { useState, useTransition } from "react";
import type { FieldTaskStatus, FieldTaskSummary } from "@/lib/api";
import { updateFieldTaskStatus } from "@/lib/client-api";

type FieldTasksTableProps = {
  initialFieldTasks: FieldTaskSummary[];
};

const statuses: FieldTaskStatus[] = ["new", "planned", "in_progress", "completed", "cancelled"];

const priorityClass: Record<FieldTaskSummary["priority"], string> = {
  high: "bg-red-50 text-red-800",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-emerald-50 text-emerald-800"
};

export function FieldTasksTable({ initialFieldTasks }: FieldTasksTableProps) {
  const [fieldTasks, setFieldTasks] = useState(initialFieldTasks);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: FieldTaskStatus) {
    setPendingId(id);
    setError(null);

    startTransition(async () => {
      try {
        const updated = await updateFieldTaskStatus(id, status);
        setFieldTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      } catch {
        setError("Kunne ikke oppdatere feltoppgave.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section className="border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Feltoppgaver</h2>
          <p className="mt-1 text-sm text-muted">
            Prioritert arbeidsliste for lekkasjesøk, måleroppfølging, ventilkontroll og fremmedvannstiltak.
          </p>
        </div>
        {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-6 py-3 font-semibold">Prioritet</th>
              <th className="px-4 py-3 font-semibold">Område</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Årsak</th>
              <th className="px-4 py-3 font-semibold">Metode</th>
              <th className="px-4 py-3 font-semibold">Sist sjekket</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {fieldTasks.map((task) => (
              <tr key={task.id} className="border-t border-slate-100 align-top">
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex min-w-16 justify-center px-2 py-1 text-xs font-semibold uppercase ${priorityClass[task.priority]}`}
                  >
                    {task.priorityLabel}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-ink">{task.areaName}</td>
                <td className="px-4 py-4 text-muted">{task.typeLabel}</td>
                <td className="max-w-sm px-4 py-4 text-muted">{task.reason}</td>
                <td className="px-4 py-4 font-medium text-ink">{task.suggestedMethodLabel}</td>
                <td className="px-4 py-4">{formatDate(task.lastChecked)}</td>
                <td className="px-4 py-4">
                  <select
                    value={task.status}
                    disabled={isPending && pendingId === task.id}
                    onChange={(event) => handleStatusChange(task.id, event.target.value as FieldTaskStatus)}
                    className="border border-slate-300 bg-white px-2 py-1 text-sm text-ink"
                    aria-label={`Status for ${task.areaName}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatStatus(status: FieldTaskStatus) {
  const labels: Record<FieldTaskStatus, string> = {
    new: "Ny",
    planned: "Planlagt",
    in_progress: "Pågår",
    completed: "Utført",
    cancelled: "Kansellert"
  };

  return labels[status];
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
