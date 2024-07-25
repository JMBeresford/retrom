import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameDetail } from "./game-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, getFileName } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

export function GameFiles() {
  const { gameFiles } = useGameDetail();

  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  return (
    <Card className="col-span-2 ring-inset">
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>

      <CardContent className="flex gap-px">
        <Select value={selectedFile} onValueChange={setSelectedFile}>
          <SelectTrigger
            className={cn(
              selectedFile === undefined && "text-muted-foreground",
              "text-left rounded-r-none",
            )}
          >
            <SelectValue
              placeholder={
                gameFiles.length ? "Select a file" : "No files found"
              }
            />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {gameFiles?.map((file) => (
                <SelectItem key={file.id} value={file.id.toString()}>
                  {getFileName(file.path)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-r-md">
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>Set as default</DropdownMenuItem>
            </DropdownMenuGroup>

            <Separator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled className="text-destructive-text">
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
