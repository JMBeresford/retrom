import { GetGamesRequest, GetGamesResponse } from "@/generated/retrom";

export interface RetromGameClient {
  getGames: (req?: Partial<GetGamesRequest>) => Promise<GetGamesResponse>;
}
