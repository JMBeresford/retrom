import { cn } from "./utils";

export function Code(props: JSX.IntrinsicElements["code"]) {
  const { className, ...rest } = props;

  return (
    <code
      {...rest}
      className={cn(
        "relative rounded bg-secondary px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
    />
  );
}
