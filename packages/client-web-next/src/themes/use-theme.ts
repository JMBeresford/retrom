import { useContext } from "react";
import { ThemeProviderContext } from "./context";

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  return context;
}
