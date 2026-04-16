import { createContext, useContext, useReducer, useEffect } from "react";
import questions from "../data/questions";
import { useLocalStorage } from "../hooks/useLocalStorage";

const QuizContext = createContext();

const phases = {
  start: "start",
  quiz: "quiz",
  results: "results",
};

const initialState = {
  phase: phases.start,
  username: "",
  category: "Toate",
  questionCount: 5,
  timeLimit: 0,
  questions: [],
  currentIndex: 0,
  answers: [],
  streak: 0,
  maxStreak: 0,
  scoreHistory: [],
};

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createQuizCompletionState(state, newAnswers, newStreak, maxStreak) {
  const correctCount = newAnswers.filter((a) => a.isCorrect).length;
  const newEntry = {
    username: state.username,
    score: correctCount,
    total: state.questions.length,
    percentage: Math.round((correctCount / state.questions.length) * 100),
    maxStreak,
    category: state.category,
    date: new Intl.DateTimeFormat("ro-RO").format(new Date()),
  };
  const history = [...state.scoreHistory, newEntry];
  return {
    ...state,
    phase: phases.results,
    answers: newAnswers,
    streak: newStreak,
    scoreHistory: history,
  };
}

function quizReducer(state, action) {
  switch (action.type) {
    case "START_QUIZ": {
      const { username, category, questionCount, timeLimit } = action.payload;
      const filtered =
        category === "Toate"
          ? [...questions]
          : questions.filter((q) => q.category === category);
      const shuffled = shuffleArray(filtered);
      const count =
        questionCount === "all" ? shuffled.length : Number(questionCount);
      const selected = shuffled.slice(0, count);
      return {
        ...state,
        phase: phases.quiz,
        username,
        category,
        questionCount: count,
        timeLimit: Number(timeLimit),
        questions: selected,
        currentIndex: 0,
        answers: [],
        streak: 0,
        maxStreak: 0,
      };
    }
    case "ANSWER_QUESTION": {
      const { selectedAnswer } = action.payload;
      const currentQuestion = state.questions[state.currentIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const newStreak = isCorrect ? state.streak + 1 : 0;
      const newMaxStreak = Math.max(state.maxStreak, newStreak);
      const newAnswers = [
        ...state.answers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          options: currentQuestion.options,
          selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect,
        },
      ];
      const isLast = state.currentIndex >= state.questions.length - 1;

      if (isLast) {
        return createQuizCompletionState(
          state,
          newAnswers,
          newStreak,
          newMaxStreak,
        );
      }

      return {
        ...state,
        answers: newAnswers,
        currentIndex: state.currentIndex + 1,
        streak: newStreak,
        maxStreak: newMaxStreak,
      };
    }
    case "TIME_UP": {
      const currentQuestion = state.questions[state.currentIndex];
      const newAnswers = [
        ...state.answers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          options: currentQuestion.options,
          selectedAnswer: null,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: false,
        },
      ];
      const newStreak = 0;
      const isLast = state.currentIndex >= state.questions.length - 1;

      if (isLast) {
        return createQuizCompletionState(
          state,
          newAnswers,
          newStreak,
          state.maxStreak,
        );
      }

      return {
        ...state,
        answers: newAnswers,
        currentIndex: state.currentIndex + 1,
        streak: newStreak,
      };
    }
    case "RESET": {
      return {
        ...initialState,
        scoreHistory: state.scoreHistory,
      };
    }
    case "RESTORE_SESSION": {
      return {
        ...action.payload,
        scoreHistory: state.scoreHistory,
      };
    }
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [storedHistory, setStoredHistory] = useLocalStorage(
    "quiz-score-history",
    [],
  );
  const [storedSession, setStoredSession, removeSession] = useLocalStorage(
    "quiz-active-session",
    null,
  );

  const [state, dispatch] = useReducer(quizReducer, {
    ...initialState,
    scoreHistory: storedHistory,
  });

  useEffect(() => {
    if (state.phase === phases.quiz) {
      setStoredSession(state);
    } else {
      removeSession();
    }
  }, [state, setStoredSession, removeSession]);

  useEffect(() => {
    setStoredHistory(state.scoreHistory);
  }, [state.scoreHistory, setStoredHistory]);

  useEffect(() => {
    if (storedSession && storedSession.phase === phases.quiz) {
      dispatch({ type: "RESTORE_SESSION", payload: storedSession });
    }
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) throw new Error("useQuiz must be used within QuizProvider");
  return context;
}

export { phases };
