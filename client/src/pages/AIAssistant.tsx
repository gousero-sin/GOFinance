import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AIAssistant() {
  const [, setLocation] = useLocation();
  const [text, setText] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const utils = trpc.useUtils();
  
  const extractMutation = trpc.ai.extractTransaction.useMutation({
    onSuccess: (data) => {
      setExtractedData(data);
      toast.success("Transação extraída com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao processar: ${error.message}`);
    }
  });

  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transação adicionada com sucesso!");
      utils.transactions.list.invalidate();
      utils.stats.summary.invalidate();
      setText("");
      setExtractedData(null);
      setLocation("/");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  const handleExtract = () => {
    if (!text.trim()) {
      toast.error("Digite algo primeiro!");
      return;
    }
    extractMutation.mutate({ text });
  };

  const handleConfirm = () => {
    if (extractedData) {
      createMutation.mutate(extractedData);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setText("");
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const examples = [
    "Gastei R$ 50 no mercado hoje",
    "Recebi R$ 1500 de salário",
    "Paguei R$ 120 de conta de luz ontem",
    "Ganhei R$ 800 de freelance",
  ];

  return (
    <FinanceDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-3xl font-bold text-shadow mb-2">AI Assistant</h1>
          <p className="text-white/70">
            Adicione transações usando linguagem natural
          </p>
        </div>

        {/* Input Card */}
        <GlassCard>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium mb-2 block">
                Descreva sua transação
              </span>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Gastei R$ 50 no mercado hoje"
                className="glass-input text-white min-h-[120px] resize-none"
                disabled={extractMutation.isPending || createMutation.isPending}
              />
            </label>

            <Button
              onClick={handleExtract}
              disabled={extractMutation.isPending || createMutation.isPending || !text.trim()}
              className="w-full glass-button text-white font-medium"
            >
              {extractMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Processar com IA
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        {/* Extracted Data Preview */}
        {extractedData && (
          <GlassCard className="border-2 border-white/30">
            <h3 className="text-lg font-bold mb-4 text-shadow">Transação Extraída</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Tipo</span>
                <span className={`font-medium ${
                  extractedData.type === 'income' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {extractedData.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Valor</span>
                <span className="font-mono font-bold text-xl">
                  {formatCurrency(extractedData.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Descrição</span>
                <span className="font-medium">{extractedData.description}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Data</span>
                <span className="font-medium">
                  {new Date(extractedData.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
              <Button
                onClick={handleCancel}
                disabled={createMutation.isPending}
                variant="outline"
                className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Examples */}
        {!extractedData && (
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-shadow">Exemplos</h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setText(example)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </FinanceDashboardLayout>
  );
}
