import {
  DeleteLibraryRequest,
  LibraryServiceClient,
  LibraryServiceDefinition,
  UpdateLibraryMetadataRequest,
  UpdateLibraryRequest,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc-web";

export class LibraryClient implements LibraryServiceClient {
  private client: LibraryServiceClient = createClient(
    LibraryServiceDefinition,
    createChannel(GRPC_HOST),
  );

  async deleteLibrary(request: Partial<DeleteLibraryRequest> = {}) {
    try {
      return await this.client.deleteLibrary(request);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateLibrary(request: Partial<UpdateLibraryRequest> = {}) {
    try {
      return await this.client.updateLibrary(request);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateLibraryMetadata(
    request: Partial<UpdateLibraryMetadataRequest> = {},
  ) {
    try {
      return await this.client.updateLibraryMetadata(request);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
