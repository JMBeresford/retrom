"use server";

import {
  DeleteGamesResponse,
  GameServiceClient,
  GameServiceDefinition,
  GetGamesResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export const getGames: GameServiceClient["getGames"] = async (req = {}) => {
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
};

export const deleteGames: GameServiceClient["deleteGames"] = async (
  req = {},
) => {
  const channel = createChannel(GRPC_HOST);
  const client: GameServiceClient = createClient(
    GameServiceDefinition,
    channel,
  );

  try {
    return await client.deleteGames(req);
  } catch (error) {
    console.error(error);
    return DeleteGamesResponse.create();
  } finally {
    channel.close();
  }
};
