import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { BaseCell } from '../base-implements/BaseCell';
import { BaseTuple } from '../base-implements/BaseTuple';

/**
 * Получить из tuple (1) значение ячейки с именем (2)
 * @param tuple (1) --
 * @param columnName (2) --
 */
export const cellValue = (tuple: HoggTupleNT, columnName: string): string => {
  const cell = tuple.cellsGet().find((cell) => {
    return cell.columnNameGet() === columnName
  })
  return cell ? cell.valueGet() : ''
}

/**
 * Возвращает список уникальынх имён столбцов встречающихся в tuples (1)
 * @param tuples (1) --
 */
export const columnNamesFrom = (tuples: HoggTupleNT[]): string[] => {
  const retSet: Set<string> = new Set<string>();
  tuples.forEach(tuple => {
    tuple.cellsGet().forEach(cell => {
      const columnName = cell.columnNameGet();
      retSet.add(columnName);
    });
  });
  return Array.from(retSet);
};

/**
 * Преобразует сырые данные (1) в типизированные
 * @param tuplesRaw (1) -- сырые данные, например полученные по сети
 */
export const tuplesCreateFromRaw = (tuplesRaw: any[]): HoggTupleNT[] => {
  return tuplesRaw.map((tuple) => {
    const cells = tuple.cells.map((cell: any) => {
      return new BaseCell().create(cell.columnName, cell.value)
    })
    return new BaseTuple().create(cells)
  })
}
