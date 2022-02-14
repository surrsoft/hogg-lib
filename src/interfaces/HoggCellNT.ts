import { EnValueTypeNotion } from '../utils/hogg_utils';

export interface HoggCellNT {
  create(columnName: string, value: string): HoggCellNT;

  columnNameGet(): string;

  valueGet(): string;

  valuesGet(): string[];

  valueSet(value: string): void;

  valuesSet(values: string[]): void;

  isArraySet(): void

  isArray(): boolean

  /**
   * обязательно для HoggConnectorNotion, см. [220214213314]
   */
  typeNotion?: EnValueTypeNotion
}
