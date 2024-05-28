import { GetPlatformsRequest, GetPlatformsResponse } from "@/generated/retrom";

export interface RetromPlatformClient {
  getPlatforms: (
    req?: Partial<GetPlatformsRequest>,
  ) => Promise<GetPlatformsResponse>;
}
