import { cn } from "@/lib/utils";
import {
  FocusContext,
  useFocusable,
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

  useImperativeHandle(forwardedRef, () => ref.current);

  useEffect(() => {
    if (initialFocus) {
      focusSelf();
    }
  }, [focusSelf, initialFocus]);

  const onClickHandler = useCallback(
    (e: MouseEvent<T>) => {
      focusSelf();
      child.props.onClick?.(e);
      onClick?.(e);
    },
    [onClick, focusSelf, child.props],
  );

  return cloneElement(child, {
    ...rest,
    ...children.props,
    ref,
    onClick: onClickHandler,
  });
}

export const FocusableElement = forwardRef(FocusableElementImpl);
