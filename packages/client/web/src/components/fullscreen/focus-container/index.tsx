import { cn } from "@/lib/utils";
import { useInputDeviceContext } from "@/providers/input-device";
import {
  FocusContext,
  setFocus,
  useFocusable as useFocusableImpl,
  UseFocusableConfig as UseFocusableConfigImpl,
  getCurrentFocusKey,
} from "@noriginmedia/norigin-spatial-navigation";
import { ReactNode, RefObject, useCallback, useEffect, useMemo } from "react";

export type FocusContainerProps = {
  opts?: UseFocusableConfig<HTMLDivElement>;
} & JSX.IntrinsicElements["div"];

export function FocusContainer(props: FocusContainerProps) {
  const { opts, className, ...rest } = props;
  const { ref, focusKey } = useFocusable<HTMLDivElement>(opts);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={cn(className)} {...rest} />
    </FocusContext.Provider>
  );
}

export type UseFocusableConfig<T> = UseFocusableConfigImpl<T> & {
  initialFocus?: boolean;
};

export function useFocusable<T extends HTMLElement>(
  opts: UseFocusableConfig<T> = {},
) {
  const [inputDevice] = useInputDeviceContext();
  const { onFocus, onBlur, ...restOpts } = opts;

  const onFocusHandler: NonNullable<typeof onFocus> = useCallback(
    (layout, ...args) => {
      if (document.activeElement !== layout.node) {
        layout.node?.focus();
      }

      onFocus?.(layout, ...args);
    },
    [onFocus],
  );

  const onBlurHandler: NonNullable<typeof onBlur> = useCallback(
    (layout, ...args) => {
      if (document.activeElement === layout.node) {
        layout.node?.blur();
      }

      onBlur?.(layout, ...args);
    },
    [onBlur],
  );

  const focusOpts = useMemo(
    () => ({
      ...restOpts,
      onFocus: onFocusHandler,
      onBlur: onBlurHandler,
    }),
    [restOpts, onFocusHandler, onBlurHandler],
  );

  const focusable = useFocusableImpl(focusOpts);
  const ref = focusable.ref as RefObject<T>;

  const value = useMemo(
    () => ({
      ...focusable,
      ref,
    }),
    [focusable, ref],
  );

  useEffect(() => {
    if (
      ["hotkeys", "gamepad"].includes(inputDevice) &&
      opts.focusKey &&
      opts.initialFocus &&
      getCurrentFocusKey() !== opts.focusKey
    ) {
      setFocus(opts.focusKey);
    }
  }, [opts.initialFocus, opts.focusKey, inputDevice]);

  return value;
}

export function FocusableElement<T extends HTMLElement>(props: {
  render: (ref: RefObject<T>) => ReactNode;
  opts: UseFocusableConfig<T>;
}) {
  const { opts, render } = props;
  const { ref } = useFocusable(opts);

  // const onClickHandler = useCallback(
  //   (e: MouseEvent<T>) => {
  //     focusSelf();
  //     childProps.onClick?.(e);
  //     onClick?.(e);
  //   },
  //   [onClick, focusSelf, childProps],
  // );

  return <>{render(ref)}</>;
}
