"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export interface TourStep {
  id: string;
  durationMs: number;
  caption: string;
  focusElement?: string;
  activeTab?: "floor" | "ai" | "trends" | "alerts";
}

export function useTourPlayer(script: TourStep[]) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // ms elapsed in current step before the current play session started
  const pausedElapsedRef = useRef(0);
  // timestamp when current play session started
  const playStartedAtRef = useRef<number>(Date.now());

  const totalMs = script.reduce((s, st) => s + st.durationMs, 0);

  // Advancement timer
  useEffect(() => {
    if (isPaused || isComplete) return;
    playStartedAtRef.current = Date.now();
    const remaining = script[stepIndex].durationMs - pausedElapsedRef.current;
    const id = setTimeout(() => {
      pausedElapsedRef.current = 0;
      if (stepIndex + 1 >= script.length) {
        setIsComplete(true);
      } else {
        setStepIndex(stepIndex + 1);
      }
    }, Math.max(0, remaining));
    return () => clearTimeout(id);
  }, [stepIndex, isPaused, isComplete, script]);

  // Progress tracker — 100ms interval
  useEffect(() => {
    if (isComplete) { setProgress(1); return; }
    if (isPaused) return;
    const stepOffsetMs = script.slice(0, stepIndex).reduce((s, st) => s + st.durationMs, 0);
    const id = setInterval(() => {
      const sessionElapsed = Date.now() - playStartedAtRef.current;
      const stepElapsed = pausedElapsedRef.current + sessionElapsed;
      const stepPct = Math.min(stepElapsed / script[stepIndex].durationMs, 1);
      setProgress((stepOffsetMs + stepPct * script[stepIndex].durationMs) / totalMs);
    }, 100);
    return () => clearInterval(id);
  }, [stepIndex, isPaused, isComplete, script, totalMs]);

  // Pause on tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden" && !isPaused) {
        pausedElapsedRef.current += Date.now() - playStartedAtRef.current;
        setIsPaused(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isPaused]);

  const pause = useCallback(() => {
    if (isPaused || isComplete) return;
    pausedElapsedRef.current += Date.now() - playStartedAtRef.current;
    setIsPaused(true);
  }, [isPaused, isComplete]);

  const play = useCallback(() => {
    if (!isPaused || isComplete) return;
    setIsPaused(false);
  }, [isPaused, isComplete]);

  const skipNext = useCallback(() => {
    if (stepIndex >= script.length - 1) {
      setIsComplete(true);
      return;
    }
    pausedElapsedRef.current = 0;
    setIsComplete(false);
    setIsPaused(false);
    setStepIndex(stepIndex + 1);
  }, [stepIndex, script.length]);

  const skipPrev = useCallback(() => {
    if (stepIndex <= 0) return;
    pausedElapsedRef.current = 0;
    setIsComplete(false);
    setIsPaused(false);
    setStepIndex(stepIndex - 1);
  }, [stepIndex]);

  const restart = useCallback(() => {
    pausedElapsedRef.current = 0;
    setIsComplete(false);
    setIsPaused(false);
    setProgress(0);
    setStepIndex(0);
  }, []);

  return {
    currentStep: script[stepIndex],
    currentStepIndex: stepIndex,
    totalSteps: script.length,
    progress,
    isPaused,
    isComplete,
    controls: { play, pause, skipNext, skipPrev, restart },
  };
}
