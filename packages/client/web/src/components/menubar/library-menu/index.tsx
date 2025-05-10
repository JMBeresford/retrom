import { Link } from "@tanstack/react-router";
import { MenuItem } from "..";

export const updateLibraryMenuItem: MenuItem = {
  label: "Update Library",
  Render: (
    <Link to="." search={{ updateLibraryModal: { open: true } }}>
      Update Library
    </Link>
  ),
};

export const downloadMetadataMenuItem: MenuItem = {
  label: "Download Metadata",
  Render: (
    <Link to="." search={{ downloadMetadataModal: { open: true } }}>
      Download Metadata
    </Link>
  ),
};

export const cleanLibraryMenuItem: MenuItem = {
  label: "Clean Library",
  Render: (
    <Link to="." search={{ cleanLibraryModal: { open: true } }}>
      Clean Library
    </Link>
  ),
};

export const deleteLibraryMenuItem: MenuItem = {
  label: "Delete Library",
  Render: (
    <Link
      to="."
      className="text-destructive-text"
      search={{ deleteLibraryModal: { open: true } }}
    >
      Delete Library
    </Link>
  ),
};

export const libraryMenu: MenuItem = {
  label: "Library",
  items: [
    {
      groupItems: [
        updateLibraryMenuItem,
        downloadMetadataMenuItem,
        cleanLibraryMenuItem,
      ],
    },
    { groupItems: [deleteLibraryMenuItem] },
  ],
};
