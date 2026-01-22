import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type Fallback = string | (() => string);

export const useBack = (fallback: Fallback) => {
  const navigate = useNavigate();

  return useCallback(() => {
    const canUseHistory =
      typeof window !== "undefined" && window.history.length > 1;
    if (canUseHistory) {
      navigate(-1);
      return;
    }
    const target = typeof fallback === "function" ? fallback() : fallback;
    if (target) navigate(target);
  }, [navigate, fallback]);
};

export default useBack;
