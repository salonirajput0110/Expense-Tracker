import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { initDatabase } from "../database";
import { useTheme } from "../theme";

export default function HomeScreen() {
  const { theme, darkMode, toggleTheme } = useTheme();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadTotals();
    }, []),
  );

  async function loadTotals() {
    const db = await initDatabase();

    const income = await db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(amount) AS total FROM transactions WHERE type = 'income'",
    );

    const expenses = await db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(amount) AS total FROM transactions WHERE type = 'expense'",
    );

    setTotalIncome(income?.total ?? 0);
    setTotalExpenses(expenses?.total ?? 0);
  }

  const balance = totalIncome - totalExpenses;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Theme Button */}
      <Pressable
        onPress={toggleTheme}
        style={[
          styles.themeButton,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Text
          style={[
            styles.themeButtonText,
            { color: theme.primary },
          ]}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </Text>
      </Pressable>

      {/* Header */}
      <Text style={[styles.title, { color: theme.text }]}>
        Expense Tracker
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: theme.secondaryText },
        ]}
      >
        Manage your money easily
      </Text>

      {/* Balance Card */}
      <View
        style={[
          styles.balanceCard,
          { backgroundColor: theme.primary },
        ]}
      >
        <Text style={styles.balanceLabel}>
          Current Balance
        </Text>

        <Text style={styles.balance}>
          ₹{balance}
        </Text>

        <Text style={styles.balanceSmall}>
          Your available balance
        </Text>
      </View>

      {/* Income and Expense Cards */}
      <View style={styles.row}>
        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.incomeLight },
          ]}
        >
          <Text
            style={[
              styles.cardLabel,
              { color: theme.income },
            ]}
          >
            Total Income
          </Text>

          <Text
            style={[
              styles.amount,
              { color: theme.income },
            ]}
          >
            ₹{totalIncome}
          </Text>
        </View>

        <View
          style={[
            styles.smallCard,
            { backgroundColor: theme.expenseLight },
          ]}
        >
          <Text
            style={[
              styles.cardLabel,
              { color: theme.expense },
            ]}
          >
            Total Expenses
          </Text>

          <Text
            style={[
              styles.amount,
              { color: theme.expense },
            ]}
          >
            ₹{totalExpenses}
          </Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Recent Transactions
      </Text>

      <View
        style={[
          styles.emptyBox,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.emptyText,
            { color: theme.text },
          ]}
        >
          Add your first transaction
        </Text>

        <Text
          style={[
            styles.emptySubtext,
            { color: theme.secondaryText },
          ]}
        >
          Your transactions will appear here
        </Text>
      </View>

      {/* Add Transaction */}
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.primary },
        ]}
        onPress={() => router.push("/add-transaction")}
      >
        <Text style={styles.buttonText}>
          + Add Transaction
        </Text>
      </Pressable>

      {/* View Transactions */}
      <Pressable
        style={[
          styles.button,
          styles.secondaryButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.primary,
          },
        ]}
        onPress={() => router.push("/transactions")}
      >
        <Text
          style={[
            styles.secondaryButtonText,
            { color: theme.primary },
          ]}
        >
          View Transactions
        </Text>
      </Pressable>

      {/* Budget */}
      <Pressable
        style={[
          styles.button,
          styles.secondaryButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.primary,
          },
        ]}
        onPress={() => router.push("/budget")}
      >
        <Text
          style={[
            styles.secondaryButtonText,
            { color: theme.primary },
          ]}
        >
          💰 Manage Budget
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  themeButton: {
    alignSelf: "flex-end",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 15,
  },

  themeButtonText: {
    fontWeight: "700",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 5,
  },

  subtitle: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 25,
  },

  balanceCard: {
    padding: 25,
    borderRadius: 22,
    marginBottom: 18,
  },

  balanceLabel: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  balance: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },

  balanceSmall: {
    color: "white",
    opacity: 0.8,
    marginTop: 8,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  smallCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 12,
  },

  emptyBox: {
    padding: 25,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtext: {
    marginTop: 5,
    fontSize: 13,
  },

  button: {
    padding: 17,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  secondaryButton: {
    borderWidth: 1.5,
  },

  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "bold",
  },
});