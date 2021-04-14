import HoggTableInfoNT from '../interfaces/HoggTableInfoNT';
import HoggFieldInfoNT from '../interfaces/HoggFieldInfoNT';

export default class HoggBaseTableInfo implements HoggTableInfoNT {
  constructor(readonly name: string, readonly fields: HoggFieldInfoNT[]) {}
}
