import * as React from 'react'
import { cn } from '@/lib/utils'

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  // Below md every row becomes a card; cells show their column name from `data-label`.
  stackOnMobile?: boolean
}

const stackedTableClassName = cn(
  'max-md:block max-md:[&_thead]:hidden max-md:[&_tbody]:block',
  'max-md:[&_tr:last-child]:border max-md:[&_tr]:mb-2 max-md:[&_tr]:block max-md:[&_tr]:rounded-xl max-md:[&_tr]:border max-md:[&_tr]:border-border max-md:[&_tr]:bg-card max-md:[&_tr]:px-3 max-md:[&_tr]:py-2',
  'max-md:[&_td]:block max-md:[&_td]:px-0 max-md:[&_td]:py-0.5',
  'max-md:[&_td[data-label]]:before:text-xs max-md:[&_td[data-label]]:before:text-muted-foreground max-md:[&_td[data-label]]:before:content-[attr(data-label)_":_"]',
)

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, stackOnMobile = false, ...props }, ref) => (
    <div
      className={cn(
        'w-full overflow-auto rounded-xl border border-border bg-card',
        stackOnMobile && 'max-md:overflow-visible max-md:border-0 max-md:bg-transparent',
      )}
    >
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', stackOnMobile && stackedTableClassName, className)}
        {...props}
      />
    </div>
  ),
)

Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />
))

TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-border', className)}
    {...props}
  />
))

TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-border bg-muted/70', className)} {...props} />
))

TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('transition-colors hover:bg-muted/70', className)} {...props} />
  ),
)

TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground',
      className,
    )}
    {...props}
  />
))

TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle text-card-foreground', className)}
    {...props}
  />
))

TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
))

TableCaption.displayName = 'TableCaption'

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
