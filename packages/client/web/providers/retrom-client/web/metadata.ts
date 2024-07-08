"use server";

import {
  MetadataServiceClient,
  MetadataServiceDefinition,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createChannel, createClient } from "nice-grpc";

export const getGameMetadata: MetadataServiceClient["getGameMetadata"] = async (
  req = {},
) => {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.getGameMetadata(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
};

export const updateGameMetadata: MetadataServiceClient["updateGameMetadata"] =
  async (req = {}) => {
    const channel = createChannel(GRPC_HOST);
    const client: MetadataServiceClient = createClient(
      MetadataServiceDefinition,
      channel,
    );

    try {
      const res = await client.updateGameMetadata(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };

export const getPlatformMetadata: MetadataServiceClient["getPlatformMetadata"] =
  async (req = {}) => {
    const channel = createChannel(GRPC_HOST);
    const client: MetadataServiceClient = createClient(
      MetadataServiceDefinition,
      channel,
    );

    try {
      const res = await client.getPlatformMetadata(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };

export const updatePlatformMetadata: MetadataServiceClient["updatePlatformMetadata"] =
  async (req = {}) => {
    const channel = createChannel(GRPC_HOST);
    const client: MetadataServiceClient = createClient(
      MetadataServiceDefinition,
      channel,
    );

    try {
      const res = await client.updatePlatformMetadata(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };

export const getIgdbSearch: MetadataServiceClient["getIgdbSearch"] = async (
  req = {},
) => {
  const channel = createChannel(GRPC_HOST);
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    const res = await client.getIgdbSearch(req);
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
};

export const getIgdbGameSearchResults: MetadataServiceClient["getIgdbGameSearchResults"] =
  async (req = {}) => {
    const channel = createChannel(GRPC_HOST);
    const client: MetadataServiceClient = createClient(
      MetadataServiceDefinition,
      channel,
    );

    try {
      const res = await client.getIgdbGameSearchResults(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };

export const getIgdbPlatformSearchResults: MetadataServiceClient["getIgdbPlatformSearchResults"] =
  async (req = {}) => {
    const channel = createChannel(GRPC_HOST);
    const client: MetadataServiceClient = createClient(
      MetadataServiceDefinition,
      channel,
    );

    try {
      const res = await client.getIgdbPlatformSearchResults(req);
      return res;
    } catch (error) {
      throw error;
    } finally {
      channel.close();
    }
  };
