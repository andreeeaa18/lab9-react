import { createContext, useContext, useReducer, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext();

function themeReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_THEME":
      return state === "light" ? "dark" : "light";
    default:
      return state;
  }
}

export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useLocalStorage("quiz-theme", "light");
  const [theme, dispatch] = useReducer(themeReducer, storedTheme);

  useEffect(() => {
    setStoredTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, setStoredTheme]);

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
