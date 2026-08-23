import { Moon, Sun } from "lucide-react";

import { Button } from "@retrom/ui-next/components/button";
import { useTheme } from "./store";

export function ModeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
