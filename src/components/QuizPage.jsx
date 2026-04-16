import { useState, useEffect, useCallback, memo } from "react";
import { useQuiz } from "../context/QuizContext";
import { useTimer } from "../hooks/useTimer";

const QuizPage = memo(function QuizPage() {
  const { state, dispatch } = useQuiz();
  const { questions, currentIndex, timeLimit, streak, answers } = state;
  const currentQuestion = questions[currentIndex];
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleTimeUp = useCallback(() => {
    if (!showFeedback) {
      setShowFeedback(true);
      setTimeout(() => {
        dispatch({ type: "TIME_UP" });
      }, 1500);
    }
  }, [showFeedback, dispatch]);

  const {
    timeLeft,
    isUrgent: timerDanger,
    reset: resetTimer,
  } = useTimer(timeLimit, {
    enabled: timeLimit > 0 && !showFeedback,
    onExpire: handleTimeUp,
  });

  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    resetTimer(timeLimit);
  }, [currentIndex, timeLimit, resetTimer]);

  const handleAnswer = useCallback(
    (answer) => {
      if (showFeedback) return;
      setSelectedAnswer(answer);
      setShowFeedback(true);
      setTimeout(() => {
        dispatch({
          type: "ANSWER_QUESTION",
          payload: { selectedAnswer: answer },
        });
      }, 1200);
    },
    [showFeedback, dispatch],
  );

  if (!currentQuestion) return null;

  return (
    <div className="quiz-page">
      <div className="quiz-card">
        <div className="quiz-header">
          <div className="quiz-progress-info">
            <span>
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="quiz-meta">
              {currentQuestion.category} - {currentQuestion.difficulty}
            </span>
          </div>
        </div>

        {timeLimit > 0 && (
          <p className={`timer-text ${timerDanger ? "timer-danger-text" : ""}`}>
            {timeLeft}s
          </p>
        )}

        {streak >= 2 && <div className="streak-badge">Streak: {streak}</div>}

        <h2 className="question-text">{currentQuestion.question}</h2>

        <div className="options-grid">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = "option-btn";
            if (showFeedback) {
              if (option === currentQuestion.correctAnswer) {
                optionClass += " option-correct";
              } else if (
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer
              ) {
                optionClass += " option-wrong";
              } else {
                optionClass += " option-disabled";
              }
            } else if (option === selectedAnswer) {
              optionClass += " option-selected";
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                <span className="option-letter">{idx + 1}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && selectedAnswer === null && (
          <div className="feedback time-up-feedback">
            Timpul a expirat! Raspunsul corect era:
            {currentQuestion.correctAnswer}
          </div>
        )}
      </div>
    </div>
  );
});

export default QuizPage;
