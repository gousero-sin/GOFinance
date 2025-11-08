/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export interface CategoryBreakdownItem {
  categoryId: number;
  name: string;
  color: string | null;
  type: "income" | "expense";
  totalAmount: number;
}

export interface MonthlyTrendItem {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
}
