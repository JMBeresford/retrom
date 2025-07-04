import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { ToasterToast, useToastState } from "./use-toast";
import { cn } from "./utils";
import { ReactNode } from "react";
import { AlertCircleIcon, InfoIcon, LucideProps } from "lucide-react";

const TitleIcon: Record<
  NonNullable<ToasterToast["variant"]>,
  (props: LucideProps) => ReactNode
> = {
  default: ({ className, ...props }: LucideProps) => (
    <InfoIcon {...props} className={cn(className, "text-primary")} />
  ),
  warning: ({ className, ...props }: LucideProps) => (
    <AlertCircleIcon {...props} className={cn(className, "text-yellow-400")} />
  ),
  destructive: ({ className, ...props }: LucideProps) => (
    <AlertCircleIcon
      {...props}
      className={cn(className, "text-destructive-text")}
    />
  ),
};

export function Toaster() {
  const { toasts } = useToastState();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        ...props
      }: ToasterToast) {
        const Icon = TitleIcon[props.variant ?? "default"];

        return (
          <Toast key={id} {...props}>
            <div className="flex gap-2">
              <div className="text-xs">
                <Icon className="p-0 m-0 w-[1.35rem] h-[1.35rem]" />
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
