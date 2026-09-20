import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const lightTheme = {
  background: "#F4F7FC",
  card: "#FFFFFF",
  text: "#172033",
  secondaryText: "#667085",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  income: "#16A34A",
  incomeLight: "#DCFCE7",
  expense: "#EF4444",
  expenseLight: "#FEE2E2",
  border: "#E5E7EB",
};

const darkTheme = {
  background: "#101522",
  card: "#1B2333",
  text: "#F8FAFC",
  secondaryText: "#AAB4C5",
  primary: "#818CF8",
  primaryLight: "#252B4A",
  income: "#4ADE80",
  incomeLight: "#173B29",
  expense: "#F87171",
  expenseLight: "#442020",
  border: "#30394D",
};

type ThemeContextType = {
  darkMode: boolean;
  theme: typeof lightTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemScheme === "dark");

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) {
        setDarkMode(value === "true");
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await AsyncStorage.setItem("darkMode", String(newValue));
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        theme: darkMode ? darkTheme : lightTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}