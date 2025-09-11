import { cva, VariantProps } from "class-variance-authority";
import {
  AlertCircleIcon,
  InfoIcon,
  LoaderCircleIcon,
  LucideProps,
  LucideX,
} from "lucide-react";
import {
  ToastT,
  Toaster as SonnerToaster,
  ToasterProps,
  toast as sonnerToast,
  useSonner,
  ExternalToast,
} from "sonner";
import { cn } from "../lib/utils";
import { Button } from "./button";

const MAX_TOASTS = 5;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme={"dark"}
      className={cn(
        "toaster group/toaster *:w-full",
        "*:data-[front=false]:data-[expanded=false]:overflow-y-hidden",
      )}
      toastOptions={{
        className: cn(
          "group/toast relative",
          "[&_*]:data-[description]:hidden",
          "[&_*]:data-[action]:hidden",
          "*:[&:not([data-content])]:hidden",
        ),
      }}
      visibleToasts={MAX_TOASTS}
      icons={{
        loading: <LoaderCircleIcon className="animate-spin" />,
      }}
      {...props}
    ></SonnerToaster>
  );
};

const toastVariants = cva(
  cn(
    "relative flex gap-2 items-center",
    "overflow-y-hidden p-2 py-4 rounded-lg border",
    "animate-in slide-in-from-bottom fade-in",
  ),
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        warning: "border-yellow-800 [&_*]:border-yellow-800 bg-yellow-950",
        destructive:
          "destructive group border-destructive bg-destructive-muted text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastProps = Pick<ToastT, "title"> &
  ExternalToast &
  VariantProps<typeof toastVariants>;

const TitleIcon: Record<
  NonNullable<ToastProps["variant"]>,
  (props: LucideProps) => React.ReactNode
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

function ToastTitle(props: ToastProps) {
  return props.title ? (
    typeof props.title !== "function" ? (
      <p className="text-sm font-semibold">{props.title}</p>
    ) : (
      <props.title />
    )
  ) : null;
}

function ToastDescription(props: ToastProps) {
  return props.description ? (
    typeof props.description !== "function" ? (
      <p className="text-sm text-muted-foreground">{props.description}</p>
    ) : (
      <props.description />
    )
  ) : null;
}

function ToastAction({ action, id }: ToastProps): React.ReactNode {
  return action ? (
    typeof action === "object" && "label" in action ? (
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          action.onClick(e);
          if (!e.defaultPrevented) {
            toast.dismiss(id);
          }
        }}
      >
        {action.label}
      </Button>
    ) : (
      <Button size="sm" variant="ghost" asChild>
        {action}
      </Button>
    )
  ) : null;
}

function Toast(props: ToastProps) {
  const { id, className, dismissible = true, closeButton = true } = props;
  const variant = props.variant ?? "default";

  const Icon = props.icon ? () => <>{props.icon}</> : TitleIcon[variant];

  return (
    <div
      onClick={dismissible ? () => sonnerToast.dismiss(id) : undefined}
      className={cn(
        toastVariants({ variant }),
        "pr-4",
        dismissible && closeButton && "pr-6",
        className,
      )}
    >
      <div className="flex flex-col justify-center">
        <Icon width={20} height={20} />
      </div>
      <div className={cn("flex flex-col gap-1 justify-center")}>
        <ToastTitle {...props} />

        <ToastDescription {...props} />
      </div>
      <div className="flex flex-col justify-center ml-auto">
        <ToastAction {...props} />
      </div>
      {dismissible && closeButton ? (
        <LucideX
          size={14}
          className={cn(
            "absolute right-[8px] top-[8px] cursor-pointer",
            "transition-opacity opacity-0 group-hover/toast:opacity-100",
          )}
        />
      ) : null}
    </div>
  );
}

const handleToast = (opts: ToastProps) =>
  sonnerToast.custom((id) => <Toast id={id} {...opts} />, {
    ...opts,
  });

const toast = (opts: ToastProps) => {
  const id = handleToast(opts);

  const update = (opts: Omit<ToastProps, "id">) => handleToast({ ...opts, id });
  const dismiss = () => sonnerToast.dismiss(id);

  return { id, dismiss, update };
};

toast.dismiss = sonnerToast.dismiss;

export { Toaster, toast, useSonner };
export type * from "sonner";
