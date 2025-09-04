import { GameSchema } from "@retrom/codegen/retrom/models/games_pb";
import { MessageShape } from "@bufbuild/protobuf";
import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";

export function useInstallationQuery(game: MessageShape<typeof GameSchema>) {
  const { installations } = useInstallationIndex();

  return installations[game.id] ?? InstallationStatus.NOT_INSTALLED;
}
