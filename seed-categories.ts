import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const defaultCategories = [
  // Receitas
  { name: "Salário", type: "income" as const, icon: "💼", color: "#10B981" },
  { name: "Freelance", type: "income" as const, icon: "💻", color: "#059669" },
  { name: "Investimentos", type: "income" as const, icon: "📈", color: "#34D399" },
  { name: "Outros Ganhos", type: "income" as const, icon: "💰", color: "#6EE7B7" },
  
  // Despesas
  { name: "Alimentação", type: "expense" as const, icon: "🍔", color: "#EF4444" },
  { name: "Transporte", type: "expense" as const, icon: "🚗", color: "#DC2626" },
  { name: "Moradia", type: "expense" as const, icon: "🏠", color: "#F87171" },
  { name: "Saúde", type: "expense" as const, icon: "⚕️", color: "#FCA5A5" },
  { name: "Educação", type: "expense" as const, icon: "📚", color: "#F59E0B" },
  { name: "Lazer", type: "expense" as const, icon: "🎮", color: "#FBBF24" },
  { name: "Compras", type: "expense" as const, icon: "🛍️", color: "#FB923C" },
  { name: "Contas", type: "expense" as const, icon: "📄", color: "#F97316" },
  { name: "Outros Gastos", type: "expense" as const, icon: "💸", color: "#FDBA74" },
];

async function seed() {
  console.log("Seeding categories...");
  
  for (const category of defaultCategories) {
    await db.insert(categories).values(category).onDuplicateKeyUpdate({ set: { name: category.name } });
  }
  
  console.log("Categories seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding categories:", error);
  process.exit(1);
});
