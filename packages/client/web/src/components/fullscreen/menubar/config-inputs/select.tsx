import { ButtonProps } from "@/components/ui/button";
import { FormControl, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  useSelectOpen,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SelectContentProps,
  SelectItemProps,
  SelectProps,
  SelectValueProps,
} from "@radix-ui/react-select";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  FocusableElement,
  FocusContainer,
  useFocusable,
} from "../../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContext } from "@noriginmedia/norigin-spatial-navigation";

type TriggerProps = ButtonProps & { label?: string };

const ConfigSelect = forwardRef<
  HTMLButtonElement,
  SelectProps & { triggerProps: TriggerProps }
>(
  (
    { children, triggerProps, open: _open, defaultOpen, ...props },
    forwardedRef,
  ) => {
    const { label, className, ...rest } = triggerProps;
    const [open, setOpen] = useState(defaultOpen ?? false);

    const contentFocus = useFocusable<HTMLDivElement>({
      isFocusBoundary: true,
      focusable: false,
      focusKey: rest.id + "-content",
    });

    const triggerFocus = useFocusable<HTMLButtonElement>({
      focusKey: rest.id + "-open",
      onFocus: ({ node }) => {
        node?.focus();
      },
      onBlur: ({ node }) => {
        if (node === document.activeElement) {
          node?.blur();
        }
      },
    });

    useImperativeHandle(forwardedRef, () => triggerFocus.ref.current!);

    const handleOpen = useCallback(() => {
      setOpen(true);
      contentFocus.focusSelf();
    }, [setOpen, contentFocus]);

    const handleClose = useCallback(() => {
      setOpen(false);
      triggerFocus.focusSelf();
    }, [setOpen, triggerFocus]);

    const onOpenChange = useCallback(
      (val: boolean) => {
        setOpen(val);
        props.onOpenChange?.(val);

        if (val) {
          contentFocus.focusSelf();
        } else {
          triggerFocus.focusSelf();
        }
      },
      [setOpen, props, contentFocus, triggerFocus],
    );

    return (
      <Select {...props} open={open} onOpenChange={onOpenChange}>
        <div
          className={cn(
            "relative flex flex-col pt-1 bg-transparent transition-colors",
            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
            "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
            "hover:before:w-1 hover:bg-secondary/20 before:rounded-r",
          )}
        >
          {label ? (
            <FormLabel
              htmlFor={rest.id}
              className="text-xs font-semibold uppercase text-muted-foreground px-4"
            >
              {label}
            </FormLabel>
          ) : (
            <></>
          )}

          <HotkeyLayer
            id={rest.id}
            handlers={{
              ACCEPT: {
                handler: () => handleOpen(),
              },
            }}
          >
            <SelectTrigger
              ref={triggerFocus.ref}
              {...rest}
              className={cn(
                "border-none focus:ring-0 bg-transparent focus:ring-transparent ring-offset-transparent",
                "px-4 py-0 text-base hover:bg-transparent",
                className,
              )}
            >
              <SelectValue />
            </SelectTrigger>
          </HotkeyLayer>
        </div>

        <FocusContext.Provider value={contentFocus.focusKey}>
          <div ref={contentFocus.ref}>
            <SelectContent>
              <HotkeyLayer
                id={rest.id}
                handlers={{ BACK: { handler: () => handleClose() } }}
              >
                {children}
              </HotkeyLayer>
            </SelectContent>
          </div>
        </FocusContext.Provider>
      </Select>
    );
  },
);

const ConfigSelectTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  (props, forwardedRef) => {
    const ref = useRef<HTMLButtonElement>(null!);
    useImperativeHandle(forwardedRef, () => ref.current);
    const { children, className, label, ...rest } = props;
    const [_, setOpen] = useSelectOpen();

    const id = `${label}-${rest.id}-trigger`;

    return (
      <div
        className={cn(
          "relative flex flex-col px-2 pt-2 pl-0 bg-transparent transition-colors",
          "before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-secondary before:transition-all",
          "before:rounded-r",
          "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
          "hover:before:w-1 hover:bg-secondary/20",
        )}
      >
        {label ? (
          <FormLabel
            htmlFor={id}
            className="font-semibold uppercase text-muted-foreground pl-4"
          >
            {label}
          </FormLabel>
        ) : (
          <></>
        )}
        <FormControl>
          <HotkeyLayer
            id={props.id}
            handlers={{
              ACCEPT: {
                handler: () => setOpen(true),
              },
            }}
          >
            <FocusableElement
              opts={{
                focusKey: props.id,
              }}
            >
              <SelectTrigger
                id={id}
                ref={ref}
                {...rest}
                className={cn(
                  "border-none focus:ring-0 bg-transparent focus:ring-transparent ring-offset-transparent",
                  "pl-4 py-0 text-xl hover:bg-transparent",
                  className,
                )}
              >
                {children}
              </SelectTrigger>
            </FocusableElement>
          </HotkeyLayer>
        </FormControl>
      </div>
    );
  },
);

ConfigSelectTrigger.displayName = "ConfigSelectTrigger";

const ConfigSelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  (props, ref) => {
    const { children, className, ...rest } = props;
    const [open, setOpen] = useSelectOpen();

    return (
      <SelectContent ref={ref} {...rest} className={cn(className)}>
        <HotkeyLayer
          id={props.id}
          handlers={{ BACK: { handler: () => setOpen(false) } }}
        >
          {open ? (
            <FocusContainer
              initialFocus
              opts={{
                isFocusBoundary: true,
                focusKey: props.id,
                focusable: false,
              }}
            >
              {children}
            </FocusContainer>
          ) : (
            children
          )}
        </HotkeyLayer>
      </SelectContent>
    );
  },
);

ConfigSelectContent.displayName = "ConfigSelectContent";

const ConfigSelectValue = forwardRef<HTMLDivElement, SelectValueProps>(
  (props, ref) => {
    const { children, className, ...rest } = props;

    return (
      <SelectValue ref={ref} {...rest} className={className}>
        {children}
      </SelectValue>
    );
  },
);

ConfigSelectValue.displayName = "ConfigSelectValue";

const ConfigSelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (props, forwardedRef) => {
    const { ref, focused, focusSelf } = useFocusable<HTMLDivElement>({
      focusKey: props.id,
      onFocus: ({ node }) => {
        if (node !== document.activeElement) {
          node?.focus();
        }
      },
      onBlur: ({ node }) => {
        if (node === document.activeElement) {
          node?.blur();
        }
      },
    });

    useImperativeHandle(forwardedRef, () => ref.current!);
    const { children, className, ...rest } = props;

    return (
      <HotkeyLayer
        id={props.id}
        handlers={{
          ACCEPT: {
            handler: () => {
              ref.current?.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "Enter",
                  bubbles: true,
                  cancelable: true,
                }),
              );
            },
          },
        }}
      >
        <SelectItem
          ref={ref}
          {...rest}
          className={cn("text-base", className)}
          onFocus={() => {
            if (!focused) {
              focusSelf();
            }
          }}
        >
          {children}
        </SelectItem>
      </HotkeyLayer>
    );
  },
);

ConfigSelectItem.displayName = "ConfigSelectItem";

export {
  ConfigSelect,
  ConfigSelectTrigger,
  ConfigSelectContent,
  ConfigSelectValue,
  ConfigSelectItem,
};
