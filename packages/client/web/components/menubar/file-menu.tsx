import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";

export function FileMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="py-2 px-2 cursor-pointer h-auto">
        File
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled>New</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
