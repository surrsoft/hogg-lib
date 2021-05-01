import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { HoggCellNT } from '../interfaces/HoggCellNT';
import { RsuvErr } from 'rsuv-lib';

export class BaseTuple implements HoggTupleNT {
  private cells: HoggCellNT[] = [];
  private vErr: RsuvErr | undefined

  create(cells: HoggCellNT[]): HoggTupleNT {
    this.cells = cells;
    return this;
  }

  cellsGet(): HoggCellNT[] {
    return this.cells;
  }

  cellAdd(cell: HoggCellNT): HoggTupleNT {
    this.cells.push(cell);
    return this;
  }

  err(): RsuvErr | undefined {
    return this.vErr;
  }

  errSet(err?: RsuvErr): HoggTupleNT {
    this.vErr = err
    return this;
  }

}
