import { HoggTupleNT } from './HoggTupleNT';
import { HoggOffsetCount } from '../utils/HoggOffsetCount';
import { HoggResult } from '../utils/HoggResult';
import HoggDbInfoNT from './HoggDbInfoNT';
import { RsuvErr } from 'rsuv-lib';

export interface HoggConnectorNT {
  db(dbName: string): HoggConnectorNT;

  table(tableName: string): HoggConnectorNT;

  /**
   * Имена столбцов значения которых необходимо получить. *Коннектор гарантированно должен возвращать указанные здесь
   * колонки, даже если какой-либо колонки нет в *источнике, и в том же порядке
   * @param columnNames (1) -- например ['name', 'order'] или []
   */
  columns(columnNames: string[]): HoggConnectorNT;

  /**
   * [vusc]
   * @param filter
   */
  filterVusc(filter: string): HoggConnectorNT;

  /**
   *
   * @param sort
   */
  sort(sort: {field: string, direction: 'desc' | 'asc'}[]): HoggConnectorNT

  /**
   * Некоторым *источникам может требоваться инициализация, этот метод для этого
   * @param options
   */
  init(options: object): void;

  /**
   * Получение данных
   * @param offsetCount
   */
  query(offsetCount: HoggOffsetCount): Promise<HoggTupleNT[]>;

  queryOneById(id: string): Promise<HoggTupleNT>;

  update(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>>;

  create(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>>;

  delete(ids: string[]): Promise<HoggResult<boolean>>;

  dbInfoGet(dbName: string): Promise<HoggDbInfoNT | RsuvErr>;
}
