import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Configurações do usuário
  settings: router({
    getApiKey: protectedProcedure.query(async ({ ctx }) => {
      const { getUserApiKey } = await import("./db");
      const apiKey = await getUserApiKey(ctx.user.id);
      return { 
        hasApiKey: !!apiKey,
        // Retorna apenas os primeiros 10 caracteres para segurança
        preview: apiKey ? `${apiKey.substring(0, 10)}...` : null
      };
    }),
    
    saveApiKey: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null && "apiKey" in raw) {
          const apiKey = (raw as { apiKey: unknown }).apiKey;
          if (typeof apiKey === "string" && apiKey.length > 0) {
            return { apiKey };
          }
        }
        throw new Error("API Key inválida");
      })
      .mutation(async ({ ctx, input }) => {
        const { saveUserApiKey } = await import("./db");
        await saveUserApiKey(ctx.user.id, input.apiKey);
        return { success: true };
      }),
  }),

  // Categorias
  categories: router({
    list: publicProcedure.query(async () => {
      const { getAllCategories } = await import("./db");
      return getAllCategories();
    }),
    byType: publicProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null && "type" in raw) {
          const type = (raw as { type: unknown }).type;
          if (type === "income" || type === "expense") {
            return { type };
          }
        }
        throw new Error("Invalid type");
      })
      .query(async ({ input }) => {
        const { getCategoriesByType } = await import("./db");
        return getCategoriesByType(input.type as "income" | "expense");
      }),
  }),

  // Transações
  transactions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserTransactions } = await import("./db");
      return getUserTransactions(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null) {
          const obj = raw as Record<string, unknown>;
          if (
            typeof obj.categoryId === "number" &&
            (obj.type === "income" || obj.type === "expense") &&
            typeof obj.amount === "number" &&
            obj.date instanceof Date
          ) {
            return {
              categoryId: obj.categoryId,
              type: obj.type as "income" | "expense",
              amount: obj.amount,
              description: typeof obj.description === "string" ? obj.description : undefined,
              date: obj.date,
            };
          }
        }
        throw new Error("Invalid transaction data");
      })
      .mutation(async ({ ctx, input }) => {
        const { createTransaction } = await import("./db");
        await createTransaction({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null) {
          const obj = raw as Record<string, unknown>;
          if (typeof obj.id === "number") {
            return {
              id: obj.id,
              categoryId: typeof obj.categoryId === "number" ? obj.categoryId : undefined,
              type: obj.type === "income" || obj.type === "expense" ? obj.type as "income" | "expense" : undefined,
              amount: typeof obj.amount === "number" ? obj.amount : undefined,
              description: typeof obj.description === "string" ? obj.description : undefined,
              date: obj.date instanceof Date ? obj.date : undefined,
            };
          }
        }
        throw new Error("Invalid update data");
      })
      .mutation(async ({ ctx, input }) => {
        const { updateTransaction } = await import("./db");
        const { id, ...data } = input;
        await updateTransaction(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null && "id" in raw) {
          const id = (raw as { id: unknown }).id;
          if (typeof id === "number") {
            return { id };
          }
        }
        throw new Error("Invalid id");
      })
      .mutation(async ({ ctx, input }) => {
        const { deleteTransaction } = await import("./db");
        await deleteTransaction(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Estatísticas financeiras
  stats: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const { getUserFinancialSummary } = await import("./db");
      return getUserFinancialSummary(ctx.user.id);
    }),
  }),

  // AI Assistant
  ai: router({
    extractTransaction: protectedProcedure
      .input((raw: unknown) => {
        if (typeof raw === "object" && raw !== null && "text" in raw) {
          const text = (raw as { text: unknown }).text;
          if (typeof text === "string") {
            return { text };
          }
        }
        throw new Error("Invalid text input");
      })
      .mutation(async ({ input, ctx }) => {
        const { extractTransactionFromText } = await import("./deepseek");
        const extracted = await extractTransactionFromText(input.text, ctx.user.id);
        
        // Buscar categoria correspondente
        const { getAllCategories } = await import("./db");
        const categories = await getAllCategories();
        const category = categories.find(
          c => c.name === extracted.category && c.type === extracted.type
        );
        
        if (!category) {
          throw new Error(`Categoria não encontrada: ${extracted.category}`);
        }
        
        return {
          categoryId: category.id,
          type: extracted.type,
          amount: Math.round(extracted.amount * 100), // Converter para centavos
          description: extracted.description,
          date: new Date(extracted.date),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
