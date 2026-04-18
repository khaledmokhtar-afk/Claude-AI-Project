"use client";

import type { Risk } from "@iesl/data";

export function RiskTable({
  risks,
  selectedRiskId,
  onSelect,
}: {
  risks: Risk[];
  selectedRiskId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...risks].sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact);
  return (
    <div className="glass p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
        Risk Register
      </div>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="text-left py-2 pr-2 font-medium">Title</th>
              <th className="text-left py-2 pr-2 font-medium">Category</th>
              <th className="text-center py-2 pr-2 font-medium">L×I</th>
              <th className="text-center py-2 pr-2 font-medium">Trend</th>
              <th className="text-center py-2 pr-2 font-medium">90d</th>
              <th className="text-left py-2 pr-2 font-medium">Owner</th>
              <th className="text-left py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const score = r.likelihood * r.impact;
              const heat = score >= 16 ? "var(--color-heat-5)" : score >= 12 ? "var(--color-heat-4)" : score >= 8 ? "var(--color-heat-3)" : "var(--color-heat-2)";
              const selected = r.id === selectedRiskId;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={`border-b border-[var(--color-border)]/40 cursor-pointer transition-colors hover:bg-white/5 ${
                    selected ? "bg-white/10" : ""
                  }`}
                >
                  <td className="py-2 pr-2">{r.title}</td>
                  <td className="py-2 pr-2">
                    <span
                      className="px-1.5 py-0.5 text-[10px] rounded"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                      style={{ background: heat, color: "white" }}
                    >
                      {score}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-center text-xs">
                    <span
                      style={{
                        color:
                          r.trend === "Rising"
                            ? "var(--color-accent)"
                            : r.trend === "Falling"
                              ? "var(--color-success)"
                              : "var(--color-text-muted)",
                      }}
                    >
                      {r.trend === "Rising" ? "↑" : r.trend === "Falling" ? "↓" : "→"} {r.trend}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-center font-mono text-xs">
                    {(r.predicted90d * 100).toFixed(0)}%
                  </td>
                  <td className="py-2 pr-2 text-[var(--color-text-muted)] text-xs">{r.owner}</td>
                  <td className="py-2 text-xs">{r.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
