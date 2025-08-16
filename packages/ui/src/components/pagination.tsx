import * as React from "react";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button, buttonVariants } from "./button";

type PaginationState = {
  /** Human-readable number of items being paginated */
  totalItems: number;

  /** Human-readable number of pages, computed from `totalItems` and `pageSize` */
  numPages: number;

  /** Number of items per page */
  pageSize: number;

  /** Current page index (0-based) */
  currentPage: number;

  /** Index of the first item on the current page (0-based) */
  pageStart: number;

  /** Index of the last item on the current page (0-based) */
  pageEnd: number;

  /** Function to set the current page. Takes either a page index
   *  or a function that receives the current page index and return
   *  the new page index.
   * */
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

const PaginationContext = React.createContext<PaginationState | undefined>(
  undefined,
);

function usePaginationContext() {
  const context = React.useContext(PaginationContext);

  if (!context) {
    throw new Error("usePaginationContext must be used within a Pagination");
  }

  return context;
}

type PaginationProviderProps = {
  initialPage?: number;
  totalItems: number;
  pageSize: number;
};

function PaginationProvider(
  props: React.PropsWithChildren<PaginationProviderProps>,
) {
  const { pageSize, totalItems, initialPage = 0, children } = props;

  const [_page, setPage] = React.useState(initialPage);

  const numPages = React.useMemo(
    () =>
      Math.max(
        totalItems % pageSize === 0
          ? Math.ceil(totalItems / pageSize) - 1
          : Math.ceil(totalItems / pageSize),
        1,
      ),
    [totalItems, pageSize],
  );

  const currentPage = React.useMemo(
    () => Math.max(Math.min(_page, numPages - 1), 0),
    [_page, numPages],
  );

  const { pageStart, pageEnd } = React.useMemo(
    () => ({
      pageStart: currentPage * pageSize,
      pageEnd: Math.min(
        currentPage * pageSize + (pageSize - 1),
        totalItems - 1,
      ),
    }),
    [currentPage, pageSize, totalItems],
  );

  return (
    <PaginationContext.Provider
      value={{
        totalItems,
        pageSize,
        currentPage,
        setPage,
        pageStart,
        pageEnd,
        numPages,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}

type PaginationProps = React.ComponentProps<"nav">;

function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

type PaginationItemState = {
  itemIndex?: number;
  isActive?: boolean;
};

const PaginationItemContext = React.createContext<
  PaginationItemState | undefined
>(undefined);

function usePaginationItemContext() {
  const context = React.useContext(PaginationItemContext);

  if (!context) {
    throw new Error(
      "usePaginationItemContext must be used within a PaginationItem",
    );
  }

  return context;
}

function PaginationItem({
  itemIndex,
  ...props
}: { itemIndex?: number } & React.ComponentProps<"li">) {
  const { currentPage } = usePaginationContext();
  const isActive = itemIndex === currentPage;

  return (
    <PaginationItemContext.Provider value={{ itemIndex, isActive }}>
      <li data-slot="pagination-item" {...props} />
    </PaginationItemContext.Provider>
  );
}

type PaginationLinkProps = Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  size = "icon",
  href = "#",
  children,
  ...props
}: PaginationLinkProps) {
  const { setPage } = usePaginationContext();
  const { itemIndex, isActive } = usePaginationItemContext();

  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      href={href}
      onClick={
        !isActive && itemIndex !== undefined
          ? () => setPage(itemIndex)
          : undefined
      }
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    >
      {children ?? itemIndex}
    </a>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { setPage } = usePaginationContext();

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon"
      onClick={() => setPage((prev) => prev - 1)}
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { setPage } = usePaginationContext();

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon"
      onClick={() => setPage((prev) => prev + 1)}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationFirst({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { setPage } = usePaginationContext();

  return (
    <PaginationLink
      aria-label="Go to first page"
      size="icon"
      onClick={() => setPage(0)}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <ChevronFirstIcon />
    </PaginationLink>
  );
}

function PaginationLast({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { setPage, numPages } = usePaginationContext();

  return (
    <PaginationLink
      aria-label="Go to last page"
      size="icon"
      onClick={() => setPage(numPages - 1)}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <ChevronLastIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export type { PaginationProps, PaginationState as PaginationContext };

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  usePaginationContext,
  PaginationProvider,
  PaginationFirst,
  PaginationLast,
};
