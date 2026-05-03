"use client";

import { useState, useTransition } from "react";
import type { PrivateServiceCaseStatus, PrivateServiceCaseSummary } from "@/lib/api";
import { updatePrivateCaseStatus } from "@/lib/client-api";

type PrivateCasesTableProps = {
  initialPrivateCases: PrivateServiceCaseSummary[];
};

const statuses: PrivateServiceCaseStatus[] = ["suspected", "contacted", "repaired", "closed"];

const statusClass: Record<PrivateServiceCaseStatus, string> = {
  suspected: "border-red-200 bg-red-50 text-red-800",
  contacted: "border-amber-200 bg-amber-50 text-amber-800",
  repaired: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-slate-200 bg-slate-50 text-slate-700"
};

export function PrivateCasesTable({ initialPrivateCases }: PrivateCasesTableProps) {
  const [privateCases, setPrivateCases] = useState(initialPrivateCases);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: PrivateServiceCaseStatus) {
    setPendingId(id);
    setError(null);

    startTransition(async () => {
      try {
        const updated = await updatePrivateCaseStatus(id, status);
        setPrivateCases((current) => current.map((privateCase) => (privateCase.id === id ? updated : privateCase)));
      } catch {
        setError("Kunne ikke oppdatere privat lekkasjesak.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section className="border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Private stikkledninger</h2>
          <p className="mt-1 text-sm text-muted">
            Oppfølging av mistenkte private lekkasjer med estimert tap og neste kontaktpunkt.
          </p>
        </div>
        {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-6 py-3 font-semibold">Adresse</th>
              <th className="px-4 py-3 font-semibold">Sone</th>
              <th className="px-4 py-3 font-semibold">Estimert tap</th>
              <th className="px-4 py-3 font-semibold">Siste oppfølging</th>
              <th className="px-4 py-3 font-semibold">Neste oppfølging</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {privateCases.map((privateCase) => (
              <tr key={privateCase.id} className="border-t border-slate-100 align-top">
                <td className="px-6 py-4 font-medium text-ink">{privateCase.address}</td>
                <td className="px-4 py-4 text-muted">{privateCase.zoneName}</td>
                <td className="px-4 py-4">{privateCase.estimatedLossM3Day.toFixed(1)} m³/d</td>
                <td className="px-4 py-4">{formatDate(privateCase.lastFollowUp)}</td>
                <td className="px-4 py-4">{formatDate(privateCase.nextFollowUp)}</td>
                <td className="px-4 py-4">
                  <select
                    value={privateCase.status}
                    disabled={isPending && pendingId === privateCase.id}
                    onChange={(event) =>
                      handleStatusChange(privateCase.id, event.target.value as PrivateServiceCaseStatus)
                    }
                    className={`border px-2 py-1 text-sm font-medium ${statusClass[privateCase.status]}`}
                    aria-label={`Status for ${privateCase.address}`}
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

function formatStatus(status: PrivateServiceCaseStatus) {
  const labels: Record<PrivateServiceCaseStatus, string> = {
    suspected: "Mistenkt",
    contacted: "Kontaktet",
    repaired: "Reparert",
    closed: "Lukket"
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
