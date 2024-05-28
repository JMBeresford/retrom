import {
  DeleteLibraryRequest,
  DeleteLibraryResponse,
  UpdateLibraryMetadataRequest,
  UpdateLibraryMetadataResponse,
  UpdateLibraryRequest,
  UpdateLibraryResponse,
} from "@/generated/retrom";

export interface RetromLibraryClient {
  deleteLibrary: (req?: DeleteLibraryRequest) => Promise<DeleteLibraryResponse>;
  updateLibrary: (req?: UpdateLibraryRequest) => Promise<UpdateLibraryResponse>;
  updateLibraryMetadata: (
    req?: UpdateLibraryMetadataRequest,
  ) => Promise<UpdateLibraryMetadataResponse>;
}
