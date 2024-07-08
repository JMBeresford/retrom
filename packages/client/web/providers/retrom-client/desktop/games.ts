import { CallOptions, createChannel, createClient } from "nice-grpc-web";
import {
  DeleteGamesRequest,
  DeleteGamesResponse,
  GameServiceClient,
  GameServiceDefinition,
  GetGamesRequest,
  GetGamesResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class GameClient implements GameServiceClient {
  private client: GameServiceClient = createClient(
    GameServiceDefinition,
    createChannel(GRPC_HOST),
  );

  getGames = async (request: Partial<GetGamesRequest> = {}) => {
    try {
      return await this.client.getGames(request);
    } catch (error) {
      console.error(error);
      return GetGamesResponse.create();
    }
  };

  deleteGames = async (request: Partial<DeleteGamesRequest>) => {
    try {
      return await this.client.deleteGames(request);
    } catch (error) {
      console.error(error);
      return DeleteGamesResponse.create();
    }
  };
}
