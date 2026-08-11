"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const LOADING_SYMBOL_SRC = "/images/loading-symbol.gif";

interface LoadingScreenProps {
  /** Accessible status text for screen readers */
  label?: string;
  /** Fill the viewport (default) vs. sit inline in a parent */
  fullPage?: boolean;
  className?: string;
}

export function LoadingSymbol({
  className = "",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOADING_SYMBOL_SRC}
      alt={alt}
      width={637}
      height={358}
      className={["loading-symbol", className].filter(Boolean).join(" ")}
      draggable={false}
    />
  );
}

export function LoadingScreen({
  label = "Loading",
  fullPage = true,
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={[
        "loading-screen",
        fullPage ? "loading-screen--full" : "loading-screen--inline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-screen__stage">
        <div className="loading-symbol-wrap">
          <LoadingSymbol />
        </div>
        <div className="loading-screen__label" aria-hidden>
          Create-a-Class
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

type LoadingContextValue = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [locks, setLocks] = useState(0);

  const startLoading = useCallback(() => {
    setLocks((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLocks((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo(
    () => ({
      isLoading: locks > 0,
      startLoading,
      stopLoading,
    }),
    [locks, startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {locks > 0 ? (
        <div className="loading-screen loading-screen--overlay" aria-live="polite">
          <div className="loading-screen__stage">
            <div className="loading-symbol-wrap">
              <LoadingSymbol />
            </div>
            <div className="loading-screen__label" aria-hidden>
              Create-a-Class
            </div>
          </div>
          <span className="sr-only">Loading</span>
        </div>
      ) : null}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return ctx;
}

/** Keep the global loading overlay up while `active` is true. */
export function useLoadingGate(active: boolean) {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (!active) return;
    startLoading();
    return () => stopLoading();
  }, [active, startLoading, stopLoading]);
}
