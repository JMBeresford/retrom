import { Button } from "@retrom/ui-next/components/button";
import { Loader2 } from "lucide-react";
import { cn } from "@retrom/ui-next/lib/utils";
import { emulatorFormOptions, useEmulatorFormContext } from "./defs";

export function SubmitButton() {
  const form = useEmulatorFormContext({ ...emulatorFormOptions });

  const handleSubmit = () => {
    form.handleSubmit().catch(console.error);
  };

  return (
    <form.Subscribe>
      {({ isValid, isSubmitting }) => (
        <Button
          type="button"
          className="relative"
          variant={isValid ? "default" : "destructive"}
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          <span
            className={cn(
              "transition-opacity opacity-100",
              isSubmitting && "opacity-0",
            )}
          >
            Save
          </span>
          <Loader2
            className={cn(
              "animate-spin absolute transition-opacity opacity-0",
              isSubmitting && "opacity-100",
            )}
          />
        </Button>
      )}
    </form.Subscribe>
  );
}
