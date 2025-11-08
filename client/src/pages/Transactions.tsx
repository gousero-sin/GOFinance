import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Transactions() {
  const [, setLocation] = useLocation();
  const { data: transactions, isLoading } = trpc.transactions.list.useQuery();

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-shadow mb-2">Transações</h1>
            <p className="text-white/70">Histórico completo de movimentações</p>
          </div>
          <Button
            onClick={() => setLocation("/ai-assistant")}
            className="glass-button text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Transactions List */}
        <GlassCard>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/50 mb-4 text-lg">Nenhuma transação ainda</p>
              <Button
                onClick={() => setLocation("/ai-assistant")}
                className="glass-button text-white"
              >
                Adicionar primeira transação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-green-300" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{transaction.description || "Sem descrição"}</p>
                      <p className="text-sm text-white/60">
                        {new Date(transaction.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className={`font-mono font-bold text-2xl ${
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
