import { Client, createChannel, createClient } from "nice-grpc";
import { LibraryServiceDefinition } from "@/generated/retrom";
import {
  MenubarTrigger,
  MenubarMenu,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { UpdateLibraryMenuItem } from "./update-library-menu-item";
import { UpdateMetadataMenuItem } from "./update-library-metadata-menu-item";
import { DeleteLibraryMenuItem } from "./delete-library-menu-item";
import { revalidatePath } from "next/cache";

export async function LibraryMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        Library
      </MenubarTrigger>

      <MenubarContent>
        <UpdateLibraryMenuItem handler={updateLibrary} />

        <UpdateMetadataMenuItem handler={updateLibraryMetadata} />

        <MenubarSeparator />

        <DeleteLibraryMenuItem handler={deleteLibrary} />
      </MenubarContent>
    </MenubarMenu>
  );
}

async function updateLibrary() {
  "use server";
  const channel = createChannel("http://localhost:5001");
  const client: Client<LibraryServiceDefinition> = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    let res = await client.updateLibrary({});
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

async function updateLibraryMetadata() {
  "use server";
  const channel = createChannel("http://localhost:5001");
  const client: Client<LibraryServiceDefinition> = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    const res = await client.updateLibraryMetadata({});
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

async function deleteLibrary() {
  "use server";
  const channel = createChannel("http://localhost:5001");
  const client: Client<LibraryServiceDefinition> = createClient(
    LibraryServiceDefinition,
    channel,
  );

  try {
    const res = await client.deleteLibrary({});
    revalidatePath("/");
    return res;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}
