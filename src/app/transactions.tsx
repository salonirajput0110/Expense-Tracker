

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { initDatabase } from "../database";
import { useTheme } from "../theme";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

type CategoryTotal = {
  category: string;
  total: number;
};

const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Other"];

const months = [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);

  const { theme } = useTheme();

  const loadTransactions = async () => {
    const db = await initDatabase();

    const result = await db.getAllAsync<Transaction>(
      "SELECT * FROM transactions ORDER BY date DESC",
    );

    setTransactions(result);

    const expenseData = await db.getAllAsync<CategoryTotal>(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
    );

    setCategoryTotals(expenseData);
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, []),
  );

  const filteredTransactions = transactions.filter((item) => {
    const categoryMatch =
      selectedCategory === "All" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const monthMatch =
      selectedMonth === "All" ||
      new Date(item.date).toLocaleString("en-US", {
        month: "long",
      }) === selectedMonth;

    return categoryMatch && monthMatch;
  });

  const summaryIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const summaryExpenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const highestExpense =
    categoryTotals.length > 0 ? categoryTotals[0].total : 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Transactions
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter */}
        <Text style={[styles.filterTitle, { color: theme.text }]}>
          Filter by Category
        </Text>

        <View style={styles.categoryRow}>
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? theme.primary
                      : theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color:
                      selectedCategory === category
                        ? "white"
                        : theme.text,
                  },
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Month Filter */}
        <Text style={[styles.filterTitle, { color: theme.text }]}>
          Filter by Month
        </Text>

        <View style={styles.categoryRow}>
          {months.map((month) => (
            <Pressable
              key={month}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedMonth === month
                      ? theme.primary
                      : theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedMonth(month)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color:
                      selectedMonth === month
                        ? "white"
                        : theme.text,
                  },
                ]}
              >
                {month}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Monthly Summary */}
        <View
          style={[
            styles.summary,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            Monthly Summary
          </Text>

          <Text style={[styles.summaryText, { color: theme.income }]}>
            Income: ₹{summaryIncome}
          </Text>

          <Text style={[styles.summaryText, { color: theme.expense }]}>
            Expenses: ₹{summaryExpenses}
          </Text>

          <Text style={[styles.summaryText, { color: theme.text }]}>
            Balance: ₹{summaryIncome - summaryExpenses}
          </Text>
        </View>

        {/* Expense Analytics */}
        <View
          style={[
            styles.analyticsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.analyticsTitle, { color: theme.text }]}>
            📊 Expense Analytics
          </Text>

          <Text
            style={[
              styles.analyticsSubtitle,
              { color: theme.secondaryText },
            ]}
          >
            Spending by category
          </Text>

          {categoryTotals.length === 0 ? (
            <Text
              style={[
                styles.noAnalytics,
                { color: theme.secondaryText },
              ]}
            >
              Add expenses to see your analytics.
            </Text>
          ) : (
            categoryTotals.map((item) => {
              const barWidth =
                highestExpense > 0
                  ? (item.total / highestExpense) * 100
                  : 0;

              return (
                <View key={item.category} style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text
                      style={[
                        styles.chartCategory,
                        { color: theme.text },
                      ]}
                    >
                      {item.category}
                    </Text>

                    <Text
                      style={[
                        styles.chartAmount,
                        { color: theme.expense },
                      ]}
                    >
                      ₹{item.total}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.barBackground,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Transaction History */}
        {filteredTransactions.length === 0 ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={{ color: theme.text }}>
              No transactions found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.transaction,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.transactionInfo}>
                  <Text
                    style={[
                      styles.category,
                      { color: theme.text },
                    ]}
                  >
                    {item.category}
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {item.description || "No description"}
                  </Text>

                  <Text
                    style={[
                      styles.date,
                      { color: theme.secondaryText },
                    ]}
                  >
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        item.type === "income"
                          ? theme.income
                          : theme.expense,
                    },
                  ]}
                >
                  {item.type === "income" ? "+" : "-"}₹{item.amount}
                </Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },

  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },

  categoryButtonText: {
    fontWeight: "600",
  },

  summary: {
    padding: 18,
    borderRadius: 15,
    marginBottom: 18,
    borderWidth: 1,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  summaryText: {
    fontSize: 15,
    marginTop: 5,
    fontWeight: "600",
  },

  analyticsCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },

  analyticsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  analyticsSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  noAnalytics: {
    textAlign: "center",
    paddingVertical: 15,
  },

  chartRow: {
    marginBottom: 16,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  chartCategory: {
    fontSize: 14,
    fontWeight: "600",
  },

  chartAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },

  barBackground: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  bar: {
    height: "100%",
    borderRadius: 10,
  },

  empty: {
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
  },

  transaction: {
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  category: {
    fontSize: 17,
    fontWeight: "bold",
  },

  description: {
    marginTop: 4,
  },

  date: {
    marginTop: 5,
    fontSize: 12,
  },

  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
});