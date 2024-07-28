"use server";

import {
  DeleteGamesResponse,
  GameServiceClient,
  GameServiceDefinition,
  GetGamesResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createClient } from "nice-grpc";
import { createGrpcChannel } from "./utils";

export const getGames: GameServiceClient["getGames"] = async (req = {}) => {
  const channel = await createGrpcChannel(GRPC_HOST);
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
  const channel = await createGrpcChannel(GRPC_HOST);
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
