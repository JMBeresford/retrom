"use server";

import {
  GetPlatformsRequest,
  GetPlatformsResponse,
  PlatformServiceClient,
  PlatformServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createClient } from "nice-grpc";
import { createGrpcChannel } from "./utils";

export const getPlatforms: PlatformServiceClient["getPlatforms"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: PlatformServiceClient = createClient(
    PlatformServiceDefinition,
    channel,
  );

  try {
    return await client.getPlatforms(req);
  } catch (error) {
    console.error(error);

    return GetPlatformsResponse.create();
  } finally {
    channel.close();
  }
};

export const deletePlatforms: PlatformServiceClient["deletePlatforms"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: PlatformServiceClient = createClient(
    PlatformServiceDefinition,
    channel,
  );

  try {
    return await client.deletePlatforms(req);
  } catch (error) {
    console.error(error);

    return GetPlatformsResponse.create();
  } finally {
    channel.close();
  }
};
