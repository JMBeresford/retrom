"use server";

import {
  GameServiceClient,
  GameServiceDefinition,
  GetGamesRequest,
  GetGamesResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export async function getGames(req: Partial<GetGamesRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: GameServiceClient = createClient(
    GameServiceDefinition,
    channel,
  );

  try {
    return await client.getGames(req);
  } catch (error) {
    console.error(error);
    return GetGamesResponse.create();
  } finally {
    channel.close();
  }
}
