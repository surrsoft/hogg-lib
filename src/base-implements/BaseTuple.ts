import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { HoggCellNT } from '../interfaces/HoggCellNT';

export class BaseTuple implements HoggTupleNT {
  private cells: HoggCellNT[] = [];

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

}
