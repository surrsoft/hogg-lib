import { HoggTupleNT } from '../interfaces/HoggTupleNT';

/**
 * Возвращает список уникальынх имён столбцов встречающихся в tuples (1)
 * @param tuples (1) --
 */
export const columnNamesFrom = (tuples: HoggTupleNT[]): string[] => {
  const retSet: Set<string> = new Set<string>()
  tuples.forEach((tuple) => {
    tuple.cellsGet().forEach((cell) => {
      const columnName = cell.columnNameGet()
      retSet.add(columnName)
    })
  })
  return Array.from(retSet)
}
