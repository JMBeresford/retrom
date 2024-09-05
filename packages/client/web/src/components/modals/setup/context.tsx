import { checkIsDesktop } from "@/lib/env";
import { useNavigate } from "@tanstack/react-router";
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

// eslint-disable-next-line react-refresh/only-export-components -- we need to export this hook
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

export function SetupModalProvider(props: React.PropsWithChildren) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("server-host");

  const transition = useMemo(() => {
    const nextStep = nextStepTransitions[step];

    switch (step) {
      case "confirm": {
        return () => {
          navigate({
            search: { setupModal: undefined },
          });
        };
      }
      default: {
        if (nextStep) {
          return () => setStep(nextStep);
        }
      }
    }
  }, [step, navigate]);

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
