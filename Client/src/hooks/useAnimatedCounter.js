// frontend/src/hooks/useAnimatedCounter.js
import { useState, useEffect, useRef } from "react";

export const useAnimatedCounter = (
  target,
  duration = 2000,
  startOnMount = true,
) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out quadratic for natural feel
    const easeProgress = 1 - Math.pow(1 - progress, 2);

    const currentCount = Math.floor(target * easeProgress);
    countRef.current = currentCount;
    setCount(currentCount);

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setCount(target); // Ensure exact final value
    }
  };

  const startAnimation = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    countRef.current = 0;
    setCount(0);
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startOnMount && target > 0) {
      startAnimation();
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startOnMount]);

  return { count, startAnimation };
};
