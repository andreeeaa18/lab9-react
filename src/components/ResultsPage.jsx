import { useState, useMemo, useCallback, memo } from "react";
import { useQuiz } from "../context/QuizContext";

const FILTER_TABS = ["Toate", "Corecte", "Gresite"];
const CATEGORIES_FILTER = ["Toate", "Cinematografie", "Stiinta", "Medicina"];

const AnswerCard = memo(function AnswerCard({ answer, index }) {
  return (
    <div
      className={`answer-card ${answer.isCorrect ? "answer-correct" : "answer-wrong"}`}
    >
      <div className="answer-card-header">
        <span className="answer-number">{index + 1}</span>
        <span className="answer-category">{answer.category}</span>
        <span
          className={`answer-difficulty difficulty-${answer.difficulty.toLowerCase()}`}
        >
          {answer.difficulty}
        </span>
        <span
          className={`answer-badge ${answer.isCorrect ? "badge-correct" : "badge-wrong"}`}
        >
          {answer.isCorrect ? "Corect" : "Gresit"}
        </span>
      </div>
      <p className="answer-question">{answer.question}</p>
      <div className="answer-details">
        {answer.selectedAnswer ? (
          <p className={answer.isCorrect ? "text-correct" : "text-wrong"}>
            Raspunsul tau: {answer.selectedAnswer}
          </p>
        ) : (
          <p className="text-wrong">Nu ai raspuns</p>
        )}
        {!answer.isCorrect && (
          <p className="text-correct">Raspuns corect: {answer.correctAnswer}</p>
        )}
      </div>
    </div>
  );
});

const ScoreHistoryTable = memo(function ScoreHistoryTable({ history }) {
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => b.percentage - a.percentage);
  }, [history]);

  if (sortedHistory.length === 0) return null;

  return (
    <div className="history-section">
      <h3>Istoricul Scorurilor</h3>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilizator</th>
              <th>Scor</th>
              <th>Procent</th>
              <th>Streak Max</th>
              <th>Categorie</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((entry, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{entry.username}</td>
                <td>
                  {entry.score}/{entry.total}
                </td>
                <td>{entry.percentage}%</td>
                <td>{entry.maxStreak}</td>
                <td>{entry.category}</td>
                <td>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const ResultsPage = memo(function ResultsPage() {
  const { state, dispatch } = useQuiz();
  const { answers, maxStreak, username, scoreHistory } = state;
  const [activeTab, setActiveTab] = useState("Toate");
  const [categoryFilter, setCategoryFilter] = useState("Toate");

  const score = useMemo(
    () => answers.filter((a) => a.isCorrect).length,
    [answers],
  );
  const total = answers.length;
  const percentage = useMemo(
    () => Math.round((score / total) * 100),
    [score, total],
  );

  const categoryStats = useMemo(() => {
    const stats = {};
    answers.forEach((a) => {
      if (!stats[a.category]) {
        stats[a.category] = { correct: 0, total: 0 };
      }
      stats[a.category].total++;
      if (a.isCorrect) stats[a.category].correct++;
    });
    return stats;
  }, [answers]);

  const filteredAnswers = useMemo(() => {
    let filtered = answers;
    if (activeTab === "Corecte") {
      filtered = filtered.filter((a) => a.isCorrect);
    } else if (activeTab === "Gresite") {
      filtered = filtered.filter((a) => !a.isCorrect);
    }
    if (categoryFilter !== "Toate") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }
    return filtered;
  }, [answers, activeTab, categoryFilter]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleCategoryFilterChange = useCallback((e) => {
    setCategoryFilter(e.target.value);
  }, []);

  return (
    <div className="results-page">
      <div className="results-card">
        <h1>Rezultate</h1>
        <p className="results-username">Bravo, {username}!</p>

        <div className="score-summary">
          <div className="score-circle">
            <span className="score-number">{percentage}%</span>
            <span className="score-label">
              {score} / {total}
            </span>
          </div>
          <div className="score-details">
            <div className="stat-item">
              <span>Streak maxim: {maxStreak}</span>
            </div>
            <div className="stat-item">
              <span>Corecte: {score}</span>
            </div>
            <div className="stat-item">
              <span>Gresite: {total - score}</span>
            </div>
          </div>
        </div>

        <div className="category-stats">
          <h3>Pe categorii</h3>
          <div className="category-stats-grid">
            {Object.keys(categoryStats).map((cat) => (
              <div key={cat} className="category-stat-card">
                <span className="cat-name">{cat}</span>
                <span className="cat-score">
                  {categoryStats[cat].correct} / {categoryStats[cat].total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-section">
          <h3>Raspunsuri</h3>
          <div className="review-filters">
            <div className="tab-group">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              className="category-dropdown"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
            >
              {CATEGORIES_FILTER.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="answers-list">
            {filteredAnswers.length === 0 ? (
              <p className="no-results">Niciun raspuns gasit.</p>
            ) : (
              filteredAnswers.map((answer, idx) => (
                <AnswerCard
                  key={answer.questionId}
                  answer={answer}
                  index={idx}
                />
              ))
            )}
          </div>
        </div>

        <ScoreHistoryTable history={scoreHistory} />

        <button className="btn-primary btn-retry" onClick={handleReset}>
          Incearca din nou
        </button>
      </div>
    </div>
  );
});

export default ResultsPage;
