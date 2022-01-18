/**
 *
 */
export class HoggResultB<T> {
  constructor(
    readonly success: boolean = false,
    readonly value?: T,
    readonly errCode?: string,
    readonly errMessage?: string
  ) {
  }
}
