import { createChannel, createClient } from "nice-grpc-web";
import {
  PlatformServiceClient,
  PlatformServiceDefinition,
  GetPlatformsRequest,
  GetPlatformsResponse,
  DeletePlatformsRequest,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class PlatformClient implements PlatformServiceClient {
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

  deletePlatforms = async (request: Partial<DeletePlatformsRequest>) => {
    try {
      return await this.client.deletePlatforms(request);
    } catch (error) {
      console.error(error);
      return GetPlatformsResponse.create();
    }
  };
}
