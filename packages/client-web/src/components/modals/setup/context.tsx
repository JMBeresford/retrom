import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

export type Step = "Mode" | "ServerHost" | "ClientName" | "Confirm";

const SetupModalContext = createContext<
  | {
      step: Step;
      nextStep?: () => void;
      previousStep?: () => void;
      setStep: Dispatch<SetStateAction<Step>>;
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
  Mode: undefined,
  ServerHost: "ClientName",
  ClientName: "Confirm",
  Confirm: "Mode",
};

const previousStepTransitions: Record<Step, Step | undefined> = {
  Mode: undefined,
  ServerHost: "Mode",
  ClientName: "Mode",
  Confirm: "ClientName",
};

export function SetupModalProvider(props: React.PropsWithChildren) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("Mode");

  const transition = useMemo(() => {
    const nextStep = nextStepTransitions[step];

    switch (step) {
      case "Confirm": {
        return () => {
          navigate({
            to: ".",
            search: (prev) => ({ ...prev, setupModal: undefined }),
          })
            .then(() => {
              setStep("Mode");
            })
            .catch(console.error);
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
        setStep,
      }}
    >
      {props.children}
    </SetupModalContext.Provider>
  );
}
