"use server";

import {
  DeleteLibraryRequest,
  LibraryServiceClient,
  LibraryServiceDefinition,
  UpdateLibraryMetadataRequest,
  UpdateLibraryRequest,
} from "@/generated/retrom";
import { GRPC_HOST } from "@/lib/env";
import { revalidatePath } from "next/cache";
import { createChannel, createClient } from "nice-grpc";

export async function deleteLibrary(req: Partial<DeleteLibraryRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    const res = await client.deleteLibrary(req);
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updateLibrary(req: Partial<UpdateLibraryRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    let res = await client.updateLibrary(req);
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updateLibraryMetadata(
  req: Partial<UpdateLibraryMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    const res = await client.updateLibraryMetadata(req);
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}
