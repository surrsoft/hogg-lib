import { HoggConnectionNT } from '../interfaces/HoggConnectionNT';
import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import Airtable from 'airtable';
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
import { HoggErr } from '../utils/HoggErr';

export class HoggConnectionAirtable implements HoggConnectionNT {

  private dbName: string = '';
  private columnNames: string[] = [];
  private tableName: string = '';
  // [vusc]
  private pFilterVusc: string = '';
  private nxApiKey?: string;

  db(dbName: string): HoggConnectionNT {
    this.dbName = dbName;
    return this;
  }

  table(tableName: string): HoggConnectionNT {
    this.tableName = tableName;
    return this;
  }

  columns(columnNames: string[]): HoggConnectionNT {
    this.columnNames = columnNames;
    return this;
  }

  filterVusc(filter: string): HoggConnectionNT {
    this.pFilterVusc = filter;
    return this;
  }

  private static convertRecord(record: Record): HoggTupleNT {
    const {fields} = record;
    const cees: HoggCellNT[] = [];
    for (const [key, value] of Object.entries(fields)) {
      const cee: HoggCellNT = new BaseCell().create(key, value as string);
      cees.push(cee);
    }
    const tidCee = new BaseCell().create('tid', record.id);
    cees.push(tidCee);
    return new BaseTuple().create(cees);
  }

  // TODO учесть columnNames
  async query(offsetCount: HoggOffsetCount): Promise<HoggTupleNT[]> {
    return new Promise((resolve, reject) => {
      const ret: HoggTupleNT[] = [];
      const selectCfg = {}
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
      let counter = 0;
      Airtable
        .base(this.dbName)
        .table(this.tableName)
        .select(selectCfg)
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              counter++;
              if (counter > offsetCount.offset) {
                const tup = HoggConnectionAirtable.convertRecord(record);
                ret.push(tup)
              }
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              reject(err)
            }
            resolve(ret)
          }
        )
    });
  }

  init(options: { apiKey: string }): void {
    const {apiKey} = options;
    this.nxApiKey = apiKey;
    if (apiKey) {
      const dc = Airtable.default_config()
      dc.apiKey = apiKey
      dc.endpointUrl = 'https://api.airtable.com'
      Airtable.configure(dc)
    } else {
      throw new Error(`[hogg]: [[210223092909]] invalid apiKey [${apiKey}]`)
    }
  }

  /**
   * Среди ячеек в (1) должна быть ячейка с именем столбца 'tid'
   * @param tuples
   */
  async update(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>> {
    if (!(tuples && tuples.length > 0)) {
      return new HoggResult<boolean>(false, '[[210223170254]]', 'tuples is empty')
    } else {
      // ---
      const {updConfs, isOk} = updConfsGet(tuples);
      // ---
      if (!isOk) {
        return new HoggResult(false, '[[210223191902]]', 'tid problem')
      }
      try {
        return new Promise((resolve) => {
          Airtable
            .base(this.dbName)
            .table(this.tableName)
            .update(updConfs, (err: any) => {
              if (err) {
                resolve(new HoggResult(false, '[[210223202024]]', err.message))
              } else {
                resolve(new HoggResult<boolean>(true))
              }
            })
        });
      } catch (e) {
        return new HoggResult<boolean>(false, '[[210223193709]]', e.message)
      }
    }
  }

  async create(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>> {
    if (!(tuples && tuples.length > 0)) {
      return new HoggResult<boolean>(false, '[[210223170254-2]]', 'tuples is empty')
    } else {
      // ---
      const createData = updConfsAtCreateGet(tuples);
      // ---
      try {
        await Airtable
          .base(this.dbName)
          .table(this.tableName)
          .create(createData, function (err: any) {
            if (err) {
              return new HoggResult(false, '[[210223202024-2]]', err.message)
            }
            return new HoggResult<boolean>(true)
          })
        return new HoggResult<boolean>(true)
      } catch (e) {
        return new HoggResult<boolean>(false, '[[210223193709-2]]', e.message)
      }
    }
  }

  async delete(ids: string[]): Promise<HoggResult<boolean>> {
    await Airtable
      .base(this.dbName)
      .table(this.tableName)
      .destroy(ids, function (err: any) {
        if (err) {
          return new HoggResult(false, '[[210223202024-3]]', err.message)
        }
        return new HoggResult(true)
      })
    return new HoggResult(true)
  }

  // see https://airtable.com/api/meta
  async dbInfoGet(dbName: string): Promise<HoggDbInfoNT | HoggErr> {
    const res = await fetch(`https://api.airtable.com/v0/meta/bases/${dbName}/tables`, {
      headers: {
        'Authorization': `Bearer ${this.nxApiKey}`
      }
    })
    if (res.ok) {
      try {
        const oj = res.json()
        // @ts-ignore
        if (oj.tables) {
          // @ts-ignore
          const tables = oj.tables.map((table) => {
            // @ts-ignore
            const fields = table.fields.map((field) => {
              return new HoggBaseFieldInfo(field.name)
            })
            return new HoggBaseTableInfo(table.name, fields)
          })
          return new HoggBaseDbInfo(dbName, tables)
        }
      } catch (e) {
        return new HoggErr('210414102201', e.message)
      }
    }
    return new HoggErr('210414102200', `res.ok is falsy; status [${res.status}]; message [${res.statusText}]`)
  }

}

function updConfsGet(tuples: HoggTupleNT[]) {
  const updConfs: any[] = [];
  const isOk = tuples.every(tuple => { // LOOP
    const cells: HoggCellNT[] = tuple.cellsGet();
    const updConf: any = {id: '', fields: {}}
    cells.forEach(cell => { // LOOP-2
      const fieldName = cell.columnNameGet()
      if (fieldName === 'tid') {
        updConf.id = cell.valueGet();
      } else {
        updConf.fields[fieldName] = cell.valueGet()
      }
    }) // LOOP-2
    if (!updConf.id) {
      return false; // stop loop
    }
    updConfs.push(updConf);
    return true;
  }) // LOOP
  return {updConfs, isOk};
}

function updConfsAtCreateGet(tuples: HoggTupleNT[]) {
  const updConfs: any[] = [];
  tuples.forEach(tuple => { // LOOP
    const cells: HoggCellNT[] = tuple.cellsGet();
    const updConf: any = {fields: {}}
    cells.forEach(cell => { // LOOP-2
      const fieldName = cell.columnNameGet()
      updConf.fields[fieldName] = cell.valueGet()
    }) // LOOP-2
    updConfs.push(updConf);
    return true;
  }) // LOOP
  return updConfs;
}
