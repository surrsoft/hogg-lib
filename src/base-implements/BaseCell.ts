import { HoggCellNT } from '../interfaces/HoggCellNT';

export class BaseCell implements HoggCellNT {
  private columnName: string = '';
  private value: string = '';
  private values: string[] = [];
  private fIsArray: boolean = false

  create(columnName: string, value: string): HoggCellNT {
    this.columnName = columnName;
    this.value = value;
    return this;
  }

  createB(columnName: string, values: string[]): HoggCellNT {
    this.columnName = columnName;
    this.values = values;
    return this;
  }

  columnNameGet(): string {
    return this.columnName;
  }

  valueGet(): string {
    return this.value;
  }

  valueSet(value: string) {
    this.value = value;
  }

  valuesGet(): string[] {
    return this.values;
  }

  valuesSet(values: string[]): void {
    this.values = values
  }

  isArray(): boolean {
    return this.fIsArray
  }

  isArraySet(): void {
    this.fIsArray = true
  }
}
