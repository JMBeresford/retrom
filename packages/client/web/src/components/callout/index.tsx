import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Separator } from "../ui/separator";
import { InfoIcon, LucideProps, CircleAlertIcon } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";

export type CalloutProps = {
  title?: string;
} & VariantProps<typeof iconVariants>;

const iconVariants = cva("w-[1rem] h-[1rem]", {
  variants: {
    variant: {
      info: "text-primary",
      warn: "text-yellow-300",
      destructive: "text-destructive-text",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const IconMap: Record<
  NonNullable<CalloutProps["variant"]>,
  (props: LucideProps) => ReactNode
> = {
  info: (props) => <InfoIcon {...props} />,
  warn: (props) => <CircleAlertIcon {...props} />,
  destructive: (props) => <CircleAlertIcon {...props} />,
};

export function Callout(props: CalloutProps & JSX.IntrinsicElements["div"]) {
  const { variant, title: _, children, className, ...rest } = props;

  const Icon = IconMap[variant ?? "info"];

  return (
    <div
      className={cn(
        "grid gap-2 grid-flow-col grid-cols-[1fr,auto,1fr] items-center mb-4",
        className,
      )}
      {...rest}
    >
      <Separator />

      <div
        className={cn(
          "bg-muted text-muted-foreground p-2 rounded mt-2 mb-4",
          "flex gap-2 text-sm",
        )}
      >
        <Icon className={cn(iconVariants({ variant }))} />
        <div>{children}</div>
      </div>

      <Separator />
    </div>
  );
}
