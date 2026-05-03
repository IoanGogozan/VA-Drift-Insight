"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { generateVaRiskReport } from "@/lib/client-api";
import { Button } from "../ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function ReportButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerateReport() {
    setError(null);

    startTransition(async () => {
      try {
        const report = await generateVaRiskReport();
        window.open(`${API_URL}${report.downloadUrl}`, "_blank", "noopener,noreferrer");
      } catch {
        setError("Kunne ikke generere VA-risikorapport.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" onClick={handleGenerateReport} disabled={isPending}>
        <FileText className="mr-2 h-4 w-4" />
        {isPending ? "Genererer rapport..." : "Generer demo-rapport"}
      </Button>
      {error ? <p className="text-sm text-riskHigh">{error}</p> : null}
    </div>
  );
}
