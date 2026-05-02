"use client";

import { useState, useTransition } from "react";
import type { RecommendationStatus, RecommendationSummary } from "@/lib/api";
import { updateRecommendationStatus } from "@/lib/client-api";
import { UI_TEXT } from "@/lib/ui-text";

type RecommendationsTableProps = {
  initialRecommendations: RecommendationSummary[];
};

const statuses: RecommendationStatus[] = ["new", "planned", "in_progress", "completed", "dismissed"];

export function RecommendationsTable({ initialRecommendations }: RecommendationsTableProps) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: RecommendationStatus) {
    setError(null);
    setPendingId(id);

    startTransition(async () => {
      try {
        const updated = await updateRecommendationStatus(id, status);
        setRecommendations((current) => current.map((item) => (item.id === id ? updated : item)));
      } catch {
        setError(UI_TEXT.updateFailed);
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{UI_TEXT.recommendationsTitle}</h2>
        {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
      </div>

      {recommendations.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{UI_TEXT.noRecommendations}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-muted">
                <th className="py-2 pr-4 font-medium">Prioritet</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Område</th>
                <th className="py-2 pr-4 font-medium">Årsak</th>
                <th className="py-2 pr-4 font-medium">Anbefalt tiltak</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((recommendation) => (
                <tr key={recommendation.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={recommendation.priority} />
                  </td>
                  <td className="py-3 pr-4 text-ink">{formatType(recommendation.type)}</td>
                  <td className="py-3 pr-4 font-medium text-ink">{recommendation.areaName}</td>
                  <td className="py-3 pr-4 text-muted">{recommendation.reason}</td>
                  <td className="py-3 pr-4 text-ink">{recommendation.suggestedAction}</td>
                  <td className="py-3">
                    <select
                      value={recommendation.status}
                      disabled={isPending && pendingId === recommendation.id}
                      onChange={(event) =>
                        handleStatusChange(recommendation.id, event.target.value as RecommendationStatus)
                      }
                      className="border border-slate-300 bg-white px-2 py-1 text-sm text-ink"
                      aria-label={`Status for ${recommendation.areaName}`}
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
      )}
    </section>
  );
}

function PriorityBadge({ priority }: { priority: RecommendationSummary["priority"] }) {
  const className =
    priority === "high"
      ? "bg-red-50 text-riskHigh"
      : priority === "medium"
        ? "bg-amber-50 text-riskMedium"
        : "bg-green-50 text-riskLow";

  return <span className={`inline-flex px-2 py-1 text-xs font-semibold uppercase ${className}`}>{priority}</span>;
}

function formatType(type: string) {
  const labels: Record<string, string> = {
    leakage: "Lekkasje",
    fremmedvann: "Fremmedvann",
    sanering: "Sanering",
    data_gap: "Datagap"
  };

  return labels[type] ?? type;
}

function formatStatus(status: RecommendationStatus) {
  const labels: Record<RecommendationStatus, string> = {
    new: "Ny",
    planned: "Planlagt",
    in_progress: "Pågår",
    completed: "Utført",
    dismissed: "Avvist"
  };

  return labels[status];
}
