import * as SQLite from "expo-sqlite";

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync("expenses.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget (
      id INTEGER PRIMARY KEY,
      amount REAL NOT NULL
    );
  `);

  return db;
}

export async function addTransaction(
  type: string,
  amount: number,
  category: string,
  description: string
) {
  const db = await initDatabase();

  await db.runAsync(
    `INSERT INTO transactions
    (type, amount, category, description, date)
    VALUES (?, ?, ?, ?, ?)`,
    type,
    amount,
    category,
    description,
    new Date().toISOString()
  );
}

export async function saveBudget(amount: number) {
  const db = await initDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO budget (id, amount)
     VALUES (1, ?)`,
    amount
  );
}

export async function getBudget() {
  const db = await initDatabase();

  const result = await db.getFirstAsync<{ amount: number }>(
    `SELECT amount FROM budget WHERE id = 1`
  );

  return result?.amount ?? 0;
}