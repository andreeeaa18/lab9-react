import { useQuiz, phases } from "./context/QuizContext";
import ThemeToggle from "./components/ThemeToggle";
import StartPage from "./components/StartPage";
import QuizPage from "./components/QuizPage";
import ResultsPage from "./components/ResultsPage";
import "./App.css";

function App() {
  const { state } = useQuiz();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Quiz App</h1>
        <ThemeToggle />
      </header>
      <main className="app-main">
        {state.phase === phases.start && <StartPage />}
        {state.phase === phases.quiz && <QuizPage />}
        {state.phase === phases.results && <ResultsPage />}
      </main>
    </div>
  );
}

export default App;
