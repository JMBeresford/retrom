import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

type RetromInputDevice = (typeof RetromInputDevice)[number];
const RetromInputDevice = ["keyboard-mouse", "gamepad", "hotkeys"] as const;

type InputDeviceContext = [
  RetromInputDevice,
  Dispatch<SetStateAction<RetromInputDevice>>,
];

const context = createContext<InputDeviceContext | undefined>(undefined);

export function InputDeviceProvider(props: { children: React.ReactNode }) {
  const value = useState<RetromInputDevice>("keyboard-mouse");

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
