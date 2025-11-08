/**
 * Helper para integração com Deepseek API
 * Processa texto em linguagem natural e extrai informações de transações financeiras
 */

interface DeepseekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ExtractedTransaction {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
}

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Extrai informações de transação financeira de texto em linguagem natural
 * @param userText Texto em linguagem natural do usuário
 * @param userId ID do usuário para buscar sua API Key pessoal
 */
export async function extractTransactionFromText(userText: string, userId: number): Promise<ExtractedTransaction> {
  // Buscar API Key do usuário no banco de dados
  const { getUserApiKey } = await import("./db");
  const apiKey = await getUserApiKey(userId);
  
  if (!apiKey) {
    throw new Error("API Key não configurada. Por favor, configure sua chave do Deepseek na página de Configurações.");
  }

  const systemPrompt = `Você é um assistente financeiro especializado em extrair informações de transações financeiras.

Analise o texto do usuário e extraia as seguintes informações:
- type: "income" (receita) ou "expense" (despesa)
- amount: valor numérico em reais (sem símbolo R$, apenas número)
- category: uma das categorias abaixo
- description: descrição curta e clara da transação
- date: data no formato YYYY-MM-DD (se não especificada, use a data de hoje)

Categorias possíveis para RECEITAS (income):
- Salário
- Freelance
- Investimentos
- Outros Ganhos

Categorias possíveis para DESPESAS (expense):
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Contas
- Outros Gastos

IMPORTANTE:
- Retorne APENAS um objeto JSON válido, sem texto adicional
- Use a categoria mais apropriada baseada no contexto
- Se o valor incluir centavos, mantenha-os (ex: 50.75)
- Datas relativas: "hoje" = data atual, "ontem" = data atual - 1 dia, etc.

Exemplo de resposta:
{"type":"expense","amount":50.00,"category":"Alimentação","description":"Compras no mercado","date":"2025-11-07"}`;

  const messages: DeepseekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userText }
  ];

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.1, // Baixa temperatura para respostas mais consistentes
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
    }

    const data: DeepseekResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da Deepseek API");
    }

    // Parse JSON response
    console.log("[Deepseek] Raw response:", content);
    
    let extracted: ExtractedTransaction;
    try {
      extracted = JSON.parse(content.trim());
    } catch (parseError) {
      console.error("[Deepseek] Failed to parse JSON:", content);
      throw new Error("Resposta da AI não é um JSON válido");
    }

    console.log("[Deepseek] Parsed data:", extracted);

    // Validação básica com mensagens mais específicas
    if (!extracted.type) {
      throw new Error("Campo 'type' ausente na resposta da AI");
    }
    
    if (extracted.type !== "income" && extracted.type !== "expense") {
      throw new Error(`Tipo de transação inválido: ${extracted.type}`);
    }
    
    if (typeof extracted.amount !== "number" || isNaN(extracted.amount)) {
      throw new Error(`Campo 'amount' inválido: ${extracted.amount}`);
    }
    
    if (!extracted.category || typeof extracted.category !== "string") {
      throw new Error(`Campo 'category' ausente ou inválido: ${extracted.category}`);
    }
    
    if (!extracted.description || typeof extracted.description !== "string") {
      throw new Error(`Campo 'description' ausente ou inválido: ${extracted.description}`);
    }
    
    if (!extracted.date) {
      throw new Error("Campo 'date' ausente na resposta da AI");
    }

    return extracted;
  } catch (error) {
    console.error("Erro ao processar com Deepseek:", error);
    throw new Error(`Falha ao processar texto: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}
