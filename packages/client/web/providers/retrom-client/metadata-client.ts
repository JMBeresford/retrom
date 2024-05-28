import {
  GetGameMetadataRequest,
  GetGameMetadataResponse,
  GetIgdbGameSearchResultsRequest,
  GetIgdbGameSearchResultsResponse,
  GetIgdbPlatformSearchResultsRequest,
  GetIgdbPlatformSearchResultsResponse,
  GetIgdbSearchRequest,
  GetIgdbSearchResponse,
  GetPlatformMetadataRequest,
  GetPlatformMetadataResponse,
  UpdateGameMetadataRequest,
  UpdateGameMetadataResponse,
  UpdatePlatformMetadataRequest,
  UpdatePlatformMetadataResponse,
} from "@/generated/retrom";

export interface RetromMetadataClient {
  getGameMetadata: (
    req?: GetGameMetadataRequest,
  ) => Promise<GetGameMetadataResponse>;
  updateGameMetadata: (
    req?: UpdateGameMetadataRequest,
  ) => Promise<UpdateGameMetadataResponse>;

  getPlatformMetadata: (
    req?: GetPlatformMetadataRequest,
  ) => Promise<GetPlatformMetadataResponse>;
  updatePlatformMetadata: (
    req?: UpdatePlatformMetadataRequest,
  ) => Promise<UpdatePlatformMetadataResponse>;

  getIgdbSearch: (req?: GetIgdbSearchRequest) => Promise<GetIgdbSearchResponse>;
  getIgdbGameSearchResults: (
    req?: GetIgdbGameSearchResultsRequest,
  ) => Promise<GetIgdbGameSearchResultsResponse>;
  getIgdbPlatformSearchResults: (
    req?: GetIgdbPlatformSearchResultsRequest,
  ) => Promise<GetIgdbPlatformSearchResultsResponse>;
}
