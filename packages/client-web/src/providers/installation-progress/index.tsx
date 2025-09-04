import { checkIsDesktop } from "@/lib/env";
import { InstallationProgressUpdate } from "@retrom/codegen/retrom/client/installation_pb";
import {
  subscribeToInstallationUpdates,
  unsubscribeFromInstallationUpdates,
} from "@retrom/plugin-installer";
import { Channel } from "@tauri-apps/api/core";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import { createStore, StoreApi, useStore, Mutate } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type InstallationProgressContext = Record<
  number,
  InstallationProgressUpdate[]
>;

type InstallationProgressStore = Mutate<
  StoreApi<InstallationProgressContext>,
  [["zustand/subscribeWithSelector", never]]
>;

const InstallationProgressContext =
  createContext<InstallationProgressStore | null>(null);

export function InstallationProgressProvider(props: PropsWithChildren) {
  const storeRef = useRef<InstallationProgressStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createStore<InstallationProgressContext>()(
      subscribeWithSelector(() => ({})),
    );
  }

  useLayoutEffect(() => {
    const store = storeRef.current;

    let channel: Channel<InstallationProgressUpdate> | undefined;

    async function subscribe() {
      if (!store || !checkIsDesktop()) return;
      channel = await subscribeToInstallationUpdates((payload) => {
        console.log({ payload });
        const gameId = payload.gameId;

        store.setState((state) => {
          const current = state[gameId] || [];
          current.push(payload);
          return { [gameId]: current.slice(-1000) }; // Keep only the last 1000 updates
        });
      });
    }

    subscribe().catch(console.error);

    return () => {
      if (channel) {
        unsubscribeFromInstallationUpdates(channel).catch(console.error);
      }
    };
  }, []);

  return (
    <InstallationProgressContext.Provider value={storeRef.current}>
      {props.children}
    </InstallationProgressContext.Provider>
  );
}

export function useInstallationProgressStore() {
  const store = useContext(InstallationProgressContext);
  if (!store) {
    throw new Error("Missing InstallationProgressContext.Provider");
  }
  return store;
}

export const useInstallationProgressContext = <TReturn,>(
  selector: (state: InstallationProgressContext) => TReturn,
) => {
  const store = useInstallationProgressStore();
  return useStore(store, selector);
};
