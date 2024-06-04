import { createChannel, createClient } from "nice-grpc-web";
import { RetromPlatformClient } from "../platform-client";
import {
  PlatformServiceClient,
  PlatformServiceDefinition,
  GetPlatformsRequest,
  GetPlatformsResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class PlatformClient implements RetromPlatformClient {
  private client: PlatformServiceClient = createClient(
    PlatformServiceDefinition,
    createChannel(GRPC_HOST),
  );

  getPlatforms = async (request: Partial<GetPlatformsRequest> = {}) => {
    try {
      return await this.client.getPlatforms(request);
    } catch (error) {
      console.error(error);
      return GetPlatformsResponse.create();
    }
  };
}
