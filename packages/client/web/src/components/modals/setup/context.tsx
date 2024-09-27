import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

export type Step = "ServerHost" | "ClientName" | "Confirm";

const SetupModalContext = createContext<
  | {
      step: Step;
      nextStep?: () => void;
      previousStep?: () => void;
      setStep: Dispatch<SetStateAction<Step>>;
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
  ServerHost: "ClientName",
  ClientName: "Confirm",
  Confirm: "ServerHost",
};

const previousStepTransitions: Record<Step, Step | undefined> = {
  ServerHost: undefined,
  ClientName: "ServerHost",
  Confirm: "ClientName",
};

export function SetupModalProvider(props: React.PropsWithChildren) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("ServerHost");

  const transition = useMemo(() => {
    const nextStep = nextStepTransitions[step];

    switch (step) {
      case "Confirm": {
        return () => {
          navigate({
            search: { setupModal: undefined },
          }).then(() => {
            setStep("ServerHost");
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
        setStep,
      }}
    >
      {props.children}
    </SetupModalContext.Provider>
  );
}
