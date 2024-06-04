import { createChannel, createClient } from "nice-grpc-web";
import {
  GetGameMetadataRequest,
  GetGameMetadataResponse,
  GetIgdbGameSearchResultsRequest,
  GetIgdbGameSearchResultsResponse,
  GetIgdbPlatformSearchResultsRequest,
  GetIgdbPlatformSearchResultsResponse,
  GetIgdbSearchRequest,
  GetIgdbSearchResponse,
  GetPlatformMetadataRequest,
  GetPlatformMetadataResponse,
  MetadataServiceClient,
  MetadataServiceDefinition,
  UpdateGameMetadataRequest,
  UpdateGameMetadataResponse,
  UpdatePlatformMetadataRequest,
  UpdatePlatformMetadataResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class MetadataClient implements MetadataServiceClient {
  private client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    createChannel(GRPC_HOST),
  );

  async getGameMetadata(request: Partial<GetGameMetadataRequest> = {}) {
    try {
      return await this.client.getGameMetadata(request);
    } catch (error) {
      console.error(error);
      return GetGameMetadataResponse.create();
    }
  }

  async updateGameMetadata(request: Partial<UpdateGameMetadataRequest>) {
    try {
      return await this.client.updateGameMetadata(request);
    } catch (error) {
      console.error(error);
      return UpdateGameMetadataResponse.create();
    }
  }

  async getPlatformMetadata(request: Partial<GetPlatformMetadataRequest>) {
    try {
      return await this.client.getPlatformMetadata(request);
    } catch (error) {
      console.error(error);
      return GetPlatformMetadataResponse.create();
    }
  }

  async updatePlatformMetadata(
    request: Partial<UpdatePlatformMetadataRequest>,
  ) {
    try {
      return await this.client.updatePlatformMetadata(request);
    } catch (error) {
      console.error(error);
      return UpdatePlatformMetadataResponse.create();
    }
  }

  async getIgdbSearch(request: Partial<GetIgdbSearchRequest>) {
    try {
      return await this.client.getIgdbSearch(request);
    } catch (error) {
      console.error(error);
      return GetIgdbSearchResponse.create();
    }
  }

  async getIgdbGameSearchResults(
    request: Partial<GetIgdbGameSearchResultsRequest>,
  ) {
    try {
      return await this.client.getIgdbGameSearchResults(request);
    } catch (error) {
      console.error(error);
      return GetIgdbGameSearchResultsResponse.create();
    }
  }

  async getIgdbPlatformSearchResults(
    request: Partial<GetIgdbPlatformSearchResultsRequest>,
  ) {
    try {
      return await this.client.getIgdbPlatformSearchResults(request);
    } catch (error) {
      console.error(error);
      return GetIgdbPlatformSearchResultsResponse.create();
    }
  }
}
