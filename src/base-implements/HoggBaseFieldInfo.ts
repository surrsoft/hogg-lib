import HoggFieldInfoNT from '../interfaces/HoggFieldInfoNT';

export default class HoggBaseFieldInfo implements HoggFieldInfoNT {
  constructor(readonly name: string) {
  }
}
