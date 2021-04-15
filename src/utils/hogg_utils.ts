import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { BaseCell } from '../base-implements/BaseCell';
import { BaseTuple } from '../base-implements/BaseTuple';
import { RsuvValueAnd } from 'rsuv-lib';

/**
 * Получить из tuple (1) значение ячейки с именем (2)
 * @param tuple (1) --
 * @param columnName (2) --
 * @return HoggValueAnd если колонки (2) в (1) нет, то у возвращаемого объекта поле isValueExist будет FALSE
 */
export const tupleCellValue = (tuple: HoggTupleNT, columnName: string): RsuvValueAnd => {
  const cell = tuple.cellsGet().find((cell) => {
    return cell.columnNameGet() === columnName
  })
  return cell ? new RsuvValueAnd(cell.valueGet()) : new RsuvValueAnd('', false)
}

/**
 * Итоговый tuple будет иметь ячейки с именами перечисленными в (2) и соответствующими значениями из (1). Если в (1) нет ячейки с
 * именем (2) то в итоговый tuple ячейка всё равно будет добавлена, но со значением '' (пустая строка)
 * @param tuple (1) --
 * @param columnNames (2) --
 * @return tuple
 */
export const tupleAdapt = (tuple: HoggTupleNT, columnNames: string[]): HoggTupleNT => {
  const cells = columnNames.map((columnName) => {
    const nx = tupleCellValue(tuple, columnName)
    if (nx.isValueExist) {
      return new BaseCell().create(columnName, nx.value)
    } else {
      return new BaseCell().create(columnName, '')
    }
  })
  return new BaseTuple().create(cells)
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
