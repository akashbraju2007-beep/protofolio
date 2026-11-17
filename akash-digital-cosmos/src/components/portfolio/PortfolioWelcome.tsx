import { useEffect, useState, type ReactNode } from "react";
import {
  WELCOME_FADE_MS,
  WELCOME_DURATION_MS,
  WELCOME_TIMEOUT_MS,
  shouldRevealWelcome,
} from "./welcome-timing";

const visitKey = "akash-portfolio-welcomed";

export function PortfolioWelcome({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "revealing" | "done">("loading");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let returning = false;
    try {
      returning = sessionStorage.getItem(visitKey) === "yes";
    } catch {
      /* Storage is optional. */
    }
    if (returning) {
      setPhase("done");
      return;
    }

    const started = performance.now();
    let ready = document.readyState === "complete" || document.readyState === "interactive";
    let revealed = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      if (revealed || !shouldRevealWelcome(performance.now() - started, ready, false, reduced))
        return;
      revealed = true;
      try {
        sessionStorage.setItem(visitKey, "yes");
      } catch {
        /* Continue without persistence. */
      }
      setPhase("revealing");
      fadeTimer = setTimeout(() => setPhase("done"), reduced ? 30 : WELCOME_FADE_MS);
    };
    const loaded = () => {
      ready = true;
      check();
    };
    if (!ready) {
      window.addEventListener("load", loaded, { once: true });
    }
    const minimumTimer = setTimeout(check, (reduced ? 150 : WELCOME_DURATION_MS) + 20);
    const fallbackTimer = setTimeout(() => {
      ready = true;
      check();
    }, WELCOME_TIMEOUT_MS + 20);
    check();
    return () => {
      window.removeEventListener("load", loaded);
      clearTimeout(minimumTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div className="portfolio-entry" data-phase={phase}>
      {phase !== "done" && (
        <div
          className="portfolio-welcome fixed inset-0 z-[200] flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 text-foreground"
          role="status"
          aria-label="Welcome to Akash B Raju’s portfolio"
        >
          <div
            className="welcome-frame absolute inset-5 border border-border/40 sm:inset-8"
            aria-hidden="true"
          />
          <div className="welcome-content relative flex w-full max-w-md flex-col items-center text-center">
            <span className="mb-9 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              AKASH B RAJU / PORTFOLIO
            </span>
            <div
              className="welcome-monogram relative mb-9 flex h-28 w-28 items-center justify-center"
              aria-hidden="true"
            >
              <span className="welcome-monogram-ring absolute inset-0 border border-primary/40" />
              <span className="font-display text-5xl font-semibold text-primary">
                ABR<span className="text-accent">.</span>
              </span>
            </div>
            <h1 className="welcome-heading font-display text-2xl font-medium sm:text-3xl">
              Welcome to My Portfolio
            </h1>
            <p className="welcome-subtitle mt-3 text-sm text-muted-foreground sm:text-base">
              Aspiring Software Developer
            </p>
            <div className="mt-10 h-px w-48 overflow-hidden bg-border" aria-hidden="true">
              <div className="welcome-progress h-full w-full origin-left bg-primary" />
            </div>
            <div
              className="mt-4 flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground"
              aria-hidden="true"
            >
              <span className="h-1 w-1 bg-accent" />
              NIAT INSTITUTION
            </div>
          </div>
        </div>
      )}
      <div
        className="portfolio-reveal"
        inert={phase === "loading"}
        aria-hidden={phase === "loading" ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
