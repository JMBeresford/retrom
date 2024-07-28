"use server";

import { ChannelCredentials, createChannel } from "nice-grpc";

export async function createGrpcChannel(host: string) {
  if (host.startsWith("https")) {
    return createChannel(host, ChannelCredentials.createSsl());
  }

  return createChannel(host, ChannelCredentials.createInsecure());
}
