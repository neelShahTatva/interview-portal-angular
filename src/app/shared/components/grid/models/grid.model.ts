export type GridColumnAlign = 'left' | 'center' | 'right';

export type GridCellType = 'text' | 'badge' | 'title';

export interface GridColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: GridColumnAlign;
  type?: GridCellType;
  formatter?: (value: unknown, row: T) => string;
  cellClass?: string | ((row: T) => string);
  badgeClass?: string | ((row: T) => string);
  secondaryKey?: keyof T;
  showSecondaryIcon?: boolean;
  leadingIcon?: string;
  leadingText?: (row: T) => string;
  leadingClass?: string;
  badgeValues?: (row: T) => readonly string[];
}

export interface GridAction<T> {
  id: string;
  icon: string;
  tooltip?: string;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  class?: string;
}

export interface GridConfig {
  loading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  actionColumnHeader?: string;
  actionColumnWidth?: string;
  pagination?: boolean;
  pageSizeOptions?: readonly number[];
  pageSize?: number;
  totalRecords?: number;
}
