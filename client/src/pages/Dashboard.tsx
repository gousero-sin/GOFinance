import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading: summaryLoading } = trpc.stats.summary.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.list.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <FinanceDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-shadow mb-2">Dashboard</h1>
            <p className="text-white/70">Visão geral das suas finanças</p>
          </div>
          <Button
            onClick={() => setLocation("/ai-assistant")}
            className="glass-button text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Saldo Total</p>
                <p className="text-3xl font-bold font-mono text-shadow">
                  {summaryLoading ? "..." : formatCurrency(summary?.balance || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-white/10">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          {/* Income Card */}
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Receitas</p>
                <p className="text-3xl font-bold font-mono text-shadow text-green-300">
                  {summaryLoading ? "..." : formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-300" />
              </div>
            </div>
          </GlassCard>

          {/* Expense Card */}
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Despesas</p>
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

        {/* Recent Transactions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-shadow">Transações Recentes</h2>
            <Button
              onClick={() => setLocation("/transactions")}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Ver todas
            </Button>
          </div>

          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 mb-4">Nenhuma transação ainda</p>
              <Button
                onClick={() => setLocation("/ai-assistant")}
                className="glass-button text-white"
              >
                Adicionar primeira transação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-300" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || "Sem descrição"}</p>
                      <p className="text-sm text-white/60">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-mono font-bold ${
                    transaction.type === 'income' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </FinanceDashboardLayout>
  );
}
