"use client";

import { checkIsDesktop } from "@/lib/env";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";

export type Step = "server-host" | "client-name" | "confirm" | "done";

const SetupModalContext = createContext<
  | {
      step: Step;
      nextStep?: () => void;
      previousStep?: () => void;
    }
  | undefined
>(undefined);

export function useSetupModal() {
  const context = useContext(SetupModalContext);

  if (!context) {
    throw new Error("useSetupModal must be used within a SetupModalProvider");
  }

  return context;
}

const nextStepTransitions: Record<Step, Step | undefined> = {
  "server-host": checkIsDesktop() ? "client-name" : "confirm",
  "client-name": "confirm",
  confirm: "done",
  done: undefined,
};

const previousStepTransitions: Record<Step, Step | undefined> = {
  "server-host": undefined,
  "client-name": "server-host",
  confirm: checkIsDesktop() ? "client-name" : "server-host",
  done: undefined,
};

export function SetupModalProvider(props: React.PropsWithChildren<{}>) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("server-host");

  const transition = useMemo(() => {
    const nextStep = nextStepTransitions[step];

    switch (step) {
      case "confirm": {
        return () => {
          router.push("/");
        };
      }
      default: {
        if (nextStep) {
          return () => setStep(nextStep);
        }
      }
    }
  }, [step, router]);

  const nextStep = useMemo(() => {
    if (transition) {
      return () => {
        transition();
      };
    }
  }, [transition]);

  const previousStep = useMemo(() => {
    const previousStep = previousStepTransitions[step];
    if (previousStep) {
      return () => setStep(previousStep);
    }

    return undefined;
  }, [step]);

  return (
    <SetupModalContext.Provider
      value={{
        step,
        nextStep,
        previousStep,
      }}
    >
      {props.children}
    </SetupModalContext.Provider>
  );
}
