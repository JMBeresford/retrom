import { Button, ButtonProps } from "@retrom/ui/components/button";
import { cn } from "@retrom/ui/lib/utils";
import { HotkeyLayer, HotkeyLayerProps } from "@/providers/hotkeys/layers";
import { useFocusable, UseFocusableConfig } from "../focus-container";
import { forwardRef, ReactNode, useId, useImperativeHandle } from "react";

type Props = Omit<ButtonProps, "size"> &
  Partial<Pick<HotkeyLayerProps, "allowBubbling" | "handlers">> & {
    label?: ReactNode;
    focusOpts?: UseFocusableConfig<HTMLButtonElement>;
    size?: "sm";
  };

export const MenuEntryButton = forwardRef<HTMLButtonElement, Props>(
  (props: Props, forwardedRef) => {
    const {
      children,
      className,
      type = "button",
      handlers,
      allowBubbling,
      id: _id,
      focusOpts,
      onFocus,
      label,
      size,
      ...rest
    } = props;

    const genId = useId();
    const id = _id ?? genId;

    const { ref, focused, focusSelf } = useFocusable<HTMLButtonElement>({
      focusKey: id,
      focusable: !rest.disabled,
      ...focusOpts,
    });

    useImperativeHandle(forwardedRef, () => ref.current!);

    return (
      <HotkeyLayer
        id={`${id}-hotkeys`}
        allowBubbling={allowBubbling}
        handlers={{
          ...handlers,
          ACCEPT: {
            handler: () => ref.current?.click(),
            ...handlers?.ACCEPT,
            actionBar: {
              label: "Accept",
              position: "right",
              ...handlers?.ACCEPT?.actionBar,
            },
          },
        }}
      >
        <Button
          ref={ref}
          id={id}
          variant="ghost"
          type={type}
          size={size}
          {...rest}
          onFocus={(e) => {
            if (!focused && e.target === e.currentTarget) {
              focusSelf();
            }

            onFocus?.(e);
          }}
          className={cn(
            size === "sm" ? "text-sm py-1" : "text-base py-4 sm:py-3",
            "font-semibold relative pl-4 pr-8 h-max overflow-hidden w-full",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
            "justify-start focus-hover:bg-secondary/30 rounded-none transition-all",
            "text-foreground focus-hover:text-accent-text",

            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-border",
            "before:transition-all before:rounded-r",

            "focus-hover:before:bg-accent focus-hover:before:w-1",
            "data-[state=active]:before:w-1",
            "data-[state=active]:text-accent-text",
            label && "flex flex-col items-start sm:py-2",
            className,
          )}
        >
          {label ? (
            <>
              <span>{children}</span>
              <span className="text-muted-foreground text-sm font-light">
                {label}
              </span>
            </>
          ) : (
            children
          )}
        </Button>
      </HotkeyLayer>
    );
  },
);

MenuEntryButton.displayName = "MenuEntryButton";
