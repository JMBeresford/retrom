import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallContext, type CallOptions } from "nice-grpc-common";
import { FilesystemNode } from "./file-explorer";
import { JobProgress } from "./jobs";
import { Client, NewClient, UpdatedClient } from "./models/clients";
import { DefaultEmulatorProfile, Emulator, EmulatorProfile, LocalEmulatorConfig, NewEmulator, NewEmulatorProfile, NewLocalEmulatorConfig, UpdatedDefaultEmulatorProfile, UpdatedEmulator, UpdatedEmulatorProfile, UpdatedLocalEmulatorConfig } from "./models/emulators";
import { GameFile, UpdatedGameFile } from "./models/game-files";
import { Game, UpdatedGame } from "./models/games";
import { GameGenre, GameMetadata, NewGameMetadata, NewPlatformMetadata, PlatformMetadata, UpdatedGameMetadata, UpdatedPlatformMetadata } from "./models/metadata";
import { Platform, UpdatedPlatform } from "./models/platforms";
import { IgdbFields, IgdbFilters, IgdbGameSearchQuery, IgdbPagination, IgdbPlatformSearchQuery, IgdbSearch } from "./providers/igdb";
import { ServerConfig } from "./server/config";
import { ServerInfo } from "./server/server-info";
export declare const protobufPackage = "retrom";
export interface UpdateLibraryRequest {
}
export interface UpdateLibraryResponse {
    jobIds: string[];
}
export interface UpdateLibraryMetadataRequest {
    overwrite?: boolean | undefined;
}
export interface UpdateLibraryMetadataResponse {
    platformMetadataJobId: string;
    gameMetadataJobId: string;
    extraMetadataJobId: string;
    steamMetadataJobId?: string | undefined;
}
export interface GetPlatformsRequest {
    ids: number[];
    withMetadata?: boolean | undefined;
    includeDeleted?: boolean | undefined;
}
export interface GetPlatformsResponse {
    platforms: Platform[];
    metadata: PlatformMetadata[];
}
export interface GetGamesRequest {
    platformIds: number[];
    ids: number[];
    withMetadata?: boolean | undefined;
    withFiles?: boolean | undefined;
    includeDeleted?: boolean | undefined;
}
export interface GetGamesResponse {
    games: Game[];
    metadata: GameMetadata[];
    gameFiles: GameFile[];
}
export interface GetGameMetadataRequest {
    gameIds: number[];
}
export interface GetGameMetadataResponse {
    metadata: GameMetadata[];
    similarGames: Map<number, GetGameMetadataResponse_SimilarGames>;
    genres: Map<number, GetGameMetadataResponse_GameGenres>;
}
export interface GetGameMetadataResponse_GameGenres {
    value: GameGenre[];
}
export interface GetGameMetadataResponse_SimilarGames {
    value: Game[];
}
export interface GetGameMetadataResponse_SimilarGamesEntry {
    key: number;
    value?: GetGameMetadataResponse_SimilarGames | undefined;
}
export interface GetGameMetadataResponse_GenresEntry {
    key: number;
    value?: GetGameMetadataResponse_GameGenres | undefined;
}
export interface GetPlatformMetadataRequest {
    platformIds: number[];
}
export interface GetPlatformMetadataResponse {
    metadata: PlatformMetadata[];
}
export interface GetIgdbGameSearchResultsRequest {
    query?: IgdbGameSearchQuery | undefined;
}
export interface GetIgdbGameSearchResultsResponse {
    metadata: NewGameMetadata[];
}
export interface UpdateGameMetadataRequest {
    metadata: UpdatedGameMetadata[];
}
export interface UpdateGameMetadataResponse {
    metadataUpdated: GameMetadata[];
}
export interface GetIgdbPlatformSearchResultsRequest {
    query?: IgdbPlatformSearchQuery | undefined;
}
export interface GetIgdbPlatformSearchResultsResponse {
    metadata: NewPlatformMetadata[];
}
export interface UpdatePlatformMetadataRequest {
    metadata: UpdatedPlatformMetadata[];
}
export interface UpdatePlatformMetadataResponse {
    metadataUpdated: PlatformMetadata[];
}
/** Arbitrary search query for IGDB */
export interface GetIgdbSearchRequest {
    searchType: GetIgdbSearchRequest_IgdbSearchType;
    search?: IgdbSearch | undefined;
    pagination?: IgdbPagination | undefined;
    filters?: IgdbFilters | undefined;
    fields?: IgdbFields | undefined;
}
export declare const GetIgdbSearchRequest_IgdbSearchType: {
    readonly GAME: 0;
    readonly PLATFORM: 1;
    readonly UNRECOGNIZED: -1;
};
export type GetIgdbSearchRequest_IgdbSearchType = typeof GetIgdbSearchRequest_IgdbSearchType[keyof typeof GetIgdbSearchRequest_IgdbSearchType];
export declare namespace GetIgdbSearchRequest_IgdbSearchType {
    type GAME = typeof GetIgdbSearchRequest_IgdbSearchType.GAME;
    type PLATFORM = typeof GetIgdbSearchRequest_IgdbSearchType.PLATFORM;
    type UNRECOGNIZED = typeof GetIgdbSearchRequest_IgdbSearchType.UNRECOGNIZED;
}
export declare function getIgdbSearchRequest_IgdbSearchTypeFromJSON(object: any): GetIgdbSearchRequest_IgdbSearchType;
export declare function getIgdbSearchRequest_IgdbSearchTypeToJSON(object: GetIgdbSearchRequest_IgdbSearchType): string;
export interface IgdbSearchGameResponse {
    games: NewGameMetadata[];
}
export interface IgdbSearchPlatformResponse {
    platforms: NewPlatformMetadata[];
}
export interface GetIgdbSearchResponse {
    searchResults?: {
        $case: "gameMatches";
        gameMatches: IgdbSearchGameResponse;
    } | {
        $case: "platformMatches";
        platformMatches: IgdbSearchPlatformResponse;
    } | undefined;
}
export interface DeleteLibraryRequest {
}
export interface DeleteLibraryResponse {
}
export interface DeleteMissingEntriesRequest {
    dryRun: boolean;
}
export interface DeleteMissingEntriesResponse {
    platformsDeleted: Platform[];
    gamesDeleted: Game[];
    gameFilesDeleted: GameFile[];
}
export interface DeletePlatformsRequest {
    ids: number[];
    deleteFromDisk: boolean;
    blacklistEntries: boolean;
}
export interface DeletePlatformsResponse {
    platformsDeleted: Platform[];
}
export interface UpdatePlatformsRequest {
    platforms: UpdatedPlatform[];
}
export interface UpdatePlatformsResponse {
    platformsUpdated: Platform[];
}
export interface DeleteGamesRequest {
    ids: number[];
    deleteFromDisk: boolean;
    blacklistEntries: boolean;
}
export interface DeleteGamesResponse {
    gamesDeleted: Game[];
}
export interface UpdateGamesRequest {
    games: UpdatedGame[];
}
export interface UpdateGamesResponse {
    gamesUpdated: Game[];
}
export interface CreateClientRequest {
    client?: NewClient | undefined;
}
export interface CreateClientResponse {
    clientCreated?: Client | undefined;
}
export interface GetClientsRequest {
    ids: number[];
    names: string[];
}
export interface GetClientsResponse {
    clients: Client[];
}
export interface UpdateClientsRequest {
    clients: UpdatedClient[];
}
export interface UpdateClientsResponse {
    clientsUpdated: Client[];
}
export interface DeleteClientsRequest {
    ids: number[];
}
export interface DeleteClientsResponse {
    clientsDeleted: Client[];
}
export interface GetServerInfoRequest {
}
export interface GetServerInfoResponse {
    serverInfo?: ServerInfo | undefined;
}
export interface GetServerConfigRequest {
}
export interface GetServerConfigResponse {
    config?: ServerConfig | undefined;
}
export interface UpdateServerConfigRequest {
    config?: ServerConfig | undefined;
}
export interface UpdateServerConfigResponse {
    configUpdated?: ServerConfig | undefined;
}
export interface CreateEmulatorsRequest {
    emulators: NewEmulator[];
}
export interface CreateEmulatorsResponse {
    emulatorsCreated: Emulator[];
}
export interface GetEmulatorsRequest {
    ids: number[];
    supportedPlatformIds: number[];
}
export interface GetEmulatorsResponse {
    emulators: Emulator[];
}
export interface UpdateEmulatorsRequest {
    emulators: UpdatedEmulator[];
}
export interface UpdateEmulatorsResponse {
    emulatorsUpdated: Emulator[];
}
export interface DeleteEmulatorsRequest {
    ids: number[];
}
export interface DeleteEmulatorsResponse {
    emulatorsDeleted: Emulator[];
}
export interface CreateEmulatorProfilesRequest {
    profiles: NewEmulatorProfile[];
}
export interface CreateEmulatorProfilesResponse {
    profilesCreated: EmulatorProfile[];
}
export interface GetEmulatorProfilesRequest {
    ids: number[];
    emulatorIds: number[];
}
export interface GetEmulatorProfilesResponse {
    profiles: EmulatorProfile[];
}
export interface UpdateEmulatorProfilesRequest {
    profiles: UpdatedEmulatorProfile[];
}
export interface UpdateEmulatorProfilesResponse {
    profilesUpdated: EmulatorProfile[];
}
export interface DeleteEmulatorProfilesRequest {
    ids: number[];
}
export interface DeleteEmulatorProfilesResponse {
    profilesDeleted: EmulatorProfile[];
}
export interface GetDefaultEmulatorProfilesRequest {
    platformIds: number[];
}
export interface GetDefaultEmulatorProfilesResponse {
    defaultProfiles: DefaultEmulatorProfile[];
}
export interface UpdateDefaultEmulatorProfilesRequest {
    defaultProfiles: UpdatedDefaultEmulatorProfile[];
}
export interface UpdateDefaultEmulatorProfilesResponse {
    defaultProfilesUpdated: DefaultEmulatorProfile[];
}
export interface DeleteDefaultEmulatorProfilesRequest {
    platformIds: number[];
}
export interface DeleteDefaultEmulatorProfilesResponse {
    defaultProfilesDeleted: DefaultEmulatorProfile[];
}
export interface DeleteGameFilesRequest {
    ids: number[];
    deleteFromDisk: boolean;
    blacklistEntries: boolean;
}
export interface DeleteGameFilesResponse {
    gameFilesDeleted: GameFile[];
}
export interface UpdateGameFilesRequest {
    gameFiles: UpdatedGameFile[];
}
export interface UpdateGameFilesResponse {
    gameFilesUpdated: GameFile[];
}
export interface GetJobsRequest {
}
export interface GetJobsResponse {
    jobs: JobProgress[];
}
export interface GetJobSubscriptionRequest {
    jobId: string;
}
export interface GetJobSubscriptionResponse {
    job?: JobProgress | undefined;
}
export interface GetFilesystemNodeRequest {
    path?: string | undefined;
}
export interface GetFilesystemNodeResponse {
    node?: FilesystemNode | undefined;
    children: FilesystemNode[];
}
export interface CreateLocalEmulatorConfigsRequest {
    configs: NewLocalEmulatorConfig[];
}
export interface CreateLocalEmulatorConfigsResponse {
    configsCreated: LocalEmulatorConfig[];
}
export interface GetLocalEmulatorConfigsRequest {
    emulatorIds: number[];
    clientId: number;
}
export interface GetLocalEmulatorConfigsResponse {
    configs: LocalEmulatorConfig[];
}
export interface UpdateLocalEmulatorConfigsRequest {
    configs: UpdatedLocalEmulatorConfig[];
}
export interface UpdateLocalEmulatorConfigsResponse {
    configsUpdated: LocalEmulatorConfig[];
}
export interface DeleteLocalEmulatorConfigsRequest {
    ids: number[];
}
export interface DeleteLocalEmulatorConfigsResponse {
    configsDeleted: LocalEmulatorConfig[];
}
export declare const UpdateLibraryRequest: MessageFns<UpdateLibraryRequest>;
export declare const UpdateLibraryResponse: MessageFns<UpdateLibraryResponse>;
export declare const UpdateLibraryMetadataRequest: MessageFns<UpdateLibraryMetadataRequest>;
export declare const UpdateLibraryMetadataResponse: MessageFns<UpdateLibraryMetadataResponse>;
export declare const GetPlatformsRequest: MessageFns<GetPlatformsRequest>;
export declare const GetPlatformsResponse: MessageFns<GetPlatformsResponse>;
export declare const GetGamesRequest: MessageFns<GetGamesRequest>;
export declare const GetGamesResponse: MessageFns<GetGamesResponse>;
export declare const GetGameMetadataRequest: MessageFns<GetGameMetadataRequest>;
export declare const GetGameMetadataResponse: MessageFns<GetGameMetadataResponse>;
export declare const GetGameMetadataResponse_GameGenres: MessageFns<GetGameMetadataResponse_GameGenres>;
export declare const GetGameMetadataResponse_SimilarGames: MessageFns<GetGameMetadataResponse_SimilarGames>;
export declare const GetGameMetadataResponse_SimilarGamesEntry: MessageFns<GetGameMetadataResponse_SimilarGamesEntry>;
export declare const GetGameMetadataResponse_GenresEntry: MessageFns<GetGameMetadataResponse_GenresEntry>;
export declare const GetPlatformMetadataRequest: MessageFns<GetPlatformMetadataRequest>;
export declare const GetPlatformMetadataResponse: MessageFns<GetPlatformMetadataResponse>;
export declare const GetIgdbGameSearchResultsRequest: MessageFns<GetIgdbGameSearchResultsRequest>;
export declare const GetIgdbGameSearchResultsResponse: MessageFns<GetIgdbGameSearchResultsResponse>;
export declare const UpdateGameMetadataRequest: MessageFns<UpdateGameMetadataRequest>;
export declare const UpdateGameMetadataResponse: MessageFns<UpdateGameMetadataResponse>;
export declare const GetIgdbPlatformSearchResultsRequest: MessageFns<GetIgdbPlatformSearchResultsRequest>;
export declare const GetIgdbPlatformSearchResultsResponse: MessageFns<GetIgdbPlatformSearchResultsResponse>;
export declare const UpdatePlatformMetadataRequest: MessageFns<UpdatePlatformMetadataRequest>;
export declare const UpdatePlatformMetadataResponse: MessageFns<UpdatePlatformMetadataResponse>;
export declare const GetIgdbSearchRequest: MessageFns<GetIgdbSearchRequest>;
export declare const IgdbSearchGameResponse: MessageFns<IgdbSearchGameResponse>;
export declare const IgdbSearchPlatformResponse: MessageFns<IgdbSearchPlatformResponse>;
export declare const GetIgdbSearchResponse: MessageFns<GetIgdbSearchResponse>;
export declare const DeleteLibraryRequest: MessageFns<DeleteLibraryRequest>;
export declare const DeleteLibraryResponse: MessageFns<DeleteLibraryResponse>;
export declare const DeleteMissingEntriesRequest: MessageFns<DeleteMissingEntriesRequest>;
export declare const DeleteMissingEntriesResponse: MessageFns<DeleteMissingEntriesResponse>;
export declare const DeletePlatformsRequest: MessageFns<DeletePlatformsRequest>;
export declare const DeletePlatformsResponse: MessageFns<DeletePlatformsResponse>;
export declare const UpdatePlatformsRequest: MessageFns<UpdatePlatformsRequest>;
export declare const UpdatePlatformsResponse: MessageFns<UpdatePlatformsResponse>;
export declare const DeleteGamesRequest: MessageFns<DeleteGamesRequest>;
export declare const DeleteGamesResponse: MessageFns<DeleteGamesResponse>;
export declare const UpdateGamesRequest: MessageFns<UpdateGamesRequest>;
export declare const UpdateGamesResponse: MessageFns<UpdateGamesResponse>;
export declare const CreateClientRequest: MessageFns<CreateClientRequest>;
export declare const CreateClientResponse: MessageFns<CreateClientResponse>;
export declare const GetClientsRequest: MessageFns<GetClientsRequest>;
export declare const GetClientsResponse: MessageFns<GetClientsResponse>;
export declare const UpdateClientsRequest: MessageFns<UpdateClientsRequest>;
export declare const UpdateClientsResponse: MessageFns<UpdateClientsResponse>;
export declare const DeleteClientsRequest: MessageFns<DeleteClientsRequest>;
export declare const DeleteClientsResponse: MessageFns<DeleteClientsResponse>;
export declare const GetServerInfoRequest: MessageFns<GetServerInfoRequest>;
export declare const GetServerInfoResponse: MessageFns<GetServerInfoResponse>;
export declare const GetServerConfigRequest: MessageFns<GetServerConfigRequest>;
export declare const GetServerConfigResponse: MessageFns<GetServerConfigResponse>;
export declare const UpdateServerConfigRequest: MessageFns<UpdateServerConfigRequest>;
export declare const UpdateServerConfigResponse: MessageFns<UpdateServerConfigResponse>;
export declare const CreateEmulatorsRequest: MessageFns<CreateEmulatorsRequest>;
export declare const CreateEmulatorsResponse: MessageFns<CreateEmulatorsResponse>;
export declare const GetEmulatorsRequest: MessageFns<GetEmulatorsRequest>;
export declare const GetEmulatorsResponse: MessageFns<GetEmulatorsResponse>;
export declare const UpdateEmulatorsRequest: MessageFns<UpdateEmulatorsRequest>;
export declare const UpdateEmulatorsResponse: MessageFns<UpdateEmulatorsResponse>;
export declare const DeleteEmulatorsRequest: MessageFns<DeleteEmulatorsRequest>;
export declare const DeleteEmulatorsResponse: MessageFns<DeleteEmulatorsResponse>;
export declare const CreateEmulatorProfilesRequest: MessageFns<CreateEmulatorProfilesRequest>;
export declare const CreateEmulatorProfilesResponse: MessageFns<CreateEmulatorProfilesResponse>;
export declare const GetEmulatorProfilesRequest: MessageFns<GetEmulatorProfilesRequest>;
export declare const GetEmulatorProfilesResponse: MessageFns<GetEmulatorProfilesResponse>;
export declare const UpdateEmulatorProfilesRequest: MessageFns<UpdateEmulatorProfilesRequest>;
export declare const UpdateEmulatorProfilesResponse: MessageFns<UpdateEmulatorProfilesResponse>;
export declare const DeleteEmulatorProfilesRequest: MessageFns<DeleteEmulatorProfilesRequest>;
export declare const DeleteEmulatorProfilesResponse: MessageFns<DeleteEmulatorProfilesResponse>;
export declare const GetDefaultEmulatorProfilesRequest: MessageFns<GetDefaultEmulatorProfilesRequest>;
export declare const GetDefaultEmulatorProfilesResponse: MessageFns<GetDefaultEmulatorProfilesResponse>;
export declare const UpdateDefaultEmulatorProfilesRequest: MessageFns<UpdateDefaultEmulatorProfilesRequest>;
export declare const UpdateDefaultEmulatorProfilesResponse: MessageFns<UpdateDefaultEmulatorProfilesResponse>;
export declare const DeleteDefaultEmulatorProfilesRequest: MessageFns<DeleteDefaultEmulatorProfilesRequest>;
export declare const DeleteDefaultEmulatorProfilesResponse: MessageFns<DeleteDefaultEmulatorProfilesResponse>;
export declare const DeleteGameFilesRequest: MessageFns<DeleteGameFilesRequest>;
export declare const DeleteGameFilesResponse: MessageFns<DeleteGameFilesResponse>;
export declare const UpdateGameFilesRequest: MessageFns<UpdateGameFilesRequest>;
export declare const UpdateGameFilesResponse: MessageFns<UpdateGameFilesResponse>;
export declare const GetJobsRequest: MessageFns<GetJobsRequest>;
export declare const GetJobsResponse: MessageFns<GetJobsResponse>;
export declare const GetJobSubscriptionRequest: MessageFns<GetJobSubscriptionRequest>;
export declare const GetJobSubscriptionResponse: MessageFns<GetJobSubscriptionResponse>;
export declare const GetFilesystemNodeRequest: MessageFns<GetFilesystemNodeRequest>;
export declare const GetFilesystemNodeResponse: MessageFns<GetFilesystemNodeResponse>;
export declare const CreateLocalEmulatorConfigsRequest: MessageFns<CreateLocalEmulatorConfigsRequest>;
export declare const CreateLocalEmulatorConfigsResponse: MessageFns<CreateLocalEmulatorConfigsResponse>;
export declare const GetLocalEmulatorConfigsRequest: MessageFns<GetLocalEmulatorConfigsRequest>;
export declare const GetLocalEmulatorConfigsResponse: MessageFns<GetLocalEmulatorConfigsResponse>;
export declare const UpdateLocalEmulatorConfigsRequest: MessageFns<UpdateLocalEmulatorConfigsRequest>;
export declare const UpdateLocalEmulatorConfigsResponse: MessageFns<UpdateLocalEmulatorConfigsResponse>;
export declare const DeleteLocalEmulatorConfigsRequest: MessageFns<DeleteLocalEmulatorConfigsRequest>;
export declare const DeleteLocalEmulatorConfigsResponse: MessageFns<DeleteLocalEmulatorConfigsResponse>;
export type LibraryServiceDefinition = typeof LibraryServiceDefinition;
export declare const LibraryServiceDefinition: {
    readonly name: "LibraryService";
    readonly fullName: "retrom.LibraryService";
    readonly methods: {
        readonly updateLibrary: {
            readonly name: "UpdateLibrary";
            readonly requestType: MessageFns<UpdateLibraryRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateLibraryResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateLibraryMetadata: {
            readonly name: "UpdateLibraryMetadata";
            readonly requestType: MessageFns<UpdateLibraryMetadataRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateLibraryMetadataResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteLibrary: {
            readonly name: "DeleteLibrary";
            readonly requestType: MessageFns<DeleteLibraryRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteLibraryResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteMissingEntries: {
            readonly name: "DeleteMissingEntries";
            readonly requestType: MessageFns<DeleteMissingEntriesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteMissingEntriesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface LibraryServiceImplementation<CallContextExt = {}> {
    updateLibrary(request: UpdateLibraryRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateLibraryResponse>>;
    updateLibraryMetadata(request: UpdateLibraryMetadataRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateLibraryMetadataResponse>>;
    deleteLibrary(request: DeleteLibraryRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteLibraryResponse>>;
    deleteMissingEntries(request: DeleteMissingEntriesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteMissingEntriesResponse>>;
}
export interface LibraryServiceClient<CallOptionsExt = {}> {
    updateLibrary(request: DeepPartial<UpdateLibraryRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateLibraryResponse>;
    updateLibraryMetadata(request: DeepPartial<UpdateLibraryMetadataRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateLibraryMetadataResponse>;
    deleteLibrary(request: DeepPartial<DeleteLibraryRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteLibraryResponse>;
    deleteMissingEntries(request: DeepPartial<DeleteMissingEntriesRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteMissingEntriesResponse>;
}
export type PlatformServiceDefinition = typeof PlatformServiceDefinition;
export declare const PlatformServiceDefinition: {
    readonly name: "PlatformService";
    readonly fullName: "retrom.PlatformService";
    readonly methods: {
        readonly getPlatforms: {
            readonly name: "GetPlatforms";
            readonly requestType: MessageFns<GetPlatformsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetPlatformsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deletePlatforms: {
            readonly name: "DeletePlatforms";
            readonly requestType: MessageFns<DeletePlatformsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeletePlatformsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updatePlatforms: {
            readonly name: "UpdatePlatforms";
            readonly requestType: MessageFns<UpdatePlatformsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdatePlatformsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface PlatformServiceImplementation<CallContextExt = {}> {
    getPlatforms(request: GetPlatformsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetPlatformsResponse>>;
    deletePlatforms(request: DeletePlatformsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeletePlatformsResponse>>;
    updatePlatforms(request: UpdatePlatformsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdatePlatformsResponse>>;
}
export interface PlatformServiceClient<CallOptionsExt = {}> {
    getPlatforms(request: DeepPartial<GetPlatformsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetPlatformsResponse>;
    deletePlatforms(request: DeepPartial<DeletePlatformsRequest>, options?: CallOptions & CallOptionsExt): Promise<DeletePlatformsResponse>;
    updatePlatforms(request: DeepPartial<UpdatePlatformsRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdatePlatformsResponse>;
}
export type GameServiceDefinition = typeof GameServiceDefinition;
export declare const GameServiceDefinition: {
    readonly name: "GameService";
    readonly fullName: "retrom.GameService";
    readonly methods: {
        readonly getGames: {
            readonly name: "GetGames";
            readonly requestType: MessageFns<GetGamesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetGamesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteGames: {
            readonly name: "DeleteGames";
            readonly requestType: MessageFns<DeleteGamesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteGamesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateGames: {
            readonly name: "UpdateGames";
            readonly requestType: MessageFns<UpdateGamesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateGamesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteGameFiles: {
            readonly name: "DeleteGameFiles";
            readonly requestType: MessageFns<DeleteGameFilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteGameFilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateGameFiles: {
            readonly name: "UpdateGameFiles";
            readonly requestType: MessageFns<UpdateGameFilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateGameFilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface GameServiceImplementation<CallContextExt = {}> {
    getGames(request: GetGamesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetGamesResponse>>;
    deleteGames(request: DeleteGamesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteGamesResponse>>;
    updateGames(request: UpdateGamesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateGamesResponse>>;
    deleteGameFiles(request: DeleteGameFilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteGameFilesResponse>>;
    updateGameFiles(request: UpdateGameFilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateGameFilesResponse>>;
}
export interface GameServiceClient<CallOptionsExt = {}> {
    getGames(request: DeepPartial<GetGamesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetGamesResponse>;
    deleteGames(request: DeepPartial<DeleteGamesRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteGamesResponse>;
    updateGames(request: DeepPartial<UpdateGamesRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateGamesResponse>;
    deleteGameFiles(request: DeepPartial<DeleteGameFilesRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteGameFilesResponse>;
    updateGameFiles(request: DeepPartial<UpdateGameFilesRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateGameFilesResponse>;
}
export type MetadataServiceDefinition = typeof MetadataServiceDefinition;
export declare const MetadataServiceDefinition: {
    readonly name: "MetadataService";
    readonly fullName: "retrom.MetadataService";
    readonly methods: {
        readonly getGameMetadata: {
            readonly name: "GetGameMetadata";
            readonly requestType: MessageFns<GetGameMetadataRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetGameMetadataResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateGameMetadata: {
            readonly name: "UpdateGameMetadata";
            readonly requestType: MessageFns<UpdateGameMetadataRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateGameMetadataResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getPlatformMetadata: {
            readonly name: "GetPlatformMetadata";
            readonly requestType: MessageFns<GetPlatformMetadataRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetPlatformMetadataResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updatePlatformMetadata: {
            readonly name: "UpdatePlatformMetadata";
            readonly requestType: MessageFns<UpdatePlatformMetadataRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdatePlatformMetadataResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getIgdbSearch: {
            readonly name: "GetIgdbSearch";
            readonly requestType: MessageFns<GetIgdbSearchRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetIgdbSearchResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getIgdbGameSearchResults: {
            readonly name: "GetIgdbGameSearchResults";
            readonly requestType: MessageFns<GetIgdbGameSearchResultsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetIgdbGameSearchResultsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getIgdbPlatformSearchResults: {
            readonly name: "GetIgdbPlatformSearchResults";
            readonly requestType: MessageFns<GetIgdbPlatformSearchResultsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetIgdbPlatformSearchResultsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface MetadataServiceImplementation<CallContextExt = {}> {
    getGameMetadata(request: GetGameMetadataRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetGameMetadataResponse>>;
    updateGameMetadata(request: UpdateGameMetadataRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateGameMetadataResponse>>;
    getPlatformMetadata(request: GetPlatformMetadataRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetPlatformMetadataResponse>>;
    updatePlatformMetadata(request: UpdatePlatformMetadataRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdatePlatformMetadataResponse>>;
    getIgdbSearch(request: GetIgdbSearchRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetIgdbSearchResponse>>;
    getIgdbGameSearchResults(request: GetIgdbGameSearchResultsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetIgdbGameSearchResultsResponse>>;
    getIgdbPlatformSearchResults(request: GetIgdbPlatformSearchResultsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetIgdbPlatformSearchResultsResponse>>;
}
export interface MetadataServiceClient<CallOptionsExt = {}> {
    getGameMetadata(request: DeepPartial<GetGameMetadataRequest>, options?: CallOptions & CallOptionsExt): Promise<GetGameMetadataResponse>;
    updateGameMetadata(request: DeepPartial<UpdateGameMetadataRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateGameMetadataResponse>;
    getPlatformMetadata(request: DeepPartial<GetPlatformMetadataRequest>, options?: CallOptions & CallOptionsExt): Promise<GetPlatformMetadataResponse>;
    updatePlatformMetadata(request: DeepPartial<UpdatePlatformMetadataRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdatePlatformMetadataResponse>;
    getIgdbSearch(request: DeepPartial<GetIgdbSearchRequest>, options?: CallOptions & CallOptionsExt): Promise<GetIgdbSearchResponse>;
    getIgdbGameSearchResults(request: DeepPartial<GetIgdbGameSearchResultsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetIgdbGameSearchResultsResponse>;
    getIgdbPlatformSearchResults(request: DeepPartial<GetIgdbPlatformSearchResultsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetIgdbPlatformSearchResultsResponse>;
}
export type ClientServiceDefinition = typeof ClientServiceDefinition;
export declare const ClientServiceDefinition: {
    readonly name: "ClientService";
    readonly fullName: "retrom.ClientService";
    readonly methods: {
        readonly createClient: {
            readonly name: "CreateClient";
            readonly requestType: MessageFns<CreateClientRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CreateClientResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getClients: {
            readonly name: "GetClients";
            readonly requestType: MessageFns<GetClientsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetClientsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateClients: {
            readonly name: "UpdateClients";
            readonly requestType: MessageFns<UpdateClientsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateClientsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteClients: {
            readonly name: "DeleteClients";
            readonly requestType: MessageFns<DeleteClientsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteClientsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface ClientServiceImplementation<CallContextExt = {}> {
    createClient(request: CreateClientRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CreateClientResponse>>;
    getClients(request: GetClientsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetClientsResponse>>;
    updateClients(request: UpdateClientsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateClientsResponse>>;
    deleteClients(request: DeleteClientsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteClientsResponse>>;
}
export interface ClientServiceClient<CallOptionsExt = {}> {
    createClient(request: DeepPartial<CreateClientRequest>, options?: CallOptions & CallOptionsExt): Promise<CreateClientResponse>;
    getClients(request: DeepPartial<GetClientsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetClientsResponse>;
    updateClients(request: DeepPartial<UpdateClientsRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateClientsResponse>;
    deleteClients(request: DeepPartial<DeleteClientsRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteClientsResponse>;
}
export type ServerServiceDefinition = typeof ServerServiceDefinition;
export declare const ServerServiceDefinition: {
    readonly name: "ServerService";
    readonly fullName: "retrom.ServerService";
    readonly methods: {
        readonly getServerInfo: {
            readonly name: "GetServerInfo";
            readonly requestType: MessageFns<GetServerInfoRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetServerInfoResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getServerConfig: {
            readonly name: "GetServerConfig";
            readonly requestType: MessageFns<GetServerConfigRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetServerConfigResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateServerConfig: {
            readonly name: "UpdateServerConfig";
            readonly requestType: MessageFns<UpdateServerConfigRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateServerConfigResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface ServerServiceImplementation<CallContextExt = {}> {
    getServerInfo(request: GetServerInfoRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetServerInfoResponse>>;
    getServerConfig(request: GetServerConfigRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetServerConfigResponse>>;
    updateServerConfig(request: UpdateServerConfigRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateServerConfigResponse>>;
}
export interface ServerServiceClient<CallOptionsExt = {}> {
    getServerInfo(request: DeepPartial<GetServerInfoRequest>, options?: CallOptions & CallOptionsExt): Promise<GetServerInfoResponse>;
    getServerConfig(request: DeepPartial<GetServerConfigRequest>, options?: CallOptions & CallOptionsExt): Promise<GetServerConfigResponse>;
    updateServerConfig(request: DeepPartial<UpdateServerConfigRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateServerConfigResponse>;
}
export type EmulatorServiceDefinition = typeof EmulatorServiceDefinition;
export declare const EmulatorServiceDefinition: {
    readonly name: "EmulatorService";
    readonly fullName: "retrom.EmulatorService";
    readonly methods: {
        readonly createEmulators: {
            readonly name: "CreateEmulators";
            readonly requestType: MessageFns<CreateEmulatorsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CreateEmulatorsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getEmulators: {
            readonly name: "GetEmulators";
            readonly requestType: MessageFns<GetEmulatorsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetEmulatorsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateEmulators: {
            readonly name: "UpdateEmulators";
            readonly requestType: MessageFns<UpdateEmulatorsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateEmulatorsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteEmulators: {
            readonly name: "DeleteEmulators";
            readonly requestType: MessageFns<DeleteEmulatorsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteEmulatorsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly createEmulatorProfiles: {
            readonly name: "CreateEmulatorProfiles";
            readonly requestType: MessageFns<CreateEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CreateEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getEmulatorProfiles: {
            readonly name: "GetEmulatorProfiles";
            readonly requestType: MessageFns<GetEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateEmulatorProfiles: {
            readonly name: "UpdateEmulatorProfiles";
            readonly requestType: MessageFns<UpdateEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteEmulatorProfiles: {
            readonly name: "DeleteEmulatorProfiles";
            readonly requestType: MessageFns<DeleteEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getDefaultEmulatorProfiles: {
            readonly name: "GetDefaultEmulatorProfiles";
            readonly requestType: MessageFns<GetDefaultEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetDefaultEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateDefaultEmulatorProfiles: {
            readonly name: "UpdateDefaultEmulatorProfiles";
            readonly requestType: MessageFns<UpdateDefaultEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateDefaultEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteDefaultEmulatorProfiles: {
            readonly name: "DeleteDefaultEmulatorProfiles";
            readonly requestType: MessageFns<DeleteDefaultEmulatorProfilesRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteDefaultEmulatorProfilesResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly createLocalEmulatorConfigs: {
            readonly name: "CreateLocalEmulatorConfigs";
            readonly requestType: MessageFns<CreateLocalEmulatorConfigsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<CreateLocalEmulatorConfigsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly getLocalEmulatorConfigs: {
            readonly name: "GetLocalEmulatorConfigs";
            readonly requestType: MessageFns<GetLocalEmulatorConfigsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetLocalEmulatorConfigsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly updateLocalEmulatorConfigs: {
            readonly name: "UpdateLocalEmulatorConfigs";
            readonly requestType: MessageFns<UpdateLocalEmulatorConfigsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<UpdateLocalEmulatorConfigsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
        readonly deleteLocalEmulatorConfigs: {
            readonly name: "DeleteLocalEmulatorConfigs";
            readonly requestType: MessageFns<DeleteLocalEmulatorConfigsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<DeleteLocalEmulatorConfigsResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface EmulatorServiceImplementation<CallContextExt = {}> {
    createEmulators(request: CreateEmulatorsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CreateEmulatorsResponse>>;
    getEmulators(request: GetEmulatorsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetEmulatorsResponse>>;
    updateEmulators(request: UpdateEmulatorsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateEmulatorsResponse>>;
    deleteEmulators(request: DeleteEmulatorsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteEmulatorsResponse>>;
    createEmulatorProfiles(request: CreateEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CreateEmulatorProfilesResponse>>;
    getEmulatorProfiles(request: GetEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetEmulatorProfilesResponse>>;
    updateEmulatorProfiles(request: UpdateEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateEmulatorProfilesResponse>>;
    deleteEmulatorProfiles(request: DeleteEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteEmulatorProfilesResponse>>;
    getDefaultEmulatorProfiles(request: GetDefaultEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetDefaultEmulatorProfilesResponse>>;
    updateDefaultEmulatorProfiles(request: UpdateDefaultEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateDefaultEmulatorProfilesResponse>>;
    deleteDefaultEmulatorProfiles(request: DeleteDefaultEmulatorProfilesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteDefaultEmulatorProfilesResponse>>;
    createLocalEmulatorConfigs(request: CreateLocalEmulatorConfigsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CreateLocalEmulatorConfigsResponse>>;
    getLocalEmulatorConfigs(request: GetLocalEmulatorConfigsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetLocalEmulatorConfigsResponse>>;
    updateLocalEmulatorConfigs(request: UpdateLocalEmulatorConfigsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<UpdateLocalEmulatorConfigsResponse>>;
    deleteLocalEmulatorConfigs(request: DeleteLocalEmulatorConfigsRequest, context: CallContext & CallContextExt): Promise<DeepPartial<DeleteLocalEmulatorConfigsResponse>>;
}
export interface EmulatorServiceClient<CallOptionsExt = {}> {
    createEmulators(request: DeepPartial<CreateEmulatorsRequest>, options?: CallOptions & CallOptionsExt): Promise<CreateEmulatorsResponse>;
    getEmulators(request: DeepPartial<GetEmulatorsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetEmulatorsResponse>;
    updateEmulators(request: DeepPartial<UpdateEmulatorsRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateEmulatorsResponse>;
    deleteEmulators(request: DeepPartial<DeleteEmulatorsRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteEmulatorsResponse>;
    createEmulatorProfiles(request: DeepPartial<CreateEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<CreateEmulatorProfilesResponse>;
    getEmulatorProfiles(request: DeepPartial<GetEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetEmulatorProfilesResponse>;
    updateEmulatorProfiles(request: DeepPartial<UpdateEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateEmulatorProfilesResponse>;
    deleteEmulatorProfiles(request: DeepPartial<DeleteEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteEmulatorProfilesResponse>;
    getDefaultEmulatorProfiles(request: DeepPartial<GetDefaultEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetDefaultEmulatorProfilesResponse>;
    updateDefaultEmulatorProfiles(request: DeepPartial<UpdateDefaultEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateDefaultEmulatorProfilesResponse>;
    deleteDefaultEmulatorProfiles(request: DeepPartial<DeleteDefaultEmulatorProfilesRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteDefaultEmulatorProfilesResponse>;
    createLocalEmulatorConfigs(request: DeepPartial<CreateLocalEmulatorConfigsRequest>, options?: CallOptions & CallOptionsExt): Promise<CreateLocalEmulatorConfigsResponse>;
    getLocalEmulatorConfigs(request: DeepPartial<GetLocalEmulatorConfigsRequest>, options?: CallOptions & CallOptionsExt): Promise<GetLocalEmulatorConfigsResponse>;
    updateLocalEmulatorConfigs(request: DeepPartial<UpdateLocalEmulatorConfigsRequest>, options?: CallOptions & CallOptionsExt): Promise<UpdateLocalEmulatorConfigsResponse>;
    deleteLocalEmulatorConfigs(request: DeepPartial<DeleteLocalEmulatorConfigsRequest>, options?: CallOptions & CallOptionsExt): Promise<DeleteLocalEmulatorConfigsResponse>;
}
export type JobServiceDefinition = typeof JobServiceDefinition;
export declare const JobServiceDefinition: {
    readonly name: "JobService";
    readonly fullName: "retrom.JobService";
    readonly methods: {
        readonly getJobs: {
            readonly name: "GetJobs";
            readonly requestType: MessageFns<GetJobsRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetJobsResponse>;
            readonly responseStream: true;
            readonly options: {};
        };
        readonly getJobSubscription: {
            readonly name: "GetJobSubscription";
            readonly requestType: MessageFns<GetJobSubscriptionRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetJobSubscriptionResponse>;
            readonly responseStream: true;
            readonly options: {};
        };
    };
};
export interface JobServiceImplementation<CallContextExt = {}> {
    getJobs(request: GetJobsRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<GetJobsResponse>>;
    getJobSubscription(request: GetJobSubscriptionRequest, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<GetJobSubscriptionResponse>>;
}
export interface JobServiceClient<CallOptionsExt = {}> {
    getJobs(request: DeepPartial<GetJobsRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<GetJobsResponse>;
    getJobSubscription(request: DeepPartial<GetJobSubscriptionRequest>, options?: CallOptions & CallOptionsExt): AsyncIterable<GetJobSubscriptionResponse>;
}
export type FileExplorerServiceDefinition = typeof FileExplorerServiceDefinition;
export declare const FileExplorerServiceDefinition: {
    readonly name: "FileExplorerService";
    readonly fullName: "retrom.FileExplorerService";
    readonly methods: {
        readonly getFilesystemNode: {
            readonly name: "GetFilesystemNode";
            readonly requestType: MessageFns<GetFilesystemNodeRequest>;
            readonly requestStream: false;
            readonly responseType: MessageFns<GetFilesystemNodeResponse>;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface FileExplorerServiceImplementation<CallContextExt = {}> {
    getFilesystemNode(request: GetFilesystemNodeRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetFilesystemNodeResponse>>;
}
export interface FileExplorerServiceClient<CallOptionsExt = {}> {
    getFilesystemNode(request: DeepPartial<GetFilesystemNodeRequest>, options?: CallOptions & CallOptionsExt): Promise<GetFilesystemNodeResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {
    $case: string;
} ? {
    [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]>;
} & {
    $case: T["$case"];
} : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export type ServerStreamingMethodResult<Response> = {
    [Symbol.asyncIterator](): AsyncIterator<Response, void>;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
