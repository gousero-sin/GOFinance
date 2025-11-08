import { useMemo } from "react";

import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as RechartsPrimitive from "recharts";

const FALLBACK_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export default function Reports() {
  const { data: summary, isLoading: summaryLoading } = trpc.stats.summary.useQuery();
  const {
    data: categoryBreakdown,
    isLoading: categoryLoading,
  } = trpc.stats.categoryBreakdown.useQuery();
  const { data: monthlyTrends, isLoading: monthlyLoading } =
    trpc.stats.monthlyTrends.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const categoryChartData = useMemo<{
    data: Array<{
      chartKey: string;
      name: string;
      type: "income" | "expense";
      value: number;
      percentage: number;
      fill: string;
    }>;
    config: Record<string, { label: string; color: string }>;
  }>(() => {
    if (!categoryBreakdown?.length) return { data: [], config: {} };

    const configEntries = categoryBreakdown.map((item, index) => {
      const chartKey = `category-${item.categoryId}`;
      const color = item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

      return {
        key: chartKey,
        value: {
          label: item.name,
          color,
        },
        data: {
          chartKey,
          name: item.name,
          type: item.type,
          value: item.total,
          percentage: item.percentage,
          fill: color,
        },
      };
    });

    return {
      data: configEntries.map(entry => entry.data),
      config: Object.fromEntries(
        configEntries.map(entry => [entry.key, entry.value])
      ),
    };
  }, [categoryBreakdown]);

  const monthlyChartData = useMemo(() => {
    if (!monthlyTrends?.length) return [];
    return monthlyTrends.map(item => ({
      ...item,
      monthLabel: item.label,
    }));
  }, [monthlyTrends]);

  return (
    <FinanceDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-shadow mb-2">Relatórios</h1>
          <p className="text-white/70">Análise detalhada das suas finanças</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Saldo Total</p>
                <p className="text-3xl font-bold font-mono text-shadow">
                  {summaryLoading ? "..." : formatCurrency(summary?.balance || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-white/10">
                <PieChartIcon className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total de Receitas</p>
                <p className="text-3xl font-bold font-mono text-shadow text-green-300">
                  {summaryLoading ? "..." : formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-300" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total de Despesas</p>
                <p className="text-3xl font-bold font-mono text-shadow text-red-300">
                  {summaryLoading ? "..." : formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <TrendingDown className="w-6 h-6 text-red-300" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard className="p-0">
            <div className="p-6 pb-2">
              <h2 className="text-xl font-semibold text-shadow mb-1">
                Distribuição por categoria
              </h2>
              <p className="text-white/60 text-sm">
                Visualize como seus gastos e receitas se distribuem.
              </p>
            </div>
            <div className="px-6 pb-6">
              {categoryLoading ? (
                <Skeleton className="h-[320px] w-full rounded-2xl bg-white/10" />
              ) : !categoryChartData.data.length ? (
                <div className="flex h-[320px] items-center justify-center text-center text-white/60">
                  Nenhuma transação para exibir a distribuição.
                </div>
              ) : (
                <ChartContainer
                  config={categoryChartData.config}
                  className="mt-4"
                >
                  <RechartsPrimitive.PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          nameKey="chartKey"
                          labelKey="chartKey"
                          formatter={value => (
                            <span className="font-mono">
                              {formatCurrency(Number(value ?? 0))}
                            </span>
                          )}
                        />
                      }
                    />
                    <ChartLegend
                      verticalAlign="bottom"
                      content={<ChartLegendContent nameKey="chartKey" />}
                    />
                    <RechartsPrimitive.Pie
                      data={categoryChartData.data}
                      dataKey="value"
                      nameKey="chartKey"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {categoryChartData.data.map(entry => (
                        <RechartsPrimitive.Cell
                          key={entry.chartKey}
                          fill={entry.fill}
                        />
                      ))}
                    </RechartsPrimitive.Pie>
                  </RechartsPrimitive.PieChart>
                </ChartContainer>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-0">
            <div className="p-6 pb-2">
              <h2 className="text-xl font-semibold text-shadow mb-1">
                Evolução mensal
              </h2>
              <p className="text-white/60 text-sm">
                Compare receitas, despesas e saldo mês a mês.
              </p>
            </div>
            <div className="px-6 pb-6">
              {monthlyLoading ? (
                <Skeleton className="h-[320px] w-full rounded-2xl bg-white/10" />
              ) : !monthlyChartData.length ? (
                <div className="flex h-[320px] items-center justify-center text-center text-white/60">
                  Registre transações para ver a evolução mensal.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    income: {
                      label: "Receitas",
                      color: "var(--color-chart-1)",
                    },
                    expense: {
                      label: "Despesas",
                      color: "var(--color-chart-3)",
                    },
                    net: {
                      label: "Saldo",
                      color: "var(--color-chart-2)",
                    },
                  }}
                  className="mt-4"
                >
                  <RechartsPrimitive.BarChart data={monthlyChartData}>
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis
                      dataKey="monthLabel"
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsPrimitive.YAxis
                      tickFormatter={value => formatCurrency(Number(value))}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value, name) => (
                            <span className="font-mono">
                              {formatCurrency(Number(value ?? 0))}
                            </span>
                          )}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <RechartsPrimitive.Bar
                      dataKey="income"
                      fill="var(--color-chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <RechartsPrimitive.Bar
                      dataKey="expense"
                      fill="var(--color-chart-3)"
                      radius={[4, 4, 0, 0]}
                    />
                    <RechartsPrimitive.Line
                      type="monotone"
                      dataKey="net"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </FinanceDashboardLayout>
  );
}
