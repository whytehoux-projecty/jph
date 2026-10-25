import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Table — docs/DESIGN_SYSTEM.md#table
 *
 * Pass `stackOnMobile` to turn rows into labelled blocks below 768 px. Give
 * every TableCell a `label` (the column name) so the stacked view can show
 * it; cells without one span the full row (e.g. a primary description).
 * Numeric columns take `numeric` for right alignment and tabular figures.
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { wrapperClassName?: string; stackOnMobile?: boolean }
>(({ className, wrapperClassName, stackOnMobile = false, ...props }, ref) => (
  <div
    className={cn("group/table relative w-full overflow-x-auto", wrapperClassName)}
    data-stack={stackOnMobile || undefined}
  >
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom border-collapse text-small tabular-nums",
        stackOnMobile && "max-md:block",
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b [&_tr]:border-fg",
      // Stacked view: column names move into each cell, keep them for AT.
      "group-data-stack/table:max-md:sr-only",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      "group-data-stack/table:max-md:block",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-fg bg-surface-muted font-semibold [&>tr]:last:border-b-0",
      "group-data-stack/table:max-md:block",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-line transition-colors duration-(--duration-fast) hover:bg-surface-muted data-[state=selected]:bg-surface-selected",
      "group-data-stack/table:max-md:grid group-data-stack/table:max-md:grid-cols-2 group-data-stack/table:max-md:gap-x-4 group-data-stack/table:max-md:gap-y-2 group-data-stack/table:max-md:py-4",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }
>(({ className, numeric, scope = "col", ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      "h-11 px-4 text-left align-bottom text-label uppercase text-fg-muted has-[[role=checkbox]]:pr-0",
      numeric && "text-right",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    /** Column name shown above the value in the stacked mobile view. */
    label?: string
    numeric?: boolean
  }
>(({ className, label, numeric, ...props }, ref) => (
  <td
    ref={ref}
    data-label={label}
    className={cn(
      "px-4 py-3 align-middle text-fg has-[[role=checkbox]]:pr-0",
      numeric && "text-right tabular-nums",
      // Stacked view
      "group-data-stack/table:max-md:block group-data-stack/table:max-md:p-0",
      label
        ? "group-data-stack/table:max-md:before:block group-data-stack/table:max-md:before:text-caption group-data-stack/table:max-md:before:text-fg-muted group-data-stack/table:max-md:before:content-[attr(data-label)]"
        : "group-data-stack/table:max-md:col-span-2",
      numeric && "group-data-stack/table:max-md:text-left",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-caption text-fg-muted", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
