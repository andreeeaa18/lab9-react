import { useState, useCallback, useMemo, memo } from "react";
import { useQuiz } from "../context/QuizContext";
import questions from "../data/questions";

const CATEGORIES = ["Toate", "Cinematografie", "Stiinta", "Medicina"];
const TIME_OPTIONS = [
  { value: 0, label: "Nelimitat" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 20, label: "20s" },
  { value: 30, label: "30s" },
];

const StartPage = memo(function StartPage() {
  const { dispatch } = useQuiz();
  const [username, setUsername] = useState("");
  const [category, setCategory] = useState("Toate");
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(0);
  const [error, setError] = useState("");

  const availableQuestions = useMemo(() => {
    if (category === "Toate") return questions.length;
    return questions.filter((q) => q.category === category).length;
  }, [category]);

  const countOptions = useMemo(() => {
    const opts = [5, 10, 15, 20].filter((n) => n <= availableQuestions);
    return opts;
  }, [availableQuestions]);

  const handleCategoryChange = useCallback((e) => {
    const newCat = e.target.value;
    setCategory(newCat);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = username.trim();
      if (trimmed === "") {
        setError("Numele de utilizator este obligatoriu!");
        return;
      }
      setError("");
      dispatch({
        type: "START_QUIZ",
        payload: {
          username: trimmed,
          category,
          questionCount,
          timeLimit,
        },
      });
    },
    [username, category, questionCount, timeLimit, dispatch],
  );

  return (
    <div className="start-page">
      <div className="start-card">
        <h1>Quiz App</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={error ? "input-error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categorie</label>
            <select
              id="category"
              value={category}
              onChange={handleCategoryChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="count">Numar de intrebari</label>
            <select
              id="count"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
            >
              {countOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value="all">Toate ({availableQuestions})</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time">Timp limita per intrebare</label>
            <select
              id="time"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Start quiz
          </button>
        </form>
      </div>
    </div>
  );
});

export default StartPage;
