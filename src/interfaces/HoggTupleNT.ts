import { HoggCellNT } from './HoggCellNT';
import { RsuvErr } from 'rsuv-lib';
import { RsuvErrNT } from 'rsuv-lib/dist/RsuvErrNT';

export interface HoggTupleNT extends RsuvErrNT<RsuvErr>{
  create(cells: HoggCellNT[]): HoggTupleNT;

  cellsGet(): HoggCellNT[];

  cellAdd(cell: HoggCellNT): HoggTupleNT;

}
