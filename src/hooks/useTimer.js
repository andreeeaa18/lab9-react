import { useState, useEffect, useCallback } from "react";

export function useTimer(initialTime, { enabled = true, onExpire } = {}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const reset = useCallback(
    (newTime) => {
      setTimeLeft(newTime !== undefined ? newTime : initialTime);
    },
    [initialTime],
  );

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!enabled || initialTime === 0) return;

    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft, initialTime, enabled, onExpire]);

  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 100;
  const isUrgent = initialTime > 0 && timeLeft <= 5;

  return { timeLeft, percentage, isUrgent, reset };
}
