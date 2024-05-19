"use server";

import {
  GetPlatformsRequest,
  GetPlatformsResponse,
  PlatformServiceClient,
  PlatformServiceDefinition,
} from "@/generated/retrom";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export async function getPlatforms(opts: Partial<GetPlatformsRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: PlatformServiceClient = createClient(
    PlatformServiceDefinition,
    channel,
  );

  try {
    return await client.getPlatforms(opts);
  } catch (error) {
    console.error(error);

    return GetPlatformsResponse.create();
  } finally {
    channel.close();
  }
}
