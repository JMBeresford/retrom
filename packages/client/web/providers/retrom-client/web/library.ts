"use server";

import {
  LibraryServiceClient,
  LibraryServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createGrpcChannel } from "./utils";
import { createClient } from "nice-grpc";

export const deleteLibrary: LibraryServiceClient["deleteLibrary"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    const res = await client.deleteLibrary(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
};

export const updateLibrary: LibraryServiceClient["updateLibrary"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    let res = await client.updateLibrary(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
};

export const updateLibraryMetadata: LibraryServiceClient["updateLibraryMetadata"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: LibraryServiceClient = createClient(
      LibraryServiceDefinition,
      channel,
    );

    try {
      const res = await client.updateLibraryMetadata(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };
