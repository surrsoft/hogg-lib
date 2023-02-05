import { HoggConnectorNT } from '../interfaces/HoggConnectorNT';
import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import Airtable, { FieldSet } from 'airtable';
import Record from 'airtable/lib/record';
import { HoggCellNT } from '../interfaces/HoggCellNT';
import { BaseTuple } from '../base-implements/BaseTuple';
import { BaseCell } from '../base-implements/BaseCell';
import { HoggOffsetCount } from '../utils/HoggOffsetCount';
import { HoggResult } from '../utils/HoggResult';
import HoggDbInfoNT from '../interfaces/HoggDbInfoNT';
import 'isomorphic-fetch';
import HoggBaseTableInfo from '../base-implements/HoggBaseTableInfo';
import HoggBaseFieldInfo from '../base-implements/HoggBaseFieldInfo';
import HoggBaseDbInfo from '../base-implements/HoggBaseDbInfo';
import { RsuvErr, RsuvTu } from 'rsuv-lib';
import { HoggResultB } from '../utils/HoggResultB';
import { HoggResultAccum } from '../utils/HoggResultAccum';
import loChunk from 'lodash/chunk';


export class HoggConnectorAirtable implements HoggConnectorNT {
  private dbName: string = '';
  private columnNames: string[] = [];
  private tableName: string = '';
  // [vusc]
  private pFilterVusc: string = '';
  private nxApiKey?: string;
  private pSort?: { field: string; direction: "desc" | "asc" }[]

  db(dbName: string): HoggConnectorNT {
    this.dbName = dbName;
    return this;
  }

  table(tableName: string): HoggConnectorNT {
    this.tableName = tableName;
    return this;
  }

  columns(columnNames: string[]): HoggConnectorNT {
    this.columnNames = columnNames;
    return this;
  }

  filterVusc(filter: string): HoggConnectorNT {
    this.pFilterVusc = filter;
    return this;
  }

  sort(sort?: { field: string; direction: "desc" | "asc" }[]): HoggConnectorNT {
    this.pSort = sort
    return this;
  }

  private static convertRecord(record: Record<FieldSet>, columnNames: string[]): HoggTupleNT {
    const { fields } = record;
    const cells: HoggCellNT[] = columnNames.map((name) => {
      return new BaseCell().create(name, '')
    })
    for (const [key, value] of Object.entries(fields)) {
      const cellF = cells.find(cell => cell.columnNameGet() === key)
      if (cellF) {
        const isArray = Array.isArray(value)
        if (isArray) {
          cellF.valuesSet(value as string[])
          cellF.isArraySet()
        } else {
          cellF.valueSet(value as string)
        }
      }
    }
    // --- tid
    const tidCell = new BaseCell().create('tid', record.id);
    cells.push(tidCell);
    // ---
    return new BaseTuple().create(cells);
  }

  init(options: { apiKey: string }): void {
    const { apiKey } = options;
    this.nxApiKey = apiKey;
    if (apiKey) {
      const dc = Airtable.default_config();
      dc.apiKey = apiKey;
      dc.endpointUrl = 'https://api.airtable.com';
      Airtable.configure(dc);
    } else {
      throw new Error(`[hogg]: [[210223092909]] invalid apiKey [${apiKey}]`);
    }
  }

