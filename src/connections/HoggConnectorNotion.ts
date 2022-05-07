import { Client } from '@notionhq/client';
import { HoggConnectorNT } from '../interfaces/HoggConnectorNT';
import { HoggResult } from '../utils/HoggResult';
import HoggDbInfoNT from '../interfaces/HoggDbInfoNT';
import { HoggResultB } from '../utils/HoggResultB';
import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { RsuvErr } from 'rsuv-lib';
import { HoggOffsetCount } from '../utils/HoggOffsetCount';
import { HoggResultAccum } from '../utils/HoggResultAccum';
import _ from 'lodash';
import { BaseTuple } from '../base-implements/BaseTuple';
import { HoggCellNT } from '../interfaces/HoggCellNT';
import { BaseCell } from '../base-implements/BaseCell';
import { EnValueTypeNotion } from '../utils/hogg_utils';

interface IPage {
  id: string,
  // example 2022-02-14T09:37:00.000Z
  created_time: string,
  // example 2022-02-14T09:37:00.000Z
  last_edited_time: string,
  archived: boolean,
  url: string,
  properties: any,
  cover: any,
  parent: any,
  icon: any
}

interface TypeMultiselectVal {
  id: string
  name: string
  color: string
}

interface TypeRichTextVal {
  type: string
  plain_text: string
  text: { content: string, link: any }
  href: any
  annotations: {
    bold: boolean,
    code: boolean,
    color: string,
    italic: boolean,
    strikethrough: boolean,
    underline: boolean,
  }
}

export class HoggConnectorNotion implements HoggConnectorNT {
  private dbName: string = '';
  // @ts-ignore
  private columnNames: string[] = [];
  // @ts-ignore
  private tableName: string = '';
  private token: string = '';
  private notionClient?: Client;

  /**
   *
   * @param dbName -- идентификатор БД (таблицы то есть)
   */
  db(dbName: string): HoggConnectorNT {
    this.dbName = dbName
    return this;
  }

  columns(columnNames: string[]): HoggConnectorNT {
    this.columnNames = columnNames;
    return this;
  }

  countAll(): Promise<number> {
    // TODO
    return Promise.resolve(0);
  }

  // @ts-ignore
  create(tuples: HoggTupleNT[]): Promise<HoggResultB<string[]>> {
    // TODO
    return Promise.resolve(new HoggResultB(false));
  }

  // @ts-ignore
  dbInfoGet(dbName: string): Promise<HoggDbInfoNT | RsuvErr> {
    // TODO
    return Promise.resolve(new RsuvErr());
  }

  // @ts-ignore
  delete(ids: string[]): Promise<HoggResult<boolean>> {
    // TODO
    return Promise.resolve(new HoggResult(false));
  }

  filterVusc(): HoggConnectorNT {
    throw Error('ERR* not supported');
  }

  init(options: { token: string }): void {
    this.token = options.token;
    this.notionClient = new Client({auth: this.token});
  }

  pageToTuple(page: IPage): HoggTupleNT {
    const cells: HoggCellNT[] = this.columnNames.map((name) => {
      return new BaseCell().create(name, '')
    })
    for (const [key, value] of Object.entries(page.properties)) {
      const cellF = cells.find(cell => cell.columnNameGet() === key)
      if (cellF) {
        const type = (value as any).type as EnValueTypeNotion
        const cellValue0 = page.properties[key][type]
        let cellValue = null
        switch (type) {
          case EnValueTypeNotion.MULTI_SELECT:
            cellValue = cellValue0.map((el: TypeMultiselectVal) => el.name)
            break;
          case EnValueTypeNotion.RICH_TEXT:
            cellValue = cellValue0.map((el: TypeRichTextVal) => el.plain_text).join('');
            break;
          default:
            cellValue = JSON.stringify(cellValue)
        }
        const cell = new BaseCell().create(key, cellValue)
        cells.push(cell)
      }
    }
    // ---
    const tidCell = new BaseCell().create('tid', page.id);
    cells.push(tidCell);
    // ---
    return new BaseTuple().create(cells)
  }

  batchToTuples(batch: Array<IPage>): HoggTupleNT[] {
    const ret: HoggTupleNT[] = []
    if (!_.isEmpty(batch)) {
      batch.forEach((elPage: IPage) => {
        const tuple = this.pageToTuple(elPage)
        ret.push(tuple)
      })
    }
    return ret;
  }

  async query(offsetCount: HoggOffsetCount): Promise<HoggTupleNT[]> {
    if (offsetCount.getAll) {
      let resBatch: any = {}
      let startCursor;
      const tuples = []
      do {
        resBatch = await this.notionClient?.databases.query({
          database_id: this.dbName,
          page_size: 100,
          start_cursor: startCursor
        })
        startCursor = resBatch.next_cursor;
        const tuples0 = this.batchToTuples(resBatch.results)
        tuples.push(...tuples0)
      } while (resBatch.has_more)
      return tuples;
    } else {
      // TODO
      throw new Error('// TODO')
    }
    throw new Error('// TODO')
  }

  // @ts-ignore
  queryAccum(offsetCount: HoggOffsetCount, fieldTargetName: string): Promise<HoggResultAccum[]> {
    throw new Error('// TODO')
  }

  // @ts-ignore
  queryOneById(id: string): Promise<HoggTupleNT> {
    throw new Error('// TODO')
  }

  // @ts-ignore
  sort(sort: { field: string; direction: "desc" | "asc" }[]): HoggConnectorNT {
    throw new Error('// TODO')
  }

  table(): HoggConnectorNT {
    throw new Error('ERR* not supported')
  }

  tupleToUpdateObj(tuple: HoggTupleNT) {
    const cells = tuple.cellsGet()
    const tidCell = cells.find(elCell => elCell.columnNameGet() === 'tid')
    if (tidCell) {
      const tid = tidCell.valueGet()
      const ret = {
        page_id: tid,
        properties: {} as any
      }
      cells.forEach((elCell: HoggCellNT) => {
        const name: string = elCell.columnNameGet()
        if (name !== 'tid') {
          if (elCell.typeNotion) {
            ret.properties[name] = {
              [elCell.typeNotion]: elCell.valueGet()
            }
          }
        }
      })
      return ret;
    }
    return null
  }

  /**
   * У ячеек из (1) должно быть поле `typeNotion` с типом {@link EnValueTypeNotion}
   * @param tuples (1) --
   */
  async update(tuples: HoggTupleNT[]): Promise<HoggResult<boolean>> {
    if (!(tuples && tuples.length > 0)) {
      return new HoggResult<boolean>(
        false,
        '[[220214212428]]',
        'tuples is empty'
      );
    } else {
      const promises: Array<Promise<any>> = []
      tuples.forEach((elTuple: HoggTupleNT) => {
        const obj = this.tupleToUpdateObj(elTuple)
        if (obj && this.notionClient) {
          promises.push(this.notionClient?.pages.update(obj))
        }
      })
      await Promise.all(promises)
      return new HoggResult<boolean>(true)
    }
  }

}
