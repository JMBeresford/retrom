import { useApiUrl } from "./use-api-url";

export function usePublicUrl(path: string = "") {
  const apiUrl = useApiUrl();

  if (path.startsWith("retrom://")) {
    const url = new URL(path.replace("retrom://", ""), apiUrl);

    return url.toString();
  } else {
    return path;
  }
}