  /**
   * @inheritDoc
   *
   * В этой реализации делается через "костыль" - запрашиваются по 100 записей (больше Airtable не допускает
   * запросить за раз) до тех пор пока они не закончатся
   */
  countAll(): Promise<number> {
    let counter = 0
    const selectCfg: any = {}
    if (this.pFilterVusc) {
      selectCfg.filterByFormula = this.pFilterVusc;
    }
    return new Promise((resolve, reject) => {
      Airtable.base(this.dbName)
        .table(this.tableName)
        .select(selectCfg)
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function () {
              counter++;
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              reject(err);
            }
            resolve(counter);
          }
        );
    });
  }

  async query(offsetCount: HoggOffsetCount): Promise<HoggTupleNT[]> {
    const columnNames = this.columnNames
    return new Promise((resolve, reject) => {
      const ret: HoggTupleNT[] = [];
      // --- selectCfg
      const selectCfg = {};
      if (!offsetCount.getAll) {
        const maxRecords = offsetCount.offset + offsetCount.count;
        if (maxRecords > 0) {
          // @ts-ignore
          selectCfg.maxRecords = maxRecords;
          // @ts-ignore
          selectCfg.pageSize = maxRecords > 100 ? 100 : maxRecords;
        }
      }
      if (this.columnNames && this.columnNames.length > 0) {
        // @ts-ignore
        selectCfg.fields = this.columnNames;
      }
      if (this.pFilterVusc) {
        // @ts-ignore
        selectCfg.filterByFormula = this.pFilterVusc;
      }
      if (this.pSort) {
        // @ts-ignore
        selectCfg.sort = this.pSort;
      }
      // ---
      let counter = 0;
      Airtable.base(this.dbName)
        .table(this.tableName)
        .select(selectCfg)
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              counter++;
              if (counter > offsetCount.offset) {
                const tup = HoggConnectorAirtable.convertRecord(record, columnNames);
                ret.push(tup);
              }
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              reject(err);
            }
            resolve(ret);
          }
        );
    });
  }

  /**
   * Аккумулирует значения из поля (2)
   * @param offsetCount (1) --
   * @param fieldTargetName (2) --
   */
  async queryAccum(offsetCount: HoggOffsetCount, fieldTargetName: string): Promise<HoggResultAccum[]> {
    // const columnNames = this.columnNames
    return new Promise((resolve, reject) => {
      const retMap = new Map<string, string[]>()
      // --- selectCfg
      const selectCfg = {};
      if (!offsetCount.getAll) {
        const maxRecords = offsetCount.offset + offsetCount.count;
        if (maxRecords > 0) {
          // @ts-ignore
          selectCfg.maxRecords = maxRecords;
          // @ts-ignore
          selectCfg.pageSize = maxRecords > 100 ? 100 : maxRecords;
        }
      }
      if (this.columnNames && this.columnNames.length > 0) {
        // @ts-ignore
        selectCfg.fields = this.columnNames;
      }
      if (this.pFilterVusc) {
        // @ts-ignore
        selectCfg.filterByFormula = this.pFilterVusc;
      }
      if (this.pSort) {
        // @ts-ignore
        selectCfg.sort = this.pSort;
      }
      // ---
      let counter = 0;
      Airtable.base(this.dbName)
        .table(this.tableName)
        .select(selectCfg)
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              counter++;
              if (counter > offsetCount.offset) {
                const values = record.fields[fieldTargetName]
                // --- values0
                let values0: string[] = values as string[]
                if (!Array.isArray(values)) {
                  if (values) {
                    values0 = [values + '']
                  } else {
                    values0 = [RsuvTu.RSUV_NO_TAGS_SPC_VALUE]
                  }
                }
                // --- retMap
                values0.forEach(el => {
                  if (retMap.has(el)) {
                    retMap.get(el)?.push(record.id)
                  } else {
                    retMap.set(el, [record.id])
                  }
                })
                // ---
              }
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              reject(err);
            }
            const rr: HoggResultAccum[] = []
            retMap.forEach((val, key) => {
              rr.push(new HoggResultAccum(key, val))
            })
            resolve(rr);
          }
        );
    });
  }

  queryOneById(id: string): Promise<HoggTupleNT> {
    const columnNames = this.columnNames
    return new Promise((resolve) => {
      Airtable
        .base(this.dbName)
        .table(this.tableName)
        .find(id, (err, record) => {
          if (err) {
            if (err.error === 'NOT_FOUND') {
              resolve(new BaseTuple().errSet(new RsuvErr('NOT_FOUND', `${err.error}; ${err.message}; 210425225000`)))
            } else {
              resolve(new BaseTuple().errSet(new RsuvErr('210425223700', `${err.error}; ${err.message}`)))
            }
          } else {
            if (record) {
              const tup = HoggConnectorAirtable.convertRecord(record, columnNames);
              resolve(tup)
            } else {
              resolve(new BaseTuple().errSet(new RsuvErr('210425223701', 'record is falsy')))
            }
          }
        })
    });
  }


  async update(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>> {
    if (!(tuples && tuples.length > 0)) {
      return new HoggResult<boolean>(
        false,
        '[[210223170254]]',
        'tuples is empty'
      );
    } else {
      // ---
      const { updConfs, isOk } = updConfsGet(tuples);
      // ---
      if (!isOk) {
        return new HoggResult(false, '[[210223191902]]', 'tid problem');
      }
      try {
        return new Promise(resolve => {
          Airtable.base(this.dbName)
            .table(this.tableName)
            .update(updConfs, (err: any) => {
              if (err) {
                resolve(new HoggResult(false, '[[210223202024]]', err.message));
              } else {
                resolve(new HoggResult<boolean>(true));
              }
            });
        });
      } catch (e) {
        return new HoggResult<boolean>(false, '[[210223193709]]', e.message);
      }
    }
  }


  async create(tuples: HoggTupleNT[]): Promise<HoggResultB<string[]>> {
    if (!(tuples && tuples.length > 0)) {
      return new HoggResultB<string[]>(false, [], '[[220118134826]]', 'tuples is empty');
    } else {
      // ---
      const createData = updConfsAtCreateGet(tuples);
      // ---
      try {
        return new Promise((resolve, reject) => {
          Airtable.base(this.dbName)
            .table(this.tableName)
            .create(createData, function (error: any, records: any) {
              if (error) {
                reject(new HoggResultB<string[]>(false, [], '[[220118134914]]', error.message));
              }
              const ids = records.map((el: any) => (el.id ? el.id : ''))
              resolve(new HoggResultB<string[]>(true, ids))
            });
        });
      } catch (err) {
        return new HoggResultB<string[]>(false, [], '[[220118135141]]', err.message);
      }
    }
  }

  /**
   * Airtable за один раз позволяет удалять не более 10 записей. Поэтому тут мы разбиваем исходный {@param ids} на
   * чанки по 10 штук
   *
   * @link https://airtable.com/developers/web/api/delete-multiple-records
   */
  async delete(ids: string[]): Promise<HoggResult<boolean>> {

    const fn = async (idsChunk: string[]) => {
      Airtable.base(this.dbName)
        .table(this.tableName)
        .destroy(idsChunk, function (err: any) {
          if (err) {
            throw new Error()
          }
        });
    }

    const chunks = loChunk(ids, 10);
    const promises = chunks.map(chunk => {
      return fn(chunk);
    })

    try {
      await Promise.all(promises);
    } catch (err) {
      return new HoggResult(false, err.code, err.message);
    }

    return new HoggResult(true);
  }

  // see https://airtable.com/api/meta
  async dbInfoGet(dbName: string): Promise<HoggDbInfoNT | RsuvErr> {
    const res = await fetch(
      `https://api.airtable.com/v0/meta/bases/${dbName}/tables`,
      {
        headers: {
          Authorization: `Bearer ${this.nxApiKey}`,
        },
      }
    );
    if (res.ok) {
      try {
        const oj = res.json();
        // @ts-ignore
        if (oj.tables) {
          // @ts-ignore
          const tables = oj.tables.map(table => {
            // @ts-ignore
            const fields = table.fields.map(field => {
              return new HoggBaseFieldInfo(field.name);
            });
            return new HoggBaseTableInfo(table.name, fields);
          });
          return new HoggBaseDbInfo(dbName, tables);
        }
      } catch (e) {
        return new RsuvErr('210414102201', e.message);
      }
    }
    return new RsuvErr(
      '210414102200',
      `res.ok is falsy; status [${res.status}]; message [${res.statusText}]`
    );
  }
}

