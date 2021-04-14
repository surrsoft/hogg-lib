/**
 * Если value === TRUE то это означает успешный результат, иначе в code содержится код ошибки, а в comm - комментарий
 */
export class HoggResult<T> {
  constructor(
    readonly value: T,
    readonly code: string = '',
    readonly comm: string = ''
  ) {}
}
