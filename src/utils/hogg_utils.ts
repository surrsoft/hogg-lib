import { HoggTupleNT } from '../interfaces/HoggTupleNT';
import { BaseCell } from '../base-implements/BaseCell';
import { BaseTuple } from '../base-implements/BaseTuple';
import { RsuvValueAnd } from 'rsuv-lib';
import { HoggCellNT } from '../interfaces/HoggCellNT';

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

/**
 * Преобразует tuple (1) в объект.
 * Значения поля columnNameGet() становятся ключами итогового объекта.
 * Возвращает null если (1) невалиден либо не содежит ячеек с данными.
 * @param tuple
 */
export const tupleToObject = (tuple: HoggTupleNT): object | null => {
  const ret: any = {}
  if (tuple) {
    const cells: HoggCellNT[] = tuple.cellsGet()
    if (cells && cells.length > 0) {
      // LOOP
      cells.forEach((elCell: HoggCellNT) => {
        const key = elCell.columnNameGet()
        let val;
        if (elCell.isArray()) {
          val = elCell.valuesGet()
        } else {
          val = elCell.valueGet()
        }
        ret[key] = val
      })
      return ret
    }
  }
  return null
}

/**
 * Создаёт tuple на базе объекта (1).
 * Возвращает null при неверном (1)
 * @param obj (1) --
 */
export const tupleFrom = (obj: object): HoggTupleNT | null => {
  if (obj && Object.keys(obj).length > 0) {
    const pairs = Object.entries(obj)
    const cells: HoggCellNT[] = []
    pairs.forEach((pair: [string, any]) => {
      const key = pair[0]
      const val = pair[1] || ''
      const cell = Array.isArray(val) ?
        new BaseCell().createB(key, val) :
        new BaseCell().create(key, val);
      cells.push(cell)
      if (key === 'id') {
        cells.push(new BaseCell().create('tid', val))
      }
    })
    return new BaseTuple().create(cells)
  }
  return null
}
