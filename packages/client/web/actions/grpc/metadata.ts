"use server";

import {
  GetIgdbGameSearchResultsRequest,
  GetIgdbSearchRequest,
  MetadataServiceClient,
  MetadataServiceDefinition,
  UpdateGameMetadataRequest,
  UpdatePlatformMetadataRequest,
} from "@/generated/retrom";
import { GRPC_HOST } from "@/lib/env";
import { revalidatePath } from "next/cache";
import { createChannel, createClient } from "nice-grpc";

export async function searchIgdbGames(
  opts: Partial<GetIgdbGameSearchResultsRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    return await client.getIgdbGameSearchResults(opts);
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updateGameMetadata(
  opts: Partial<UpdateGameMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.updateGameMetadata(opts);
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updatePlatformMetadata(
  opts: UpdatePlatformMetadataRequest,
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.updatePlatformMetadata(opts);
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function searchIgdb(opts: GetIgdbSearchRequest) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    return await client.getIgdbSearch(opts);
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}
