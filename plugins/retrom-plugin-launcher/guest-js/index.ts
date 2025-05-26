import {
  create,
  fromBinary,
  MessageInitShape,
  toBinary,
} from "@bufbuild/protobuf";
import {
  GamePlayStatusUpdateSchema,
  GetGamePlayStatusPayloadSchema,
  PlayGamePayloadSchema,
  StopGamePayloadSchema,
} from "@retrom/codegen/retrom/client/client-utils_pb";
import { invoke } from "@tauri-apps/api/core";

export async function execute() {
  await invoke("plugin:launcher|execute");
}

export async function getGamePlayStatus(
  payload: MessageInitShape<typeof GetGamePlayStatusPayloadSchema>,
) {
  const bytes = toBinary(
    GetGamePlayStatusPayloadSchema,
    create(GetGamePlayStatusPayloadSchema, payload),
  );

  return await invoke<number[]>("plugin:launcher|get_game_play_status", {
    payload: bytes,
  }).then((res) => fromBinary(GamePlayStatusUpdateSchema, new Uint8Array(res)));
}

export async function playGame(
  payload: MessageInitShape<typeof PlayGamePayloadSchema>,
) {
  return invoke("plugin:launcher|play_game", {
    payload: toBinary(
      PlayGamePayloadSchema,
      create(PlayGamePayloadSchema, payload),
    ),
  });
}

export async function stopGame(
  payload: MessageInitShape<typeof StopGamePayloadSchema>,
) {
  return invoke("plugin:launcher|stop_game", {
    payload: toBinary(
      StopGamePayloadSchema,
      create(StopGamePayloadSchema, payload),
    ),
  });
}
