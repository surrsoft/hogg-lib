import { BaseCell, BaseTuple, EnValueTypeNotion, HoggConnectorAirtable, HoggOffsetCount, tupleToObject } from '../src';
import { airtableApiKey, notionToken } from '../src/config-nx';
import { HoggConnectorNotion } from '../src';
import * as _ from 'lodash';

const air = new HoggConnectorAirtable();
air.init({apiKey: airtableApiKey});

const notion = new HoggConnectorNotion()
notion.init({token: notionToken})

describe('airtable', () => {
  it('info', async () => {
    const info = await air.dbInfoGet('appXv6ry7Vn262nGR');
    console.log('!!-!!-!! info {210414105020}\n', info);
  });

  it('countAll', async () => {
    const count = await air
      .db('appXv6ry7Vn262nGR')
      .table('main')
      .countAll();
    console.log('!!-!!-!! count {210414105020}\n', count);
  });

  it('query', async () => {
    const tuples = await air
      .db('appZoHaX4a5tRLJlv')
      .table('main')
      .columns(['title', 'tags'])
      .filterVusc(`AND(FIND("[Европа]",{tags}),FIND("[классические новости]",{tags}))`)
      .query(new HoggOffsetCount(false, 0, 10));

    console.log(
      '!!-!!-!! 1435-20 tuples {210414143637}\n',
      JSON.stringify(tuples, null, 2)
    );

  });

  it('queryAccum', async () => {
    const tuples = await air
      .db('appZoHaX4a5tRLJlv')
      .table('main')
      .columns(['title', 'tags'])
      // .filterVusc(`FIND("11",{title})`)
      .queryAccum(new HoggOffsetCount(true), 'tags');

    console.log(
      '!!-!!-!! 1435-20 tuples {210414143637}\n',
      JSON.stringify(tuples, null, 2)
    );

  });

  it('queryOneById', async () => {
    const tuple = await air
      .db('app0z4PLV15OpHHzo')
      .table('cards')
      .columns(['name', 'scopes'])
      .sort([{field: 'binds_count', direction: 'desc'}])
      .query(new HoggOffsetCount(false, 0, 3));

    console.log(
      '!!-!!-!! 1435-20 tuple {210414143637}\n',
      JSON.stringify(tuple, null, 2)
    );

  });

  it('create', async () => {
    const cell2 = new BaseCell().create('kelems', '')
    cell2.valuesSet(['receLB1mJEJRWjzON'])
    cell2.isArraySet()
    const tupleCreate1 = new BaseTuple().create([
      new BaseCell().create('title', 'nx-1'),
      cell2
    ])
    const tuple = await air
      .db('appMo64xRBNsBNH0C')
      .table('main')
      .columns(['title', 'comm', 'kelems'])
      .create([tupleCreate1])

    console.log(
      '!!-!!-!! 1435-20 tuple {210414143637}\n',
      JSON.stringify(tuple, null, 2)
    );

  });
});

async function updateOne(dbId: string, id: string, val: number) {
  const tuples = []
  // ---
  const cellId = new BaseCell().create('tid', id)
  const cell1 = new BaseCell().createAtNotion('random', val, EnValueTypeNotion.NUMBER)
  const tuple = new BaseTuple().create([cellId, cell1])
  tuples.push(tuple)
  // ---
  return notion
    .db(dbId)
    .update(tuples)
}

describe('notion', () => {

  it('вопрос-ответ shuffle', async () => {
    const dbId = '5bda5482e2e14df388784831369e2ca9'
    const res = await notion
      .db(dbId)
      .query(new HoggOffsetCount(true))

    const tids = res.map(tuple => {
      const obj: any = tupleToObject(tuple)
      return obj.tid
    })
    const tidsRandom = _.shuffle(tids)

    const promises = tids.map((id) => updateOne(dbId, id, tidsRandom.findIndex(el => el === id)))
    await Promise.all(promises)
  }, 30000)


  it('query', async () => {
    const res = await notion
      .db('5bda5482e2e14df388784831369e2ca9')
      .columns(['вопрос'])
      .query(new HoggOffsetCount(true))

    res.forEach(tuple => {
      const obj = tupleToObject(tuple)
    })
  })

  it('update', async () => {
    const tuples = []
    // ---
    const cellId = new BaseCell().create('tid', '2c7b8b0d-a755-4771-9142-77d0ab35c68d')
    const cell1 = new BaseCell().createAtNotion('random', 11, EnValueTypeNotion.NUMBER)
    const tuple = new BaseTuple().create([cellId, cell1])
    tuples.push(tuple)
    // ---
    const res = await notion
      .db('5bda5482e2e14df388784831369e2ca9')
      .update(tuples)
  })
})
