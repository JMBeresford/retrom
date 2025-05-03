import { cn } from "@/lib/utils";
import {
  FocusContext,
  useFocusable as useFocusableImpl,
  UseFocusableConfig as UseFocusableConfigImpl,
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
  const { onFocus, onBlur, ...restOpts } = opts;

  const onFocusHandler: NonNullable<typeof onFocus> = useCallback(
    (layout, ...args) => {
      if (document.activeElement !== layout.node) {
        layout.node.focus();
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
    if (opts.initialFocus && !focusable.focused) {
      focusable.focusSelf();
    }
  }, [focusable, opts.initialFocus]);

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
