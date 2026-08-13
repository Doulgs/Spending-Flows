"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDonutChart({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-text-muted">
            Nenhuma despesa categorizada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface-elevated))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--text-primary))",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      fontSize: 12,
                    }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-text-muted">Total</span>
                <span className="text-sm font-bold text-text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {data.slice(0, 5).map((d) => (
                <li key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate max-w-[120px]">{d.name}</span>
                  </span>
                  <span className="font-semibold text-text-primary tabular-nums">{formatCurrency(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
