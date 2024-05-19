"use server";

import {
  GameServiceClient,
  GameServiceDefinition,
  GetGamesRequest,
  GetGamesResponse,
} from "@/generated/retrom";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export async function getGames(opts: Partial<GetGamesRequest> = {}) {
  const channel = createChannel(GRPC_HOST);
  const client: GameServiceClient = createClient(
    GameServiceDefinition,
    channel,
  );

  try {
    return await client.getGames(opts);
  } catch (error) {
    console.error(error);
    return GetGamesResponse.create();
  } finally {
    channel.close();
  }
}
