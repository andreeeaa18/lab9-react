import { memo, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = memo(function ThemeToggle() {
  const { theme, dispatch } = useTheme();

  const handleToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_THEME" });
  }, [dispatch]);

  return (
    <button className="theme-toggle" onClick={handleToggle}>
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
});

export default ThemeToggle;
