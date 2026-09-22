import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  GridAction,
  GridColumn,
  GridConfig,
} from '@shared/components/grid/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-grid',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent<T extends object> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly GridColumn<T>[]>();
  readonly actions = input<readonly GridAction<T>[]>([]);
  readonly config = input<GridConfig>({});
  readonly actionClicked = output<{
    action: GridAction<T>;
    row: T;
  }>();
  readonly pageChanged = output<PageEvent>();
  readonly displayedColumns = computed(() => {
    const columnKeys = this.columns().map((column) => String(column.key));

    if (this.showActions()) {
      columnKeys.push('actions');
    }

    return columnKeys;
  });
  readonly showActions = computed(
    () => this.config().showActions ?? this.actions().length > 0
  );
  readonly emptyMessage = computed(
    () => this.config().emptyMessage ?? 'No records found.'
  );
  readonly totalRecords = computed(
    () => this.config().totalRecords ?? this.data().length
  );
  readonly pageSize = computed(() => this.config().pageSize ?? 5);
  readonly pageSizeOptions = computed(
    () => this.config().pageSizeOptions ?? [5, 10, 25, 50]
  );
  readonly actionColumnWidth = computed(
    () => this.config().actionColumnWidth ?? '120px'
  );

  protected getColumnKey(column: GridColumn<T>): string {
    return String(column.key);
  }

  protected getColumn(key: string): GridColumn<T> | undefined {
    return this.columns().find((column) => String(column.key) === key);
  }

  protected getCellValue(row: T, column: GridColumn<T>): unknown {
    return row[column.key];
  }

  protected getFormattedValue(row: T, column: GridColumn<T>): string {
    const value = this.getCellValue(row, column);

    if (column.formatter) {
      return column.formatter(value, row);
    }

    return value == null ? '' : String(value);
  }

  protected getSecondaryValue(row: T, column: GridColumn<T>): string {
    if (!column.secondaryKey) {
      return '';
    }

    const value = row[column.secondaryKey];

    return value == null ? '' : String(value);
  }

  protected getBadges(row: T, column: GridColumn<T>): readonly string[] {
    return column.badgeValues?.(row) ?? [this.getFormattedValue(row, column)];
  }

  protected getCellClass(row: T, column: GridColumn<T>): string {
    if (typeof column.cellClass === 'function') {
      return column.cellClass(row);
    }

    return column.cellClass ?? '';
  }

  protected getBadgeClass(row: T, column: GridColumn<T>): string {
    if (typeof column.badgeClass === 'function') {
      return column.badgeClass(row);
    }

    return column.badgeClass ?? '';
  }

  protected isActionVisible(action: GridAction<T>, row: T): boolean {
    return action.visible?.(row) ?? true;
  }

  protected isActionDisabled(action: GridAction<T>, row: T): boolean {
    return action.disabled?.(row) ?? false;
  }

  protected onActionClick(action: GridAction<T>, row: T): void {
    this.actionClicked.emit({
      action,
      row,
    });
  }

  protected onPageChanged(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  protected trackColumn(_index: number, column: GridColumn<T>): string {
    return String(column.key);
  }

  protected trackAction(_index: number, action: GridAction<T>): string {
    return action.id;
  }
}
