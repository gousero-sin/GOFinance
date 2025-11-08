import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { trpc } from "@/lib/trpc";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";

export default function Reports() {
  const { data: summary, isLoading } = trpc.stats.summary.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

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
                  {isLoading ? "..." : formatCurrency(summary?.balance || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-white/10">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total de Receitas</p>
                <p className="text-3xl font-bold font-mono text-shadow text-green-300">
                  {isLoading ? "..." : formatCurrency(summary?.totalIncome || 0)}
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
                  {isLoading ? "..." : formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <TrendingDown className="w-6 h-6 text-red-300" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Placeholder for future charts */}
        <GlassCard>
          <div className="text-center py-16">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50 text-lg">Gráficos e análises detalhadas em breve</p>
          </div>
        </GlassCard>
      </div>
    </FinanceDashboardLayout>
  );
}
