// src/hooks/useAnimatedCounter.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Animated number counter hook with easing, formatting, and controls.
 *
 * @param {number} target - The final number to animate to
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in ms (default: 2000)
 * @param {boolean} options.startOnMount - Auto-start on mount (default: true)
 * @param {number} options.decimals - Decimal places for float values (default: 0)
 * @param {Function} options.format - Custom formatter function (receives raw number)
 * @param {Function} options.onComplete - Callback when animation finishes
 * @param {boolean} options.enabled - Conditionally enable/disable animation
 * @param {number} options.delay - Delay before starting animation (ms)
 * @param {'up' | 'down'} options.direction - Count direction (default: 'up')
 *
 * @returns {Object} { count, formattedCount, progress, start, pause, resume, reset, isAnimating }
 */
export const useAnimatedCounter = (target, options = {}) => {
  const {
    duration = 2000,
    startOnMount = true,
    decimals = 0,
    format = null,
    onComplete = null,
    enabled = true,
    delay = 0,
    direction = "up",
  } = options;

  const [count, setCount] = useState(direction === "up" ? 0 : target);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const targetRef = useRef(target);
  const directionRef = useRef(direction);

  // Update refs when props change
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Easing function: ease-out quadratic for natural deceleration
  const easeOutQuad = (t) => 1 - Math.pow(1 - t, 2);

  // Core animation frame handler
  const animate = useCallback(
    (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(rawProgress);

      const startValue = directionRef.current === "up" ? 0 : targetRef.current;
      const endValue = directionRef.current === "up" ? targetRef.current : 0;
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      // Round to specified decimals
      const roundedValue = parseFloat(currentValue.toFixed(decimals));

      setCount(roundedValue);
      setProgress(rawProgress);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure exact final value
        setCount(targetRef.current);
        setProgress(1);
        setIsAnimating(false);

        // Trigger completion callback
        if (typeof onComplete === "function") {
          onComplete(targetRef.current);
        }
      }
    },
    [duration, decimals, onComplete],
  );

  // Start the animation (with optional delay)
  const start = useCallback(() => {
    if (!enabled) return;

    // Clear any existing animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);

    // Reset state
    const startValue = directionRef.current === "up" ? 0 : targetRef.current;
    setCount(startValue);
    setProgress(0);
    setIsAnimating(true);
    startTimeRef.current = null;

    // Start after delay if specified
    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [enabled, delay, animate]);

  // Pause the animation at current value
  const pause = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setIsAnimating(false);
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Resume from paused state
  const resume = useCallback(() => {
    if (isAnimating || !enabled) return;

    // Adjust start time to account for elapsed progress
    if (progress > 0 && progress < 1) {
      const elapsedAtPause = progress * duration;
      startTimeRef.current = performance.now() - elapsedAtPause;
    }

    setIsAnimating(true);
    rafRef.current = requestAnimationFrame(animate);
  }, [isAnimating, enabled, progress, duration, animate]);

  // Reset to initial state
  const reset = useCallback(() => {
    pause();
    const startValue = directionRef.current === "up" ? 0 : targetRef.current;
    setCount(startValue);
    setProgress(0);
  }, [pause]);

  // Format the count for display (e.g., ₱1,240, 24.8k, 99.9%)
  const formattedCount = format
    ? format(count)
    : decimals > 0
      ? count.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : count.toLocaleString();

  // Auto-start on mount if configured
  useEffect(() => {
    if (enabled && startOnMount && target !== undefined) {
      start();
    }

    // Cleanup on unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    };
  }, [enabled, startOnMount, target, start]);

  // Re-run animation when target changes (optional behavior)
  useEffect(() => {
    if (enabled && !startOnMount && target !== undefined) {
      start();
    }
  }, [target, enabled, startOnMount, start]);

  return {
    count, // Raw numeric value
    formattedCount, // Formatted string for display
    progress, // 0-1 animation progress (useful for progress bars)
    isAnimating, // Boolean: currently animating?
    start, // Start/restart animation
    pause, // Pause at current value
    resume, // Resume from pause
    reset, // Reset to initial state
  };
};

