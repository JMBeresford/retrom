import { useEffect, useRef } from "react";

export function useTraceUpdate(props: Record<string, unknown>) {
  const prev = useRef(props);

  useEffect(() => {
    const changedProps = Object.entries(props).reduce(
      (ps, [k, v]) => {
        if (prev.current[k] !== v) {
          ps[k] = [prev.current[k], v];
        }
        return ps;
      },
      {} as Record<string, unknown>,
    );

    if (Object.keys(changedProps).length > 0) {
      console.error("Changed props:", changedProps);
    }

    prev.current = props;
  });
}
