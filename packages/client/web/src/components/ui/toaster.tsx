import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { ToasterToast, useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ReactNode } from "@tanstack/react-router";
import { AlertCircleIcon, InfoIcon, LucideProps } from "lucide-react";

const TitleIcon: Record<
  NonNullable<ToasterToast["variant"]>,
  (props: LucideProps) => ReactNode
> = {
  default: ({ className, ...props }: LucideProps) => (
    <InfoIcon {...props} className={cn(className, "text-primary")} />
  ),
  destructive: ({ className, ...props }: LucideProps) => (
    <AlertCircleIcon
      {...props}
      className={cn(className, "text-destructive-text")}
    />
  ),
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const Icon = TitleIcon[props.variant ?? "default"];

        return (
          <Toast key={id} {...props}>
            <div className="flex gap-2">
              <div className="text-xs">
                <Icon size="1.35rem" className="p-0 m-0" />
              </div>
              <div className={cn("grid gap-1")}>
                {title && (
                  <ToastTitle
                    className={cn(!description && "flex items-center")}
                  >
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}

      <ToastViewport className={cn("gap-2 w-max")} />
    </ToastProvider>
  );
}