function updConfsGet(tuples: HoggTupleNT[]) {
  const updConfs: any[] = [];
  const isOk = tuples.every(tuple => {
    // LOOP
    const cells: HoggCellNT[] = tuple.cellsGet();
    const updConf: any = { id: '', fields: {} };
    cells.forEach(cell => {
      // LOOP-2
      const fieldName = cell.columnNameGet();
      if (fieldName === 'tid') {
        updConf.id = cell.valueGet();
      } else {
        updConf.fields[fieldName] = cell.valueGet();
      }
    }); // LOOP-2
    if (!updConf.id) {
      return false; // stop loop
    }
    updConfs.push(updConf);
    return true;
  }); // LOOP
  return { updConfs, isOk };
}

/**
 * На базе формата (1) формирует Airtable-формат предназначенный для создания записи
 * @param tuples
 */
function updConfsAtCreateGet(tuples: HoggTupleNT[]) {
  const updConfs: any[] = [];
  tuples.forEach(tuple => {
    // LOOP
    const cells: HoggCellNT[] = tuple.cellsGet();
    const updConf: any = { fields: {} };
    cells.forEach(cell => {
      // LOOP-2
      const fieldName = cell.columnNameGet();
      let val: string | string[] = cell.valueGet();
      if (cell.isArray()) {
        val = cell.valuesGet()
      }
      updConf.fields[fieldName] = val;
    }); // LOOP-2
    updConfs.push(updConf);
    return true;
  }); // LOOP
  return updConfs;
}
