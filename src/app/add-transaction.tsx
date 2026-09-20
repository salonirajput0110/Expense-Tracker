import { useState } from "react";
import { useTheme } from "../theme";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addTransaction } from "../database";

export default function AddTransaction() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const { theme } = useTheme();

  const saveTransaction = async () => {
    const cleanAmount = amount.replace(/,/g, "").trim();
    const numericAmount = parseFloat(cleanAmount);

    if (
      cleanAmount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0.",
      );
      return;
    }

    if (category.trim() === "") {
      Alert.alert("Missing Category", "Please enter a category.");
      return;
    }

    try {
      await addTransaction(
        type,
        numericAmount,
        category.trim(),
        description.trim(),
      );

      Alert.alert(
        "Transaction Added",
        `${type === "income" ? "Income" : "Expense"} of ₹${numericAmount} added.`,
      );

      setAmount("");
      setCategory("");
      setDescription("");
    } catch (error) {
      console.error("Save transaction error:", error);

      Alert.alert("Error", "Could not save the transaction.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Add Transaction</Text>

      <Text style={[styles.label, { color: theme.text }]}>Transaction Type</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.typeButton, type === "expense" && styles.selected]}
          onPress={() => setType("expense")}
        >
          <Text
            style={type === "expense" ? styles.selectedText : styles.buttonText}
          >
            Expense
          </Text>
        </Pressable>

        <Pressable
          style={[styles.typeButton, type === "income" && styles.selected]}
          onPress={() => setType("income")}
        >
          <Text
            style={type === "income" ? styles.selectedText : styles.buttonText}
          >
            Income
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Amount</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.label, { color: theme.text }]}>Category</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Food, Travel, Shopping, Bills..."
        value={category}
        onChangeText={setCategory}
      />

      <Text style={[styles.label, { color: theme.text }]}>Description</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        placeholder="Optional description"
        value={description}
        onChangeText={setDescription}
      />

      <Pressable style={styles.saveButton} onPress={saveTransaction}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  typeButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#222",
  },

  buttonText: {
    color: "#222",
    fontWeight: "600",
  },

  selectedText: {
    color: "white",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#222",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },

  saveText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
