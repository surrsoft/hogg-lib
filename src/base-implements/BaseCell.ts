import { HoggCellNT } from '../interfaces/HoggCellNT';
import { EnValueTypeNotion } from '../utils/hogg_utils';

export class BaseCell implements HoggCellNT {
  private columnName: string = '';
  private value: string = '';
  private values: string[] = [];
  private fIsArray: boolean = false
  typeNotion?: EnValueTypeNotion

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

  /**
   * Использовать для Notion
   * @param columnName
   * @param value
   * @param type
   */
  createAtNotion(columnName: string, value: any, type: EnValueTypeNotion): HoggCellNT {
    this.columnName = columnName;
    this.value = value;
    this.typeNotion = type
    return this;
  }

  /**
   * Использовать для Notion.
   * Отличие от А только в (2)
   * @param columnName (1) --
   * @param values (2) --
   * @param type (3) --
   */
  createAtNotionB(columnName: string, values: Array<any>, type: EnValueTypeNotion): HoggCellNT {
    this.columnName = columnName;
    this.values = values;
    this.typeNotion = type
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
