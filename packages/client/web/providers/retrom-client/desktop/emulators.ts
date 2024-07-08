import { CallOptions, createChannel, createClient } from "nice-grpc-web";
import {
  EmulatorServiceClient,
  EmulatorServiceDefinition,
  GetEmulatorsRequest,
  DeleteEmulatorsRequest,
  UpdateEmulatorsRequest,
  CreateEmulatorsRequest,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class EmulatorClient implements EmulatorServiceClient {
  private client: EmulatorServiceClient = createClient(
    EmulatorServiceDefinition,
    createChannel(GRPC_HOST),
  );

  getEmulators = async (request: Partial<GetEmulatorsRequest> = {}) => {
    return await this.client.getEmulators(request);
  };

  deleteEmulators = async (request: Partial<DeleteEmulatorsRequest>) => {
    return await this.client.deleteEmulators(request);
  };

  updateEmulators = async (request: Partial<UpdateEmulatorsRequest>) => {
    return await this.client.updateEmulators(request);
  };

  createEmulators = async (request: Partial<CreateEmulatorsRequest>) => {
    return await this.client.createEmulators(request);
  };
}
