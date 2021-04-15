export interface HoggCellNT {
  create(columnName: string, value: string): HoggCellNT;

  columnNameGet(): string;

  valueGet(): string;

  valueSet(value: string): void;
}
