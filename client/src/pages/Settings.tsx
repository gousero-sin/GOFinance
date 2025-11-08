import { FinanceDashboardLayout } from "@/components/FinanceDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Save } from "lucide-react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { data: apiKeyData, refetch } = trpc.settings.getApiKey.useQuery();
  const saveApiKeyMutation = trpc.settings.saveApiKey.useMutation({
    onSuccess: () => {
      toast.success("API Key salva com sucesso!");
      setApiKey("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma API Key válida");
      return;
    }
    saveApiKeyMutation.mutate({ apiKey: apiKey.trim() });
  };

  return (
    <FinanceDashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-shadow">Configurações</h1>
        <p className="text-white/70 mb-8">Configure sua API Key do Deepseek para usar o AI Assistant</p>

        <div className="glass-card p-6 space-y-6">
          {/* Status atual */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Status da API Key</h2>
            {apiKeyData?.hasApiKey ? (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Configurada: {apiKeyData.preview}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span>Não configurada</span>
              </div>
            )}
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-white">
                Deepseek API Key
              </Label>
              <p className="text-sm text-white/60 mb-2">
                Obtenha sua chave em{" "}
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  platform.deepseek.com
                </a>
              </p>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saveApiKeyMutation.isPending}
              className="w-full glass-button text-white font-medium"
            >
              {saveApiKeyMutation.isPending ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar API Key
                </>
              )}
            </Button>
          </div>

          {/* Informações */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="font-medium mb-2">ℹ️ Sobre a API Key</h3>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Sua chave é armazenada de forma segura no banco de dados</li>
              <li>• Apenas você tem acesso à sua chave</li>
              <li>• A chave é necessária para usar o AI Assistant</li>
              <li>• Você pode atualizar sua chave a qualquer momento</li>
            </ul>
          </div>
        </div>
      </div>
    </FinanceDashboardLayout>
  );
}
