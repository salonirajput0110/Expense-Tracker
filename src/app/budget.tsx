import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBudget, initDatabase, saveBudget } from "../database";
import { useTheme } from "../theme";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function Budget() {
  const { theme } = useTheme();

  const [budget, setBudget] = useState(0);
  const [amount, setAmount] = useState("");
  const [spent, setSpent] = useState(0);

  const loadBudget = async () => {
    const db = await initDatabase();

    const savedBudget = await getBudget();

    const result = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount) AS total
       FROM transactions
       WHERE type = 'expense'`
    );

    setBudget(savedBudget);
    setSpent(result?.total ?? 0);
  };

  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [])
  );

  const remaining = budget - spent;

  const handleSave = async () => {
    const value = parseFloat(amount);

    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid budget.");
      return;
    }

    await saveBudget(value);
    setBudget(value);
    setAmount("");

    Alert.alert("Budget Saved", `Your budget is ₹${value}.`);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Monthly Budget
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: theme.secondaryText },
        ]}
      >
        Set a spending limit for your expenses.
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Current Budget
        </Text>

        <Text style={[styles.bigAmount, { color: theme.primary }]}>
          ₹{budget}
        </Text>

        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Total Spent
        </Text>

        <Text style={[styles.amount, { color: theme.expense }]}>
          ₹{spent}
        </Text>

        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Remaining
        </Text>

        <Text
          style={[
            styles.amount,
            {
              color:
                remaining < 0
                  ? theme.expense
                  : theme.income,
            },
          ]}
        >
          ₹{remaining}
        </Text>
      </View>

      {budget > 0 && spent >= budget && (
        <View
          style={[
            styles.alert,
            { backgroundColor: theme.expenseLight },
          ]}
        >
          <Text
            style={[
              styles.alertText,
              { color: theme.expense },
            ]}
          >
            🚨 Budget exceeded!
          </Text>
        </View>
      )}

      {budget > 0 && spent < budget && spent >= budget * 0.8 && (
        <View
          style={[
            styles.alert,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Text
            style={[
              styles.alertText,
              { color: theme.primary },
            ]}
          >
            ⚠️ You have used more than 80% of your budget.
          </Text>
        </View>
      )}

      <Text style={[styles.label, { color: theme.text }]}>
        Set New Budget
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Enter monthly budget"
        placeholderTextColor={theme.secondaryText}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.primary },
        ]}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>
          Save Budget
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

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 25,
    fontSize: 14,
  },

  card: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },

  bigAmount: {
    fontSize: 34,
    fontWeight: "bold",
  },

  amount: {
    fontSize: 23,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 15,
  },

  button: {
    padding: 17,
    borderRadius: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  alert: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
  },

  alertText: {
    fontWeight: "bold",
    textAlign: "center",
  },
});