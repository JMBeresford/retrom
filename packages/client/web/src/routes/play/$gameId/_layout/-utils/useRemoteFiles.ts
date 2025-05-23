import { File, FileStat } from "@retrom/codegen/retrom/files";
import { useMutation } from "@tanstack/react-query";
import { useRetromClient } from "@/providers/retrom-client";
import { useApiUrl } from "@/utils/useApiUrl";
import { useCallback, useMemo } from "react";

export function useRemoteFiles() {
  const apiUrl = useApiUrl();
  const retromClient = useRetromClient();

  const getPublicUrl = useCallback(
    (path: FileStat | string) => {
      path = typeof path === "string" ? path : path.path;

      const publicDir = new URL("./rest/public/", apiUrl);
      return new URL(`./${path}`, publicDir).toString();
    },
    [apiUrl],
  );

  const { mutate: mutateUpload, mutateAsync: mutateAsyncUpload } = useMutation({
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

  const { mutate: mutateDownload, mutateAsync: mutateAsyncDownload } =
    useMutation({
      mutationKey: ["download-file", getPublicUrl],
      mutationFn: async (path: string) => {
        try {
          const { stats } = await retromClient.fileExplorerClient.getStat({
            path,
          });

          const files = await Promise.all(
            stats.map((stat) =>
              fetch(getPublicUrl(stat).toString()).then(
                async (r) =>
                  ({
                    stat,
                    content: new Uint8Array(await r.arrayBuffer()),
                  }) satisfies File,
              ),
            ),
          );

          return files;
        } catch (e) {
          console.error(e);
          return [];
        }
      },
    });

  const { mutate: mutateDelete, mutateAsync: mutateAsyncDelete } = useMutation({
    mutationKey: ["delete-file", apiUrl],
    mutationFn: async (path: string) => {
      const url = getPublicUrl(path);
      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete file: ${res.statusText}`);
      }

      return res;
    },
  });

  return useMemo(
    () => ({
      uploadFiles: {
        mutate: mutateUpload,
        mutateAsync: mutateAsyncUpload,
      },
      downloadFiles: {
        mutate: mutateDownload,
        mutateAsync: mutateAsyncDownload,
      },
      deleteFiles: {
        mutate: mutateDelete,
        mutateAsync: mutateAsyncDelete,
      },
      getPublicUrl,
    }),
    [
      mutateUpload,
      mutateAsyncUpload,
      mutateDownload,
      mutateAsyncDownload,
      mutateDelete,
      mutateAsyncDelete,
      getPublicUrl,
    ],
  );
}
