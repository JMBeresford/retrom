import { cn } from "@/lib/utils";
import { Input, InputStyles } from "../ui/input";
import { SearchIcon, SortAscIcon, SortDescIcon } from "lucide-react";
import {
  GameSortKey,
  PlatformSortKey,
  SortDirection,
  useFilterAndSort,
} from "./filter-sort-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";

export function FiltersAndSorting() {
  const {
    filters,
    groupByInstallationStatus,
    setFilter,
    gameSortDirection,
    platformSortDirection,
    gameSortKey,
    platformSortKey,
    setPlatformSort,
    setGameSort,
    setGroupByInstallationStatus,
    toggleGameSortDirection,
    togglePlatformSortDirection,
  } = useFilterAndSort();

  const labelStyles = cn("pl-1 font-medium text-muted-foreground text-sm");

  return (
    <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
      <div className={cn(InputStyles, "flex items-stretch py-0 pr-0")}>
        <SearchIcon className="w-[1rem] h-[1rem] my-auto" />
        <Input
          defaultValue={filters.name}
          onChange={(e) => setFilter("name", e.target.value)}
          className="m-0 border-none bg-transparent h-full flex-grow ring-inset"
          placeholder="Search Games"
        />
      </div>

      <Accordion type="single" collapsible className="h-fit">
        <AccordionItem value="filters-and-sorting" className="border-none">
          <AccordionContent>
            <div className="flex flex-col gap-3 items-stretch">
              <div>
                <div className="flex flex-wrap gap-2 *:basis-2/5 [&_*]:ring-inset">
                  <div className="flex-grow">
                    <Label className={labelStyles}>Sort Platforms</Label>

                    <div className="flex">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-max aspect-square rounded-r-none border-r-0"
                        onClick={togglePlatformSortDirection}
                      >
                        {SortButton[platformSortDirection]}
                      </Button>
                      <Select
                        value={platformSortKey}
                        onValueChange={setPlatformSort}
                      >
                        <SelectTrigger className="flex-grow min-w-[125px] rounded-l-none">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {Object.entries(PlatformSortKeysReadable).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <Label className={labelStyles}>Sort Games</Label>

                    <div className="flex">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-max aspect-square rounded-r-none border-r-0"
                        onClick={toggleGameSortDirection}
                      >
                        {SortButton[gameSortDirection]}
                      </Button>
                      <Select value={gameSortKey} onValueChange={setGameSort}>
                        <SelectTrigger className="flex-grow min-w-[125px] rounded-l-none">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {Object.entries(GameSortKeysReadable).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-top gap-2">
                <Checkbox
                  id="group-by-installation-status"
                  checked={groupByInstallationStatus}
                  onCheckedChange={setGroupByInstallationStatus}
                />

                <div className="grid gap-1 leading-none">
                  <Label
                    htmlFor="group-by-installation-status"
                    className="font-semibold"
                  >
                    Group by Installation Status
                  </Label>

                  <Label
                    htmlFor="group-by-installation-status"
                    className={cn(labelStyles, "pl-0")}
                  >
                    Place installed games at the top of the list
                  </Label>
                </div>
              </div>
            </div>
          </AccordionContent>

          <AccordionTrigger asChild>
            <Button
              size="sm"
              variant="accent"
              className="w-full py-2 min-h-0 h-fit px-auto block leading-none"
            >
              Toggle Filters
            </Button>
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const SortButton: Record<SortDirection, ReactNode> = {
  asc: <SortAscIcon className="w-[1.2rem] h-[1.2rem]" />,
  desc: <SortDescIcon className="w-[1.2rem] h-[1.2rem]" />,
};

const PlatformSortKeysReadable: Record<PlatformSortKey, string> = {
  createdAt: "Date Added",
  updatedAt: "Date Updated",
  name: "Name",
};

const GameSortKeysReadable: Record<GameSortKey, string> = {
  createdAt: "Date Added",
  updatedAt: "Date Updated",
  lastPlayed: "Last Played",
  minutesPlayed: "Time Played",
  name: "Name",
};
