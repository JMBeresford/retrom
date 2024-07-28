"use server";

import {
  CreateEmulatorProfilesResponse,
  CreateEmulatorsResponse,
  DeleteDefaultEmulatorProfilesResponse,
  DeleteEmulatorProfilesResponse,
  DeleteEmulatorsResponse,
  EmulatorServiceClient,
  EmulatorServiceDefinition,
  GetDefaultEmulatorProfilesResponse,
  GetEmulatorProfilesResponse,
  GetEmulatorsResponse,
  UpdateDefaultEmulatorProfilesResponse,
  UpdateEmulatorProfilesResponse,
  UpdateEmulatorsResponse,
} from "@/generated/retrom/services";
import { GRPC_HOST } from "@/lib/env";
import { createClient } from "nice-grpc";
import { createGrpcChannel } from "./utils";

export const createEmulators: EmulatorServiceClient["createEmulators"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: EmulatorServiceClient = createClient(
    EmulatorServiceDefinition,
    channel,
  );

  try {
    return await client.createEmulators(req);
  } catch (error) {
    console.error(error);
    return CreateEmulatorsResponse.create();
  } finally {
    channel.close();
  }
};

export const getEmulators: EmulatorServiceClient["getEmulators"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: EmulatorServiceClient = createClient(
    EmulatorServiceDefinition,
    channel,
  );

  try {
    return await client.getEmulators(req);
  } catch (error) {
    console.error(error);
    return GetEmulatorsResponse.create();
  } finally {
    channel.close();
  }
};

export const updateEmulators: EmulatorServiceClient["updateEmulators"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: EmulatorServiceClient = createClient(
    EmulatorServiceDefinition,
    channel,
  );

  try {
    let res = await client.updateEmulators(req);
    return res;
  } catch (error) {
    console.error(error);
    return UpdateEmulatorsResponse.create();
  } finally {
    channel.close();
  }
};

export const deleteEmulators: EmulatorServiceClient["deleteEmulators"] = async (
  req = {},
) => {
  const channel = await createGrpcChannel(GRPC_HOST);
  const client: EmulatorServiceClient = createClient(
    EmulatorServiceDefinition,
    channel,
  );

  try {
    return await client.deleteEmulators(req);
  } catch (error) {
    console.error(error);
    return DeleteEmulatorsResponse.create();
  } finally {
    channel.close();
  }
};

export const getEmulatorProfiles: EmulatorServiceClient["getEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.getEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return GetEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const createEmulatorProfiles: EmulatorServiceClient["createEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.createEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return CreateEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const deleteEmulatorProfiles: EmulatorServiceClient["deleteEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.deleteEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return DeleteEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const updateEmulatorProfiles: EmulatorServiceClient["updateEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.updateEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return UpdateEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const getDefaultEmulatorProfiles: EmulatorServiceClient["getDefaultEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.getDefaultEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return GetDefaultEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const updateDefaultEmulatorProfiles: EmulatorServiceClient["updateDefaultEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.updateDefaultEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return UpdateDefaultEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };

export const deleteDefaultEmulatorProfiles: EmulatorServiceClient["deleteDefaultEmulatorProfiles"] =
  async (req = {}) => {
    const channel = await createGrpcChannel(GRPC_HOST);
    const client: EmulatorServiceClient = createClient(
      EmulatorServiceDefinition,
      channel,
    );

    try {
      return await client.deleteDefaultEmulatorProfiles(req);
    } catch (error) {
      console.error(error);
      return DeleteDefaultEmulatorProfilesResponse.create();
    } finally {
      channel.close();
    }
  };
