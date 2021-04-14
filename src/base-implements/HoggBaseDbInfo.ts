import HoggDbInfoNT from '../interfaces/HoggDbInfoNT';
import HoggTableInfoNT from '../interfaces/HoggTableInfoNT';

export default class HoggBaseDbInfo implements HoggDbInfoNT {
  constructor(readonly name: string, readonly tables: HoggTableInfoNT[]) {}
}
