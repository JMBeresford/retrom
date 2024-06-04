"use server";

import {
  GetGameMetadataRequest,
  GetIgdbGameSearchResultsRequest,
  GetIgdbPlatformSearchResultsRequest,
  GetIgdbSearchRequest,
  GetPlatformMetadataRequest,
  MetadataServiceClient,
  MetadataServiceDefinition,
  UpdateGameMetadataRequest,
  UpdatePlatformMetadataRequest,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export async function getGameMetadata(
  req: Partial<GetGameMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.getGameMetadata(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updateGameMetadata(
  req: Partial<UpdateGameMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.updateGameMetadata(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function getPlatformMetadata(
  req: Partial<GetPlatformMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.getPlatformMetadata(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function updatePlatformMetadata(
  req: Partial<UpdatePlatformMetadataRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.updatePlatformMetadata(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function getIgdbSearch(req: Partial<GetIgdbSearchRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    return await client.getIgdbSearch(req);
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function getIgdbGameSearchResults(
  req: Partial<GetIgdbGameSearchResultsRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    return await client.getIgdbGameSearchResults(req);
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

export async function getIgdbPlatformSearchResults(
  req: Partial<GetIgdbPlatformSearchResultsRequest> = {},
) {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    return await client.getIgdbPlatformSearchResults(req);
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}
