import { File } from "@retrom/codegen/retrom/files";
import { useMutation } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { useApiUrl } from "@/utils/useApiUrl";

export function useRemoteFiles() {
  const apiUrl = useApiUrl();
  const retromClient = useRetromClient();

  const uploadFiles = useMutation({
    mutationKey: ["upload-file", apiUrl],
    mutationFn: async (files: File[]) => {
      return Promise.allSettled(
        files.map(async (file) => {
          if (!file.stat?.path) throw new Error("Missing path for file");

          const url = new URL(`./rest/public/${file.stat.path}`, apiUrl);
          const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(file, (_k, v: unknown) => {
              if (v instanceof Uint8Array) {
                return Array.from(v);
              }

              return v;
            }),
            headers: {
              ["Content-Type"]: "application/json",
            },
          });

          if (!res.ok) {
            throw new Error(`Failed to upload save: ${res.statusText}`);
          }

          return res;
        }),
      );
    },
  });

  const downloadFiles = useMutation({
    mutationKey: ["download-file", apiUrl],
    mutationFn: async (path: string) => {
      const publicUrl = new URL("./rest/public/", apiUrl);

      try {
        const { stats } = await retromClient.fileExplorerClient.getStat({
          path,
        });

        const files = await Promise.all(
          stats.map((stat) =>
            fetch(new URL(`./${stat.path}`, publicUrl).toString()).then(
              async (r) => ({
                stat,
                data: new Uint8Array(await r.arrayBuffer()),
              }),
            ),
          ),
        );

        return files;
      } catch (e) {
        console.error(e);
      }
    },
  });

  return {
    uploadFiles,
    downloadFiles,
  };
}
