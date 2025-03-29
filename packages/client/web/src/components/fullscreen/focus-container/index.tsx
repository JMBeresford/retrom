import { cn } from "@/lib/utils";
import {
  FocusContext,
  useFocusable as useFocusableImpl,
  UseFocusableConfig,
} from "@noriginmedia/norigin-spatial-navigation";
import {
  Children,
  cloneElement,
  ForwardedRef,
  forwardRef,
  HTMLProps,
  MouseEvent,
  PropsWithoutRef,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";

export function FocusContainer(
  props: {
    opts?: UseFocusableConfig<HTMLDivElement>;
    initialFocus?: boolean;
  } & JSX.IntrinsicElements["div"],
) {
  const { opts, initialFocus, className, ...rest } = props;
  const { ref, focusKey, focusSelf } = useFocusable<HTMLDivElement>({
    ...opts,
  });

  useEffect(() => {
    if (initialFocus) {
      focusSelf();
    }
  }, [focusSelf, initialFocus]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={cn("contents", className)} {...rest} />
    </FocusContext.Provider>
  );
}

export function useFocusable<T extends HTMLElement = HTMLElement>(
  ...opts: Parameters<typeof useFocusableImpl<T>>
) {
  const focusable = useFocusableImpl(...opts);
  const ref = focusable.ref as RefObject<T>;

  return { ...focusable, ref };
}

function FocusableElementImpl<T extends HTMLElement>(
  props: PropsWithoutRef<
    HTMLProps<T> & {
      opts?: UseFocusableConfig<T>;
      initialFocus?: boolean;
      children: ReactElement;
    }
  >,
  forwardedRef: ForwardedRef<T>,
) {
  const { opts, onClick, initialFocus, children, ...rest } = props;
  const { ref, focusSelf } = useFocusable({
    onFocus: ({ node }) => {
      node?.focus();
    },
    onBlur: ({ node }) => {
      if (node === document.activeElement) {
        node?.blur();
      }
    },
    ...opts,
  });

  const child = Children.only(children);
  const childProps = child.props as typeof props;

  useImperativeHandle(forwardedRef, () => ref.current!);

  useEffect(() => {
    if (initialFocus) {
      focusSelf();
    }
  }, [focusSelf, initialFocus]);

  const onClickHandler = useCallback(
    (e: MouseEvent<T>) => {
      focusSelf();
      childProps.onClick?.(e);
      onClick?.(e);
    },
    [onClick, focusSelf, childProps],
  );

  return cloneElement(child, {
    ...rest,
    ...childProps,
    ref,
    onClick: onClickHandler,
  });
}

export const FocusableElement = forwardRef(FocusableElementImpl);
