import { createChannel, createClient } from "nice-grpc-web";
import { RetromGameClient } from "../game-client";
import {
  GameServiceClient,
  GameServiceDefinition,
  GetGamesRequest,
  GetGamesResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";

export class GameClient implements RetromGameClient {
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
}
