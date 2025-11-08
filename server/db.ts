import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Queries para categorias
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  const { categories } = await import("../drizzle/schema");
  return db.select().from(categories);
}

export async function getCategoriesByType(type: "income" | "expense") {
  const db = await getDb();
  if (!db) return [];
  const { categories } = await import("../drizzle/schema");
  return db.select().from(categories).where(eq(categories.type, type));
}

// Queries para transações
export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { transactions } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
}

export async function createTransaction(transaction: {
  userId: number;
  categoryId: number;
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const result = await db.insert(transactions).values(transaction);
  return result;
}

export async function updateTransaction(id: number, userId: number, data: {
  categoryId?: number;
  type?: "income" | "expense";
  amount?: number;
  description?: string;
  date?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function getUserFinancialSummary(userId: number) {
  const db = await getDb();
  if (!db) return { totalIncome: 0, totalExpense: 0, balance: 0 };
  const { transactions } = await import("../drizzle/schema");
  const { sum, and } = await import("drizzle-orm");
  
  const allTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId));
  
  const totalIncome = allTransactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = allTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

/**
 * Salva a Deepseek API Key do usuário
 */
export async function saveUserApiKey(userId: number, apiKey: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ deepseekApiKey: apiKey })
    .where(eq(users.id, userId));
}

/**
 * Busca a Deepseek API Key do usuário
 */
export async function getUserApiKey(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db.select({ deepseekApiKey: users.deepseekApiKey })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0]?.deepseekApiKey || null;
}
