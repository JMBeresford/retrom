import { cn } from "@retrom/ui/lib/utils";
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
} from "@retrom/ui/components/select";
import { Button } from "@retrom/ui/components/button";
import { Label } from "@retrom/ui/components/label";
import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui/components/accordion";
import { Checkbox } from "@retrom/ui/components/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@retrom/ui/components/input-group";

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
    <div className="flex flex-col gap-3 px-3 sm:px-4 pt-2 pb-4">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          defaultValue={filters.name}
          onChange={(e) => setFilter("name", e.target.value)}
          placeholder="Search Games"
        />
      </InputGroup>

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
