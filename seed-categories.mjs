import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const defaultCategories = [
  // Receitas
  { name: "Salário", type: "income", icon: "💼", color: "#10B981" },
  { name: "Freelance", type: "income", icon: "💻", color: "#059669" },
  { name: "Investimentos", type: "income", icon: "📈", color: "#34D399" },
  { name: "Outros Ganhos", type: "income", icon: "💰", color: "#6EE7B7" },
  
  // Despesas
  { name: "Alimentação", type: "expense", icon: "🍔", color: "#EF4444" },
  { name: "Transporte", type: "expense", icon: "🚗", color: "#DC2626" },
  { name: "Moradia", type: "expense", icon: "🏠", color: "#F87171" },
  { name: "Saúde", type: "expense", icon: "⚕️", color: "#FCA5A5" },
  { name: "Educação", type: "expense", icon: "📚", color: "#F59E0B" },
  { name: "Lazer", type: "expense", icon: "🎮", color: "#FBBF24" },
  { name: "Compras", type: "expense", icon: "🛍️", color: "#FB923C" },
  { name: "Contas", type: "expense", icon: "📄", color: "#F97316" },
  { name: "Outros Gastos", type: "expense", icon: "💸", color: "#FDBA74" },
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
