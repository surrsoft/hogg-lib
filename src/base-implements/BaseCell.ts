import { HoggCellNT } from '../interfaces/HoggCellNT';

export class BaseCell implements HoggCellNT {
  private columnName: string = '';
  private value: string = '';

  create(columnName: string, value: string): HoggCellNT {
    this.columnName = columnName;
    this.value = value;
    return this;
  }

  columnNameGet(): string {
    return this.columnName;
  }

  valueGet(): string {
    return this.value;
  }

}
