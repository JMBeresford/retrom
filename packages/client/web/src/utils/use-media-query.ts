import { useState, useEffect } from "react";

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const listener = () => {
      const media = window.matchMedia(query);
      console.log({ media });
      setMatches(media.matches);
    };

    listener();
    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [query]);

  return matches;
};
