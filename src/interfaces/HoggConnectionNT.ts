import { HoggTupleNT } from './HoggTupleNT';
import { HoggOffsetCount } from '../utils/HoggOffsetCount';
import { HoggResult } from '../utils/HoggResult';
import HoggDbInfoNT from './HoggDbInfoNT';
import { HoggErr } from '../utils/HoggErr';

export interface HoggConnectionNT {
  db(dbName: string): HoggConnectionNT

  table(tableName: string): HoggConnectionNT

  /**
   * Имена столбцов значения которых необходимо получить. Если пустой массив, то подразумевается необходимость
   * получить значения всех столбцов
   * @param columnNames (1) -- например ['name', 'order'] или []
   */
  columns(columnNames: string[]): HoggConnectionNT

  /**
   * [vusc]
   * @param filter
   */
  filterVusc(filter: string): HoggConnectionNT

  /**
   * Некоторым *источникам может требоваться инициализация, этот метод для этого
   * @param options
   */
  init(options: object): void;

  /**
   * Получение данных
   * @param offsetCount
   */
  query(offsetCount: HoggOffsetCount): Promise<HoggTupleNT[]>

  update(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>>

  create(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>>

  delete(ids: string[]): Promise<HoggResult<boolean>>

  dbInfoGet(dbName: string): Promise<HoggDbInfoNT | HoggErr>
}
