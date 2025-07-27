import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type RetromInputDevice = (typeof RetromInputDevice)[number];
const RetromInputDevice = ["gamepad", "hotkeys", "touch"] as const;

type InputDeviceContext = Readonly<
  [RetromInputDevice, Dispatch<SetStateAction<RetromInputDevice>>]
>;

const context = createContext<InputDeviceContext | undefined>(undefined);

export function InputDeviceProvider(props: { children: React.ReactNode }) {
  const [inputDevice, setInputDevice] = useState<RetromInputDevice>("hotkeys");

  useEffect(() => {
    function handler() {
      setInputDevice("touch");
    }

    window.addEventListener("touchstart", handler, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handler);
    };
  }, []);

  const value = useMemo(
    () => [inputDevice, setInputDevice] as const,
    [inputDevice, setInputDevice],
  );

  return <context.Provider value={value}>{props.children}</context.Provider>;
}

export function useInputDeviceContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(
      "useInputDeviceContext must be used within a InputDeviceProvider",
    );
  }

  return ctx;
}
