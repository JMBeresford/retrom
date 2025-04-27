import { Link } from "@tanstack/react-router";
import { MenuItem, RootMenuItem } from "..";

export const updateLibraryMenuItem: MenuItem = {
  label: "Update Library",
  Render: (
    <Link search={{ updateLibraryModal: { open: true } }}>Update Library</Link>
  ),
};

export const downloadMetadataMenuItem: MenuItem = {
  label: "Download Metadata",
  Render: (
    <Link search={{ downloadMetadataModal: { open: true } }}>
      Download Metadata
    </Link>
  ),
};

export const cleanLibraryMenuItem: MenuItem = {
  label: "Clean Library",
  Render: (
    <Link search={{ cleanLibraryModal: { open: true } }}>Clean Library</Link>
  ),
};

export const deleteLibraryMenuItem: MenuItem = {
  label: "Delete Library",
  Render: (
    <Link
      className="text-destructive-text"
      search={{ deleteLibraryModal: { open: true } }}
    >
      Delete Library
    </Link>
  ),
};

export const libraryMenu: RootMenuItem = {
  label: "Library",
  items: [
    [updateLibraryMenuItem, downloadMetadataMenuItem, cleanLibraryMenuItem],
    [deleteLibraryMenuItem],
  ],
};
