export interface HoggCellNT {
  create(columnName: string, value: string): HoggCellNT;

  columnNameGet(): string;

  valueGet(): string;

  valuesGet(): string[];

  valueSet(value: string): void;

  valuesSet(values: string[]): void;
}
