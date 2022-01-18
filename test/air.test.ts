import { BaseCell, BaseTuple, HoggConnectorAirtable, HoggOffsetCount } from '../src';
import { airtableApiKey } from '../src/config-nx';

const air = new HoggConnectorAirtable();
air.init({apiKey: airtableApiKey});

describe('airtable', () => {
  it('info', async () => {
    const info = await air.dbInfoGet('appXv6ry7Vn262nGR');
    console.log('!!-!!-!! info {210414105020}\n', info);
  });

  it('query', async () => {
    const tuples = await air
      .db('appMo64xRBNsBNH0C')
      .table('main')
      .columns(['scopes'])
      .query(new HoggOffsetCount(true));

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
