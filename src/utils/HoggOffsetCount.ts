export class HoggOffsetCount {
  /**
   *
   * @param getAll (1) -- если TRUE, то это означает "получить все записи", тогда параметры (2), (3) должны
   * игнорироваться
   * @param offset (2) -- количество записей которые нужно пропустить
   * набор
   * @param count (3) -- количество записей которое нужно вернуть
   */
  constructor(
    readonly getAll: boolean = false,
    readonly offset: number = 0,
    readonly count: number = 20
  ) {}
}
