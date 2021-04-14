import { HoggConnectionAirtable, HoggOffsetCount } from '../src';
import { columnNamesFrom } from '../src/utils/hogg_utils';

const air = new HoggConnectionAirtable()
air.init({apiKey: 'zzz'})

describe('airtable', () => {
  it('info', async () => {
    const info = await air.dbInfoGet('appXv6ry7Vn262nGR')
    console.log('!!-!!-!! info {210414105020}\n', info); // del+
  });

  it('query', async () => {
    const tuples = await air
      .db('zzz')
      .table('main')
      .query(new HoggOffsetCount(false, 3, 3))

    const columnNames = columnNamesFrom(tuples)
    console.log('!!-!!-!! 1435-10 columnNames {210414120923}\n', columnNames); // del+

    console.log('!!-!!-!! 1435-20 tuples {210414143637}\n', JSON.stringify(tuples, null, 2)) // del+

    const nx = JSON.stringify(tuples);
    console.log('!!-!!-!! 1435-30 nx {210414143949}\n', nx); // del+

  });
});
